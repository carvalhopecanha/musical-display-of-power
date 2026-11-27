"""Musical Display of Power — web server (API + pages)."""
import shutil
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import logging
import shutil as _sh
import threading
import time
from urllib.parse import quote as _quote, urlsplit

from . import artists as art
from . import auth, backup, config, db, i18n, migrate, sfx, trash, zips
from . import library as lib
from .library import LibraryError

STATIC_DIR = Path(__file__).parent / "static"
log = logging.getLogger("mdop")


def _housekeeping() -> None:
    """Runs at start and then once a day: automatic trash cleanup, when switched on in Settings."""
    while True:
        try:
            if not backup.MAINTENANCE["on"]:
                with db.connect() as conn:
                    days = int(lib.get_settings(conn)["trash_days"])
                    if days and (n := trash.purge_older_than(conn, days)):
                        log.info("Trash cleanup: %s item(s) older than %s days deleted.", n, days)
        except Exception as exc:  # never stop the app because of the cleanup
            log.warning("Trash cleanup failed: %s", exc)
        time.sleep(24 * 3600)


def _start() -> None:
    """Open the library. A library from an early build is first renamed to English names (with the app paused)."""
    if not migrate.needed():
        db.init()
        threading.Thread(target=_housekeeping, daemon=True, name="mdop-housekeeping").start()
        return

    def work():
        migrate.run(backup.JOB)
        db.init()
        threading.Thread(target=_housekeeping, daemon=True, name="mdop-housekeeping").start()

    backup.start_job("migrate", work, keep_maintenance_on_error=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    _start()
    yield
    if config.DESKTOP:
        _desktop_shutdown()


app = FastAPI(title=config.APP_NAME, version=config.VERSION, lifespan=lifespan)

OPEN_PATHS = {"/api/auth/status", "/api/auth/login", "/api/health"}
# library folders that are never served as media (database, trash; .lixeira = early builds)
HIDDEN_DIRS = (".mdop", ".trash", ".lixeira")
SAFE_METHODS = ("GET", "HEAD", "OPTIONS")


def _cross_site(request: Request) -> bool:
    """A change requested by a page from another site, through the user's browser (CSRF).

    MDoP runs on the local network, often without a password, so any page the user opens could
    otherwise empty the trash or restore a backup with a hidden form. "same-site" is refused too:
    on a home server, other services on the same address count as the same site.
    Requests with neither header (curl, scripts) are not from a browser page and stay allowed.
    """
    site = request.headers.get("sec-fetch-site")
    if site is not None:
        return site not in ("same-origin", "none")
    origin = request.headers.get("origin")
    if origin is None:
        return False
    return origin == "null" or urlsplit(origin).netloc.lower() != (request.headers.get("host") or "").lower()


@app.middleware("http")
async def require_login(request: Request, call_next):
    path = request.url.path
    uses_library = path.startswith("/api/") or path.startswith("/media/")
    if uses_library and request.method not in SAFE_METHODS and _cross_site(request):
        i18n.LANG.set(i18n.pick_lang("", request.headers.get("accept-language", "")))
        return JSONResponse(status_code=403, content={"detail": i18n.tr("Request refused: it came from another site.")})
    if not uses_library:
        i18n.LANG.set(i18n.pick_lang("", request.headers.get("accept-language", "")))
        return await call_next(request)
    backup.request_started()   # counted first, so a restore that starts now waits for this request
    try:
        return await _guarded(request, call_next, path)
    finally:
        backup.request_finished()


async def _guarded(request: Request, call_next, path: str):
    accept = request.headers.get("accept-language", "")
    if backup.MAINTENANCE["on"]:
        # while a backup is restored (or the library is updated) it is being replaced: nothing reads or writes it
        if path not in ("/api/backup/status", "/api/health"):
            return JSONResponse(status_code=503, content={"detail": "restoring"})
        i18n.LANG.set(i18n.pick_lang("", accept))   # do not open the database now
        return await call_next(request)
    with db.connect() as conn:
        i18n.LANG.set(i18n.pick_lang(lib.get_settings(conn)["lang"], accept))
        if path not in OPEN_PATHS and auth.enabled(conn) and not auth.valid_token(conn, auth.session_cookie(request.cookies)):
            return JSONResponse(status_code=401, content={"detail": "login"})
    return await call_next(request)


@app.exception_handler(LibraryError)
def _library_error(_: Request, exc: LibraryError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


# ================================================================ request models

class SongIn(BaseModel):
    title: str
    style: str = ""


class SongPatch(BaseModel):
    band_id: Optional[int] = None
    title: Optional[str] = None
    style: Optional[str] = None
    status: Optional[str] = None
    music_key: Optional[str] = None
    tuning: Optional[str] = None
    bpm: Optional[str] = None
    notes: Optional[str] = None
    favorite: Optional[bool] = None
    idea_kind: Optional[str] = None


class IdeaIn(BaseModel):
    title: str = ""
    kind: str = ""


class PromoteIn(BaseModel):
    title: str = ""
    style: str = ""
    band_id: Optional[int] = None


class MergeIn(BaseModel):
    song_id: int


class VersionIn(BaseModel):
    label: str = ""


class FilePatch(BaseModel):
    name: Optional[str] = None
    version_id: Optional[int] = None


class MainIn(BaseModel):
    file_id: int


class AlbumIn(BaseModel):
    title: str
    description: str = ""


class AlbumPatch(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    band_id: Optional[int] = None
    release: Optional[str] = None
    recorded_at: Optional[str] = None
    label: Optional[str] = None
    status: Optional[str] = None


class BandIn(BaseModel):
    title: str
    description: str = ""


class BandPatch(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class TextIn(BaseModel):
    title: str = ""
    body: str = ""


class TextPatch(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None


class LooseAssignIn(BaseModel):
    file_ids: List[int]
    action: str = "new"
    title: str = ""
    song_id: Optional[int] = None
    new_version: bool = False
    version_label: str = ""
    band_id: Optional[int] = None
    kind: str = ""


class LooseIdsIn(BaseModel):
    file_ids: List[int]


class SettingsIn(BaseModel):
    lang: Optional[str] = None
    theme: Optional[str] = None
    accent: Optional[str] = None
    hidden: Optional[str] = None
    trash_days: Optional[str] = None


class CoverFromFileIn(BaseModel):
    file_id: int


class ArtistIn(BaseModel):
    name: str
    bio: str = ""


class ArtistPatch(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None


class CreditIn(BaseModel):
    artist_id: Optional[int] = None
    artist_name: str = ""
    role: str = ""
    song_id: Optional[int] = None
    album_id: Optional[int] = None
    band_id: Optional[int] = None


class CreditPatch(BaseModel):
    role: str


class LooseFlagIn(BaseModel):
    file_ids: List[int]
    value: bool = True


class MarkerIn(BaseModel):
    time: float
    end_time: Optional[float] = None
    label: str = ""


class MarkerPatch(BaseModel):
    time: Optional[float] = None
    end_time: Optional[float] = None
    label: Optional[str] = None


class SfxFolderIn(BaseModel):
    path: str


class SfxPatch(BaseModel):
    favorite: Optional[bool] = None
    hidden: Optional[bool] = None
    tags: Optional[list[str]] = None


class BackupIn(BaseModel):
    include_trash: bool = True


class RestoreIn(BaseModel):
    name: str


class LoginIn(BaseModel):
    user: str = ""
    password: str = ""


class PasswordChangeIn(BaseModel):
    current: str
    new: str


class PasswordIn(BaseModel):
    password: str


class AlbumSongsIn(BaseModel):
    song_ids: List[int]


class ServerImportIn(BaseModel):
    paths: List[str]
    mode: str = "copy"
    target: str = "new"
    title: str = ""
    song_id: Optional[int] = None
    new_version: bool = False
    version_label: str = ""
    version_id: Optional[int] = None


# ================================================================ general

@app.get("/api/health")
def health():
    """For the Docker health check: answers even with a password set or while the library is being updated."""
    return {"ok": True, "version": config.VERSION}


@app.get("/api/meta")
def meta():
    with db.connect() as conn:
        styles = conn.execute(
            "SELECT style, COUNT(*) n FROM songs WHERE style != '' AND is_idea = 0 GROUP BY style ORDER BY style COLLATE NOCASE").fetchall()
        counts = conn.execute("SELECT COUNT(*) songs, SUM(favorite) favs FROM songs WHERE is_idea = 0").fetchone()
        n_ideas = conn.execute("SELECT COUNT(*) FROM songs WHERE is_idea = 1").fetchone()[0]
        sfx_summary = sfx.summary(conn)
        kinds = lib.idea_kinds(conn)
        n_albums = conn.execute("SELECT COUNT(*) FROM albums").fetchone()[0]
        n_files, size = conn.execute("SELECT COUNT(*), COALESCE(SUM(size), 0) FROM files").fetchone()
        bands = conn.execute("SELECT id, title, folder, cover, updated_at FROM bands ORDER BY title COLLATE NOCASE").fetchall()
        n_loose = len(lib.loose_groups(conn))
        settings = lib.get_settings(conn)
        n_trash = conn.execute("SELECT COUNT(*) FROM trash").fetchone()[0]
        n_artists = conn.execute("SELECT COUNT(*) FROM artists").fetchone()[0]
        by_status = {r["status"]: r["n"] for r in conn.execute("SELECT status, COUNT(*) n FROM songs WHERE is_idea = 0 GROUP BY status")}
        loose_bytes = conn.execute("SELECT COALESCE(SUM(size), 0) FROM loose_files").fetchone()[0]
        auth_on = auth.enabled(conn)
        auth_user = auth.user(conn)
        by_type = {"audio": 0, "midi": 0, "gp": 0, "other": 0}
        for r in conn.execute("SELECT LOWER(ext) ext, COUNT(*) n FROM files GROUP BY LOWER(ext)"):
            kind = ("audio" if r["ext"] in config.AUDIO_EXTS else "midi" if r["ext"] in config.MIDI_EXTS
                    else "gp" if r["ext"] in config.GP_EXTS else "other")
            by_type[kind] += r["n"]
    disk = _sh.disk_usage(config.LIBRARY_DIR)
    bg = lib.background_path()
    return {
        "by_type": by_type, "ideas": n_ideas, "idea_kinds": kinds, "sfx": sfx_summary,
        "background_url": f"/api/background?v={int(bg.stat().st_mtime)}" if bg.exists() else None,
        "trash": n_trash, "artists": n_artists, "auth": {"enabled": auth_on, "user": auth_user}, "by_status": by_status,
        "library_host": config.LIBRARY_HOST, "library_bytes": size + loose_bytes,
        "disk": {"total": disk.total, "free": disk.free},
        "settings": settings, "loose": n_loose,
        "bands": [{"id": b["id"], "title": b["title"],
                   "cover_url": lib.media_url(f"bands/{b['folder']}/{b['cover']}", b["updated_at"]) if b["cover"] else None}
                  for b in bands],
        "desktop": config.DESKTOP,
        "app": config.APP_NAME, "version": config.VERSION, "repo": config.REPO_URL, "library": str(config.LIBRARY_DIR),
        "import_roots": [str(r) for r in config.IMPORT_ROOTS], "statuses": config.STATUSES,
        "styles": [{"name": s["style"], "count": s["n"]} for s in styles],
        "songs": counts["songs"], "favorites": counts["favs"] or 0, "albums": n_albums,
        "files": n_files, "bytes": size,
    }


@app.get("/api/search")
def search(q: str = ""):
    """Global search on Home: songs, albums, bands, artists and the File list."""
    q = q.strip()
    if not q:
        return {"songs": [], "ideas": [], "albums": [], "bands": [], "artists": [], "loose": [], "sfx": []}
    like = f"%{q}%"
    songs = list_songs(q=q, limit=24)
    ideas = list_songs(q=q, limit=24, ideas=True)
    with db.connect() as conn:
        albums = [lib.album_summary(conn, r) for r in conn.execute(
            "SELECT * FROM albums WHERE title LIKE ? OR description LIKE ? OR label LIKE ? ORDER BY title COLLATE NOCASE LIMIT 12",
            (like, like, like))]
        bands = [lib.band_summary(conn, r) for r in conn.execute(
            "SELECT * FROM bands WHERE title LIKE ? ORDER BY title COLLATE NOCASE LIMIT 12", (like,))]
        artists = [art.artist_summary(conn, r) for r in conn.execute(
            "SELECT * FROM artists WHERE name LIKE ? ORDER BY name COLLATE NOCASE LIMIT 12", (like,))]
        sfx_found = sfx.search(conn, q=q, limit=12)
        needle = q.lower()
        loose = [{"title": g["title"], "files": [f["name"] for f in g["files"]], "origin_dir": g["origin_dir"]}
                 for g in lib.loose_groups(conn)
                 if needle in g["title"].lower() or any(needle in f["name"].lower() for f in g["files"])]
    return {"songs": songs, "ideas": ideas, "albums": albums, "bands": bands, "artists": artists,
            "sfx": sfx_found["items"], "sfx_total": sfx_found["total"],
            "loose": loose[:12], "loose_total": len(loose)}


# ---------------------------------------------------------------- sound effects (SFX)

@app.get("/api/sfx")
def sfx_list(q: str = "", category: str = "", sub: str = "", tag: str = "", dur: str = "", fmt: str = "",
             favorite: bool = False, folder: int = 0, hidden: bool = False, sort: str = "name",
             offset: int = 0, limit: int = 100):
    with db.connect() as conn:
        return sfx.search(conn, q, category, sub, tag, dur, fmt, favorite, folder, hidden, sort, offset, limit)


@app.get("/api/sfx/facets")
def sfx_facets():
    with db.connect() as conn:
        return sfx.facets(conn)


@app.get("/api/sfx/folders")
def sfx_folders():
    with db.connect() as conn:
        return {"folders": sfx.list_folders(conn), "roots": [str(r) for r in config.SFX_ROOTS],
                "roots_ok": sfx.roots_ok(), "scan": dict(sfx.SCAN)}


@app.post("/api/sfx/folders")
def sfx_add_folder(data: SfxFolderIn):
    with db.connect() as conn:
        fid = sfx.add_folder(conn, data.path)
    return {"id": fid, "scan": sfx.start_scan(fid)}


@app.delete("/api/sfx/folders/{folder_id}")
def sfx_remove_folder(folder_id: int):
    with db.connect() as conn:
        row = conn.execute("SELECT path FROM sfx_folders WHERE id = ?", (folder_id,)).fetchone()
        sfx.remove_folder(conn, folder_id)
    if config.DESKTOP and row:
        # on the desktop, each linked folder is also its own root: unlinking it forgets the root too
        _desktop_forget_root("sfx_roots", row["path"])
    return {"ok": True}


@app.get("/api/sfx/browse")
def sfx_browse(path: str = ""):
    return sfx.browse(path)


@app.post("/api/sfx/scan")
def sfx_scan(folder_id: int = 0):
    return sfx.start_scan(folder_id or None)


@app.get("/api/sfx/scan")
def sfx_scan_status():
    return dict(sfx.SCAN)


@app.post("/api/sfx/unhide")
def sfx_unhide_all():
    with db.connect() as conn:
        n = conn.execute("UPDATE sfx SET hidden = 0 WHERE hidden = 1").rowcount
    return {"restored": n}


@app.patch("/api/sfx/{sfx_id}")
def sfx_patch(sfx_id: int, data: SfxPatch):
    with db.connect() as conn:
        return sfx.update(conn, sfx_id, data.model_dump(exclude_none=True))


@app.get("/api/sfx/{sfx_id}/audio")
def sfx_audio(sfx_id: int, download: bool = False):
    with db.connect() as conn:
        row = sfx.get(conn, sfx_id)
    path = sfx.file_path(row)
    return FileResponse(path, filename=path.name if download else None,
                        content_disposition_type="attachment" if download else "inline")


# ---------------------------------------------------------------- backup

@app.get("/api/backup")
def backup_info():
    return backup.info()


@app.post("/api/backup")
def backup_create(data: BackupIn):
    return backup.start_create(include_trash=data.include_trash)


@app.get("/api/backup/download")
def backup_download(include_trash: bool = True):
    name = backup.default_name()
    return StreamingResponse(backup.stream(include_trash=include_trash), media_type="application/zip",
                             headers={"Content-Disposition": f'attachment; filename="{name}"'})


@app.get("/api/backup/files/{name}")
def backup_file(name: str):
    return FileResponse(backup.backup_path(name), filename=name)


@app.delete("/api/backup/files/{name}")
def backup_delete(name: str):
    backup.backup_path(name).unlink()
    return {"ok": True}


@app.post("/api/backup/restore")
def backup_restore(data: RestoreIn):
    return backup.start_restore(backup.backup_path(data.name))


@app.post("/api/backup/upload")
def backup_upload(file: UploadFile = File(...)):
    """Receive a backup from the computer and keep it in the backup folder (to restore later)."""
    return backup.save_upload(file)


@app.get("/api/backup/status")
def backup_status():
    return dict(backup.JOB)


# ---------------------------------------------------------------- Glass theme background

@app.get("/api/background")
def background_get():
    path = lib.background_path()
    if not path.exists():
        raise HTTPException(404, lib.tr("No background image."))
    return FileResponse(path, headers={"Cache-Control": "private, max-age=31536000"})


@app.post("/api/background")
def background_set(image: UploadFile = File(...)):
    lib.save_background(image.file)
    return {"ok": True}


@app.delete("/api/background")
def background_delete():
    lib.background_path().unlink(missing_ok=True)
    return {"ok": True}


# ================================================================ songs

def _matches_format(song: dict, fmt: str) -> bool:
    exts = {f.lower() for f in song["formats"]}
    if fmt == "audio":
        return bool(exts & config.AUDIO_EXTS)
    if fmt == "midi":
        return bool(exts & config.MIDI_EXTS)
    if fmt == "gp":
        return bool(exts & config.GP_EXTS)
    return True


@app.get("/api/songs")
def list_songs(q: str = "", status: str = "", style: str = "", album: int = 0, fmt: str = "",
               favorite: bool = False, sort: str = "updated", band: int = 0, limit: int = 0,
               ideas: bool = False, kind: str = "", key: str = ""):
    """Songs, or ideas with ideas=true (the two never mix)."""
    order = {"updated": "updated_at DESC", "title": "title COLLATE NOCASE", "created": "created_at DESC",
             "random": "RANDOM()"}.get(sort, "updated_at DESC")
    sql, args = "SELECT * FROM songs WHERE is_idea = ?", [int(ideas)]
    if kind:
        sql += " AND idea_kind = ?"; args.append(kind)
    if key:
        sql += " AND music_key = ?"; args.append(key)
    if status:
        sql += " AND status = ?"; args.append(status)
    if style:
        sql += " AND style = ?"; args.append(style)
    if favorite:
        sql += " AND favorite = 1"
    if album:
        sql += " AND id IN (SELECT song_id FROM album_songs WHERE album_id = ?)"; args.append(album)
    if band:
        sql += " AND band_id = ?"; args.append(band)
    if q.strip():
        like = f"%{q.strip()}%"
        sql += (" AND (title LIKE ? OR style LIKE ? OR notes LIKE ? OR music_key LIKE ? OR tuning LIKE ? OR idea_kind LIKE ?"
                " OR id IN (SELECT song_id FROM files WHERE name LIKE ?)"
                " OR id IN (SELECT c.song_id FROM credits c JOIN artists a ON a.id = c.artist_id WHERE a.name LIKE ?))")
        args += [like] * 8
    with db.connect() as conn:
        rows = conn.execute(f"{sql} ORDER BY {order}", args).fetchall()
        songs = [lib.song_summary(conn, r) for r in rows]
    if fmt:
        songs = [s for s in songs if _matches_format(s, fmt)]
    return songs[:limit] if limit > 0 else songs


@app.post("/api/songs")
def create_song(data: SongIn):
    with db.connect() as conn:
        sid = lib.create_song(conn, data.title, style=data.style.strip())
        return lib.song_detail(conn, sid)


# ---------------------------------------------------------------- ideas

@app.post("/api/ideas")
def create_idea(data: IdeaIn):
    with db.connect() as conn:
        sid = lib.create_song(conn, data.title, idea=True, idea_kind=data.kind.strip()[:40])
        return lib.song_detail(conn, sid)


@app.post("/api/ideas/{idea_id}/promote")
def promote_idea(idea_id: int, data: PromoteIn):
    with db.connect() as conn:
        sid = lib.promote_idea(conn, idea_id, data.title, data.style, data.band_id)
        return lib.song_detail(conn, sid)


@app.post("/api/ideas/{idea_id}/merge")
def merge_idea(idea_id: int, data: MergeIn):
    with db.connect() as conn:
        sid = lib.merge_idea(conn, idea_id, data.song_id)
        return lib.song_detail(conn, sid)


@app.get("/api/songs/{song_id}")
def get_song(song_id: int):
    with db.connect() as conn:
        return lib.song_detail(conn, song_id)


@app.patch("/api/songs/{song_id}")
def patch_song(song_id: int, data: SongPatch):
    changes = data.model_dump(exclude_unset=True)
    changes = {k: v for k, v in changes.items() if v is not None or k == "band_id"}
    if "status" in changes and changes["status"] not in config.SONG_STATUSES:
        raise LibraryError("Invalid status.")
    if "idea_kind" in changes:
        changes["idea_kind"] = changes["idea_kind"].strip()[:40]
    if "title" in changes:
        changes["title"] = changes["title"].strip() or lib.tr("Untitled song")
    for k in ("style", "music_key", "tuning", "bpm"):
        if k in changes:
            changes[k] = changes[k].strip()
    if "favorite" in changes:
        changes["favorite"] = int(changes["favorite"])
    with db.connect() as conn:
        lib.get_song(conn, song_id)
        if changes.get("band_id"):
            lib.get_band(conn, changes["band_id"])
        if changes:
            sets = ", ".join(f"{k} = ?" for k in changes)
            conn.execute(f"UPDATE songs SET {sets}, updated_at = datetime('now') WHERE id = ?", [*changes.values(), song_id])
        return lib.song_detail(conn, song_id)


@app.delete("/api/songs/{song_id}")
def delete_song(song_id: int):
    with db.connect() as conn:
        lib.delete_song(conn, song_id)
    return {"ok": True}


@app.post("/api/songs/{song_id}/cover")
def song_cover(song_id: int, image: UploadFile = File(...)):
    with db.connect() as conn:
        song = lib.get_song(conn, song_id)
        name = lib.save_cover(image.file, lib.song_path(song))
        conn.execute("UPDATE songs SET cover = ?, updated_at = datetime('now') WHERE id = ?", (name, song_id))
        return lib.song_detail(conn, song_id)


@app.post("/api/songs/{song_id}/cover-from-file")
def song_cover_from_file(song_id: int, data: CoverFromFileIn):
    with db.connect() as conn:
        song = lib.get_song(conn, song_id)
        f = lib.get_file(conn, data.file_id)
        if f["song_id"] != song_id:
            raise LibraryError("This file does not belong to this song.")
        with lib.library_path(f["rel_path"]).open("rb") as fh:
            name = lib.save_cover(fh, lib.song_path(song))
        conn.execute("UPDATE songs SET cover = ?, updated_at = datetime('now') WHERE id = ?", (name, song_id))
        return lib.song_detail(conn, song_id)


@app.delete("/api/songs/{song_id}/cover")
def song_cover_delete(song_id: int):
    with db.connect() as conn:
        song = lib.get_song(conn, song_id)
        if song["cover"]:
            lib.to_trash(lib.song_path(song) / song["cover"])
        conn.execute("UPDATE songs SET cover = NULL, updated_at = datetime('now') WHERE id = ?", (song_id,))
        return lib.song_detail(conn, song_id)


@app.post("/api/songs/{song_id}/main")
def set_main(song_id: int, data: MainIn):
    with db.connect() as conn:
        f = lib.get_file(conn, data.file_id)
        if f["song_id"] != song_id:
            raise LibraryError("This file does not belong to this song.")
        conn.execute("UPDATE songs SET main_file_id = ?, updated_at = datetime('now') WHERE id = ?", (f["id"], song_id))
        return lib.song_detail(conn, song_id)


# ================================================================ versions

@app.post("/api/songs/{song_id}/versions")
def create_version(song_id: int, data: VersionIn):
    with db.connect() as conn:
        lib.create_version(conn, song_id, data.label)
        return lib.song_detail(conn, song_id)


@app.patch("/api/versions/{version_id}")
def patch_version(version_id: int, data: VersionIn):
    with db.connect() as conn:
        v = lib.get_version(conn, version_id)
        conn.execute("UPDATE versions SET label = ? WHERE id = ?", (data.label.strip() or lib.tr("Version {n}", n=v["number"]), version_id))
        lib.touch_song(conn, v["song_id"])
        return lib.song_detail(conn, v["song_id"])


@app.delete("/api/versions/{version_id}")
def delete_version(version_id: int):
    with db.connect() as conn:
        song_id = lib.get_version(conn, version_id)["song_id"]
        lib.delete_version(conn, version_id)
        return lib.song_detail(conn, song_id)


# ================================================================ files

@app.get("/api/files/{file_id}")
def get_file_info(file_id: int):
    """A library file with its song (Listening room and tab viewer)."""
    with db.connect() as conn:
        f = lib.get_file(conn, file_id)
        song = lib.get_song(conn, f["song_id"])
        v = conn.execute("SELECT number, label FROM versions WHERE id = ?", (f["version_id"],)).fetchone()
        return {"id": f["id"], "name": f["name"], "ext": f["ext"], "size": f["size"], "url": lib.media_url(f["rel_path"]),
                "song_id": song["id"], "song_title": song["title"],
                "version": {"number": v["number"], "label": v["label"]} if v else None,
                "markers": lib.list_markers(conn, file_id)}


@app.get("/api/loose/files/{file_id}")
def get_loose_file(file_id: int):
    with db.connect() as conn:
        r = conn.execute("SELECT * FROM loose_files WHERE id = ?", (file_id,)).fetchone()
        if not r:
            raise HTTPException(404, lib.tr("File not found."))
        return {"id": r["id"], "name": r["name"], "ext": r["ext"], "size": r["size"], "url": lib.media_url(r["rel_path"])}


@app.get("/api/files/{file_id}/markers")
def file_markers(file_id: int):
    with db.connect() as conn:
        lib.get_file(conn, file_id)
        return lib.list_markers(conn, file_id)


@app.post("/api/files/{file_id}/markers")
def add_marker(file_id: int, data: MarkerIn):
    with db.connect() as conn:
        return lib.add_marker(conn, file_id, data.time, data.end_time, data.label)


@app.patch("/api/markers/{marker_id}")
def patch_marker(marker_id: int, data: MarkerPatch):
    with db.connect() as conn:
        return lib.update_marker(conn, marker_id, data.model_dump(exclude_unset=True))


@app.delete("/api/markers/{marker_id}")
def delete_marker(marker_id: int):
    with db.connect() as conn:
        lib.get_marker(conn, marker_id)
        conn.execute("DELETE FROM markers WHERE id = ?", (marker_id,))
        return {"ok": True}


@app.patch("/api/files/{file_id}")
def patch_file(file_id: int, data: FilePatch):
    with db.connect() as conn:
        f = lib.get_file(conn, file_id)
        if data.version_id:
            lib.move_file_to_version(conn, file_id, data.version_id)
        if data.name:
            lib.rename_file(conn, file_id, data.name)
        return lib.song_detail(conn, f["song_id"])


@app.delete("/api/files/{file_id}")
def delete_file(file_id: int):
    with db.connect() as conn:
        song_id = lib.get_file(conn, file_id)["song_id"]
        lib.delete_file(conn, file_id)
        return lib.song_detail(conn, song_id)


# ================================================================ import

@app.get("/api/browse")
def browse(path: str = ""):
    return lib.browse(path)


@app.post("/api/import/server")
def import_server(data: ServerImportIn):
    if not data.paths:
        raise LibraryError("Pick at least one file or folder.")
    files = lib.expand_server_paths(data.paths)
    if not files:
        raise LibraryError("No files found in the chosen folders.")
    items = [(p, p.name, str(p)) for p in files]
    with db.connect() as conn:
        return lib.import_files(conn, items, mode=data.mode, target=data.target, title=data.title,
                                song_id=data.song_id, new_version=data.new_version, version_label=data.version_label,
                                version_id=data.version_id)


def _save_upload(up: UploadFile, dest: Path) -> None:
    """Save an uploaded file, refusing anything above MDOP_MAX_UPLOAD_MB."""
    limit = config.MAX_UPLOAD_MB * 1024 * 1024
    written = 0
    with dest.open("wb") as out:
        while chunk := up.file.read(1024 * 1024):
            written += len(chunk)
            if limit and written > limit:
                out.close()
                dest.unlink(missing_ok=True)
                raise LibraryError("The file is larger than the {mb} MB limit.", mb=config.MAX_UPLOAD_MB)
            out.write(chunk)


@app.post("/api/import/upload")
def import_upload(files: List[UploadFile] = File(...), target: str = Form("new"), title: str = Form(""),
                  song_id: Optional[int] = Form(None), new_version: bool = Form(False), version_label: str = Form(""),
                  version_id: Optional[int] = Form(None)):
    tmp_root = config.DATA_DIR / "tmp"
    tmp_root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=tmp_root) as tmp:
        items = []
        for i, up in enumerate(files):
            raw = Path((up.filename or "").replace("\\", "/")).name
            if raw.startswith("."):  # ._file and .DS_Store made by macOS
                continue
            name = lib.safe_filename(raw or f"arquivo-{i}")
            dest = Path(tmp) / f"{i}-{name}"
            _save_upload(up, dest)
            items.append((dest, name, None))
        if not items:
            raise LibraryError("No file received.")
        with db.connect() as conn:
            # Files uploaded from the browser are copies: the original stays on the person's computer.
            return lib.import_files(conn, items, mode="move", target=target, title=title, song_id=song_id,
                                    new_version=new_version, version_label=version_label, skip_imported=False,
                                    version_id=version_id)


# ================================================================ albums

@app.get("/api/albums")
def list_albums():
    with db.connect() as conn:
        rows = conn.execute("SELECT * FROM albums ORDER BY title COLLATE NOCASE").fetchall()
        return [lib.album_summary(conn, r) for r in rows]


@app.post("/api/albums")
def create_album(data: AlbumIn):
    title = data.title.strip() or lib.tr("Untitled album")
    with db.connect() as conn:
        folder = lib.unique_folder(conn, "albums", lib.slugify(title), config.ALBUMS_DIR)
        cur = conn.execute("INSERT INTO albums (title, folder, description) VALUES (?, ?, ?)",
                           (title, folder, data.description.strip()))
        return album_detail(conn, cur.lastrowid)


def album_detail(conn, album_id: int) -> dict:
    row = conn.execute("SELECT * FROM albums WHERE id = ?", (album_id,)).fetchone()
    if not row:
        raise LibraryError("Album not found.")
    data = lib.album_summary(conn, row)
    songs = conn.execute(
        "SELECT s.* FROM songs s JOIN album_songs a ON a.song_id = s.id WHERE a.album_id = ? ORDER BY a.position, s.title",
        (album_id,)).fetchall()
    data["songs"] = [lib.song_summary(conn, s) for s in songs]
    data["credits"] = art.credits_for(conn, "album_id", album_id)
    return data


@app.get("/api/albums/{album_id}")
def get_album(album_id: int):
    with db.connect() as conn:
        return album_detail(conn, album_id)


@app.patch("/api/albums/{album_id}")
def patch_album(album_id: int, data: AlbumPatch):
    with db.connect() as conn:
        album_detail(conn, album_id)
        if data.title is not None:
            conn.execute("UPDATE albums SET title = ? WHERE id = ?", (data.title.strip() or lib.tr("Untitled album"), album_id))
        if data.description is not None:
            conn.execute("UPDATE albums SET description = ? WHERE id = ?", (data.description.strip(), album_id))
        if data.status is not None:
            if data.status not in config.STATUSES:
                raise LibraryError("Invalid status.")
            conn.execute("UPDATE albums SET status = ? WHERE id = ?", (data.status, album_id))
        for field in ("release", "recorded_at", "label"):
            value = getattr(data, field)
            if value is not None:
                conn.execute(f"UPDATE albums SET {field} = ? WHERE id = ?", (value.strip(), album_id))
        if "band_id" in data.model_fields_set:
            if data.band_id:
                lib.get_band(conn, data.band_id)
            conn.execute("UPDATE albums SET band_id = ? WHERE id = ?", (data.band_id, album_id))
        conn.execute("UPDATE albums SET updated_at = datetime('now') WHERE id = ?", (album_id,))
        return album_detail(conn, album_id)


@app.delete("/api/albums/{album_id}")
def delete_album(album_id: int):
    """Delete only the album. The songs stay in the library."""
    with db.connect() as conn:
        row = conn.execute("SELECT * FROM albums WHERE id = ?", (album_id,)).fetchone()
        if not row:
            raise LibraryError("Album not found.")
        lib.to_trash(lib.album_dir(row["folder"]))
        conn.execute("DELETE FROM albums WHERE id = ?", (album_id,))
    return {"ok": True}


@app.post("/api/albums/{album_id}/songs")
def album_add_songs(album_id: int, data: AlbumSongsIn):
    with db.connect() as conn:
        album_detail(conn, album_id)
        pos = conn.execute("SELECT COALESCE(MAX(position), 0) FROM album_songs WHERE album_id = ?", (album_id,)).fetchone()[0]
        for sid in data.song_ids:
            if lib.get_song(conn, sid)["is_idea"]:
                raise LibraryError("Ideas cannot go into albums. Turn it into a song first.")
            pos += 1
            conn.execute("INSERT OR IGNORE INTO album_songs (album_id, song_id, position) VALUES (?, ?, ?)", (album_id, sid, pos))
        conn.execute("UPDATE albums SET updated_at = datetime('now') WHERE id = ?", (album_id,))
        return album_detail(conn, album_id)


@app.delete("/api/albums/{album_id}/songs/{song_id}")
def album_remove_song(album_id: int, song_id: int):
    with db.connect() as conn:
        conn.execute("DELETE FROM album_songs WHERE album_id = ? AND song_id = ?", (album_id, song_id))
        return album_detail(conn, album_id)


@app.put("/api/albums/{album_id}/order")
def album_order(album_id: int, data: AlbumSongsIn):
    with db.connect() as conn:
        for pos, sid in enumerate(data.song_ids, 1):
            conn.execute("UPDATE album_songs SET position = ? WHERE album_id = ? AND song_id = ?", (pos, album_id, sid))
        return album_detail(conn, album_id)


@app.post("/api/albums/{album_id}/cover")
def album_cover(album_id: int, image: UploadFile = File(...)):
    with db.connect() as conn:
        row = conn.execute("SELECT * FROM albums WHERE id = ?", (album_id,)).fetchone()
        if not row:
            raise LibraryError("Album not found.")
        name = lib.save_cover(image.file, lib.album_dir(row["folder"]))
        conn.execute("UPDATE albums SET cover = ?, updated_at = datetime('now') WHERE id = ?", (name, album_id))
        return album_detail(conn, album_id)


@app.delete("/api/albums/{album_id}/cover")
def album_cover_delete(album_id: int):
    with db.connect() as conn:
        row = conn.execute("SELECT * FROM albums WHERE id = ?", (album_id,)).fetchone()
        if not row:
            raise LibraryError("Album not found.")
        if row["cover"]:
            lib.to_trash(lib.album_dir(row["folder"]) / row["cover"])
        conn.execute("UPDATE albums SET cover = NULL, updated_at = datetime('now') WHERE id = ?", (album_id,))
        return album_detail(conn, album_id)


# ================================================================ file list (loose files)

@app.get("/api/loose")
def loose_list():
    with db.connect() as conn:
        return lib.loose_groups(conn)


@app.post("/api/loose/assign")
def loose_assign(data: LooseAssignIn):
    with db.connect() as conn:
        sid = lib.assign_loose(conn, data.file_ids, data.action, title=data.title, song_id=data.song_id,
                               new_version=data.new_version, version_label=data.version_label, band_id=data.band_id,
                               kind=data.kind)
        return {"song_id": sid, "song": lib.song_summary(conn, lib.get_song(conn, sid))}


@app.post("/api/loose/discard")
def loose_discard(data: LooseIdsIn):
    with db.connect() as conn:
        return {"discarded": lib.discard_loose(conn, data.file_ids)}


@app.post("/api/loose/flag")
def loose_flag(data: LooseFlagIn):
    with db.connect() as conn:
        lib.set_separated(conn, data.file_ids, data.value)
    return {"ok": True}


@app.get("/api/loose/duplicates")
def loose_duplicates():
    with db.connect() as conn:
        return lib.find_duplicates(conn)


@app.post("/api/loose/dedupe")
def loose_dedupe():
    """Send identical copies in the list to the trash (one always stays)."""
    with db.connect() as conn:
        dupes = lib.find_duplicates(conn)
        if dupes:
            lib.discard_loose(conn, [d["id"] for d in dupes])
        return {"removed": len(dupes), "bytes": sum(d["size"] for d in dupes)}


# ================================================================ ZIP

def _zip_response(name: str, chunks) -> StreamingResponse:
    return StreamingResponse(chunks, media_type="application/zip", headers={
        "Content-Disposition": f"attachment; filename=\"mdop.zip\"; filename*=UTF-8''{_quote(name)}"})


@app.get("/api/songs/{song_id}/zip")
def song_zip(song_id: int):
    with db.connect() as conn:
        name, chunks = zips.song_zip(conn, song_id)
    return _zip_response(name, chunks)


@app.get("/api/albums/{album_id}/zip")
def album_zip(album_id: int):
    with db.connect() as conn:
        name, chunks = zips.album_zip(conn, album_id)
    return _zip_response(name, chunks)


# ================================================================ trash

@app.get("/api/trash")
def trash_list():
    with db.connect() as conn:
        return trash.list_items(conn)


@app.post("/api/trash/{item_id}/restore")
def trash_restore(item_id: int):
    with db.connect() as conn:
        return trash.restore(conn, item_id)


@app.delete("/api/trash/{item_id}")
def trash_delete(item_id: int):
    with db.connect() as conn:
        trash.delete_forever(conn, item_id)
    return {"ok": True}


@app.post("/api/trash/empty")
def trash_empty():
    with db.connect() as conn:
        return {"removed": trash.empty(conn)}


# ================================================================ login (optional)

def _client(request: Request) -> str:
    return request.client.host if request.client else "?"


def _set_session(resp: Response, conn) -> None:
    resp.set_cookie(auth.COOKIE, auth.make_token(conn), max_age=auth.SESSION_DAYS * 86400, httponly=True, samesite="lax")


@app.get("/api/auth/status")
def auth_status(request: Request):
    with db.connect() as conn:
        on = auth.enabled(conn)
        return {"enabled": on, "logged_in": (not on) or auth.valid_token(conn, auth.session_cookie(request.cookies)),
                "user": auth.user(conn) if on else None, "lang": lib.get_settings(conn)["lang"]}


@app.post("/api/auth/login")
def auth_login(data: LoginIn, request: Request, response: Response):
    client = _client(request)
    auth.check_rate(client)
    with db.connect() as conn:
        if not auth.enabled(conn):
            return {"ok": True}
        if not auth.check_password(conn, data.user, data.password):
            auth.record_fail(client)
            time.sleep(1)  # slows down repeated guesses
            raise LibraryError("Wrong username or password.")
        auth.clear_fails(client)
        _set_session(response, conn)
    return {"ok": True}


@app.post("/api/auth/logout")
def auth_logout(response: Response):
    for name in (auth.COOKIE, *auth.OLD_COOKIES):
        response.delete_cookie(name)
    return {"ok": True}


@app.post("/api/auth/setup")
def auth_setup(data: LoginIn, response: Response):
    with db.connect() as conn:
        auth.setup(conn, data.user, data.password)
        _set_session(response, conn)
    return {"ok": True}


@app.post("/api/auth/password")
def auth_password(data: PasswordChangeIn, request: Request, response: Response):
    client = _client(request)
    auth.check_rate(client)
    with db.connect() as conn:
        try:
            auth.change_password(conn, data.current, data.new)
        except LibraryError:
            if not auth.check_password(conn, None, data.current):
                auth.record_fail(client)
            raise
        _set_session(response, conn)
    return {"ok": True}


@app.post("/api/auth/disable")
def auth_disable(data: PasswordIn, request: Request, response: Response):
    client = _client(request)
    auth.check_rate(client)
    with db.connect() as conn:
        try:
            auth.disable(conn, data.password)
        except LibraryError:
            auth.record_fail(client)
            raise
    for name in (auth.COOKIE, *auth.OLD_COOKIES):
        response.delete_cookie(name)
    return {"ok": True}


# ================================================================ bands

def band_detail(conn, band_id: int) -> dict:
    data = lib.band_summary(conn, lib.get_band(conn, band_id))
    songs = conn.execute("SELECT * FROM songs WHERE band_id = ? ORDER BY title COLLATE NOCASE", (band_id,)).fetchall()
    albums = conn.execute("SELECT * FROM albums WHERE band_id = ? ORDER BY title COLLATE NOCASE", (band_id,)).fetchall()
    data["songs"] = [lib.song_summary(conn, r) for r in songs]
    data["albums"] = [lib.album_summary(conn, r) for r in albums]
    data["members"] = art.credits_for(conn, "band_id", band_id)
    return data


@app.get("/api/bands")
def list_bands():
    with db.connect() as conn:
        return [lib.band_summary(conn, r) for r in conn.execute("SELECT * FROM bands ORDER BY title COLLATE NOCASE")]


@app.post("/api/bands")
def create_band(data: BandIn):
    title = data.title.strip() or "Banda sem nome"
    with db.connect() as conn:
        folder = lib.unique_folder(conn, "bands", lib.slugify(title), config.BANDS_DIR)
        cur = conn.execute("INSERT INTO bands (title, folder, description) VALUES (?, ?, ?)", (title, folder, data.description.strip()))
        return band_detail(conn, cur.lastrowid)


@app.get("/api/bands/{band_id}")
def get_band(band_id: int):
    with db.connect() as conn:
        return band_detail(conn, band_id)


@app.patch("/api/bands/{band_id}")
def patch_band(band_id: int, data: BandPatch):
    with db.connect() as conn:
        lib.get_band(conn, band_id)
        if data.title is not None:
            conn.execute("UPDATE bands SET title = ? WHERE id = ?", (data.title.strip() or "Banda sem nome", band_id))
        if data.description is not None:
            conn.execute("UPDATE bands SET description = ? WHERE id = ?", (data.description.strip(), band_id))
        conn.execute("UPDATE bands SET updated_at = datetime('now') WHERE id = ?", (band_id,))
        return band_detail(conn, band_id)


@app.delete("/api/bands/{band_id}")
def delete_band(band_id: int):
    """Delete only the band. Songs and albums stay, just without a band."""
    with db.connect() as conn:
        row = lib.get_band(conn, band_id)
        conn.execute("UPDATE songs SET band_id = NULL WHERE band_id = ?", (band_id,))
        conn.execute("UPDATE albums SET band_id = NULL WHERE band_id = ?", (band_id,))
        lib.to_trash(lib.band_dir(row["folder"]))
        conn.execute("DELETE FROM bands WHERE id = ?", (band_id,))
    return {"ok": True}


@app.post("/api/bands/{band_id}/cover")
def band_cover(band_id: int, image: UploadFile = File(...)):
    with db.connect() as conn:
        row = lib.get_band(conn, band_id)
        name = lib.save_cover(image.file, lib.band_dir(row["folder"]))
        conn.execute("UPDATE bands SET cover = ?, updated_at = datetime('now') WHERE id = ?", (name, band_id))
        return band_detail(conn, band_id)


@app.delete("/api/bands/{band_id}/cover")
def band_cover_delete(band_id: int):
    with db.connect() as conn:
        row = lib.get_band(conn, band_id)
        if row["cover"]:
            lib.to_trash(lib.band_dir(row["folder"]) / row["cover"])
        conn.execute("UPDATE bands SET cover = NULL, updated_at = datetime('now') WHERE id = ?", (band_id,))
        return band_detail(conn, band_id)


# ================================================================ artists and credits

@app.get("/api/artists")
def list_artists():
    with db.connect() as conn:
        return [art.artist_summary(conn, r) for r in conn.execute("SELECT * FROM artists ORDER BY name COLLATE NOCASE")]


@app.post("/api/artists")
def create_artist(data: ArtistIn):
    with db.connect() as conn:
        aid = art.create_artist(conn, data.name, data.bio)
        return art.artist_detail(conn, aid)


@app.get("/api/artists/{artist_id}")
def get_artist(artist_id: int):
    with db.connect() as conn:
        return art.artist_detail(conn, artist_id)


@app.patch("/api/artists/{artist_id}")
def patch_artist(artist_id: int, data: ArtistPatch):
    with db.connect() as conn:
        art.get_artist(conn, artist_id)
        if data.name is not None:
            conn.execute("UPDATE artists SET name = ? WHERE id = ?", (data.name.strip() or "Artista sem nome", artist_id))
        if data.bio is not None:
            conn.execute("UPDATE artists SET bio = ? WHERE id = ?", (data.bio.strip(), artist_id))
        conn.execute("UPDATE artists SET updated_at = datetime('now') WHERE id = ?", (artist_id,))
        return art.artist_detail(conn, artist_id)


@app.delete("/api/artists/{artist_id}")
def delete_artist(artist_id: int):
    """Delete the artist and their credits. Songs, albums and bands stay."""
    with db.connect() as conn:
        row = art.get_artist(conn, artist_id)
        lib.to_trash(art.artist_dir(row["folder"]))
        conn.execute("DELETE FROM artists WHERE id = ?", (artist_id,))
    return {"ok": True}


@app.post("/api/artists/{artist_id}/photo")
def artist_photo(artist_id: int, image: UploadFile = File(...)):
    with db.connect() as conn:
        row = art.get_artist(conn, artist_id)
        name = lib.save_cover(image.file, art.artist_dir(row["folder"]))
        conn.execute("UPDATE artists SET photo = ?, updated_at = datetime('now') WHERE id = ?", (name, artist_id))
        return art.artist_detail(conn, artist_id)


@app.delete("/api/artists/{artist_id}/photo")
def artist_photo_delete(artist_id: int):
    with db.connect() as conn:
        row = art.get_artist(conn, artist_id)
        if row["photo"]:
            lib.to_trash(art.artist_dir(row["folder"]) / row["photo"])
        conn.execute("UPDATE artists SET photo = NULL, updated_at = datetime('now') WHERE id = ?", (artist_id,))
        return art.artist_detail(conn, artist_id)


@app.post("/api/credits")
def add_credit(data: CreditIn):
    with db.connect() as conn:
        return art.add_credit(conn, artist_id=data.artist_id, artist_name=data.artist_name, role=data.role,
                              song_id=data.song_id, album_id=data.album_id, band_id=data.band_id)


@app.patch("/api/credits/{credit_id}")
def patch_credit(credit_id: int, data: CreditPatch):
    with db.connect() as conn:
        if not conn.execute("SELECT 1 FROM credits WHERE id = ?", (credit_id,)).fetchone():
            raise LibraryError("Credit not found.")
        conn.execute("UPDATE credits SET role = ? WHERE id = ?", (data.role.strip(), credit_id))
    return {"ok": True}


@app.delete("/api/credits/{credit_id}")
def delete_credit(credit_id: int):
    with db.connect() as conn:
        conn.execute("DELETE FROM credits WHERE id = ?", (credit_id,))
    return {"ok": True}


# ================================================================ song texts

@app.post("/api/songs/{song_id}/texts")
def create_text(song_id: int, data: TextIn):
    with db.connect() as conn:
        lib.get_song(conn, song_id)
        pos = conn.execute("SELECT COALESCE(MAX(position), 0) + 1 FROM texts WHERE song_id = ?", (song_id,)).fetchone()[0]
        cur = conn.execute("INSERT INTO texts (song_id, title, body, position) VALUES (?, ?, ?, ?)",
                           (song_id, data.title.strip() or "Texto", data.body, pos))
        lib.touch_song(conn, song_id)
        return dict(conn.execute("SELECT id, title, body, created_at, updated_at FROM texts WHERE id = ?", (cur.lastrowid,)).fetchone())


@app.patch("/api/texts/{text_id}")
def patch_text(text_id: int, data: TextPatch):
    with db.connect() as conn:
        t = lib.get_text(conn, text_id)
        if data.title is not None:
            conn.execute("UPDATE texts SET title = ? WHERE id = ?", (data.title.strip() or "Texto", text_id))
        if data.body is not None:
            conn.execute("UPDATE texts SET body = ? WHERE id = ?", (data.body, text_id))
        conn.execute("UPDATE texts SET updated_at = datetime('now') WHERE id = ?", (text_id,))
        lib.touch_song(conn, t["song_id"])
        return dict(conn.execute("SELECT id, title, body, created_at, updated_at FROM texts WHERE id = ?", (text_id,)).fetchone())


@app.delete("/api/texts/{text_id}")
def delete_text(text_id: int):
    with db.connect() as conn:
        t = lib.get_text(conn, text_id)
        conn.execute("DELETE FROM texts WHERE id = ?", (text_id,))
        lib.touch_song(conn, t["song_id"])
    return {"ok": True}


# ================================================================ settings

@app.get("/api/settings")
def get_settings():
    with db.connect() as conn:
        return lib.get_settings(conn)


@app.put("/api/settings")
def put_settings(data: SettingsIn):
    with db.connect() as conn:
        return lib.set_settings(conn, data.model_dump(exclude_none=True))


# ================================================================ desktop app only
# These routes exist only in the desktop app (app/desktop.py). On the server they answer 404.
# They also require the X-MDoP-Desktop header, so another web page open in a browser
# cannot call them (a custom header needs CORS, which MDoP never allows).

DESKTOP_HEADER = "x-mdop-desktop"


def _desktop_only(request: Request) -> None:
    if not config.DESKTOP:
        raise HTTPException(404)
    if request.headers.get(DESKTOP_HEADER) != "1":
        raise HTTPException(403)


def _desktop_forget_root(key: str, path: str) -> None:
    from . import desktop_prefs
    prefs = desktop_prefs.remove_root(key, path)
    config.set_roots(**{key: prefs[key]})


def _desktop_shutdown() -> None:
    from . import opener
    try:
        with db.connect() as conn:
            if kept := opener.cleanup(conn):
                log.info("%s edited file(s) not saved as versions were kept in the File list.", kept)
    except Exception as exc:  # closing the app must never fail because of this
        log.warning("Could not clean up the working copies: %s", exc)


class DesktopPathIn(BaseModel):
    path: str


class DesktopSaveIn(BaseModel):
    label: str = ""


def _desktop_info() -> dict:
    from . import desktop_prefs, opener
    return {"library": str(config.LIBRARY_DIR), "backup_dir": str(config.BACKUP_DIR),
            "import_roots": [str(r) for r in config.IMPORT_ROOTS], "sfx_roots": [str(r) for r in config.SFX_ROOTS],
            "next_library": desktop_prefs.load()["library"],
            "settings_file": str(desktop_prefs.prefs_path()), "work_dir": str(opener.work_dir())}


def _existing_dir(path: str) -> Path:
    p = Path(path.strip()).expanduser()
    if not path.strip() or not p.is_dir():
        raise LibraryError("Folder not found.")
    return p.resolve()


@app.get("/api/desktop")
def desktop_info(request: Request):
    _desktop_only(request)
    return _desktop_info()


@app.post("/api/desktop/import-roots")
def desktop_add_import_root(data: DesktopPathIn, request: Request):
    _desktop_only(request)
    from . import desktop_prefs
    p = _existing_dir(data.path)
    if lib.within(p, config.LIBRARY_DIR) or lib.within(config.LIBRARY_DIR, p):
        raise LibraryError("Pick a folder outside the MDoP library.")
    prefs = desktop_prefs.add_root("import_roots", p)
    config.set_roots(import_roots=prefs["import_roots"])
    return _desktop_info()


@app.post("/api/desktop/import-roots/remove")
def desktop_remove_import_root(data: DesktopPathIn, request: Request):
    _desktop_only(request)
    _desktop_forget_root("import_roots", data.path)
    return _desktop_info()


@app.post("/api/desktop/sfx-roots")
def desktop_add_sfx_root(data: DesktopPathIn, request: Request):
    """Link an effects folder picked with the system dialog (it becomes a root and a linked folder)."""
    _desktop_only(request)
    from . import desktop_prefs
    p = _existing_dir(data.path)
    if lib.within(p, config.LIBRARY_DIR) or lib.within(config.LIBRARY_DIR, p):
        raise LibraryError("Pick a folder outside the MDoP library.")
    old_roots = [str(r) for r in config.SFX_ROOTS]
    config.set_roots(sfx_roots=old_roots + [str(p)])
    try:
        with db.connect() as conn:
            fid = sfx.add_folder(conn, str(p))
    except Exception:
        config.set_roots(sfx_roots=old_roots)
        raise
    desktop_prefs.add_root("sfx_roots", p)
    return {"id": fid, "scan": sfx.start_scan(fid), **_desktop_info()}


@app.post("/api/desktop/open/{file_id}")
def desktop_open(file_id: int, request: Request):
    """Open a copy of the file in the system's default program (the original is never changed)."""
    _desktop_only(request)
    from . import opener
    with db.connect() as conn:
        return opener.open_copy(conn, file_id)


@app.post("/api/desktop/library")
def desktop_set_library(data: DesktopPathIn, request: Request):
    """Use another library folder from the next start on. Nothing is moved or copied."""
    _desktop_only(request)
    from . import desktop_prefs
    error = desktop_prefs.check_library_folder(data.path)
    if error:
        raise LibraryError("MDoP cannot write to this folder. Choose another one." if error == "not_writable"
                           else "Folder not found.")
    desktop_prefs.update(library=desktop_prefs.norm(data.path))
    return {"next_library": desktop_prefs.norm(data.path), **_desktop_info()}


@app.post("/api/desktop/show-library")
def desktop_show_library(request: Request):
    _desktop_only(request)
    from . import opener
    opener.launcher(config.LIBRARY_DIR)
    return {"ok": True}


@app.get("/api/desktop/edits")
def desktop_edits(request: Request):
    _desktop_only(request)
    from . import opener
    with db.connect() as conn:
        return opener.pending_edits(conn)


@app.post("/api/desktop/edits/{token}/save")
def desktop_edit_save(token: str, data: DesktopSaveIn, request: Request):
    _desktop_only(request)
    from . import opener
    with db.connect() as conn:
        return opener.save_as_version(conn, token, data.label)


@app.post("/api/desktop/edits/{token}/dismiss")
def desktop_edit_dismiss(token: str, request: Request):
    _desktop_only(request)
    from . import opener
    opener.dismiss(token)
    return {"ok": True}


# ================================================================ media files and pages

@app.get("/media/{rel_path:path}")
def media(rel_path: str, download: bool = False):
    if rel_path.split("/")[0].lower() in HIDDEN_DIRS:
        raise HTTPException(404)
    try:
        path = lib.library_path(rel_path)
    except LibraryError:
        raise HTTPException(404)
    # checked again after resolving: "songs/../.mdop/mdop.db" must not reach the database or the trash
    top = path.relative_to(config.LIBRARY_DIR).parts[:1]
    if top and top[0].lower() in HIDDEN_DIRS:
        raise HTTPException(404)
    if not path.is_file():
        raise HTTPException(404)
    return FileResponse(path, filename=path.name if download else None,
                        content_disposition_type="attachment" if download else "inline")


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html", headers={"Cache-Control": "no-cache"})
