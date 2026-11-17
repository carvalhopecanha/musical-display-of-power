"""Download a song or a whole album as a ZIP.

The ZIP is built and sent in parts (streaming), with no temporary file and
without loading whole audio files into memory.
"""
import re
import zipfile
from pathlib import Path
from typing import Iterator

from . import library as lib
from .i18n import tr

CHUNK = 1024 * 1024
STATUS = {"idea": "Idea", "in_progress": "In progress", "ready": "Ready", "recorded": "Recorded"}


def safe(name: str) -> str:
    name = re.sub(r'[\x00-\x1f<>:"/\\|?*]', "_", name or "").strip(" .")
    return name[:120] or "untitled"


class _Buffer:
    """File-like object that collects what zipfile writes, so it can be sent in parts."""

    def __init__(self):
        self.parts: list[bytes] = []
        self.pos = 0

    def write(self, b) -> int:
        self.parts.append(bytes(b))
        self.pos += len(b)
        return len(b)

    def tell(self) -> int:
        return self.pos

    def flush(self):
        pass

    def take(self) -> bytes:
        data = b"".join(self.parts)
        self.parts = []
        return data


def _song_entries(conn, song_id: int, prefix: str) -> list[tuple]:
    """List of (path_in_zip, file_on_disk | None, text | None) for one song."""
    s = lib.song_detail(conn, song_id)
    row = lib.get_song(conn, song_id)
    out = []
    if row["cover"]:
        out.append((f"{prefix}cover.jpg", lib.song_path(row) / row["cover"], None))
    for v in sorted(s["versions"], key=lambda x: x["number"]):
        vdir = f"{prefix}v{v['number']} - {safe(v['label'])}/"
        for f in v["files"]:
            frow = lib.get_file(conn, f["id"])
            out.append((vdir + safe(f["name"]), lib.library_path(frow["rel_path"]), None))
    for t in s["texts"]:
        out.append((f"{prefix}Texts/{safe(t['title'])}.txt", None, t["body"]))
    info = [
        s["title"], "",
        f"{tr('Status')}: {tr(STATUS.get(s['status'], s['status']))}",
        f"{tr('Band')}: {s['band']['title']}" if s["band"] else "",
        f"{tr('Style')}: {s['style']}" if s["style"] else "",
        f"{tr('Key')}: {s['music_key']}" if s["music_key"] else "",
        f"{tr('Tuning')}: {s['tuning']}" if s["tuning"] else "",
        f"{tr('Tempo')}: {s['bpm']}" if s["bpm"] else "",
        f"{tr('Main file')}: {s['main_file']['name']}" if s["main_file"] else "",
        (f"{tr('Credits')}:\n" + "\n".join(f"  {c['artist']['name']}" + (f" — {c['role']}" if c["role"] else "") for c in s["credits"]))
        if s.get("credits") else "",
        "", s["notes"] or "",
    ]
    out.append((f"{prefix}info.txt", None, "\n".join(x for x in info if x is not None).strip() + "\n"))
    return out


def _stream(entries: list[tuple]) -> Iterator[bytes]:
    buf = _Buffer()
    seen = set()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_STORED, allowZip64=True) as zf:
        for arcname, path, text in entries:
            base, n = arcname, 2
            while arcname in seen:
                stem, dot, ext = base.rpartition(".")
                arcname = f"{stem} ({n}).{ext}" if dot else f"{base} ({n})"
                n += 1
            seen.add(arcname)
            if text is not None:
                zf.writestr(arcname, text.encode("utf-8"))
            elif path is not None and Path(path).is_file():
                with open(path, "rb") as src, zf.open(arcname, "w", force_zip64=True) as dst:
                    for chunk in iter(lambda: src.read(CHUNK), b""):
                        dst.write(chunk)
                        if buf.pos and len(buf.parts) > 4:
                            yield buf.take()
            yield buf.take()
    yield buf.take()


def song_zip(conn, song_id: int) -> tuple[str, Iterator[bytes]]:
    s = lib.get_song(conn, song_id)
    name = safe(s["title"])
    return f"{name}.zip", _stream(_song_entries(conn, song_id, f"{name}/"))


def album_zip(conn, album_id: int) -> tuple[str, Iterator[bytes]]:
    a = conn.execute("SELECT * FROM albums WHERE id = ?", (album_id,)).fetchone()
    if not a:
        raise lib.LibraryError("Album not found.")
    name = safe(a["title"])
    entries = []
    if a["cover"]:
        entries.append((f"{name}/cover.jpg", lib.album_dir(a["folder"]) / a["cover"], None))
    songs = conn.execute("SELECT s.id, s.title FROM songs s JOIN album_songs x ON x.song_id = s.id "
                         "WHERE x.album_id = ? ORDER BY x.position, s.title", (album_id,)).fetchall()
    for i, s in enumerate(songs, 1):
        entries += _song_entries(conn, s["id"], f"{name}/{i:02d} - {safe(s['title'])}/")
    if a["description"]:
        entries.append((f"{name}/about.txt", None, a["description"] + "\n"))
    return f"{name}.zip", _stream(entries)

