"""One-time update of libraries made by early builds, which used Portuguese names.

Early builds kept the songs in musicas/, ideas in ideias/, the trash in .lixeira/,
covers as capa.jpg and so on. This module renames them to the English layout
(songs/, ideas/, .trash/, cover.jpg...) and updates the paths in the database.

Safety rules:
- Nothing is deleted: folders and files are only renamed, inside the same library.
- Before anything changes, a copy of the database is saved in .mdop/, and, when the
  backup folder has room for it, a full backup ZIP of the library.
- Every rename is written down. If anything fails, or if a file that could be
  opened before cannot be opened afterwards, every rename is undone and the
  database copy is put back, so the library ends up exactly as it was.
"""
from __future__ import annotations

import logging
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional

from . import config, db

log = logging.getLogger("mdop.migrate")

DIRS = [("musicas", "songs"), ("ideias", "ideas"), ("albuns", "albums"), ("bandas", "bands"),
        ("artistas", "artists"), ("audios-soltos", "inbox"), (".lixeira", ".trash")]
ENTITY_DIRS = ["songs", "ideas", "albums", "bands", "artists"]
COVER_FILES = [("capa.jpg", config.COVER_NAME), ("capa-mini.jpg", config.THUMB_NAME)]
DATA_FILES = [("fundo.jpg", config.BACKGROUND_NAME)]
# tables with a cover-like column and the folder their rows live in
COVERS = [("songs", "cover", "is_idea"), ("albums", "cover", "albums"), ("bands", "cover", "bands"),
          ("artists", "photo", "artists")]


class MigrationError(Exception):
    pass


def _layout(conn) -> Optional[str]:
    row = conn.execute("SELECT value FROM settings WHERE key = 'layout'").fetchone()
    return row[0] if row else None


def needed(lib_dir: Optional[Path] = None) -> bool:
    lib_dir = lib_dir or config.LIBRARY_DIR
    if not lib_dir.is_dir():
        return False
    if any((lib_dir / old).exists() for old, _ in DIRS):
        return True
    if not config.DB_PATH.exists():
        return False
    conn = sqlite3.connect(config.DB_PATH)
    try:
        has_settings = conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='settings'").fetchone()
        return not has_settings or _layout(conn) != db.LAYOUT
    finally:
        conn.close()


# ---------------------------------------------------------------- renames with a journal

class _Journal:
    def __init__(self):
        self.moves: list[tuple[Path, Path]] = []
        self.removed_dirs: list[Path] = []

    def move(self, src: Path, dst: Path) -> None:
        if dst.exists():
            raise MigrationError(f"{dst} already exists")
        src.rename(dst)
        self.moves.append((src, dst))

    def undo(self) -> list[str]:
        problems = []
        for d in reversed(self.removed_dirs):
            d.mkdir(parents=True, exist_ok=True)
        for src, dst in reversed(self.moves):
            try:
                if not src.parent.exists():
                    src.parent.mkdir(parents=True)
                dst.rename(src)
            except OSError as exc:
                problems.append(f"{dst} -> {src}: {exc}")
        return problems


def _move_dir(j: _Journal, src: Path, dst: Path) -> None:
    """Rename src to dst. If dst already exists (it should not), merge into it, never overwriting."""
    if not dst.exists():
        j.move(src, dst)
        return
    for child in sorted(src.iterdir()):
        target = dst / child.name
        if target.exists():
            raise MigrationError(f"{target} exists in both the old and the new folder")
        j.move(child, target)
    try:
        src.rmdir()   # now empty; undo recreates it
        j.removed_dirs.append(src)
    except OSError:
        pass


# ---------------------------------------------------------------- checks

def _cover_dir(lib_dir: Path, table: str, kind: str, row) -> Path:
    if table == "songs":
        return lib_dir / ("ideas" if row["is_idea"] else "songs") / row["folder"]
    return lib_dir / kind / row["folder"]


def _snapshot(conn, lib_dir: Path, new_layout: bool) -> dict:
    """Which files the database points to that can actually be opened right now."""
    def song_area(is_idea):
        return ("ideas" if is_idea else "songs") if new_layout else ("ideias" if is_idea else "musicas")
    ok = set()
    for table in ("files", "loose_files"):
        for r in conn.execute(f"SELECT id, rel_path FROM {table}"):
            if (lib_dir / r["rel_path"]).is_file():
                ok.add((table, r["id"]))
    for r in conn.execute("SELECT id, trash_path FROM trash"):
        if (lib_dir / r["trash_path"]).exists():
            ok.add(("trash", r["id"]))
    for table, col, kind in COVERS:
        cols = {c["name"] for c in conn.execute(f"PRAGMA table_info({table})")}
        idea_col = "is_idea" if "is_idea" in cols else "0 AS is_idea"
        for r in conn.execute(f"SELECT id, folder, {col} AS cover, {idea_col} FROM {table} WHERE {col} IS NOT NULL"):
            if table == "songs":
                d = lib_dir / song_area(r["is_idea"]) / r["folder"]
            else:
                old = {"albums": "albuns", "bands": "bandas", "artists": "artistas"}[kind]
                d = lib_dir / (kind if new_layout else old) / r["folder"]
            if (d / r["cover"]).is_file():
                ok.add((table, r["id"]))
    return {"ok": ok}


