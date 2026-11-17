"""Desktop app: preferences, desktop-only routes, folders picked in Settings, "open with" and "save as new version".

The window itself (pywebview) is not tested here; everything behind it is.
"""
import json
import os
import time
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import config, desktop, desktop_prefs, opener
from app.main import app

LIB = Path(os.environ["MDOP_LIBRARY"])
TMP = LIB.parent
H = {"X-MDoP-Desktop": "1"}


@pytest.fixture(scope="module")
def c():
    with TestClient(app) as client:
        yield client


@pytest.fixture
def desk(monkeypatch):
    """Switch the running app to desktop mode, with a fake "open with" that only records the path."""
    opened = []
    monkeypatch.setattr(config, "DESKTOP", True)
    monkeypatch.setattr(opener, "launcher", opened.append)
    monkeypatch.setattr(opener, "SETTLE_SECONDS", 0)
    old_import, old_sfx = list(config.IMPORT_ROOTS), list(config.SFX_ROOTS)
    yield opened
    config.set_roots(import_roots=old_import, sfx_roots=old_sfx)
    opener.SESSIONS.clear()


def ok(r):
    assert r.status_code == 200, r.text
    return r.json()


def song_with_file(c, title: str, name: str, content: bytes) -> tuple[int, int]:
    s = ok(c.post("/api/import/upload", files=[("files", (name, content, "application/octet-stream"))],
                  data={"target": "new", "title": title}))
    song = ok(c.get(f"/api/songs/{s['songs_created'][0]}"))
    return song["id"], song["versions"][0]["files"][0]["id"]


# ---------------------------------------------------------------- the server stays as it was

def test_server_mode_hides_desktop_routes(c):
    assert ok(c.get("/api/meta"))["desktop"] is False
    for method, url in (("GET", "/api/desktop"), ("POST", "/api/desktop/open/1"), ("GET", "/api/desktop/edits"),
                        ("POST", "/api/desktop/import-roots"), ("POST", "/api/desktop/show-library")):
        assert c.request(method, url, headers=H, json={"path": "x"}).status_code == 404, url


def test_desktop_routes_need_the_header(c, desk):
    assert ok(c.get("/api/meta"))["desktop"] is True
    assert c.get("/api/desktop").status_code == 403
    assert c.post("/api/desktop/open/1").status_code == 403
    assert ok(c.get("/api/desktop", headers=H))["library"] == str(config.LIBRARY_DIR)


# ---------------------------------------------------------------- preferences file

def test_prefs_roundtrip_with_accents_and_spaces(tmp_path, monkeypatch):
    monkeypatch.setenv("MDOP_DESKTOP_CONFIG", str(tmp_path / "cfg"))
    assert desktop_prefs.load() == desktop_prefs.DEFAULTS
    lib_dir = tmp_path / "Minhas Músicas" / "Coração & Ação"
    desktop_prefs.update(library=desktop_prefs.norm(lib_dir))
    desktop_prefs.add_root("import_roots", tmp_path / "Gravações do celular")
    desktop_prefs.add_root("import_roots", tmp_path / "Gravações do celular")   # no duplicates
    data = desktop_prefs.load()
    assert data["library"] == lib_dir.resolve().as_posix() and "\\" not in data["library"]
    assert data["import_roots"] == [(tmp_path / "Gravações do celular").resolve().as_posix()]
    raw = desktop_prefs.prefs_path().read_text(encoding="utf-8")
    assert "Músicas" in raw   # stored as readable UTF-8
    desktop_prefs.remove_root("import_roots", tmp_path / "Gravações do celular")
    assert desktop_prefs.load()["import_roots"] == []


def test_prefs_ignore_a_broken_file(tmp_path, monkeypatch):
    monkeypatch.setenv("MDOP_DESKTOP_CONFIG", str(tmp_path))
    (tmp_path / desktop_prefs.FILE_NAME).write_text("{not json", encoding="utf-8")
    assert desktop_prefs.load() == desktop_prefs.DEFAULTS
    (tmp_path / desktop_prefs.FILE_NAME).write_text(json.dumps({"library": 5, "import_roots": "x", "extra": 1}))
    assert desktop_prefs.load() == desktop_prefs.DEFAULTS


