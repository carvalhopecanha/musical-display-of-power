"""Backup and restore of the whole library.

A backup is an uncompressed .zip (audio is already compressed: compressing it
again would only make it slow) with the database, every library folder and an
mdop-backup.json with the version and the date. Restoring always saves a safety
copy of the current library first. Backups from early builds, with Portuguese
folder names, are updated to the current layout as they are restored.
"""
from __future__ import annotations

import contextvars
import json
import os
import re
import shutil
import sqlite3
import sys
import tempfile
import threading
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Iterator, Optional

from . import config, db, migrate
from .library import LibraryError
from .zips import CHUNK, _Buffer

MANIFEST = "mdop-backup.json"
DB_ENTRY = "mdop.db"
LIB_PREFIX = "library/"
LIB_PREFIXES = (LIB_PREFIX, "biblioteca/")   # early builds used "biblioteca/"
NAME_RE = re.compile(r"^[\w.\- ]+\.zip$")

MAINTENANCE = {"on": False}
_lock = threading.Lock()
# requests that are using the library right now (see main.require_login): a restore waits for them
_inflight = {"n": 0}
_inflight_cond = threading.Condition()


def request_started() -> None:
    with _inflight_cond:
        _inflight["n"] += 1


def request_finished() -> None:
    with _inflight_cond:
        _inflight["n"] -= 1
        _inflight_cond.notify_all()


def _wait_for_requests(timeout: float = 120) -> None:
    """After MAINTENANCE is on, new requests are refused; wait for the ones already running to finish."""
    with _inflight_cond:
        _inflight_cond.wait_for(lambda: _inflight["n"] <= 0, timeout=timeout)
JOB = {"kind": "", "running": False, "done": 0, "total": 0, "name": "", "error": "", "finished_at": None,
       "safety": ""}


def default_name(prefix: str = "mdop-backup") -> str:
    return f"{prefix}-{datetime.now().strftime('%Y-%m-%d-%H%M%S')}.zip"


def _backup_dir_inside_library() -> bool:
    return config.BACKUP_DIR == config.LIBRARY_DIR or config.LIBRARY_DIR in config.BACKUP_DIR.parents


def _library_files(include_trash: bool) -> list[Path]:
    """Everything in the library except the database (saved as a safe copy) and the backup folder itself."""
    skip_dirs = {config.DATA_DIR}
    if not include_trash:
        skip_dirs.add(config.TRASH_DIR)
    if _backup_dir_inside_library():
        skip_dirs.add(config.BACKUP_DIR)
    out = []
    for dirpath, dirnames, filenames in os.walk(config.LIBRARY_DIR):
        here = Path(dirpath)
        dirnames[:] = sorted(d for d in dirnames if here / d not in skip_dirs)
        out += [here / f for f in sorted(filenames)]
    # the Glass theme background lives in .mdop, but it belongs to the library
    for name in (config.BACKGROUND_NAME, "fundo.jpg"):
        if (config.DATA_DIR / name).exists():
            out.append(config.DATA_DIR / name)
    return out


def _db_snapshot() -> Path:
    """Consistent copy of the database, even while the app is in use (SQLite backup API)."""
    fd, name = tempfile.mkstemp(prefix="mdop-db-", suffix=".db")
    os.close(fd)   # an open handle would keep Windows from deleting the file later
    tmp = Path(name)
    src = sqlite3.connect(config.DB_PATH)
    dst = sqlite3.connect(tmp)
    try:
        src.backup(dst)
    finally:
        dst.close()
        src.close()
    return tmp


def _manifest(files: list[Path], include_trash: bool) -> dict:
    with db.connect() as conn:
        counts = {k: conn.execute(q).fetchone()[0] for k, q in {
            "songs": "SELECT COUNT(*) FROM songs WHERE is_idea = 0", "ideas": "SELECT COUNT(*) FROM songs WHERE is_idea = 1",
            "albums": "SELECT COUNT(*) FROM albums", "files": "SELECT COUNT(*) FROM files"}.items()}
    return {"app": config.APP_NAME, "version": config.VERSION, "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "include_trash": include_trash, "library_files": len(files),
            "bytes": sum(f.stat().st_size for f in files if f.exists()), **counts}


def _entries(include_trash: bool):
    files = _library_files(include_trash)
    snap = _db_snapshot()
    manifest = _manifest(files, include_trash)
    items = [(MANIFEST, None, json.dumps(manifest, ensure_ascii=False, indent=2).encode()), (DB_ENTRY, snap, None)]
    items += [(LIB_PREFIX + f.relative_to(config.LIBRARY_DIR).as_posix(), f, None) for f in files]
    return items, snap, manifest


