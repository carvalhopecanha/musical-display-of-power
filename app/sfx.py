"""Sound-effect (SFX) library from linked folders.

MDoP only READS these folders: it stores name, duration, format and category in
the database, but never copies, changes or deletes the original files.
"Removing" an effect only hides it from the list.
"""
from __future__ import annotations

import os
import threading
import wave
from datetime import datetime
from pathlib import Path
from typing import Optional

from . import config, db
from .library import LibraryError

# duration ranges for the filters (seconds)
DURATIONS = {"short": (0, 2), "medium": (2, 10), "long": (10, 60), "xlong": (60, None)}
SORTS = {"name": "s.name COLLATE NOCASE, s.id", "duration": "s.duration IS NULL, s.duration, s.id",
         "duration_desc": "s.duration IS NULL, s.duration DESC, s.id", "recent": "s.added_at DESC, s.id DESC",
         "random": "RANDOM()"}

_scan_lock = threading.Lock()
SCAN = {"running": False, "folder": "", "done": 0, "total": 0, "added": 0, "updated": 0, "missing": 0,
        "error": "", "finished_at": None}


# ---------------------------------------------------------------- folders

def roots_ok() -> bool:
    """There is an allowed effects folder with content (in Docker, with no folder chosen, /sfx is empty)."""
    for r in config.SFX_ROOTS:
        try:
            if r.is_dir() and any(r.iterdir()):
                return True
        except OSError:
            pass
    return False


def _root_for(p: Path) -> Optional[Path]:
    for r in config.SFX_ROOTS:
        if p == r or r in p.parents:
            return r
    return None


def browse(path: str = "") -> dict:
    """List subfolders inside the SFX roots (to choose what to link)."""
    if not path:
        return {"path": "", "parent": None,
                "entries": [{"name": str(r), "path": str(r)} for r in config.SFX_ROOTS if r.is_dir()]}
    p = Path(path).resolve()
    if not _root_for(p) or not p.is_dir():
        raise LibraryError("Folder outside the allowed sound-effect folders.")
    try:
        dirs = sorted((c for c in p.iterdir() if c.is_dir() and not c.name.startswith(".")), key=lambda c: c.name.lower())
    except PermissionError:
        raise LibraryError("No permission to read this folder.")
    parent = str(p.parent) if p not in config.SFX_ROOTS else ""
    return {"path": str(p), "parent": parent, "entries": [{"name": c.name, "path": str(c)} for c in dirs]}


def list_folders(conn) -> list[dict]:
    rows = conn.execute(
        "SELECT f.*, COUNT(s.id) total, SUM(s.missing) missing, SUM(s.hidden) hidden FROM sfx_folders f "
        "LEFT JOIN sfx s ON s.folder_id = f.id GROUP BY f.id ORDER BY f.path").fetchall()
    return [{"id": r["id"], "path": r["path"], "name": Path(r["path"]).name or r["path"], "files": r["total"] or 0,
             "missing": r["missing"] or 0, "hidden": r["hidden"] or 0, "scanned_at": r["scanned_at"],
             "available": Path(r["path"]).is_dir()} for r in rows]


def add_folder(conn, path: str) -> int:
    p = Path(path).resolve()
    if not _root_for(p):
        raise LibraryError("This folder is outside the sound-effect folders allowed for MDoP.")
    if not p.is_dir():
        raise LibraryError("Folder not found.")
    for r in conn.execute("SELECT path FROM sfx_folders"):
        other = Path(r["path"])
        if other == p or other in p.parents:
            raise LibraryError("This folder is already included in {other}.", other=other)
        if p in other.parents:
            raise LibraryError("This folder contains {other}, which is already linked. Remove it first.", other=other)
    return conn.execute("INSERT INTO sfx_folders (path) VALUES (?)", (str(p),)).lastrowid


def remove_folder(conn, folder_id: int) -> None:
    """Take the folder (and its effects) out of MDoP. The files stay where they are."""
    if not conn.execute("SELECT 1 FROM sfx_folders WHERE id = ?", (folder_id,)).fetchone():
        raise LibraryError("Folder not found.")
    conn.execute("DELETE FROM sfx_folders WHERE id = ?", (folder_id,))


# ---------------------------------------------------------------- reading the folders

def _duration(path: Path, ext: str) -> Optional[float]:
    try:
        if ext == "wav":
            with wave.open(str(path)) as w:
                return round(w.getnframes() / float(w.getframerate()), 3)
    except Exception:
        pass
    try:
        import mutagen
        info = mutagen.File(str(path))
        if info is not None and info.info and info.info.length:
            return round(float(info.info.length), 3)
    except Exception:
        pass
    return None


def _category(rel: str) -> tuple[str, str]:
    parts = rel.split("/")[:-1]
    return (parts[0], "/".join(parts[1:])) if parts else ("", "")


