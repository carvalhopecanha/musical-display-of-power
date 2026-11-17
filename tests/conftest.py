"""Test setup: temporary library, import, sound-effect and backup folders."""
import os
import tempfile
from pathlib import Path

# resolved, as MDoP resolves paths: macOS /var -> /private/var, Windows short names (RUNNER~1) -> long names
_TMP = Path(tempfile.mkdtemp(prefix="mdop-test-")).resolve()
for name in ("import", "sfx", "backups"):
    (_TMP / name).mkdir()
os.environ["MDOP_LIBRARY"] = str(_TMP / "library")
os.environ["MDOP_IMPORT_ROOTS"] = str(_TMP / "import")
os.environ["MDOP_SFX_ROOTS"] = str(_TMP / "sfx")
os.environ["MDOP_BACKUP_DIR"] = str(_TMP / "backups")
# desktop app: settings file and working copies also in the temporary folder (never the user's real ones)
os.environ["MDOP_DESKTOP_CONFIG"] = str(_TMP / "desktop-config")
os.environ["MDOP_DESKTOP_CACHE"] = str(_TMP / "desktop-cache")