def test_apply_env(monkeypatch):
    for k in ("MDOP_DESKTOP", "MDOP_LIBRARY", "MDOP_IMPORT_ROOTS", "MDOP_SFX_ROOTS", "MDOP_BACKUP_DIR"):
        monkeypatch.delenv(k, raising=False)
    desktop_prefs.apply_env({"library": "/a/Músicas", "import_roots": ["/b", "/c d"], "sfx_roots": [], "backup_dir": ""})
    sep = ";" if os.name == "nt" else ":"
    assert os.environ["MDOP_DESKTOP"] == "1" and os.environ["MDOP_LIBRARY"] == "/a/Músicas"
    assert os.environ["MDOP_IMPORT_ROOTS"] == f"/b{sep}/c d" and os.environ["MDOP_SFX_ROOTS"] == ""
    assert "MDOP_BACKUP_DIR" not in os.environ


def test_library_folder_check(tmp_path):
    assert desktop_prefs.check_library_folder("") == "empty"
    assert desktop_prefs.check_library_folder(str(tmp_path / "nova pasta" / "MDoP")) == ""
    assert (tmp_path / "nova pasta" / "MDoP").is_dir()
    blocker = tmp_path / "a file"
    blocker.write_text("x")
    assert desktop_prefs.check_library_folder(str(blocker / "inside")) == "not_writable"
    assert 0 < desktop.free_port() < 65536


# ---------------------------------------------------------------- folders picked in Settings

def test_import_roots_from_settings(c, desk):
    folder = TMP / "Gravações antigas" / "Ensaio de março"
    folder.mkdir(parents=True)
    (folder / "riff lá menor.wav").write_bytes(b"RIFF" + b"0" * 200)
    info = ok(c.post("/api/desktop/import-roots", headers=H, json={"path": str(folder)}))
    assert str(folder.resolve()) in info["import_roots"]
    assert str(folder.resolve()) in ok(c.get("/api/meta"))["import_roots"]
    listing = ok(c.get("/api/browse", params={"path": str(folder)}))
    assert [e["name"] for e in listing["entries"]] == ["riff lá menor.wav"]
    saved = desktop_prefs.load()["import_roots"]
    assert folder.resolve().as_posix() in saved

    # folders inside the library, or missing ones, are refused
    assert c.post("/api/desktop/import-roots", headers=H, json={"path": str(LIB / "songs")}).status_code == 400
    assert c.post("/api/desktop/import-roots", headers=H, json={"path": str(TMP / "nope")}).status_code == 400

    ok(c.post("/api/desktop/import-roots/remove", headers=H, json={"path": str(folder)}))
    assert folder.resolve() not in config.IMPORT_ROOTS
    assert ok(c.get("/api/browse", params={"path": str(folder)}))["entries"] == []


def test_sfx_folder_from_settings(c, desk):
    folder = TMP / "Efeitos do HD" / "Portas e passos"
    folder.mkdir(parents=True)
    (folder / "porta rangendo.wav").write_bytes(b"RIFF" + b"0" * 200)
    r = ok(c.post("/api/desktop/sfx-roots", headers=H, json={"path": str(folder)}))
    assert str(folder.resolve()) in r["sfx_roots"]
    for _ in range(100):
        if not ok(c.get("/api/sfx/scan"))["running"]:
            break
        time.sleep(0.05)
    linked = [f for f in ok(c.get("/api/sfx/folders"))["folders"] if f["id"] == r["id"]]
    assert linked and linked[0]["path"] == str(folder.resolve())
    assert folder.resolve().as_posix() in desktop_prefs.load()["sfx_roots"]

    ok(c.delete(f"/api/sfx/folders/{r['id']}"))
    assert folder.resolve() not in config.SFX_ROOTS
    assert folder.resolve().as_posix() not in desktop_prefs.load()["sfx_roots"]


# ---------------------------------------------------------------- open with, then save as new version

def edit(path: Path, content: bytes) -> None:
    path.write_bytes(content)
    st = path.stat()
    os.utime(path, ns=(st.st_atime_ns, st.st_mtime_ns + 2_000_000_000))