def _walk(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if not d.startswith("."))
        for name in filenames:
            if name.startswith("."):
                continue
            ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
            if ext in config.SFX_EXTS:
                yield Path(dirpath) / name, ext


def scan_folder(conn, folder_id: int, progress: Optional[dict] = None) -> dict:
    """Read a folder. Only looks again at what is new or changed (size or date); marks what disappeared."""
    folder = conn.execute("SELECT * FROM sfx_folders WHERE id = ?", (folder_id,)).fetchone()
    if not folder:
        raise LibraryError("Folder not found.")
    root = Path(folder["path"])
    stats = {"added": 0, "updated": 0, "missing": 0}
    if not root.is_dir():
        # drive off or folder moved: the effects are marked unavailable, not deleted
        stats["missing"] = conn.execute("UPDATE sfx SET missing = 1 WHERE folder_id = ? AND missing = 0", (folder_id,)).rowcount
        return stats
    known = {r["rel_path"]: r for r in conn.execute("SELECT id, rel_path, size, mtime, missing FROM sfx WHERE folder_id = ?", (folder_id,))}
    files = list(_walk(root))
    if progress is not None:
        progress["total"] += len(files)
    seen = set()
    for i, (path, ext) in enumerate(files, 1):
        rel = path.relative_to(root).as_posix()
        seen.add(rel)
        try:
            st = path.stat()
        except OSError:
            continue
        old = known.get(rel)
        if old is None:
            cat, sub = _category(rel)
            conn.execute(
                "INSERT INTO sfx (folder_id, rel_path, name, ext, size, mtime, duration, category, subcategory) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (folder_id, rel, path.stem, ext, st.st_size, st.st_mtime, _duration(path, ext), cat, sub))
            stats["added"] += 1
        elif old["size"] != st.st_size or abs(old["mtime"] - st.st_mtime) > 1:
            conn.execute("UPDATE sfx SET size = ?, mtime = ?, duration = ?, missing = 0 WHERE id = ?",
                         (st.st_size, st.st_mtime, _duration(path, ext), old["id"]))
            stats["updated"] += 1
        elif old["missing"]:
            conn.execute("UPDATE sfx SET missing = 0 WHERE id = ?", (old["id"],))
        if progress is not None:
            progress["done"] += 1
        if i % 500 == 0:
            conn.commit()
    gone = [r["id"] for rel, r in known.items() if rel not in seen and not r["missing"]]
    for chunk in range(0, len(gone), 500):
        ids = gone[chunk:chunk + 500]
        conn.execute(f"UPDATE sfx SET missing = 1 WHERE id IN ({','.join('?' * len(ids))})", ids)
    stats["missing"] = len(gone)
    conn.execute("UPDATE sfx_folders SET scanned_at = ? WHERE id = ?",
                 (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), folder_id))
    return stats


