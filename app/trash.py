"""Trash: list, restore and delete for good.

Everything that is deleted goes to the library's .trash folder and is recorded
in the "trash" table with what is needed to put it back.
"""
import json
import shutil
from pathlib import Path

from . import config, db
from . import library as lib
from .library import LibraryError


def _path(row) -> Path:
    return config.LIBRARY_DIR / row["trash_path"]


def list_items(conn) -> dict:
    items = []
    for r in conn.execute("SELECT * FROM trash ORDER BY deleted_at DESC, id DESC"):
        data = json.loads(r["data"])
        where = ""
        if r["kind"] == "file":
            where = data.get("song_title", "")
        items.append({"id": r["id"], "kind": r["kind"], "name": r["name"], "size": r["size"],
                      "deleted_at": r["deleted_at"], "where": where, "exists": _path(r).exists()})
    tracked = {Path(r["trash_path"]).name for r in conn.execute("SELECT trash_path FROM trash")}
    others = [p for p in config.TRASH_DIR.iterdir() if p.name not in tracked] if config.TRASH_DIR.exists() else []
    return {"items": items, "others": len(others), "others_size": sum(lib.path_size(p) for p in others),
            "size": sum(i["size"] for i in items)}


def _get(conn, item_id: int):
    row = conn.execute("SELECT * FROM trash WHERE id = ?", (item_id,)).fetchone()
    if not row:
        raise LibraryError("Item not found in the trash.")
    if not _path(row).exists():
        raise LibraryError("The file for this item is no longer in the .trash folder.")
    return row


def restore(conn, item_id: int) -> dict:
    row = _get(conn, item_id)
    data = json.loads(row["data"])
    src = _path(row)
    if row["kind"] == "loose":
        result = _restore_loose(conn, src, data["loose"])
    elif row["kind"] == "file":
        result = _restore_file(conn, src, data)
    elif row["kind"] == "song":
        result = _restore_song(conn, src, data)
    else:
        raise LibraryError("This item cannot be restored.")
    conn.execute("DELETE FROM trash WHERE id = ?", (item_id,))
    return result


def _restore_loose(conn, src: Path, info: dict) -> dict:
    target = lib.unique_path(config.LOOSE_DIR, info["name"])
    config.LOOSE_DIR.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(target))
    conn.execute(
        "INSERT INTO loose_files (name, rel_path, ext, size, origin, group_key, separated, sha256) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (target.name, target.relative_to(config.LIBRARY_DIR).as_posix(), info.get("ext", lib.ext_of(target.name)),
         target.stat().st_size, info.get("origin"), info.get("group_key") or lib.group_key(target.name),
         info.get("separated", 0), info.get("sha256")))
    return {"to": "loose"}


def _restore_file(conn, src: Path, data: dict) -> dict:
    info = data["file"]
    song = conn.execute("SELECT * FROM songs WHERE id = ?", (info["song_id"],)).fetchone()
    version = conn.execute("SELECT * FROM versions WHERE id = ? AND song_id = ?", (info["version_id"], info["song_id"])).fetchone()
    if not song or not version:
        # the song or version no longer exists: the file goes back to the File list
        _restore_loose(conn, src, {"name": info["name"], "ext": info["ext"], "origin": info.get("origin")})
        return {"to": "loose"}
    target_dir = lib.song_path(song) / f"v{version['number']}"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = lib.unique_path(target_dir, info["name"])
    shutil.move(str(src), str(target))
    cur = conn.execute(
        "INSERT INTO files (song_id, version_id, name, rel_path, ext, size, origin, sha256) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (song["id"], version["id"], target.name, target.relative_to(config.LIBRARY_DIR).as_posix(), info["ext"],
         target.stat().st_size, info.get("origin"), info.get("sha256")))
    lib.restore_markers(conn, data.get("markers"), {info["id"]: cur.lastrowid})
    lib.touch_song(conn, song["id"])
    lib.auto_main(conn, song["id"])
    return {"to": "song", "song_id": song["id"]}