# ---------------------------------------------------------------- the database part

def _update_db(conn, lib_dir: Path) -> None:
    for table, col in (("files", "rel_path"), ("loose_files", "rel_path"), ("trash", "trash_path")):
        for old, new in DIRS:
            conn.execute(f"UPDATE {table} SET {col} = ? || substr({col}, ?) WHERE substr({col}, 1, ?) = ?",
                         (new + "/", len(old) + 2, len(old) + 1, old + "/"))
    for table, col, kind in COVERS:
        for r in conn.execute(f"SELECT * FROM {table} WHERE {col} IN ('capa.jpg', 'capa-mini.jpg')").fetchall():
            d = _cover_dir(lib_dir, table, kind, r)
            new = dict(COVER_FILES)[r[col]]
            if not (d / r[col]).exists() and (d / new).exists():
                conn.execute(f"UPDATE {table} SET {col} = ? WHERE id = ?", (new, r["id"]))
    for old, new in db.LEGACY_KIND.items():
        conn.execute("UPDATE songs SET idea_kind = ? WHERE idea_kind = ?", (new, old))
    # early builds had Portuguese as the default language: keep it for these libraries
    conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('lang', 'pt')")
    conn.execute("INSERT INTO settings (key, value) VALUES ('layout', ?) "
                 "ON CONFLICT(key) DO UPDATE SET value = excluded.value", (db.LAYOUT,))


def _full_backup(progress: Optional[dict]) -> str:
    """A full backup ZIP before changing anything, if the backup folder has room. Returns its name or ""."""
    from . import backup
    try:
        if not backup._writable(config.BACKUP_DIR):
            return ""
        size = sum(f.stat().st_size for f in config.LIBRARY_DIR.rglob("*") if f.is_file())
        if shutil.disk_usage(config.BACKUP_DIR).free < size * 1.1 + 200 * 1024 * 1024:
            log.warning("Not enough room in %s for a full backup before the update; keeping a database copy only.",
                        config.BACKUP_DIR)
            return ""
        name = backup.default_name("before-update")
        backup.create(config.BACKUP_DIR, name, True, progress)
        return name
    except Exception as exc:  # a failed extra backup must not stop the update; the database copy still exists
        log.warning("Full backup before the update failed: %s", exc)
        return ""


# ---------------------------------------------------------------- run

def run(progress: Optional[dict] = None, full_backup: bool = True) -> Optional[dict]:
    """Update the library to the English layout. Returns a report, or None when nothing was needed."""
    lib_dir = config.LIBRARY_DIR
    if not needed(lib_dir):
        return None
    has_db = config.DB_PATH.exists()
    report = {"backup": "", "db_copy": "", "renamed": 0}
    log.info("Updating the library at %s to English folder names…", lib_dir)

    db_copy = None
    if has_db:
        with db.connect() as conn:
            db.upgrade_schema(conn)    # old backups may predate some columns
        db_copy = config.DATA_DIR / f"mdop-before-update-{datetime.now().strftime('%Y-%m-%d-%H%M%S')}.db"
        src, dst = sqlite3.connect(config.DB_PATH), sqlite3.connect(db_copy)
        try:
            src.backup(dst)
        finally:
            dst.close()
            src.close()
        report["db_copy"] = db_copy.name
        if full_backup:
            report["backup"] = _full_backup(progress)
        with db.connect() as conn:
            before = _snapshot(conn, lib_dir, new_layout=False)["ok"]

    j = _Journal()
    try:
        for old, new in DIRS:
            if (lib_dir / old).exists():
                _move_dir(j, lib_dir / old, lib_dir / new)
        for area in ENTITY_DIRS:
            base = lib_dir / area
            if not base.is_dir():
                continue
            for folder in base.iterdir():
                if not folder.is_dir():
                    continue
                for old, new in COVER_FILES:
                    if (folder / old).is_file() and not (folder / new).exists():
                        j.move(folder / old, folder / new)
        for old, new in DATA_FILES:
            if (config.DATA_DIR / old).is_file() and not (config.DATA_DIR / new).exists():
                j.move(config.DATA_DIR / old, config.DATA_DIR / new)
        report["renamed"] = len(j.moves)

        if has_db:
            with db.connect() as conn:
                _update_db(conn, lib_dir)
            with db.connect() as conn:
                after = _snapshot(conn, lib_dir, new_layout=True)["ok"]
            lost = before - after
            if lost:
                raise MigrationError(f"{len(lost)} item(s) could not be found after renaming, e.g. {sorted(lost)[:5]}")
    except Exception as exc:
        log.error("Library update failed, undoing it: %s", exc)
        problems = j.undo()
        if db_copy and db_copy.exists():
            for suffix in ("-wal", "-shm"):
                Path(str(config.DB_PATH) + suffix).unlink(missing_ok=True)
            shutil.copy2(db_copy, config.DB_PATH)
        if problems:
            raise MigrationError(f"{exc}. Some renames could not be undone: {problems[:5]}") from exc
        raise MigrationError(str(exc)) from exc
    log.info("Library updated: %s items renamed.", report["renamed"])
    return report
