"""SFX from linked folders, configurable menu, paths with "/" and backup/restore."""
import io
import math
import os
import struct
import time
import wave
import zipfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import config
from app.main import app

SFX = Path(os.environ["MDOP_SFX_ROOTS"])
BACKUPS = Path(os.environ["MDOP_BACKUP_DIR"])


@pytest.fixture(scope="module")
def c():
    with TestClient(app) as client:
        yield client


def ok(r):
    assert r.status_code == 200, r.text
    return r.json()


def wav(path: Path, seconds: float) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(8000)
        w.writeframes(b"".join(struct.pack("<h", int(3000 * math.sin(i / 5))) for i in range(int(8000 * seconds))))
    return path


def wait_scan(c):
    for _ in range(200):
        st = ok(c.get("/api/sfx/scan"))
        if not st["running"]:
            return st
        time.sleep(0.05)
    raise AssertionError("a leitura das pastas não terminou")


def test_sfx_link_scan_search(c):
    lib_root = SFX / "Biblioteca de efeitos"
    wav(lib_root / "Ambiente" / "Chuva" / "chuva forte.wav", 12)
    wav(lib_root / "Ambiente" / "Chuva" / "chuva fina.wav", 3)
    wav(lib_root / "Impactos" / "Portas" / "porta batendo.wav", 0.8)
    wav(lib_root / "solto.wav", 1.5)
    (lib_root / "Impactos" / "leia-me.txt").write_text("não é áudio")
    assert c.post("/api/sfx/folders", json={"path": "/etc"}).status_code == 400   # outside the allowed root
    r = ok(c.post("/api/sfx/folders", json={"path": str(lib_root)}))
    st = wait_scan(c)
    assert st["added"] == 4 and not st["error"]
    assert c.post("/api/sfx/folders", json={"path": str(lib_root / "Ambiente")}).status_code == 400  # already included
    found = ok(c.get("/api/sfx?q=chuva"))
    assert found["total"] == 2 and {i["category"] for i in found["items"]} == {"Ambiente"}
    assert {i["subcategory"] for i in found["items"]} == {"Chuva"}
    long = ok(c.get("/api/sfx?dur=long"))["items"]
    assert [i["name"] for i in long] == ["chuva forte"] and 11.9 < long[0]["duration"] < 12.1
    assert ok(c.get("/api/sfx?dur=short"))["total"] == 2
    facets = ok(c.get("/api/sfx/facets"))
    names = [x["name"] for x in facets["categories"]]
    assert names == ["Ambiente", "Impactos", ""] and facets["formats"] == ["wav"]
    item = found["items"][0]
    a = c.get(item["url"])
    assert a.status_code == 200 and a.content[:4] == b"RIFF"
    assert "attachment" in c.get(item["url"] + "?download=1").headers["content-disposition"]
    # etiquetas, favorito, ocultar
    p = ok(c.patch(f"/api/sfx/{item['id']}", json={"tags": ["Natureza", " noite ", "natureza"], "favorite": True}))
    assert p["tags"] == ["natureza", "noite"] and p["favorite"]
    assert ok(c.get("/api/sfx?tag=noite"))["total"] == 1 and ok(c.get("/api/sfx?favorite=true"))["total"] == 1
    ok(c.patch(f"/api/sfx/{item['id']}", json={"hidden": True}))
    assert ok(c.get("/api/sfx?q=chuva"))["total"] == 1
    assert ok(c.get("/api/meta"))["sfx"]["hidden"] == 1
    # the global search finds effects too
    assert ok(c.get("/api/search?q=porta"))["sfx"][0]["name"] == "porta batendo"
    # rescan: only what changed; what disappeared is marked; hidden stay hidden; nothing is deleted from the folder
    (lib_root / "Impactos" / "Portas" / "porta batendo.wav").unlink()
    wav(lib_root / "Ambiente" / "vento.wav", 4)
    ok(c.post("/api/sfx/scan"))
    st = wait_scan(c)
    assert (st["added"], st["updated"], st["missing"]) == (1, 0, 1)
    assert ok(c.get("/api/sfx?q=porta"))["items"][0]["missing"] is True
    assert ok(c.get("/api/sfx?q=chuva"))["total"] == 1
    assert (lib_root / "Ambiente" / "Chuva" / "chuva forte.wav").exists()
    ok(c.post("/api/sfx/unhide"))
    assert ok(c.get("/api/sfx?q=chuva"))["total"] == 2
    # removing the folder only takes it out of MDoP
    folders = ok(c.get("/api/sfx/folders"))["folders"]
    assert folders[0]["files"] == 5 and folders[0]["available"]
    ok(c.delete(f"/api/sfx/folders/{folders[0]['id']}"))
    assert ok(c.get("/api/sfx"))["total"] == 0 and (lib_root / "solto.wav").exists()
    # browsing only inside the root
    assert ok(c.get("/api/sfx/browse"))["entries"][0]["path"] == str(SFX)
    assert c.get("/api/sfx/browse?path=/etc").status_code == 400


def test_menu_hidden_setting(c):
    assert ok(c.put("/api/settings", json={"hidden": "sfx,bands,sfx"}))["hidden"] == "sfx,bands"
    assert c.put("/api/settings", json={"hidden": "musicas"}).status_code == 400
    assert ok(c.put("/api/settings", json={"hidden": ""}))["hidden"] == ""