def _restore_song(conn, src: Path, data: dict) -> dict:
    s = data["song"]
    idea = bool(s.get("is_idea"))
    area = "ideas" if idea else "songs"
    folder = lib.unique_folder(conn, "songs", s["folder"], config.IDEAS_DIR if idea else config.SONGS_DIR)
    target = lib.song_dir(folder, idea)
    shutil.move(str(src), str(target))
    band_id = s.get("band_id")
    if band_id and not conn.execute("SELECT 1 FROM bands WHERE id = ?", (band_id,)).fetchone():
        band_id = None
    cur = conn.execute(
        "INSERT INTO songs (title, folder, style, status, music_key, tuning, bpm, notes, favorite, cover, band_id, created_at, "
        "is_idea, idea_kind, idea_since, promoted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (s["title"], folder, s.get("style", ""), db.LEGACY_STATUS.get(s.get("status"), s.get("status")) or ("idea" if idea else "in_progress"),
         s.get("music_key", ""), s.get("tuning", ""), s.get("bpm", ""), s.get("notes", ""), s.get("favorite", 0),
         s.get("cover") if s.get("cover") and (target / s["cover"]).exists() else None, band_id, s.get("created_at"),
         int(idea), db.LEGACY_KIND.get(s.get("idea_kind", ""), s.get("idea_kind", "")), s.get("idea_since"), s.get("promoted_at")))
    new_id = cur.lastrowid
    version_map = {}
    for v in sorted(data["versions"], key=lambda x: x["number"]):
        c = conn.execute("INSERT INTO versions (song_id, number, label, created_at) VALUES (?, ?, ?, ?)",
                         (new_id, v["number"], v["label"], v["created_at"]))
        version_map[v["id"]] = c.lastrowid
    main_file = None
    file_map = {}
    # items trashed before the folders got English names still say musicas/ or ideias/
    old_prefixes = (f"{area}/{s['folder']}/", f"{'ideias' if idea else 'musicas'}/{s['folder']}/")
    for f in data["files"]:
        rel = f["rel_path"].replace("\\", "/")
        old_prefix = next((p for p in old_prefixes if rel.startswith(p)), None)
        rel = f"{area}/{folder}/" + rel[len(old_prefix):] if old_prefix else rel
        if not (config.LIBRARY_DIR / rel).exists() or f["version_id"] not in version_map:
            continue
        c = conn.execute(
            "INSERT INTO files (song_id, version_id, name, rel_path, ext, size, origin, sha256, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (new_id, version_map[f["version_id"]], f["name"], rel, f["ext"], f["size"], f.get("origin"), f.get("sha256"), f["created_at"]))
        file_map[f["id"]] = c.lastrowid
        if f["id"] == s.get("main_file_id"):
            main_file = c.lastrowid
    conn.execute("UPDATE songs SET main_file_id = ? WHERE id = ?", (main_file, new_id))
    lib.restore_markers(conn, data.get("markers"), file_map)
    for t in data["texts"]:
        conn.execute("INSERT INTO texts (song_id, title, body, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                     (new_id, t["title"], t["body"], t["position"], t["created_at"], t["updated_at"]))
    for a in data["albums"]:
        if conn.execute("SELECT 1 FROM albums WHERE id = ?", (a["album_id"],)).fetchone():
            conn.execute("INSERT OR IGNORE INTO album_songs (album_id, song_id, position) VALUES (?, ?, ?)",
                         (a["album_id"], new_id, a["position"]))
    for c in data.get("credits", []):
        if conn.execute("SELECT 1 FROM artists WHERE id = ?", (c["artist_id"],)).fetchone():
            conn.execute("INSERT INTO credits (artist_id, song_id, role, position) VALUES (?, ?, ?, ?)",
                         (c["artist_id"], new_id, c["role"], c["position"]))
    lib.auto_main(conn, new_id)
    return {"to": "song", "song_id": new_id}


def _remove(path: Path) -> None:
    if path.is_dir():
        shutil.rmtree(path, ignore_errors=True)
    elif path.exists():
        path.unlink()


def delete_forever(conn, item_id: int) -> None:
    row = conn.execute("SELECT * FROM trash WHERE id = ?", (item_id,)).fetchone()
    if not row:
        raise LibraryError("Item not found in the trash.")
    _remove(_path(row))
    conn.execute("DELETE FROM trash WHERE id = ?", (item_id,))


def purge_older_than(conn, days: int) -> int:
    """Automatic cleanup (off unless chosen in Settings): delete for good what has been in the trash longer than `days`."""
    if days <= 0:
        return 0
    rows = conn.execute("SELECT id FROM trash WHERE deleted_at < datetime('now', ?)", (f"-{int(days)} days",)).fetchall()
    for r in rows:
        delete_forever(conn, r["id"])
    return len(rows)


def empty(conn) -> int:
    n = 0
    if config.TRASH_DIR.exists():
        for p in config.TRASH_DIR.iterdir():
            _remove(p)
            n += 1
    conn.execute("DELETE FROM trash")
    return n
