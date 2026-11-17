"""Library operations: folders, versions, files, import and trash.

Safety rules:
- Library files are never really deleted: they go to .trash.
- When importing in "copy" mode, the originals are never touched.
- Nothing outside the library or the configured import folders can be reached.
"""
import hashlib
import json
import os
import re
import shutil
import sqlite3
import time
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Iterable, Optional
from urllib.parse import quote

from . import config
from .i18n import tr

AUTO_MAIN_PRIORITY = ["mp3", "wav", "m4a", "flac", "ogg", "opus", "aac", "aiff", "aif", "webm"]


class LibraryError(Exception):
    """Error whose message can be shown to the user (translated to the current language)."""

    def __init__(self, message: str, **params):
        super().__init__(tr(message, **params))


# ---------------------------------------------------------------- names and paths

def slugify(text: str, fallback: str = "untitled") -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:60].strip("-") or fallback


def safe_filename(name: str) -> str:
    name = Path(name.replace("\\", "/")).name  # nunca aceita caminhos
    name = re.sub(r'[\x00-\x1f<>:"/\\|?*]', "_", name).strip(" .")
    return name[:180] or "arquivo"


def ext_of(name: str) -> str:
    return Path(name).suffix.lower().lstrip(".")


def unique_path(directory: Path, name: str) -> Path:
    target = directory / name
    if not target.exists():
        return target
    stem, suffix = Path(name).stem, Path(name).suffix
    n = 2
    while (directory / f"{stem} ({n}){suffix}").exists():
        n += 1
    return directory / f"{stem} ({n}){suffix}"


def unique_folder(conn: sqlite3.Connection, table: str, base: str, parent: Path) -> str:
    folder, n = base, 2
    while conn.execute(f"SELECT 1 FROM {table} WHERE folder = ?", (folder,)).fetchone() or (parent / folder).exists():
        folder = f"{base}-{n}"
        n += 1
    return folder