def test_backslash_paths_are_normalized(c):
    from app import db
    with db.connect() as conn:
        conn.execute("INSERT INTO loose_files (name, rel_path, ext, size, group_key) VALUES ('x.mp3', 'inbox\\x.mp3', 'mp3', 1, 'x')")
    db.init()
    with db.connect() as conn:
        assert conn.execute("SELECT rel_path FROM loose_files WHERE name = 'x.mp3'").fetchone()[0] == "inbox/x.mp3"
        conn.execute("DELETE FROM loose_files WHERE name = 'x.mp3'")


def test_backup_and_restore_roundtrip(c):
    song = ok(c.post("/api/songs", json={"title": "Antes do backup"}))
    ok(c.post("/api/import/upload", data={"target": "existing", "song_id": str(song["id"])},
              files=[("files", ("take.mp3", b"ID3" + b"b" * 4000, "audio/mpeg"))]))
    info = ok(c.get("/api/backup"))
    assert info["writable"] and info["dir"] == str(BACKUPS)
    # baixar direto pelo navegador
    r = c.get("/api/backup/download")
    assert r.status_code == 200
    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        names = zf.namelist()
        assert "mdop-backup.json" in names and "mdop.db" in names
        assert any(n.startswith("library/songs/antes-do-backup/v1/take.mp3") for n in names)
        assert not any(n.startswith("library/.mdop/mdop.db") for n in names)
    # salvar no servidor
    ok(c.post("/api/backup", json={"include_trash": True}))
    for _ in range(200):
        job = ok(c.get("/api/backup/status"))
        if not job["running"]:
            break
        time.sleep(0.05)
    assert not job["error"], job["error"]
    name = job["name"]
    assert (BACKUPS / name).exists() and ok(c.get("/api/backup"))["backups"][0]["manifest"]["version"] == config.VERSION
    # muda a biblioteca depois do backup
    ok(c.post("/api/songs", json={"title": "Depois do backup"}))
    ok(c.delete(f"/api/songs/{song['id']}"))
    # restore: the library becomes the backup one, and the current one becomes a safety copy
    ok(c.post("/api/backup/restore", json={"name": name}))
    for _ in range(400):
        job = ok(c.get("/api/backup/status"))
        if not job["running"]:
            break
        time.sleep(0.05)
    assert not job["error"], job["error"]
    assert job["safety"].startswith("before-restore") and (BACKUPS / job["safety"]).exists()
    titles = [s["title"] for s in ok(c.get("/api/songs"))]
    assert "Antes do backup" in titles and "Depois do backup" not in titles
    detail = ok(c.get(f"/api/songs/{song['id']}"))
    assert c.get(detail["versions"][0]["files"][0]["url"]).content.startswith(b"ID3")
    # invalid names and files that are not backups
    assert c.post("/api/backup/restore", json={"name": "../etc/passwd"}).status_code == 400
    bad = c.post("/api/backup/upload", files={"file": ("x.zip", b"nao e zip", "application/zip")})
    assert bad.status_code == 400
    up = ok(c.post("/api/backup/upload", files={"file": ("meu backup.zip", (BACKUPS / name).read_bytes(), "application/zip")}))
    assert (BACKUPS / up["name"]).exists()
    ok(c.delete(f"/api/backup/files/{up['name']}"))
    assert not (BACKUPS / up["name"]).exists()


def test_login_lockout_after_wrong_passwords(c):
    from app import auth
    ok(c.post("/api/auth/setup", json={"user": "ana", "password": "senha-forte-1"}))
    try:
        c.cookies.clear()
        for _ in range(auth.MAX_FAILS):
            assert c.post("/api/auth/login", json={"user": "ana", "password": "errada!!"}).status_code == 400
        r = c.post("/api/auth/login", json={"user": "ana", "password": "senha-forte-1"})
        assert r.status_code == 400 and "Too many attempts" in r.json()["detail"]
        auth._fails.clear()
        ok(c.post("/api/auth/login", json={"user": "ana", "password": "senha-forte-1"}))
    finally:
        auth._fails.clear()
        ok(c.post("/api/auth/disable", json={"password": "senha-forte-1"}))
        c.cookies.clear()


def test_upload_limit(c, monkeypatch):
    from app import config
    monkeypatch.setattr(config, "MAX_UPLOAD_MB", 1)
    r = c.post("/api/import/upload", data={"target": "loose"},
               files=[("files", ("big.wav", b"RIFF" + b"0" * (1024 * 1024 + 10), "audio/wav"))])
    assert r.status_code == 400 and "1 MB" in r.json()["detail"]
    assert not any("big" in p.name for p in (config.DATA_DIR / "tmp").rglob("*"))


def test_trash_cleanup_only_old_items(c):
    from app import db, trash
    s = ok(c.post("/api/songs", json={"title": "Velha na lixeira"}))
    s2 = ok(c.post("/api/songs", json={"title": "Nova na lixeira"}))
    ok(c.delete(f"/api/songs/{s['id']}"))
    ok(c.delete(f"/api/songs/{s2['id']}"))
    with db.connect() as conn:
        conn.execute("UPDATE trash SET deleted_at = datetime('now', '-40 days') WHERE name = 'Velha na lixeira'")
        assert trash.purge_older_than(conn, 0) == 0          # switched off: nothing happens
        assert trash.purge_older_than(conn, 30) == 1
        names = [r["name"] for r in conn.execute("SELECT name FROM trash")]
    assert "Velha na lixeira" not in names and "Nova na lixeira" in names
    assert ok(c.put("/api/settings", json={"trash_days": "30"}))["trash_days"] == "30"
    assert c.put("/api/settings", json={"trash_days": "7"}).status_code == 400
    ok(c.put("/api/settings", json={"trash_days": "0"}))
