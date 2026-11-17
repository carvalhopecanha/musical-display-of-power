"""SQLite database: a single file inside the library."""
import sqlite3
from contextlib import contextmanager

from . import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS songs (
    id           INTEGER PRIMARY KEY,
    title        TEXT NOT NULL,
    folder       TEXT NOT NULL UNIQUE,
    style        TEXT NOT NULL DEFAULT '',
    status       TEXT NOT NULL DEFAULT 'in_progress',
    music_key    TEXT NOT NULL DEFAULT '',
    tuning       TEXT NOT NULL DEFAULT '',
    bpm          TEXT NOT NULL DEFAULT '',
    notes        TEXT NOT NULL DEFAULT '',
    favorite     INTEGER NOT NULL DEFAULT 0,
    cover        TEXT,
    main_file_id INTEGER,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS versions (
    id         INTEGER PRIMARY KEY,
    song_id    INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    number     INTEGER NOT NULL,
    label      TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (song_id, number)
);
CREATE TABLE IF NOT EXISTS files (
    id          INTEGER PRIMARY KEY,
    song_id     INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    version_id  INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    rel_path    TEXT NOT NULL UNIQUE,
    ext         TEXT NOT NULL DEFAULT '',
    size        INTEGER NOT NULL DEFAULT 0,
    origin      TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS files_song ON files(song_id);
CREATE INDEX IF NOT EXISTS files_origin ON files(origin);
CREATE TABLE IF NOT EXISTS albums (
    id          INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    folder      TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    cover       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS bands (
    id          INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    folder      TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    cover       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS texts (
    id         INTEGER PRIMARY KEY,
    song_id    INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    title      TEXT NOT NULL DEFAULT '',
    body       TEXT NOT NULL DEFAULT '',
    position   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS loose_files (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    rel_path   TEXT NOT NULL UNIQUE,
    ext        TEXT NOT NULL DEFAULT '',
    size       INTEGER NOT NULL DEFAULT 0,
    origin     TEXT,
    group_key  TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS loose_origin ON loose_files(origin);
CREATE TABLE IF NOT EXISTS artists (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    folder     TEXT NOT NULL UNIQUE,
    bio        TEXT NOT NULL DEFAULT '',
    photo      TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS credits (
    id         INTEGER PRIMARY KEY,
    artist_id  INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    song_id    INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    album_id   INTEGER REFERENCES albums(id) ON DELETE CASCADE,
    band_id    INTEGER REFERENCES bands(id) ON DELETE CASCADE,
    role       TEXT NOT NULL DEFAULT '',
    position   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS credits_artist ON credits(artist_id);
CREATE INDEX IF NOT EXISTS credits_song ON credits(song_id);
CREATE INDEX IF NOT EXISTS credits_album ON credits(album_id);
CREATE TABLE IF NOT EXISTS trash (
    id         INTEGER PRIMARY KEY,
    kind       TEXT NOT NULL,
    name       TEXT NOT NULL,
    trash_path TEXT NOT NULL,
    size       INTEGER NOT NULL DEFAULT 0,
    data       TEXT NOT NULL DEFAULT '{}',
    deleted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS markers (
    id         INTEGER PRIMARY KEY,
    file_id    INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    time       REAL NOT NULL,
    end_time   REAL,
    label      TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS markers_file ON markers(file_id);
CREATE TABLE IF NOT EXISTS sfx_folders (
    id         INTEGER PRIMARY KEY,
    path       TEXT NOT NULL UNIQUE,
    added_at   TEXT NOT NULL DEFAULT (datetime('now')),
    scanned_at TEXT
);
CREATE TABLE IF NOT EXISTS sfx (
    id          INTEGER PRIMARY KEY,
    folder_id   INTEGER NOT NULL REFERENCES sfx_folders(id) ON DELETE CASCADE,
    rel_path    TEXT NOT NULL,
    name        TEXT NOT NULL,
    ext         TEXT NOT NULL,
    size        INTEGER NOT NULL DEFAULT 0,
    mtime       REAL NOT NULL DEFAULT 0,
    duration    REAL,
    category    TEXT NOT NULL DEFAULT '',
    subcategory TEXT NOT NULL DEFAULT '',
    tags        TEXT NOT NULL DEFAULT '',
    favorite    INTEGER NOT NULL DEFAULT 0,
    hidden      INTEGER NOT NULL DEFAULT 0,
    missing     INTEGER NOT NULL DEFAULT 0,
    added_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (folder_id, rel_path)
);
CREATE INDEX IF NOT EXISTS sfx_name ON sfx(name);
CREATE INDEX IF NOT EXISTS sfx_category ON sfx(category, subcategory);
CREATE TABLE IF NOT EXISTS album_songs (
    album_id INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    song_id  INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (album_id, song_id)
);
"""


# Columns added after the first schema: (table, column, definition)
MIGRATIONS = [
    ("songs", "is_idea", "INTEGER NOT NULL DEFAULT 0"),
    ("songs", "idea_kind", "TEXT NOT NULL DEFAULT ''"),
    ("songs", "idea_since", "TEXT"),
    ("songs", "promoted_at", "TEXT"),
    ("albums", "status", "TEXT NOT NULL DEFAULT 'idea'"),
    ("songs", "band_id", "INTEGER REFERENCES bands(id) ON DELETE SET NULL"),
    ("albums", "band_id", "INTEGER REFERENCES bands(id) ON DELETE SET NULL"),
    ("loose_files", "separated", "INTEGER NOT NULL DEFAULT 0"),
    ("loose_files", "sha256", "TEXT"),
    ("files", "sha256", "TEXT"),
    ("albums", "release", "TEXT NOT NULL DEFAULT ''"),
    ("albums", "recorded_at", "TEXT NOT NULL DEFAULT ''"),
    ("albums", "label", "TEXT NOT NULL DEFAULT ''"),
]


# Status and idea-kind values used by early builds, which stored them in Portuguese.
LEGACY_STATUS = {"triagem": "idea", "desenvolvendo": "in_progress", "pronta": "ready", "gravada": "recorded"}
LEGACY_KIND = {"melodia": "melody", "harmonia": "harmony", "escala": "scale", "exercicio": "exercise"}


def upgrade_schema(conn: sqlite3.Connection) -> None:
    """Create missing tables and columns, and bring old values up to date. Safe to run any number of times."""
    conn.executescript(SCHEMA)
    for table, column, definition in MIGRATIONS:
        cols = {r["name"] for r in conn.execute(f"PRAGMA table_info({table})")}
        if column not in cols:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
    # paths always use "/" (a library made on Windows opens on Linux and the other way round)
    for table, col in (("files", "rel_path"), ("loose_files", "rel_path"), ("trash", "trash_path")):
        conn.execute(f"UPDATE {table} SET {col} = REPLACE({col}, '\\', '/') WHERE {col} LIKE '%\\%'")
    for old, new in LEGACY_STATUS.items():
        conn.execute("UPDATE songs SET status = ? WHERE status = ?", (new, old))
        conn.execute("UPDATE albums SET status = ? WHERE status = ?", (new, old))
    # songs no longer have the "idea" status (that is the Ideas tab now)
    conn.execute("UPDATE songs SET status = 'in_progress' WHERE status = 'idea' AND is_idea = 0")


def init() -> None:
    for d in (config.LIBRARY_DIR, config.SONGS_DIR, config.IDEAS_DIR, config.ALBUMS_DIR, config.BANDS_DIR, config.ARTISTS_DIR,
              config.LOOSE_DIR, config.TRASH_DIR, config.DATA_DIR):
        d.mkdir(parents=True, exist_ok=True)
    with connect() as conn:
        upgrade_schema(conn)
        conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('layout', ?)", (LAYOUT,))


# Version of the folder layout on disk. 2 = English folder names (songs/, ideas/, .trash/...).
LAYOUT = "2"


def _open() -> sqlite3.Connection:
    conn = sqlite3.connect(config.DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA busy_timeout = 30000")
    return conn


@contextmanager
def connect():
    """One connection per operation; commits at the end or rolls back on error."""
    conn = _open()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
