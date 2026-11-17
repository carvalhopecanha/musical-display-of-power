"""Artists (people) and credits.

A band is the group or project; an artist is the person. Each credit links an
artist to a song, an album or a band, with a free-text role
(vocals, guitar, songwriting, production, cover art…).
"""
from typing import Optional

from . import config
from . import library as lib
from .library import LibraryError


def artist_dir(folder: str):
    return config.ARTISTS_DIR / folder


def get_artist(conn, artist_id: int):
    row = conn.execute("SELECT * FROM artists WHERE id = ?", (artist_id,)).fetchone()
    if not row:
        raise LibraryError("Artist not found.")
    return row


def photo_url(row) -> Optional[str]:
    return lib.media_url(f"artists/{row['folder']}/{row['photo']}", row["updated_at"]) if row["photo"] else None


def create_artist(conn, name: str, bio: str = "") -> int:
    name = (name or "").strip() or "Artista sem nome"
    folder = lib.unique_folder(conn, "artists", lib.slugify(name), config.ARTISTS_DIR)
    cur = conn.execute("INSERT INTO artists (name, folder, bio) VALUES (?, ?, ?)", (name, folder, bio.strip()))
    return cur.lastrowid


def find_or_create(conn, name: str) -> int:
    name = (name or "").strip()
    if not name:
        raise LibraryError("Enter the artist's name.")
    row = conn.execute("SELECT id FROM artists WHERE name = ? COLLATE NOCASE", (name,)).fetchone()
    return row["id"] if row else create_artist(conn, name)


def artist_summary(conn, row) -> dict:
    counts = conn.execute(
        "SELECT COUNT(DISTINCT song_id) s, COUNT(DISTINCT album_id) a, COUNT(DISTINCT band_id) b FROM credits WHERE artist_id = ?",
        (row["id"],)).fetchone()
    roles = [r["role"] for r in conn.execute(
        "SELECT role, COUNT(*) n FROM credits WHERE artist_id = ? AND role != '' GROUP BY role ORDER BY n DESC LIMIT 3", (row["id"],))]
    return {"id": row["id"], "name": row["name"], "bio": row["bio"], "photo_url": photo_url(row),
            "song_count": counts["s"], "album_count": counts["a"], "band_count": counts["b"], "roles": roles,
            "updated_at": row["updated_at"]}


def credits_for(conn, column: str, target_id: int) -> list[dict]:
    """Credits of a song, album or band."""
    assert column in ("song_id", "album_id", "band_id")
    rows = conn.execute(
        f"SELECT c.id AS cid, c.role, a.id AS aid, a.name, a.folder, a.photo, a.updated_at "
        f"FROM credits c JOIN artists a ON a.id = c.artist_id WHERE c.{column} = ? ORDER BY c.position, c.id",
        (target_id,)).fetchall()
    return [{"id": r["cid"], "role": r["role"],
             "artist": {"id": r["aid"], "name": r["name"], "photo_url": photo_url(r)}} for r in rows]


def add_credit(conn, *, artist_id: Optional[int], artist_name: str, role: str,
               song_id: Optional[int] = None, album_id: Optional[int] = None, band_id: Optional[int] = None) -> dict:
    targets = [x for x in (song_id, album_id, band_id) if x]
    if len(targets) != 1:
        raise LibraryError("A credit must belong to a song, an album or a band.")
    if song_id:
        lib.get_song(conn, song_id)
    if album_id and not conn.execute("SELECT 1 FROM albums WHERE id = ?", (album_id,)).fetchone():
        raise LibraryError("Album not found.")
    if band_id:
        lib.get_band(conn, band_id)
    aid = get_artist(conn, artist_id)["id"] if artist_id else find_or_create(conn, artist_name)
    col, tid = next((c, v) for c, v in (("song_id", song_id), ("album_id", album_id), ("band_id", band_id)) if v)
    pos = conn.execute(f"SELECT COALESCE(MAX(position), 0) + 1 FROM credits WHERE {col} = ?", (tid,)).fetchone()[0]
    cur = conn.execute(f"INSERT INTO credits (artist_id, {col}, role, position) VALUES (?, ?, ?, ?)",
                       (aid, tid, (role or "").strip(), pos))
    if song_id:
        lib.touch_song(conn, song_id)
    return {"id": cur.lastrowid, "artist_id": aid}


def artist_detail(conn, artist_id: int) -> dict:
    row = get_artist(conn, artist_id)
    data = artist_summary(conn, row)

    def grouped(column: str):
        out: dict[int, list[str]] = {}
        for r in conn.execute(f"SELECT {column} t, role FROM credits WHERE artist_id = ? AND {column} IS NOT NULL ORDER BY id", (artist_id,)):
            out.setdefault(r["t"], [])
            if r["role"] and r["role"] not in out[r["t"]]:
                out[r["t"]].append(r["role"])
        return out

    songs = []
    for sid, roles in grouped("song_id").items():
        s = conn.execute("SELECT * FROM songs WHERE id = ?", (sid,)).fetchone()
        if s:
            songs.append({**lib.song_summary(conn, s), "roles": roles})
    albums = []
    for aid, roles in grouped("album_id").items():
        a = conn.execute("SELECT * FROM albums WHERE id = ?", (aid,)).fetchone()
        if a:
            albums.append({**lib.album_summary(conn, a), "roles": roles})
    bands = []
    for bid, roles in grouped("band_id").items():
        b = conn.execute("SELECT * FROM bands WHERE id = ?", (bid,)).fetchone()
        if b:
            bands.append({**lib.band_summary(conn, b), "roles": roles})
    data.update({"songs": sorted(songs, key=lambda x: x["title"].lower()),
                 "albums": sorted(albums, key=lambda x: x["title"].lower()),
                 "bands": sorted(bands, key=lambda x: x["title"].lower())})
    return data
