"""Desktop preferences: where the library lives and which folders the user picked.

Saved as JSON in the system's settings folder (platformdirs), for example
~/.config/MDoP on Linux, %LOCALAPPDATA%\\MDoP on Windows and
~/Library/Application Support/MDoP on macOS. The server (Docker) never uses this file.

This module has no GUI dependencies so it can be tested anywhere.
"""
import json
import os
import tempfile
from pathlib import Path

APP_DIR_NAME = "MDoP"
FILE_NAME = "desktop.json"
DEFAULTS = {"library": "", "import_roots": [], "sfx_roots": [], "backup_dir": ""}


def config_dir() -> Path:
    override = os.environ.get("MDOP_DESKTOP_CONFIG", "").strip()
    if override:
        return Path(override).expanduser()
    from platformdirs import user_config_dir
    return Path(user_config_dir(APP_DIR_NAME, appauthor=False, roaming=False))


def cache_dir() -> Path:
    """Scratch space for working copies of files opened in other programs."""
    override = os.environ.get("MDOP_DESKTOP_CACHE", "").strip()
    if override:
        return Path(override).expanduser()
    from platformdirs import user_cache_dir
    return Path(user_cache_dir(APP_DIR_NAME, appauthor=False))


def default_library() -> Path:
    """The user's Music folder (localized by the system) plus MDoP."""
    from platformdirs import user_music_dir
    return Path(user_music_dir()) / APP_DIR_NAME


def prefs_path() -> Path:
    return config_dir() / FILE_NAME


def norm(path) -> str:
    """Absolute path with "/" separators (also on Windows), as MDoP stores paths."""
    return Path(path).expanduser().resolve().as_posix()


def load() -> dict:
    data = dict(DEFAULTS)
    try:
        stored = json.loads(prefs_path().read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return data
    if isinstance(stored, dict):
        for key, default in DEFAULTS.items():
            value = stored.get(key, default)
            if isinstance(default, list):
                data[key] = [str(v) for v in value if isinstance(v, str) and v.strip()] if isinstance(value, list) else []
            elif isinstance(value, str):
                data[key] = value
    return data


def save(data: dict) -> dict:
    """Write atomically (a crash never leaves a half-written file)."""
    clean = {k: data.get(k, v) for k, v in DEFAULTS.items()}
    folder = config_dir()
    folder.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=folder, prefix=".desktop-", suffix=".json")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(clean, fh, ensure_ascii=False, indent=2)
        os.replace(tmp, prefs_path())
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise
    return clean


def update(**changes) -> dict:
    data = load()
    data.update({k: v for k, v in changes.items() if k in DEFAULTS})
    return save(data)


def add_root(key: str, path) -> dict:
    """Add a folder to import_roots or sfx_roots (no duplicates)."""
    data = load()
    p = norm(path)
    if p not in data[key]:
        data[key] = data[key] + [p]
    return save(data)


def remove_root(key: str, path) -> dict:
    data = load()
    p = norm(path)
    data[key] = [r for r in data[key] if norm(r) != p]
    return save(data)


def check_library_folder(path: str) -> str:
    """Create the folder if needed and make sure MDoP can write there. Returns an error key or ""."""
    if not path.strip():
        return "empty"
    p = Path(path).expanduser()
    try:
        p.mkdir(parents=True, exist_ok=True)
        probe = p / ".mdop-write-test"
        probe.write_text("ok", encoding="utf-8")
        probe.unlink()
    except OSError:
        return "not_writable"
    return ""


def apply_env(data: dict) -> None:
    """Point the app at the chosen folders. Must run before app.config is imported."""
    sep = ";" if os.name == "nt" else ":"
    os.environ["MDOP_DESKTOP"] = "1"
    os.environ["MDOP_LIBRARY"] = data["library"]
    os.environ["MDOP_IMPORT_ROOTS"] = sep.join(data["import_roots"])
    os.environ["MDOP_SFX_ROOTS"] = sep.join(data["sfx_roots"])
    if data.get("backup_dir"):
        os.environ["MDOP_BACKUP_DIR"] = data["backup_dir"]