def _write(zf: zipfile.ZipFile, items, progress: Optional[dict] = None, on_chunk=None):
    for arc, path, data in items:
        if data is not None:
            zf.writestr(arc, data)
            continue
        if not path.exists():
            continue
        info = zipfile.ZipInfo.from_file(path, arc)
        info.compress_type = zipfile.ZIP_STORED
        with path.open("rb") as src, zf.open(info, "w", force_zip64=True) as dst:
            while True:
                chunk = src.read(CHUNK)
                if not chunk:
                    break
                dst.write(chunk)
                if progress is not None:
                    progress["done"] += len(chunk)
                if on_chunk:
                    yield from on_chunk()
        if on_chunk:
            yield from on_chunk()


def stream(include_trash: bool = True) -> Iterator[bytes]:
    """Backup straight to the browser, in parts (nothing is kept on the server)."""
    items, snap, _ = _entries(include_trash)
    buf = _Buffer()
    try:
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_STORED, allowZip64=True) as zf:
            yield from _write(zf, items, on_chunk=lambda: iter([buf.take()]))
        yield buf.take()
    finally:
        snap.unlink(missing_ok=True)


def create(dest_dir: Path, name: str, include_trash: bool = True, progress: Optional[dict] = None) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    items, snap, manifest = _entries(include_trash)
    if progress is not None:
        progress["total"] = manifest["bytes"]
    part = dest_dir / (name + ".part")
    try:
        with zipfile.ZipFile(part, "w", zipfile.ZIP_STORED, allowZip64=True) as zf:
            for _ in _write(zf, items, progress):
                pass
        final = dest_dir / name
        part.replace(final)
        return final
    finally:
        snap.unlink(missing_ok=True)
        part.unlink(missing_ok=True)


# ---------------------------------------------------------------- backup folder

def info() -> dict:
    d = config.BACKUP_DIR
    items = []
    if d.is_dir():
        for f in sorted(d.glob("*.zip"), key=lambda p: p.stat().st_mtime, reverse=True):
            items.append({"name": f.name, "size": f.stat().st_size,
                          "date": datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                          "manifest": read_manifest(f)})
    writable = _writable(d)
    free = shutil.disk_usage(d).free if d.is_dir() else None
    return {"dir": str(d), "host_dir": os.environ.get("MDOP_BACKUP_HOST", ""), "writable": writable,
            "free": free, "backups": items, "job": dict(JOB)}


def _writable(d: Path) -> bool:
    try:
        d.mkdir(parents=True, exist_ok=True)
        probe = d / ".mdop-write-test"
        probe.write_text("ok")
        probe.unlink()
        return True
    except OSError:
        return False


def read_manifest(path: Path) -> Optional[dict]:
    try:
        with zipfile.ZipFile(path) as zf:
            return json.loads(zf.read(MANIFEST))
    except (OSError, KeyError, zipfile.BadZipFile, ValueError):
        return None


def backup_path(name: str) -> Path:
    if not NAME_RE.match(name or ""):
        raise LibraryError("Invalid backup name.")
    p = config.BACKUP_DIR / name
    if not p.is_file():
        raise LibraryError("Backup not found.")
    return p


def save_upload(upload) -> dict:
    d = config.BACKUP_DIR
    if not _writable(d):
        raise LibraryError("The backup folder is not writable.")
    base = re.sub(r"[^\w.\- ]", "_", Path(upload.filename or "backup.zip").name)
    if not base.lower().endswith(".zip"):
        base += ".zip"
    target = d / base
    n = 1
    while target.exists():
        target = d / f"{base[:-4]} ({n}).zip"
        n += 1
    part = target.with_suffix(".part")
    with part.open("wb") as out:
        shutil.copyfileobj(upload.file, out, CHUNK)
    if read_manifest(part) is None:
        part.unlink(missing_ok=True)
        raise LibraryError("This file is not an MDoP backup.")
    part.replace(target)
    return {"name": target.name}


# ---------------------------------------------------------------- background jobs