def start_scan(folder_id: Optional[int] = None) -> dict:
    """Read the folders in the background (with tens of thousands of files it can take a few minutes)."""
    with _scan_lock:
        if SCAN["running"]:
            return dict(SCAN)
        SCAN.update(running=True, folder="", done=0, total=0, added=0, updated=0, missing=0, error="", finished_at=None)

    def work():
        try:
            with db.connect() as conn:
                ids = [folder_id] if folder_id else [r["id"] for r in conn.execute("SELECT id FROM sfx_folders ORDER BY path")]
            for fid in ids:
                with db.connect() as conn:
                    row = conn.execute("SELECT path FROM sfx_folders WHERE id = ?", (fid,)).fetchone()
                    if not row:
                        continue
                    SCAN["folder"] = row["path"]
                    st = scan_folder(conn, fid, SCAN)
                for k in ("added", "updated", "missing"):
                    SCAN[k] += st[k]
        except Exception as exc:  # the error is shown on the Settings page
            SCAN["error"] = str(exc)
        finally:
            SCAN.update(running=False, folder="", finished_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    threading.Thread(target=work, daemon=True, name="mdop-sfx-scan").start()
    return dict(SCAN)


# ---------------------------------------------------------------- search

def _item(r) -> dict:
    return {"id": r["id"], "name": r["name"], "ext": r["ext"], "size": r["size"], "duration": r["duration"],
            "category": r["category"], "subcategory": r["subcategory"],
            "tags": [x for x in r["tags"].split(",") if x], "favorite": bool(r["favorite"]),
            "hidden": bool(r["hidden"]), "missing": bool(r["missing"]),
            "folder": Path(r["folder_path"]).name, "url": f"/api/sfx/{r['id']}/audio"}


def search(conn, q: str = "", category: str = "", sub: str = "", tag: str = "", dur: str = "", fmt: str = "",
           favorite: bool = False, folder: int = 0, hidden: bool = False, sort: str = "name",
           offset: int = 0, limit: int = 100) -> dict:
    where, args = ["s.hidden = ?"], [int(hidden)]
    for word in q.lower().split():
        where.append("(LOWER(s.name) LIKE ? OR LOWER(s.category) LIKE ? OR LOWER(s.subcategory) LIKE ? OR LOWER(s.tags) LIKE ?)")
        args += [f"%{word}%"] * 4
    if category:
        where.append("s.category = ?"); args.append("" if category == "__none" else category)
    if sub:
        where.append("(s.subcategory = ? OR s.subcategory LIKE ?)"); args += [sub, f"{sub}/%"]
    if tag:
        where.append("(',' || s.tags || ',') LIKE ?"); args.append(f"%,{tag},%")
    if dur in DURATIONS:
        lo, hi = DURATIONS[dur]
        where.append("s.duration >= ?"); args.append(lo)
        if hi is not None:
            where.append("s.duration < ?"); args.append(hi)
    if fmt:
        where.append("s.ext = ?"); args.append(fmt.lower())
    if favorite:
        where.append("s.favorite = 1")
    if folder:
        where.append("s.folder_id = ?"); args.append(folder)
    sql_where = " WHERE " + " AND ".join(where)
    total = conn.execute(f"SELECT COUNT(*) FROM sfx s{sql_where}", args).fetchone()[0]
    rows = conn.execute(
        f"SELECT s.*, f.path folder_path FROM sfx s JOIN sfx_folders f ON f.id = s.folder_id{sql_where} "
        f"ORDER BY {SORTS.get(sort, SORTS['name'])} LIMIT ? OFFSET ?",
        args + [max(1, min(limit, 500)), max(0, offset)]).fetchall()
    return {"total": total, "items": [_item(r) for r in rows]}


def facets(conn) -> dict:
    cats: dict[str, dict] = {}
    tags: dict[str, int] = {}
    fmts: dict[str, int] = {}
    for r in conn.execute("SELECT category, subcategory, tags, ext FROM sfx WHERE hidden = 0"):
        c = cats.setdefault(r["category"], {"name": r["category"], "count": 0, "subs": {}})
        c["count"] += 1
        if r["subcategory"]:
            top = r["subcategory"].split("/")[0]
            c["subs"][top] = c["subs"].get(top, 0) + 1
        for tg in filter(None, r["tags"].split(",")):
            tags[tg] = tags.get(tg, 0) + 1
        fmts[r["ext"]] = fmts.get(r["ext"], 0) + 1
    categories = sorted(cats.values(), key=lambda c: (not c["name"], c["name"].lower()))
    for c in categories:
        c["subs"] = [{"name": k, "count": v} for k, v in sorted(c["subs"].items(), key=lambda x: x[0].lower())]
    return {"categories": categories,
            "tags": [{"name": k, "count": v} for k, v in sorted(tags.items(), key=lambda x: (-x[1], x[0].lower()))],
            "formats": sorted(fmts)}


def get(conn, sfx_id: int):
    row = conn.execute("SELECT s.*, f.path folder_path FROM sfx s JOIN sfx_folders f ON f.id = s.folder_id WHERE s.id = ?",
                       (sfx_id,)).fetchone()
    if not row:
        raise LibraryError("Sound effect not found.")
    return row


def file_path(row) -> Path:
    root = Path(row["folder_path"])
    path = (root / row["rel_path"]).resolve()
    if root not in path.parents or not _root_for(path):
        raise LibraryError("Invalid path.")
    if not path.is_file():
        raise LibraryError("This file is not available right now (the drive may be disconnected).")
    return path


def update(conn, sfx_id: int, changes: dict) -> dict:
    get(conn, sfx_id)
    if "tags" in changes:
        clean = []
        for tg in changes["tags"]:
            tg = tg.strip().lower().replace(",", " ")[:40]
            if tg and tg not in clean:
                clean.append(tg)
        conn.execute("UPDATE sfx SET tags = ? WHERE id = ?", (",".join(clean), sfx_id))
    for key in ("favorite", "hidden"):
        if key in changes:
            conn.execute(f"UPDATE sfx SET {key} = ? WHERE id = ?", (int(bool(changes[key])), sfx_id))
    return _item(get(conn, sfx_id))


def summary(conn) -> dict:
    r = conn.execute("SELECT COUNT(*) n, SUM(hidden) h, SUM(missing) m FROM sfx").fetchone()
    return {"count": (r["n"] or 0) - (r["h"] or 0), "hidden": r["h"] or 0, "missing": r["m"] or 0,
            "folders": conn.execute("SELECT COUNT(*) FROM sfx_folders").fetchone()[0],
            "roots": [str(p) for p in config.SFX_ROOTS], "roots_ok": roots_ok()}
