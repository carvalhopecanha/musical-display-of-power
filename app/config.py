"""Settings read from environment variables.

No hard-coded paths: the same code runs in Docker, directly on the system
or packaged as a desktop app.
"""
import os
from pathlib import Path

APP_NAME = "Musical Display of Power"
VERSION = "1.1.1"
REPO_URL = "https://github.com/carvalhopecanha/musical-display-of-power"

_sep = ";" if os.name == "nt" else ":"


def _paths(value: str) -> list[Path]:
    return [Path(p).expanduser().resolve() for p in value.split(_sep) if p.strip()]


# Where MDoP keeps the songs, covers, database and trash.
LIBRARY_DIR = Path(os.environ.get("MDOP_LIBRARY", "./library")).expanduser().resolve()

# Server folders that can be browsed in "Add files". Several folders separated by ":" (";" on Windows).
IMPORT_ROOTS = _paths(os.environ.get("MDOP_IMPORT_ROOTS", ""))
# Sound-effect (SFX) root folders. MDoP only reads them: it never copies, changes or deletes anything there.
SFX_ROOTS = _paths(os.environ.get("MDOP_SFX_ROOTS", ""))

# Library path as seen by the host (outside the container, in Docker). Display only.
LIBRARY_HOST = os.environ.get("MDOP_LIBRARY_HOST", "").strip() or None

# Desktop app (app/desktop.py): local window, folders chosen in Settings, "open with" and "save as new version".
DESKTOP = os.environ.get("MDOP_DESKTOP", "") == "1"

HOST = os.environ.get("MDOP_HOST", "0.0.0.0")
PORT = int(os.environ.get("MDOP_PORT", "8090"))



def set_roots(import_roots=None, sfx_roots=None) -> None:
    """Replace the import or SFX folders while the app runs (desktop Settings).

    The lists are changed in place, so modules that keep a reference to them see the change.
    """
    for target, value in ((IMPORT_ROOTS, import_roots), (SFX_ROOTS, sfx_roots)):
        if value is not None:
            target[:] = [Path(p).expanduser().resolve() for p in value]


SONGS_DIR = LIBRARY_DIR / "songs"
IDEAS_DIR = LIBRARY_DIR / "ideas"
ALBUMS_DIR = LIBRARY_DIR / "albums"
BANDS_DIR = LIBRARY_DIR / "bands"
ARTISTS_DIR = LIBRARY_DIR / "artists"
LOOSE_DIR = LIBRARY_DIR / "inbox"
TRASH_DIR = LIBRARY_DIR / ".trash"
DATA_DIR = LIBRARY_DIR / ".mdop"
DB_PATH = DATA_DIR / "mdop.db"
COVER_NAME = "cover.jpg"
THUMB_NAME = "cover-thumb.jpg"
BACKGROUND_NAME = "background.jpg"
# Where backups are stored (in Docker, the folder mounted at /backups).
BACKUP_DIR = Path(os.environ.get("MDOP_BACKUP_DIR") or (LIBRARY_DIR.parent / "mdop-backups")).expanduser().resolve()

# Largest single upload, in MB (0 = no limit). Backups uploaded for restore are not limited.
MAX_UPLOAD_MB = int(os.environ.get("MDOP_MAX_UPLOAD_MB", "2048") or 0)

STATUSES = ["idea", "in_progress", "ready", "recorded"]   # albums use all four
SONG_STATUSES = ["in_progress", "ready", "recorded"]      # song ideas live in the Ideas tab
IDEA_KINDS = ["riff", "melody", "harmony", "scale", "exercise"]  # built-in kinds; users can add their own

# Format groups used by the library filters.
SFX_EXTS = {"wav", "mp3", "ogg", "oga", "opus", "flac", "aif", "aiff", "m4a", "aac", "webm"}
AUDIO_EXTS = {"mp3", "wav", "m4a", "aac", "ogg", "oga", "opus", "flac", "aif", "aiff", "wma", "amr", "3gp", "caf", "webm"}
MIDI_EXTS = {"mid", "midi"}
GP_EXTS = {"gp", "gp3", "gp4", "gp5", "gpx", "gtp", "tg"}
IMAGE_EXTS = {"jpg", "jpeg", "png", "webp", "gif"}

# lang "" = follow the browser language
DEFAULT_SETTINGS = {"lang": "", "theme": "dark", "accent": "yellow", "hidden": "", "trash_days": "0"}
# menu parts that can be switched off in Settings (switching off only hides; nothing is deleted)
OPTIONAL_MODULES = ["ideas", "sfx", "albums", "bands", "artists", "favorites"]
SETTING_CHOICES = {"lang": {"", "pt", "en"}, "theme": {"dark", "light", "glass"},
                   "accent": {"yellow", "blue", "green", "red", "purple"}, "trash_days": {"0", "30", "90"}}
