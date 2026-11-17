"""Run in a separate process by test_migrate.py: opens a library in a fresh environment.

    python legacy_check.py upgrade  LIBRARY BACKUPS   library from an early build is updated at start
    python legacy_check.py conflict LIBRARY BACKUPS   the update must fail and undo everything
    python legacy_check.py restore  LIBRARY BACKUPS ZIP   an old backup is restored into a new install
"""
import os
import sys
import time
from pathlib import Path

mode, LIB, BACKUPS = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
os.environ.update(MDOP_LIBRARY=str(LIB), MDOP_BACKUP_DIR=str(BACKUPS), MDOP_IMPORT_ROOTS="", MDOP_SFX_ROOTS="")
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def ok(r):
    assert r.status_code < 300, (r.status_code, r.text)
    return r.json()


def wait(c):
    for _ in range(300):
        j = c.get("/api/backup/status").json()
        if not j["running"]:
            return j
        time.sleep(0.05)
    raise AssertionError("job never finished")


def check_library(c):
    songs = {s["title"]: s for s in ok(c.get("/api/songs"))}
    assert set(songs) >= {"Canção da Serra", "Estrada Velha"}, songs.keys()
    assert songs["Canção da Serra"]["status"] == "ready" and songs["Estrada Velha"]["status"] == "recorded"
    serra = ok(c.get(f"/api/songs/{songs['Canção da Serra']['id']}"))
    assert serra["cover_url"] and "/songs/cancao-da-serra/cover.jpg" in serra["cover_url"]
    assert c.get(serra["cover_url"]).status_code == 200 and c.get(songs["Canção da Serra"]["thumb_url"]).status_code == 200
    for v in serra["versions"]:
        for f in v["files"]:
            assert f["url"].startswith("/media/songs/") and c.get(f["url"]).status_code == 200, f
    ideas = {i["title"]: i for i in ok(c.get("/api/songs", params={"ideas": "true"}))}
    assert ideas["Melodia de Ré"]["idea_kind"] == "melody" and ideas["Exercício de palhetada"]["idea_kind"] == "exercise"
    idea = ok(c.get(f"/api/songs/{ideas['Melodia de Ré']['id']}"))
    assert c.get(idea["versions"][0]["files"][0]["url"]).status_code == 200
    album = ok(c.get("/api/albums"))[0]
    assert album["status"] == "in_progress" and c.get(album["cover_url"]).status_code == 200
    band = ok(c.get("/api/bands"))[0]
    assert c.get(band["cover_url"]).status_code == 200
    artist = ok(c.get("/api/artists"))[0]
    assert c.get(artist["photo_url"]).status_code == 200
    meta = ok(c.get("/api/meta"))
    assert meta["background_url"] and c.get(meta["background_url"]).status_code == 200
    assert meta["settings"]["lang"] == "pt" and meta["loose"] == 1
    loose = ok(c.get("/api/loose"))
    assert "solto" in str(loose) and "/media/inbox/" in str(loose)
    for old in ("musicas", "ideias", "albuns", "bandas", "artistas", "audios-soltos", ".lixeira"):
        assert not (LIB / old).exists(), old
    assert not (LIB / ".mdop" / "fundo.jpg").exists() and (LIB / ".mdop" / "background.jpg").exists()
    # trash made before the update still restores
    trash = ok(c.get("/api/trash"))["items"]
    assert len(trash) == 2 and all(i["exists"] for i in trash), trash
    for item in trash:
        ok(c.post(f"/api/trash/{item['id']}/restore"))
    back = next(s for s in ok(c.get("/api/songs")) if s["title"] == "Música Apagada")
    back = ok(c.get(f"/api/songs/{back['id']}"))
    assert back["versions"][0]["files"] and c.get(back["versions"][0]["files"][0]["url"]).status_code == 200
    serra = ok(c.get(f"/api/songs/{songs['Canção da Serra']['id']}"))
    names = [f["name"] for v in serra["versions"] for f in v["files"]]
    assert "take 1.mp3" in names, names
    riff = next(f for v in serra["versions"] for f in v["files"] if f["name"] == "riff.gp5")
    assert [m["label"] for m in ok(c.get(f"/api/files/{riff['id']}/markers"))] == ["refrão"]


if mode == "upgrade":
    with TestClient(app) as c:
        job = wait(c)
        assert job["kind"] == "migrate" and not job["error"], job
        check_library(c)
    assert list((LIB / ".mdop").glob("mdop-before-update-*.db"))
    assert list(BACKUPS.glob("before-update-*.zip"))
    # a second start finds nothing to do
    from app import migrate
    assert not migrate.needed()
    with TestClient(app) as c:
        assert c.get("/api/backup/status").json()["kind"] == "migrate"  # still the old job: no new one started
        assert ok(c.get("/api/meta"))["songs"] >= 3
    print("UPGRADE OK")

elif mode == "conflict":
    def listing():
        return sorted(str(p.relative_to(LIB)) for p in LIB.rglob("*") if ".mdop" not in p.parts)
    before = listing()
    db_before = (LIB / ".mdop" / "mdop.db").read_bytes()
    with TestClient(app) as c:
        job = wait(c)
        assert job["kind"] == "migrate" and "exists in both" in job["error"], job
        # the app stays paused: it must not open a library it could not update
        assert c.get("/api/meta").status_code == 503
    assert listing() == before
    import sqlite3
    a = sqlite3.connect(LIB / ".mdop" / "mdop.db")
    rows = a.execute("SELECT rel_path FROM files ORDER BY id").fetchall()
    assert all(r[0].startswith(("musicas/", "ideias/")) for r in rows), rows
    assert len(db_before) > 0
    print("CONFLICT OK")

elif mode == "restore":
    zip_path = Path(sys.argv[4])
    with TestClient(app) as c:
        assert ok(c.get("/api/meta"))["songs"] == 0
        with zip_path.open("rb") as f:
            name = ok(c.post("/api/backup/upload", files={"file": ("old.zip", f, "application/zip")}))["name"]
        ok(c.post("/api/backup/restore", json={"name": name}))
        job = wait(c)
        assert job["kind"] == "restore" and not job["error"], job
        check_library(c)
    print("RESTORE OK")