def test_open_copy_and_save_as_new_version(c, desk):
    song_id, file_id = song_with_file(c, "Tema de teste", "solo final.gp5", b"GP5-original")
    original = LIB / ok(c.get(f"/api/files/{file_id}"))["url"].split("/media/", 1)[1].replace("%20", " ")
    assert original.read_bytes() == b"GP5-original"

    r = ok(c.post(f"/api/desktop/open/{file_id}", headers=H))
    copy = desk[-1]
    assert copy != original and copy.name == "solo final.gp5" and copy.read_bytes() == b"GP5-original"
    assert not str(copy).startswith(str(LIB))
    # opening again without changes reuses the same copy
    assert ok(c.post(f"/api/desktop/open/{file_id}", headers=H))["token"] == r["token"] and desk[-1] == copy

    assert ok(c.get("/api/desktop/edits", headers=H)) == []
    edit(copy, b"GP5-edited-in-another-program")
    ok(c.get("/api/desktop/edits", headers=H))            # first look: the file may still be being written
    pending = ok(c.get("/api/desktop/edits", headers=H))
    assert [(e["token"], e["name"], e["song_title"]) for e in pending] == [(r["token"], "solo final.gp5", "Tema de teste")]

    saved = ok(c.post(f"/api/desktop/edits/{r['token']}/save", headers=H, json={"label": "Editado no Guitar Pro"}))
    assert saved["number"] == 2
    song = ok(c.get(f"/api/songs/{song_id}"))
    v2 = next(v for v in song["versions"] if v["number"] == 2)
    assert v2["label"] == "Editado no Guitar Pro" and [f["name"] for f in v2["files"]] == ["solo final.gp5"]
    assert (LIB / "songs" / song["folder"] / "v2" / "solo final.gp5").read_bytes() == b"GP5-edited-in-another-program"
    assert original.read_bytes() == b"GP5-original"        # the original is never touched
    assert ok(c.get("/api/desktop/edits", headers=H)) == []

    # saving the same copy again later becomes yet another version
    edit(copy, b"GP5-edited-twice!")
    ok(c.get("/api/desktop/edits", headers=H))
    assert len(ok(c.get("/api/desktop/edits", headers=H))) == 1
    assert ok(c.post(f"/api/desktop/edits/{r['token']}/save", headers=H, json={"label": ""}))["number"] == 3


def test_ignore_an_edit_and_keep_unsaved_edits_on_exit(c, desk):
    _, file_id = song_with_file(c, "Outra ideia", "base.mid", b"MThd-base")
    r = ok(c.post(f"/api/desktop/open/{file_id}", headers=H))
    copy = desk[-1]
    edit(copy, b"MThd-changed")
    ok(c.get("/api/desktop/edits", headers=H))
    assert len(ok(c.get("/api/desktop/edits", headers=H))) == 1
    ok(c.post(f"/api/desktop/edits/{r['token']}/dismiss", headers=H))
    assert ok(c.get("/api/desktop/edits", headers=H)) == []
    assert c.post("/api/desktop/edits/unknown/save", headers=H, json={}).status_code == 400

    # an edit nobody handled is not lost when the app closes: it goes to the File list
    edit(copy, b"MThd-changed-again")
    loose_before = sum(len(g["files"]) for g in ok(c.get("/api/loose")))
    from app import db
    with db.connect() as conn:
        assert opener.cleanup(conn) == 1
    assert not opener.work_dir().exists()
    groups = ok(c.get("/api/loose"))
    assert sum(len(g["files"]) for g in groups) == loose_before + 1
    assert any(f["name"].startswith("base") for g in groups for f in g["files"])


def test_open_needs_an_existing_file(c, desk):
    assert c.post("/api/desktop/open/999999", headers=H).status_code == 400
    assert desk == []


def test_clean_env_restores_system_libraries(monkeypatch):
    monkeypatch.setenv("LD_LIBRARY_PATH", "/bundle/lib")
    monkeypatch.setenv("LD_LIBRARY_PATH_ORIG", "/usr/lib/custom")
    assert opener._clean_env()["LD_LIBRARY_PATH"] == "/usr/lib/custom"
    monkeypatch.delenv("LD_LIBRARY_PATH_ORIG")
    monkeypatch.setenv("APPIMAGE", "/x/MDoP.AppImage")
    assert "LD_LIBRARY_PATH" not in opener._clean_env()


def test_choose_another_library_for_the_next_start(c, desk):
    target = TMP / "Outra Biblioteca Ação"
    d = ok(c.post("/api/desktop/library", headers=H, json={"path": str(target)}))
    assert d["next_library"] == target.resolve().as_posix() and target.is_dir()
    assert d["library"] == str(config.LIBRARY_DIR)          # the running app keeps its library
    assert desktop_prefs.load()["library"] == target.resolve().as_posix()
    blocker = TMP / "not a folder"
    blocker.write_text("x")
    assert c.post("/api/desktop/library", headers=H, json={"path": str(blocker / "x")}).status_code == 400
    assert c.post("/api/desktop/library", headers=H, json={"path": " "}).status_code == 400
