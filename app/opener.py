"""Desktop only: open library files in the system's default program and catch edits.

A file is never opened in place. MDoP copies it to a working folder outside the
library and opens the copy. When the copy changes (the user edited it in Guitar Pro,
Reaper, etc. and saved), MDoP offers to keep the result as a new version of the song.
The original file is never touched.
"""
import os
import secrets
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path
from typing import Callable, Optional

from . import desktop_prefs
from . import library as lib
from .library import LibraryError

# A change only counts once the file has stayed the same for this long (programs save in steps).
SETTLE_SECONDS = 1.5

_lock = threading.Lock()
SESSIONS: dict[str, dict] = {}


def work_dir() -> Path:
    return desktop_prefs.cache_dir() / "open"


def _clean_env() -> dict:
    """Environment for launching other programs.

    Packaged builds (PyInstaller, AppImage) point LD_LIBRARY_PATH and similar at their
    bundled libraries; system programs must not inherit that.
    """
    env = dict(os.environ)
    for var in ("LD_LIBRARY_PATH", "DYLD_LIBRARY_PATH", "QT_PLUGIN_PATH", "QML2_IMPORT_PATH",
                "GTK_PATH", "GIO_MODULE_DIR", "GDK_PIXBUF_MODULE_FILE", "PYTHONHOME", "PYTHONPATH"):
        orig = env.pop(var + "_ORIG", None)
        if orig is not None:
            env[var] = orig
        elif getattr(sys, "frozen", False) or os.environ.get("APPIMAGE"):
            env.pop(var, None)
    return env


def system_open(path: Path) -> None:
    """Open a file or folder with the program the system uses for it."""
    path = Path(path)
    if not path.exists():
        raise LibraryError("File not found.")
    if sys.platform == "win32":
        os.startfile(str(path))  # noqa: S606 (desktop app, user's own file)
        return
    cmd = ["open", str(path)] if sys.platform == "darwin" else ["xdg-open", str(path)]
    try:
        subprocess.Popen(cmd, env=_clean_env(), stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL, start_new_session=True)
    except OSError:
        raise LibraryError("Could not open the file with the default program.")


# tests replace this to avoid launching programs
launcher: Callable[[Path], None] = system_open


def _stamp(path: Path) -> Optional[tuple[int, int]]:
    try:
        st = path.stat()
    except OSError:
        return None
    return st.st_mtime_ns, st.st_size


def open_copy(conn, file_id: int) -> dict:
    """Copy a song file to the working folder and open the copy."""
    f = lib.get_file(conn, file_id)
    src = lib.library_path(f["rel_path"])
    if not src.is_file():
        raise LibraryError("File not found.")
    with _lock:
        # the same file already open and untouched: open the same copy again
        for token, s in SESSIONS.items():
            if s["file_id"] == file_id and _stamp(s["path"]) == s["stamp"]:
                launcher(s["path"])
                return _public(token, s)
        token = secrets.token_hex(8)
        folder = work_dir() / f"{file_id}-{token}"
        folder.mkdir(parents=True, exist_ok=True)
        copy = folder / f["name"]
        shutil.copy2(src, copy)
        SESSIONS[token] = {"file_id": file_id, "song_id": f["song_id"], "name": f["name"], "path": copy,
                           "stamp": _stamp(copy), "seen": None, "seen_at": 0.0}
        session = SESSIONS[token]
    launcher(copy)
    return _public(token, session)


def _public(token: str, s: dict) -> dict:
    return {"token": token, "file_id": s["file_id"], "song_id": s["song_id"], "name": s["name"]}


def pending_edits(conn) -> list[dict]:
    """Working copies that were saved by another program and not yet handled."""
    now = time.monotonic()
    out = []
    with _lock:
        for token, s in list(SESSIONS.items()):
            current = _stamp(s["path"])
            if current is None or current == s["stamp"]:
                continue
            if current != s["seen"]:          # still changing: wait until it settles
                s["seen"], s["seen_at"] = current, now
                continue
            if now - s["seen_at"] < SETTLE_SECONDS:
                continue
            song = conn.execute("SELECT id, title, is_idea FROM songs WHERE id = ?", (s["song_id"],)).fetchone()
            if not song:                       # the song went to the trash meanwhile
                continue
            out.append({**_public(token, s), "song_title": song["title"], "is_idea": bool(song["is_idea"]),
                        "size": current[1]})
    return out


def _session(token: str) -> dict:
    s = SESSIONS.get(token)
    if not s:
        raise LibraryError("This edit is no longer available.")
    return s


def save_as_version(conn, token: str, label: str = "") -> dict:
    """Keep the edited copy as a new version of the song. The original stays as it was."""
    with _lock:
        s = _session(token)
        if not s["path"].is_file():
            raise LibraryError("File not found.")
        version = lib.create_version(conn, s["song_id"], label.strip())
        new_id, _ = lib.add_file(conn, s["song_id"], version["id"], s["path"], s["name"], mode="copy",
                                 origin=None)
        # later saves of the same copy can become another version
        s["stamp"] = _stamp(s["path"])
        s["seen"] = None
    return {"song_id": s["song_id"], "version_id": version["id"], "number": version["number"], "file_id": new_id}


def dismiss(token: str) -> None:
    """Ignore the current change (later saves are offered again)."""
    with _lock:
        s = _session(token)
        s["stamp"] = _stamp(s["path"])
        s["seen"] = None


def cleanup(conn) -> int:
    """On exit: edits that were not handled go to the File list, then the working copies are removed.

    Nothing the user saved is lost. Returns how many edited copies were kept.
    """
    kept = 0
    with _lock:
        for s in SESSIONS.values():
            current = _stamp(s["path"])
            if current is not None and current != s["stamp"]:
                lib.add_loose(conn, s["path"], s["name"])
                kept += 1
        SESSIONS.clear()
    shutil.rmtree(work_dir(), ignore_errors=True)
    return kept
