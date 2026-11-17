"""Libraries and backups from early builds (Portuguese folder names) open in this version."""
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
FIXTURE = HERE / "fixtures" / "legacy-1.1-backup.zip"


def _legacy_library(dest: Path) -> Path:
    """Unpack the old backup the way it sat on disk in an early build."""
    lib = dest / "library"
    with zipfile.ZipFile(FIXTURE) as zf:
        for info in zf.infolist():
            if info.filename == "mdop.db":
                target = lib / ".mdop" / "mdop.db"
            elif info.filename.startswith("biblioteca/"):
                target = lib / info.filename[len("biblioteca/"):]
            else:
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(zf.read(info))
    for d in ("musicas/estrada-velha/v1", "ideias/exercicio-de-palhetada/v1"):
        (lib / d).mkdir(parents=True, exist_ok=True)
    return lib


def _run(*args) -> str:
    r = subprocess.run([sys.executable, str(HERE / "legacy_check.py"), *map(str, args)],
                       capture_output=True, text=True, timeout=120)
    assert r.returncode == 0, r.stdout + r.stderr
    return r.stdout


def test_old_library_is_updated_at_start(tmp_path):
    lib = _legacy_library(tmp_path)
    (tmp_path / "backups").mkdir()
    assert "UPGRADE OK" in _run("upgrade", lib, tmp_path / "backups")


def test_failed_update_leaves_library_untouched(tmp_path):
    lib = _legacy_library(tmp_path)
    (tmp_path / "backups").mkdir()
    # a folder that exists under both the old and the new name makes the update stop halfway
    (lib / "songs" / "cancao-da-serra").mkdir(parents=True)
    (lib / "songs" / "cancao-da-serra" / "note.txt").write_text("x")
    assert "CONFLICT OK" in _run("conflict", lib, tmp_path / "backups")


def test_old_backup_restores_into_new_install(tmp_path):
    (tmp_path / "backups").mkdir()
    shutil.copy(FIXTURE, tmp_path / "old.zip")
    assert "RESTORE OK" in _run("restore", tmp_path / "library", tmp_path / "backups", tmp_path / "old.zip")