def within(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def library_path(rel_path: str) -> Path:
    p = (config.LIBRARY_DIR / rel_path).resolve()
    if not within(p, config.LIBRARY_DIR):
        raise LibraryError("Invalid path.")
    return p


def song_dir(folder: str, idea: bool = False) -> Path:
    return (config.IDEAS_DIR if idea else config.SONGS_DIR) / folder


def song_path(row) -> Path:
    """Folder of a song or idea (ideas live in ideas/, songs in songs/)."""
    return song_dir(row["folder"], bool(row["is_idea"]))


def song_rel(row) -> str:
    return f"{'ideas' if row['is_idea'] else 'songs'}/{row['folder']}"


def album_dir(folder: str) -> Path:
    return config.ALBUMS_DIR / folder


def media_url(rel_path: str, stamp: Optional[str] = None) -> str:
    # encode spaces, accents, # and ? so the address works with any file name
    url = "/media/" + quote(rel_path.replace("\\", "/"), safe="/")
    return f"{url}?v={stamp}" if stamp else url


def touch_song(conn: sqlite3.Connection, song_id: int) -> None:
    conn.execute("UPDATE songs SET updated_at = datetime('now') WHERE id = ?", (song_id,))


# ---------------------------------------------------------------- trash

def to_trash(path: Path) -> Optional[Path]:
    if not path.exists():
        return None
    config.TRASH_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    target = unique_path(config.TRASH_DIR, f"{stamp} {path.name}")
    shutil.move(str(path), str(target))
    return target


def path_size(path: Path) -> int:
    if path.is_file():
        return path.stat().st_size
    return sum(p.stat().st_size for p in path.rglob("*") if p.is_file()) if path.exists() else 0


def record_trash(conn, kind: str, name: str, trashed: Optional[Path], data: dict) -> None:
    """Record the item in the trash so it can be restored later."""
    if trashed is None:
        return
    conn.execute("INSERT INTO trash (kind, name, trash_path, size, data) VALUES (?, ?, ?, ?, ?)",
                 (kind, name, trashed.relative_to(config.LIBRARY_DIR).as_posix(), path_size(trashed),
                  json.dumps(data, ensure_ascii=False)))


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


# ---------------------------------------------------------------- songs and versions

def create_song(conn: sqlite3.Connection, title: str, idea: bool = False, **fields) -> int:
    title = (title or "").strip() or tr("Untitled idea" if idea else "Untitled song")
    folder = unique_folder(conn, "songs", slugify(title), config.IDEAS_DIR if idea else config.SONGS_DIR)
    song_dir(folder, idea).mkdir(parents=True, exist_ok=True)
    if idea:
        fields = {**fields, "is_idea": 1, "status": "idea", "idea_since": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
    else:
        fields.setdefault("status", "in_progress")
    cols = ["title", "folder"] + list(fields)
    cur = conn.execute(
        f"INSERT INTO songs ({', '.join(cols)}) VALUES ({', '.join('?' * len(cols))})",
        [title, folder, *fields.values()],
    )
    song_id = cur.lastrowid
    create_version(conn, song_id, tr("Original idea"))
    return song_id


def get_song(conn: sqlite3.Connection, song_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM songs WHERE id = ?", (song_id,)).fetchone()
    if not row:
        raise LibraryError("Song not found.")
    return row


def create_version(conn: sqlite3.Connection, song_id: int, label: str = "") -> sqlite3.Row:
    song = get_song(conn, song_id)
    number = (conn.execute("SELECT MAX(number) FROM versions WHERE song_id = ?", (song_id,)).fetchone()[0] or 0) + 1
    label = (label or "").strip() or tr("Version {n}", n=number)
    (song_path(song) / f"v{number}").mkdir(parents=True, exist_ok=True)
    cur = conn.execute("INSERT INTO versions (song_id, number, label) VALUES (?, ?, ?)", (song_id, number, label))
    touch_song(conn, song_id)
    return conn.execute("SELECT * FROM versions WHERE id = ?", (cur.lastrowid,)).fetchone()


def latest_version(conn: sqlite3.Connection, song_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM versions WHERE song_id = ? ORDER BY number DESC LIMIT 1", (song_id,)).fetchone()
    return row or create_version(conn, song_id)


def get_version(conn: sqlite3.Connection, version_id: int, song_id: Optional[int] = None) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM versions WHERE id = ?", (version_id,)).fetchone()
    if not row or (song_id is not None and row["song_id"] != song_id):
        raise LibraryError("Version not found.")
    return row


def delete_song(conn: sqlite3.Connection, song_id: int) -> None:
    song = get_song(conn, song_id)
    snapshot = {
        "song": dict(song),
        "versions": [dict(r) for r in conn.execute("SELECT * FROM versions WHERE song_id = ?", (song_id,))],
        "files": [dict(r) for r in conn.execute("SELECT * FROM files WHERE song_id = ?", (song_id,))],
        "texts": [dict(r) for r in conn.execute("SELECT * FROM texts WHERE song_id = ?", (song_id,))],
        "albums": [dict(r) for r in conn.execute("SELECT album_id, position FROM album_songs WHERE song_id = ?", (song_id,))],
        "credits": [dict(r) for r in conn.execute("SELECT artist_id, role, position FROM credits WHERE song_id = ?", (song_id,))],
    }
    snapshot["markers"] = markers_snapshot(conn, [f["id"] for f in snapshot["files"]])
    trashed = to_trash(song_path(song))
    if trashed is None:  # the folder no longer existed: keep only the data
        trashed = config.TRASH_DIR / f"{datetime.now():%Y%m%d-%H%M%S} {song['folder']}"
        trashed.mkdir(parents=True, exist_ok=True)
    record_trash(conn, "song", song["title"], trashed, snapshot)
    conn.execute("DELETE FROM songs WHERE id = ?", (song_id,))


def delete_version(conn: sqlite3.Connection, version_id: int) -> None:
    v = get_version(conn, version_id)
    if conn.execute("SELECT COUNT(*) FROM versions WHERE song_id = ?", (v["song_id"],)).fetchone()[0] <= 1:
        raise LibraryError("A song needs at least one version.")
    if conn.execute("SELECT 1 FROM files WHERE version_id = ?", (version_id,)).fetchone():
        raise LibraryError("Only an empty version can be deleted. Move or delete its files first.")
    song = get_song(conn, v["song_id"])
    folder = song_path(song) / f"v{v['number']}"
    if folder.exists() and not any(folder.iterdir()):
        folder.rmdir()
    conn.execute("DELETE FROM versions WHERE id = ?", (version_id,))
    touch_song(conn, v["song_id"])


# ---------------------------------------------------------------- files

def add_file(conn, song_id: int, version_id: int, src: Path, name: str, mode: str = "copy",
             origin: Optional[str] = None) -> tuple[int, Optional[str]]:
    """Put a file into the version. Returns (id, warning)."""
    song = get_song(conn, song_id)
    version = get_version(conn, version_id, song_id)
    target_dir = song_path(song) / f"v{version['number']}"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = unique_path(target_dir, safe_filename(name))
    warning = None
    shutil.copy2(src, target)
    if mode == "move":
        try:
            src.unlink()
        except OSError:
            warning = tr("“{name}” was copied, but the original could not be removed (no permission).", name=name)
    rel = target.relative_to(config.LIBRARY_DIR).as_posix()
    cur = conn.execute(
        "INSERT INTO files (song_id, version_id, name, rel_path, ext, size, origin) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (song_id, version_id, target.name, rel, ext_of(target.name), target.stat().st_size, origin),
    )
    touch_song(conn, song_id)
    auto_main(conn, song_id)
    return cur.lastrowid, warning


def get_file(conn, file_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM files WHERE id = ?", (file_id,)).fetchone()
    if not row:
        raise LibraryError("File not found.")
    return row


def auto_main(conn, song_id: int) -> None:
    """If the song has no main file, pick the first audio file (from the newest version)."""
    song = get_song(conn, song_id)
    if song["main_file_id"] and conn.execute(
            "SELECT 1 FROM files WHERE id = ? AND song_id = ?", (song["main_file_id"], song_id)).fetchone():
        return
    rows = conn.execute(
        "SELECT f.id, f.ext FROM files f JOIN versions v ON v.id = f.version_id "
        "WHERE f.song_id = ? ORDER BY v.number DESC, f.id", (song_id,)).fetchall()
    best = None
    for ext in AUTO_MAIN_PRIORITY:
        best = next((r["id"] for r in rows if r["ext"] == ext), None)
        if best:
            break
    conn.execute("UPDATE songs SET main_file_id = ? WHERE id = ?", (best, song_id))


def rename_file(conn, file_id: int, new_name: str) -> None:
    f = get_file(conn, file_id)
    new_name = safe_filename(new_name)
    if ext_of(new_name) != f["ext"]:
        new_name = f"{new_name}.{f['ext']}" if f["ext"] else new_name
    src = library_path(f["rel_path"])
    if new_name == src.name:
        return
    target = unique_path(src.parent, new_name)
    src.rename(target)
    conn.execute("UPDATE files SET name = ?, rel_path = ? WHERE id = ?",
                 (target.name, target.relative_to(config.LIBRARY_DIR).as_posix(), file_id))
    touch_song(conn, f["song_id"])


def move_file_to_version(conn, file_id: int, version_id: int) -> None:
    f = get_file(conn, file_id)
    v = get_version(conn, version_id, f["song_id"])
    if v["id"] == f["version_id"]:
        return
    song = get_song(conn, f["song_id"])
    target_dir = song_path(song) / f"v{v['number']}"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = unique_path(target_dir, f["name"])
    shutil.move(str(library_path(f["rel_path"])), str(target))
    conn.execute("UPDATE files SET version_id = ?, name = ?, rel_path = ? WHERE id = ?",
                 (v["id"], target.name, target.relative_to(config.LIBRARY_DIR).as_posix(), file_id))
    touch_song(conn, f["song_id"])


def delete_file(conn, file_id: int) -> None:
    f = get_file(conn, file_id)
    song = get_song(conn, f["song_id"])
    v = get_version(conn, f["version_id"])
    trashed = to_trash(library_path(f["rel_path"]))
    record_trash(conn, "file", f["name"], trashed, {"file": dict(f), "song_title": song["title"], "version_number": v["number"],
                                                    "markers": markers_snapshot(conn, [file_id])})
    conn.execute("DELETE FROM files WHERE id = ?", (file_id,))
    conn.execute("UPDATE songs SET main_file_id = NULL WHERE id = ? AND main_file_id = ?", (f["song_id"], file_id))
    auto_main(conn, f["song_id"])
    touch_song(conn, f["song_id"])


# ---------------------------------------------------------------- ideas

def get_idea(conn, idea_id: int) -> sqlite3.Row:
    row = get_song(conn, idea_id)
    if not row["is_idea"]:
        raise LibraryError("This is already a song, not an idea.")
    return row


def _now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def promote_idea(conn, idea_id: int, title: str = "", style: str = "", band_id: Optional[int] = None) -> int:
    """Turn the idea into a song: its folder moves from ideas/ to songs/, with everything inside."""
    idea = get_idea(conn, idea_id)
    if band_id:
        get_band(conn, band_id)
    title = (title or "").strip() or idea["title"]
    old_dir, old_rel = song_path(idea), song_rel(idea) + "/"
    folder = unique_folder(conn, "songs", slugify(title), config.SONGS_DIR)
    new_dir = song_dir(folder)
    if old_dir.exists():
        shutil.move(str(old_dir), str(new_dir))
    else:
        new_dir.mkdir(parents=True, exist_ok=True)
    new_rel = f"songs/{folder}/"
    for f in conn.execute("SELECT id, rel_path FROM files WHERE song_id = ?", (idea_id,)).fetchall():
        if f["rel_path"].startswith(old_rel):
            conn.execute("UPDATE files SET rel_path = ? WHERE id = ?", (new_rel + f["rel_path"][len(old_rel):], f["id"]))
    conn.execute(
        "UPDATE songs SET is_idea = 0, title = ?, folder = ?, status = 'in_progress', style = ?, band_id = ?, "
        "promoted_at = ?, idea_since = COALESCE(idea_since, created_at), updated_at = datetime('now') WHERE id = ?",
        (title, folder, (style or "").strip(), band_id, _now(), idea_id))
    return idea_id


def merge_idea(conn, idea_id: int, song_id: int) -> int:
    """Add the idea to an existing song, as a new version. The idea stops existing."""
    idea = get_idea(conn, idea_id)
    song = get_song(conn, song_id)
    if song["is_idea"]:
        raise LibraryError("Pick a song, not another idea.")
    version = create_version(conn, song_id, tr("From the idea: {title}", title=idea['title']))
    target_dir = song_path(song) / f"v{version['number']}"
    for f in conn.execute("SELECT * FROM files WHERE song_id = ? ORDER BY id", (idea_id,)).fetchall():
        src = library_path(f["rel_path"])
        dest = unique_path(target_dir, f["name"])
        if src.exists():
            shutil.move(str(src), str(dest))
        # it is the same file record: Listening room markers and sections still apply
        conn.execute("UPDATE files SET song_id = ?, version_id = ?, name = ?, rel_path = ? WHERE id = ?",
                     (song_id, version["id"], dest.name, dest.relative_to(config.LIBRARY_DIR).as_posix(), f["id"]))
    conn.execute("UPDATE texts SET song_id = ? WHERE song_id = ?", (song_id, idea_id))
    if idea["notes"].strip():
        conn.execute("INSERT INTO texts (song_id, title, body) VALUES (?, ?, ?)",
                     (song_id, tr("Idea: {title}", title=idea['title']), idea["notes"]))
    if not song["main_file_id"]:
        auto_main(conn, song_id)
    leftover = song_path(idea)
    conn.execute("DELETE FROM songs WHERE id = ?", (idea_id,))
    if leftover.exists():
        # only empty version folders (or a cover) are left; nothing is really deleted
        if any(p.is_file() for p in leftover.rglob("*")):
            to_trash(leftover)
        else:
            shutil.rmtree(leftover, ignore_errors=True)
    touch_song(conn, song_id)
    return song_id


def idea_kinds(conn) -> list[dict]:
    rows = conn.execute("SELECT idea_kind k, COUNT(*) n FROM songs WHERE is_idea = 1 AND idea_kind != '' GROUP BY idea_kind").fetchall()
    counts = {r["k"]: r["n"] for r in rows}
    kinds = [{"name": k, "count": counts.pop(k, 0), "builtin": True} for k in config.IDEA_KINDS]
    kinds += [{"name": k, "count": n, "builtin": False} for k, n in sorted(counts.items(), key=lambda x: x[0].lower())]
    return kinds


# ---------------------------------------------------------------- markers (Listening room)

def markers_snapshot(conn, file_ids: list[int]) -> list[dict]:
    if not file_ids:
        return []
    rows = conn.execute(f"SELECT file_id, time, end_time, label FROM markers WHERE file_id IN ({','.join('?' * len(file_ids))})", file_ids)
    return [dict(r) for r in rows]


def restore_markers(conn, markers: list[dict], file_map: dict) -> None:
    for m in markers or []:
        new_id = file_map.get(m["file_id"])
        if new_id:
            conn.execute("INSERT INTO markers (file_id, time, end_time, label) VALUES (?, ?, ?, ?)",
                         (new_id, m["time"], m.get("end_time"), m.get("label", "")))


def list_markers(conn, file_id: int) -> list[dict]:
    return [dict(r) for r in conn.execute(
        "SELECT id, time, end_time, label FROM markers WHERE file_id = ? ORDER BY time, id", (file_id,))]


def _clean_marker(time_: float, end: Optional[float]) -> tuple[float, Optional[float]]:
    try:
        time_ = round(max(0.0, float(time_)), 3)
        end = None if end is None else round(float(end), 3)
    except (TypeError, ValueError):
        raise LibraryError("Invalid time.")
    if end is not None and end <= time_:
        raise LibraryError("The end of the section must come after the start.")
    return time_, end


def add_marker(conn, file_id: int, time_: float, end: Optional[float] = None, label: str = "") -> dict:
    get_file(conn, file_id)
    time_, end = _clean_marker(time_, end)
    cur = conn.execute("INSERT INTO markers (file_id, time, end_time, label) VALUES (?, ?, ?, ?)",
                       (file_id, time_, end, label.strip()[:120]))
    return dict(conn.execute("SELECT id, time, end_time, label FROM markers WHERE id = ?", (cur.lastrowid,)).fetchone())


def get_marker(conn, marker_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM markers WHERE id = ?", (marker_id,)).fetchone()
    if not row:
        raise LibraryError("Marker not found.")
    return row


def update_marker(conn, marker_id: int, changes: dict) -> dict:
    row = get_marker(conn, marker_id)
    time_ = changes["time"] if changes.get("time") is not None else row["time"]
    end = changes["end_time"] if "end_time" in changes else row["end_time"]
    time_, end = _clean_marker(time_, end)
    label = (changes["label"] if changes.get("label") is not None else row["label"]).strip()[:120]
    conn.execute("UPDATE markers SET time = ?, end_time = ?, label = ? WHERE id = ?", (time_, end, label, marker_id))
    return dict(conn.execute("SELECT id, time, end_time, label FROM markers WHERE id = ?", (marker_id,)).fetchone())


# ---------------------------------------------------------------- covers

def save_cover(src_file, target_dir: Path) -> str:
    """Convert any image to cover.jpg (max 1200 px). Returns the file name."""
    from PIL import Image, ImageOps, UnidentifiedImageError
    try:
        img = Image.open(src_file)
        img = ImageOps.exif_transpose(img).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise LibraryError("This file is not a valid image.")
    img.thumbnail((1200, 1200))
    target_dir.mkdir(parents=True, exist_ok=True)
    img.save(target_dir / config.COVER_NAME, "JPEG", quality=88)
    _make_thumb(img, target_dir / THUMB_NAME)
    return config.COVER_NAME


THUMB_NAME = config.THUMB_NAME
THUMB_SIZE = 480


def _make_thumb(img, dest: Path) -> None:
    small = img.copy()
    small.thumbnail((THUMB_SIZE, THUMB_SIZE))
    small.save(dest, "JPEG", quality=82)


def thumb_url(rel_dir: str, cover: Optional[str], stamp: Optional[str]) -> Optional[str]:
    """Cover thumbnail (480 px) for lists and grids; made on the fly for older covers."""
    if not cover:
        return None
    folder = config.LIBRARY_DIR / rel_dir
    src, dest = folder / cover, folder / THUMB_NAME
    try:
        if not dest.exists() or dest.stat().st_mtime < src.stat().st_mtime:
            from PIL import Image
            with Image.open(src) as img:
                _make_thumb(img.convert("RGB"), dest)
    except OSError:
        return media_url(f"{rel_dir}/{cover}", stamp)
    return media_url(f"{rel_dir}/{THUMB_NAME}", stamp)


def save_background(src_file) -> None:
    """Glass theme background image (max 2400 px), stored as .mdop/background.jpg."""
    from PIL import Image, ImageOps, UnidentifiedImageError
    try:
        img = ImageOps.exif_transpose(Image.open(src_file)).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise LibraryError("This file is not a valid image.")
    img.thumbnail((2400, 2400))
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    img.save(background_path(), "JPEG", quality=86)


def background_path() -> Path:
    return config.DATA_DIR / config.BACKGROUND_NAME


# ---------------------------------------------------------------- browsing server folders

def _import_root_for(path: Path) -> Optional[Path]:
    return next((r for r in config.IMPORT_ROOTS if within(path, r)), None)


def browse(path: str = "") -> dict:
    if not config.IMPORT_ROOTS:
        return {"path": "", "parent": None, "roots": [], "entries": []}
    if not path:
        return {
            "path": "", "parent": None, "roots": [str(r) for r in config.IMPORT_ROOTS],
            "entries": [{"name": str(r), "path": str(r), "dir": True} for r in config.IMPORT_ROOTS if r.exists()],
        }
    p = Path(path).resolve()
    root = _import_root_for(p)
    if not root or not p.is_dir():
        raise LibraryError("Folder not allowed or missing.")
    entries = []
    try:
        children = sorted(p.iterdir(), key=lambda c: (not c.is_dir(), c.name.lower()))
    except PermissionError:
        raise LibraryError("No permission to read this folder.")
    for c in children:
        if c.name.startswith("."):
            continue
        try:
            if c.is_dir():
                entries.append({"name": c.name, "path": str(c), "dir": True})
            elif c.is_file():
                entries.append({"name": c.name, "path": str(c), "dir": False, "ext": ext_of(c.name),
                                "size": c.stat().st_size})
        except OSError:
            continue
    parent = str(p.parent) if p != root else ""
    return {"path": str(p), "parent": parent, "roots": [str(r) for r in config.IMPORT_ROOTS], "entries": entries}


def expand_server_paths(paths: Iterable[str]) -> list[Path]:
    """Check the chosen paths and expand folders into files (subfolders included)."""
    out: list[Path] = []
    seen = set()
    for raw in paths:
        p = Path(raw).resolve()
        if not _import_root_for(p):
            raise LibraryError("Path outside the allowed folders: {path}", path=raw)
        candidates = [p] if p.is_file() else sorted(x for x in p.rglob("*") if x.is_file()) if p.is_dir() else []
        for c in candidates:
            if any(part.startswith(".") for part in c.relative_to(p.parent).parts):
                continue  # ignora .DS_Store, ._arquivo e pastas ocultas
            if c not in seen:
                seen.add(c)
                out.append(c)
    return out


# ---------------------------------------------------------------- import

_NOISE = re.compile(r"(\s*\(\d+\)|[\s_-]*(copia|cópia|copy|final|basic[_ ]pitch))+$", re.IGNORECASE)


def group_key(filename: str) -> str:
    stem = Path(filename).stem
    return slugify(_NOISE.sub("", stem), fallback=slugify(stem))


def pretty_title(filename: str) -> str:
    stem = _NOISE.sub("", Path(filename).stem) or Path(filename).stem
    return re.sub(r"[_]+", " ", stem).strip() or tr("Untitled song")


def import_files(conn, items: list[tuple[Path, str, Optional[str]]], *, mode: str = "copy", target: str = "new",
                 title: str = "", song_id: Optional[int] = None, new_version: bool = False,
                 version_label: str = "", skip_imported: bool = True, version_id: Optional[int] = None) -> dict:
    """items = [(source_path, original_name, origin_to_record)].

    target: "new" (one new song with everything), "existing" (an existing song) or
    "grouped" (one song per group of files with the same name).
    """
    if mode not in ("copy", "move"):
        raise LibraryError("Invalid mode.")
    summary = {"songs_created": [], "files_added": 0, "skipped": [], "warnings": [], "errors": []}

    pending = []
    for src, name, origin in items:
        if skip_imported and origin and already_imported(conn, origin, src.stat().st_size):
            summary["skipped"].append(name)
        else:
            pending.append((src, name, origin))
    if not pending:
        return summary

    if target == "loose":
        for src, name, origin in pending:
            try:
                warning = add_loose(conn, src, name, mode, origin)
                summary["files_added"] += 1
                if warning:
                    summary["warnings"].append(warning)
            except OSError as e:
                summary["errors"].append(f"{name}: {e.strerror or e}")
        return summary

    if target == "grouped":
        groups: dict[str, list] = {}
        for it in pending:
            groups.setdefault(group_key(it[1]), []).append(it)
        plan = []
        for members in groups.values():
            members.sort(key=lambda it: (ext_of(it[1]) not in config.AUDIO_EXTS, it[1].lower()))
            sid = create_song(conn, pretty_title(members[0][1]))
            summary["songs_created"].append(sid)
            plan.append((sid, latest_version(conn, sid)["id"], members))
    else:
        if target == "existing":
            if not song_id:
                raise LibraryError("Pick the song.")
            get_song(conn, song_id)
            sid = song_id
            if version_id:
                vid = get_version(conn, version_id, sid)["id"]
            elif new_version:
                vid = create_version(conn, sid, version_label)["id"]
            else:
                vid = latest_version(conn, sid)["id"]
        else:
            sid = create_song(conn, title or pretty_title(pending[0][1]))
            summary["songs_created"].append(sid)
            vid = latest_version(conn, sid)["id"]
            if version_label:
                conn.execute("UPDATE versions SET label = ? WHERE id = ?", (version_label.strip(), vid))
        plan = [(sid, vid, pending)]

    for sid, vid, members in plan:
        for src, name, origin in members:
            try:
                _, warning = add_file(conn, sid, vid, src, name, mode, origin)
                summary["files_added"] += 1
                if warning:
                    summary["warnings"].append(warning)
            except OSError as e:
                summary["errors"].append(f"{name}: {e.strerror or e}")
    return summary


# ---------------------------------------------------------------- reading (shapes used by the API)

def already_imported(conn, origin: str, size: int) -> bool:
    return bool(conn.execute("SELECT 1 FROM files WHERE origin = ? AND size = ?", (origin, size)).fetchone()
                or conn.execute("SELECT 1 FROM loose_files WHERE origin = ? AND size = ?", (origin, size)).fetchone())


# ---------------------------------------------------------------- file list (loose files)

def add_loose(conn, src: Path, name: str, mode: str = "copy", origin: Optional[str] = None) -> Optional[str]:
    config.LOOSE_DIR.mkdir(parents=True, exist_ok=True)
    target = unique_path(config.LOOSE_DIR, safe_filename(name))
    shutil.copy2(src, target)
    warning = None
    if mode == "move":
        try:
            src.unlink()
        except OSError:
            warning = tr("“{name}” was copied, but the original could not be removed (no permission).", name=name)
    conn.execute(
        "INSERT INTO loose_files (name, rel_path, ext, size, origin, group_key) VALUES (?, ?, ?, ?, ?, ?)",
        (target.name, target.relative_to(config.LIBRARY_DIR).as_posix(), ext_of(target.name), target.stat().st_size,
         origin, group_key(name)))
    return warning


def loose_groups(conn) -> list[dict]:
    """Loose files grouped by name (riff.m4a + riff.mid = one item)."""
    rows = conn.execute("SELECT * FROM loose_files ORDER BY created_at, id").fetchall()
    groups: dict[str, dict] = {}
    for r in rows:
        g = groups.setdefault(r["group_key"] or f"id-{r['id']}", {"key": r["group_key"], "files": [], "created_at": r["created_at"]})
        g["files"].append({"id": r["id"], "name": r["name"], "ext": r["ext"], "size": r["size"],
                           "url": media_url(r["rel_path"]), "created_at": r["created_at"],
                           "origin_dir": origin_dir(r["origin"]), "separated": bool(r["separated"])})
    out = []
    for g in groups.values():
        g["files"].sort(key=lambda f: (f["ext"] not in config.AUDIO_EXTS, f["name"].lower()))
        g["title"] = pretty_title(g["files"][0]["name"])
        g["size"] = sum(f["size"] for f in g["files"])
        g["separated"] = any(f["separated"] for f in g["files"])
        g["origin_dir"] = g["files"][0]["origin_dir"]
        out.append(g)
    return out


def origin_dir(origin: Optional[str]) -> str:
    """Folder the file came from, relative to the import folder ("" = uploaded from the browser)."""
    if not origin:
        return ""
    parent = Path(origin).parent
    for root in config.IMPORT_ROOTS:
        try:
            rel = parent.relative_to(root)
            return str(rel) if str(rel) != "." else root.name
        except ValueError:
            continue
    return parent.name


def set_separated(conn, file_ids: list[int], value: bool) -> None:
    _loose_rows(conn, file_ids)
    conn.execute(f"UPDATE loose_files SET separated = ? WHERE id IN ({','.join('?' * len(file_ids))})", [int(value), *file_ids])


def _hash_of(conn, table: str, row) -> Optional[str]:
    if row["sha256"]:
        return row["sha256"]
    try:
        digest = file_sha256(library_path(row["rel_path"]))
    except OSError:
        return None
    conn.execute(f"UPDATE {table} SET sha256 = ? WHERE id = ?", (digest, row["id"]))
    return digest


def find_duplicates(conn) -> list[dict]:
    """Files in the list that are identical copies (same content) of another file in the list or the library.
    One is always kept: the one with the simplest name (no "(2)") or that is already in a song."""
    loose = conn.execute("SELECT * FROM loose_files ORDER BY id").fetchall()
    sizes = {r["size"] for r in loose}
    if not sizes:
        return []
    marks = ",".join("?" * len(sizes))
    lib_rows = conn.execute(f"SELECT * FROM files WHERE size IN ({marks})", list(sizes)).fetchall()
    by_size: dict[int, list] = {}
    for r in loose:
        by_size.setdefault(r["size"], []).append(("loose", r))
    for r in lib_rows:
        by_size.setdefault(r["size"], []).append(("files", r))
    dupes = []
    for items in by_size.values():
        if len(items) < 2 or not any(k == "loose" for k, _ in items):
            continue
        by_hash: dict[str, list] = {}
        for kind, r in items:
            h = _hash_of(conn, "loose_files" if kind == "loose" else "files", r)
            if h:
                by_hash.setdefault(h, []).append((kind, r))
        for same in by_hash.values():
            if len(same) < 2:
                continue
            # the one that stays: a file already in a song; otherwise the shortest name / without "(n)"
            keep = next((x for x in same if x[0] == "files"), None) or min(
                same, key=lambda x: (bool(re.search(r"\(\d+\)|c[oó]pia|copy", x[1]["name"], re.I)), len(x[1]["name"]), x[1]["id"]))
            for kind, r in same:
                if (kind, r["id"]) != (keep[0], keep[1]["id"]) and kind == "loose":
                    dupes.append({"id": r["id"], "name": r["name"], "size": r["size"],
                                  "same_as": keep[1]["name"], "same_in_song": keep[0] == "files"})
    return dupes


def _loose_rows(conn, file_ids: list[int]) -> list[sqlite3.Row]:
    if not file_ids:
        raise LibraryError("Pick at least one audio file.")
    rows = conn.execute(f"SELECT * FROM loose_files WHERE id IN ({','.join('?' * len(file_ids))})", file_ids).fetchall()
    if len(rows) != len(set(file_ids)):
        raise LibraryError("Some audio file is no longer in the list. Refresh the page.")
    return rows


def assign_loose(conn, file_ids: list[int], action: str, *, title: str = "", song_id: Optional[int] = None,
                 new_version: bool = False, version_label: str = "", band_id: Optional[int] = None,
                 kind: str = "") -> int:
    """Turn loose files into a new song or add them to an existing one. Returns the song id."""
    rows = _loose_rows(conn, file_ids)
    if action == "existing":
        if not song_id:
            raise LibraryError("Pick the song.")
        get_song(conn, song_id)
        sid = song_id
        vid = create_version(conn, sid, version_label)["id"] if new_version else latest_version(conn, sid)["id"]
    elif action == "new":
        first = sorted(rows, key=lambda r: (r["ext"] not in config.AUDIO_EXTS, r["name"].lower()))[0]
        fields = {"band_id": band_id} if band_id else {}
        if band_id:
            get_band(conn, band_id)
        sid = create_song(conn, title.strip() or pretty_title(first["name"]), **fields)
        vid = latest_version(conn, sid)["id"]
    elif action == "idea":
        first = sorted(rows, key=lambda r: (r["ext"] not in config.AUDIO_EXTS, r["name"].lower()))[0]
        sid = create_song(conn, title.strip() or pretty_title(first["name"]), idea=True, idea_kind=kind.strip()[:40])
        vid = latest_version(conn, sid)["id"]
    else:
        raise LibraryError("Invalid action.")
    for r in rows:
        add_file(conn, sid, vid, library_path(r["rel_path"]), r["name"], "move", r["origin"])
        conn.execute("DELETE FROM loose_files WHERE id = ?", (r["id"],))
    return sid


def discard_loose(conn, file_ids: list[int]) -> int:
    rows = _loose_rows(conn, file_ids)
    for r in rows:
        trashed = to_trash(library_path(r["rel_path"]))
        record_trash(conn, "loose", r["name"], trashed, {"loose": dict(r)})
        conn.execute("DELETE FROM loose_files WHERE id = ?", (r["id"],))
    return len(rows)


# ---------------------------------------------------------------- bands

def get_band(conn, band_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM bands WHERE id = ?", (band_id,)).fetchone()
    if not row:
        raise LibraryError("Band not found.")
    return row


def band_dir(folder: str) -> Path:
    return config.BANDS_DIR / folder


def band_summary(conn, row: sqlite3.Row) -> dict:
    n_songs = conn.execute("SELECT COUNT(*) FROM songs WHERE band_id = ? AND is_idea = 0", (row["id"],)).fetchone()[0]
    n_albums = conn.execute("SELECT COUNT(*) FROM albums WHERE band_id = ?", (row["id"],)).fetchone()[0]
    return {
        "id": row["id"], "title": row["title"], "description": row["description"], "updated_at": row["updated_at"],
        "cover_url": media_url(f"bands/{row['folder']}/{row['cover']}", row["updated_at"]) if row["cover"] else None,
        "song_count": n_songs, "album_count": n_albums,
    }


# ---------------------------------------------------------------- texts

def get_text(conn, text_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM texts WHERE id = ?", (text_id,)).fetchone()
    if not row:
        raise LibraryError("Text not found.")
    return row


# ---------------------------------------------------------------- settings

def get_settings(conn) -> dict:
    data = dict(config.DEFAULT_SETTINGS)
    for r in conn.execute("SELECT key, value FROM settings"):
        if r["key"] == "hidden":
            data["hidden"] = ",".join(m for m in r["value"].split(",") if m in config.OPTIONAL_MODULES)
        elif r["key"] in data and r["value"] in config.SETTING_CHOICES[r["key"]]:
            data[r["key"]] = r["value"]
    return data


def set_settings(conn, changes: dict) -> dict:
    for k, v in changes.items():
        if k == "hidden":
            parts = [m for m in v.split(",") if m]
            if any(m not in config.OPTIONAL_MODULES for m in parts):
                raise LibraryError("Unknown menu part.")
            v = ",".join(dict.fromkeys(parts))
        elif k not in config.SETTING_CHOICES or v not in config.SETTING_CHOICES[k]:
            raise LibraryError("Invalid setting: {key}", key=k)
        conn.execute("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", (k, v))
    return get_settings(conn)


def song_summary(conn, row: sqlite3.Row) -> dict:
    files = conn.execute("SELECT id, name, rel_path, ext FROM files WHERE song_id = ?", (row["id"],)).fetchall()
    main = next((f for f in files if f["id"] == row["main_file_id"]), None)
    albums = conn.execute(
        "SELECT a.id, a.title, a.folder, a.cover, a.updated_at FROM albums a JOIN album_songs s ON s.album_id = a.id "
        "WHERE s.song_id = ? ORDER BY a.title", (row["id"],)).fetchall()
    formats = sorted({f["ext"].upper() for f in files if f["ext"]})
    band = conn.execute("SELECT id, title, folder, cover, updated_at FROM bands WHERE id = ?",
                        (row["band_id"],)).fetchone() if row["band_id"] else None
    return {
        # thumbnails for the album and band circles on the cards
        "band": {"id": band["id"], "title": band["title"],
                 "thumb": thumb_url(f"bands/{band['folder']}", band["cover"], band["updated_at"])} if band else None,
        "id": row["id"], "title": row["title"], "style": row["style"], "status": row["status"],
        "favorite": bool(row["favorite"]), "updated_at": row["updated_at"], "created_at": row["created_at"],
        "cover_url": media_url(f"{song_rel(row)}/{row['cover']}", row["updated_at"]) if row["cover"] else None,
        "thumb_url": thumb_url(song_rel(row), row["cover"], row["updated_at"]),
        "is_idea": bool(row["is_idea"]), "idea_kind": row["idea_kind"],
        "idea_since": row["idea_since"], "promoted_at": row["promoted_at"],
        "file_count": len(files), "formats": formats,
        "albums": [{"id": a["id"], "title": a["title"],
                    "thumb": thumb_url(f"albums/{a['folder']}", a["cover"], a["updated_at"])} for a in albums],
        "main_file": {"id": main["id"], "name": main["name"], "ext": main["ext"],
                      "url": media_url(main["rel_path"])} if main else None,
    }


def song_detail(conn, song_id: int) -> dict:
    row = get_song(conn, song_id)
    data = song_summary(conn, row)
    data.update({k: row[k] for k in ("music_key", "tuning", "bpm", "notes", "folder")})
    data["main_file_id"] = row["main_file_id"]
    versions = []
    for v in conn.execute("SELECT * FROM versions WHERE song_id = ? ORDER BY number DESC", (song_id,)).fetchall():
        files = conn.execute("SELECT * FROM files WHERE version_id = ? ORDER BY name COLLATE NOCASE", (v["id"],)).fetchall()
        versions.append({
            "id": v["id"], "number": v["number"], "label": v["label"], "created_at": v["created_at"],
            "files": [{"id": f["id"], "name": f["name"], "ext": f["ext"], "size": f["size"],
                       "created_at": f["created_at"], "url": media_url(f["rel_path"]),
                       "main": f["id"] == row["main_file_id"]} for f in files],
        })
    data["versions"] = versions
    data["album_ids"] = [a["id"] for a in data["albums"]]
    data["texts"] = [dict(t) for t in conn.execute(
        "SELECT id, title, body, created_at, updated_at FROM texts WHERE song_id = ? ORDER BY position, id", (song_id,))]
    data["cover_download"] = media_url(f"{song_rel(row)}/{row['cover']}") if row["cover"] else None
    from .artists import credits_for
    data["credits"] = credits_for(conn, "song_id", song_id)
    return data


def album_summary(conn, row: sqlite3.Row) -> dict:
    songs = conn.execute(
        "SELECT s.folder, s.cover, s.updated_at, s.is_idea FROM songs s JOIN album_songs a ON a.song_id = s.id "
        "WHERE a.album_id = ? ORDER BY a.position, s.title", (row["id"],)).fetchall()
    mosaic = [thumb_url(song_rel(s), s["cover"], s["updated_at"]) for s in songs if s["cover"]][:4]
    band = conn.execute("SELECT id, title FROM bands WHERE id = ?", (row["band_id"],)).fetchone() if row["band_id"] else None
    return {
        "band": {"id": band["id"], "title": band["title"]} if band else None,
        "id": row["id"], "title": row["title"], "description": row["description"],
        "release": row["release"], "recorded_at": row["recorded_at"], "label": row["label"], "status": row["status"],
        "cover_url": media_url(f"albums/{row['folder']}/{row['cover']}", row["updated_at"]) if row["cover"] else None,
        "thumb_url": thumb_url(f"albums/{row['folder']}", row["cover"], row["updated_at"]),
        "mosaic": mosaic, "song_count": len(songs), "updated_at": row["updated_at"],
    }


def now_stamp() -> str:
    return str(int(time.time()))