def start_job(kind: str, work, keep_maintenance_on_error: bool = False) -> dict:
    """Run a backup, restore or library update in the background. Only one at a time.

    With keep_maintenance_on_error the app stays paused if the job fails (used by the
    library update: the app must not open a library it could not update)."""
    with _lock:
        if JOB["running"]:
            raise LibraryError("A backup or restore is already running.")
        JOB.update(kind=kind, running=True, done=0, total=0, name="", error="", finished_at=None, safety="")
        if kind == "migrate":
            MAINTENANCE["on"] = True
    ctx = contextvars.copy_context()   # keeps the language of the request that started the job

    def run():
        failed = False
        try:
            work()
        except Exception as exc:  # the message is shown on the Settings page / waiting screen
            failed = True
            JOB["error"] = str(exc)
        finally:
            if not (failed and keep_maintenance_on_error):
                MAINTENANCE["on"] = False
            JOB.update(running=False, finished_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    threading.Thread(target=lambda: ctx.run(run), daemon=True, name=f"mdop-{kind}").start()
    return dict(JOB)


def start_create(include_trash: bool = True) -> dict:
    if not _writable(config.BACKUP_DIR):
        raise LibraryError("The backup folder is not writable. Check the folder chosen in the installer.")
    name = default_name()

    def work():
        JOB["name"] = name
        create(config.BACKUP_DIR, name, include_trash, JOB)

    return start_job("backup", work)


def _rmtree(path: Path) -> None:
    """Delete a folder; SQLite removes its -wal/-shm files by itself, so a file that vanished midway is not an error."""
    def vanished(func, p, exc):
        exc = exc if isinstance(exc, BaseException) else exc[1]
        if not isinstance(exc, FileNotFoundError):
            raise exc
    if sys.version_info >= (3, 12):
        shutil.rmtree(path, onexc=vanished)
    else:
        shutil.rmtree(path, onerror=vanished)


def _library_has_content() -> bool:
    with db.connect() as conn:
        return bool(conn.execute("SELECT (SELECT COUNT(*) FROM songs) + (SELECT COUNT(*) FROM loose_files) + "
                                 "(SELECT COUNT(*) FROM albums)").fetchone()[0])


def _check_zip(path: Path) -> dict:
    manifest = read_manifest(path)
    if manifest is None:
        raise LibraryError("This file is not an MDoP backup.")
    with zipfile.ZipFile(path) as zf:
        names = zf.namelist()
    if DB_ENTRY not in names:
        raise LibraryError("The backup is incomplete (the database is missing).")
    for n in names:
        p = Path(n)
        if p.is_absolute() or ".." in p.parts:
            raise LibraryError("The backup has invalid paths and will not be restored.")
    return manifest


def start_restore(path: Path) -> dict:
    manifest = _check_zip(path)
    if not _writable(config.BACKUP_DIR):
        raise LibraryError("To restore, the backup folder must be writable (the safety copy goes there).")

    def work():
        JOB["name"] = path.name
        # 1. safety copy of the current library, before touching anything
        if _library_has_content():
            JOB["safety"] = default_name("before-restore")
            create(config.BACKUP_DIR, JOB["safety"], True, JOB)
        MAINTENANCE["on"] = True
        _wait_for_requests()
        # 2. empty the library (backups stay, if they are inside it)
        for child in config.LIBRARY_DIR.iterdir():
            if child == config.BACKUP_DIR or child in config.BACKUP_DIR.parents:
                continue
            if child.is_dir() and not child.is_symlink():
                _rmtree(child)
            else:
                child.unlink(missing_ok=True)
        # 3. extract the backup
        with zipfile.ZipFile(path) as zf:
            infos = [i for i in zf.infolist() if not i.is_dir()]
            JOB.update(done=0, total=sum(i.file_size for i in infos))
            for i in infos:
                if i.filename == MANIFEST:
                    continue
                if i.filename == DB_ENTRY:
                    target = config.DB_PATH
                elif i.filename.startswith(LIB_PREFIXES):
                    prefix = next(p for p in LIB_PREFIXES if i.filename.startswith(p))
                    target = config.LIBRARY_DIR / i.filename[len(prefix):]
                else:
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(i) as src, target.open("wb") as out:
                    while True:
                        chunk = src.read(CHUNK)
                        if not chunk:
                            break
                        out.write(chunk)
                        JOB["done"] += len(chunk)
        # 4. bring a backup from an earlier version up to date (folder names, then the database)
        migrate.run(full_backup=False)
        db.init()
        if not manifest.get("include_trash", True):
            with db.connect() as conn:
                conn.execute("DELETE FROM trash")

    return start_job("restore", work)
