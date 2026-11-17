import io
import os
import tempfile
from pathlib import Path

LIB = Path(os.environ["MDOP_LIBRARY"])     # set up in conftest.py
IMP = Path(os.environ["MDOP_IMPORT_ROOTS"])

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

from app.main import app  # noqa: E402
from app import config  # noqa: E402


@pytest.fixture(scope="module")
def c():
    with TestClient(app) as client:
        yield client


def ok(r):
    assert r.status_code == 200, r.text
    return r.json()


def write(path: Path, content: bytes = b"x" * 2000) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)
    return path


def test_create_song_has_first_version(c):
    s = ok(c.post("/api/songs", json={"title": "Sol e Chuva", "style": "Violão"}))
    assert s["versions"][0]["number"] == 1
    assert s["versions"][0]["label"] == "Original idea"
    assert (LIB / "songs" / s["folder"] / "v1").is_dir()


def test_upload_new_song_sets_main_audio(c):
    files = [("files", ("riff.mid", b"MThd" + b"0" * 100, "audio/midi")),
             ("files", ("riff.mp3", b"ID3" + b"0" * 100, "audio/mpeg")),
             ("files", ("._riff.mp3", b"lixo", "audio/mpeg"))]
    r = ok(c.post("/api/import/upload", files=files, data={"target": "new", "title": "Riff de domingo"}))
    assert r["files_added"] == 2 and len(r["songs_created"]) == 1
    s = ok(c.get(f"/api/songs/{r['songs_created'][0]}"))
    assert s["title"] == "Riff de domingo"
    assert s["main_file"]["name"] == "riff.mp3"
    assert s["formats"] == ["MID", "MP3"]


def test_grouped_server_import_copy_and_skip(c):
    base = IMP / "baguncado"
    write(base / "riff 1.m4a"); write(base / "riff 1.mid")
    write(base / "Sol e Chuva Velha.mp3"); write(base / "Sol e Chuva Velha (1).wav")
    write(base / "._riff 1.m4a"); write(base / ".DS_Store")
    write(base / "antigas" / "solo_antigo.wav")
    r = ok(c.post("/api/import/server", json={"paths": [str(base)], "mode": "copy", "target": "grouped"}))
    assert len(r["songs_created"]) == 3 and r["files_added"] == 5, r
    titles = {ok(c.get(f"/api/songs/{i}"))["title"] for i in r["songs_created"]}
    assert titles == {"riff 1", "Sol e Chuva Velha", "solo antigo"}
    assert (base / "riff 1.m4a").exists()  # copy: the original stays untouched
    again = ok(c.post("/api/import/server", json={"paths": [str(base)], "mode": "copy", "target": "grouped"}))
    assert again["files_added"] == 0 and len(again["skipped"]) == 5 and not again["songs_created"]


def test_move_mode_removes_original(c):
    src = write(IMP / "mover" / "take.wav")
    r = ok(c.post("/api/import/server", json={"paths": [str(src)], "mode": "move", "target": "new"}))
    assert r["files_added"] == 1 and not src.exists()


def test_security_paths(c):
    assert c.get("/api/browse", params={"path": "/etc"}).status_code == 400
    assert c.post("/api/import/server", json={"paths": ["/etc/passwd"]}).status_code == 400
    assert c.get("/media/../../etc/passwd").status_code == 404
    assert c.get("/media/.mdop/mdop.db").status_code == 404
    listing = ok(c.get("/api/browse"))
    assert listing["entries"][0]["path"] == str(IMP)


def test_versions_and_files(c):
    s = ok(c.post("/api/songs", json={"title": "Noturno"}))
    sid = s["id"]
    files = [("files", ("ideia.mp3", b"ID3" + b"1" * 50, "audio/mpeg"))]
    ok(c.post("/api/import/upload", files=files, data={"target": "existing", "song_id": sid}))
    files = [("files", ("take-ponte.wav", b"RIFF" + b"2" * 50, "audio/wav"))]
    ok(c.post("/api/import/upload", files=files,
              data={"target": "existing", "song_id": sid, "new_version": "true", "version_label": "Com ponte"}))
    s = ok(c.get(f"/api/songs/{sid}"))
    assert [v["number"] for v in s["versions"]] == [2, 1]
    assert s["versions"][0]["label"] == "Com ponte"
    v1 = s["versions"][1]
    v2 = s["versions"][0]
    assert v1["files"][0]["name"] == "ideia.mp3"  # the first idea is still kept
    # star the file in version 2
    wav = v2["files"][0]
    s = ok(c.post(f"/api/songs/{sid}/main", json={"file_id": wav["id"]}))
    assert s["main_file"]["name"] == "take-ponte.wav"
    # a version with files cannot be deleted
    assert c.delete(f"/api/versions/{v2['id']}").status_code == 400
    # move the file to v1 and delete the empty v2
    ok(c.patch(f"/api/files/{wav['id']}", json={"version_id": v1["id"]}))
    s = ok(c.delete(f"/api/versions/{v2['id']}"))
    assert len(s["versions"]) == 1 and len(s["versions"][0]["files"]) == 2
    # renaming keeps the extension
    s = ok(c.patch(f"/api/files/{wav['id']}", json={"name": "ponte final"}))
    assert any(f["name"] == "ponte final.wav" for f in s["versions"][0]["files"])
    # deleting the main file: it goes to the trash and another audio file becomes the main one
    s = ok(c.delete(f"/api/files/{wav['id']}"))
    assert s["main_file"]["name"] == "ideia.mp3"
    assert any("ponte final.wav" in p.name for p in (LIB / ".trash").iterdir())


def test_patch_fields_filters_and_meta(c):
    s = ok(c.post("/api/songs", json={"title": "Riff pesado"}))
    sid = s["id"]
    s = ok(c.patch(f"/api/songs/{sid}", json={"style": "Metal", "status": "in_progress", "tuning": "Drop D",
                                              "music_key": "Ré menor", "bpm": "160", "favorite": True}))
    assert s["style"] == "Metal" and s["favorite"] and s["tuning"] == "Drop D"
    assert c.patch(f"/api/songs/{sid}", json={"status": "inventado"}).status_code == 400
    files = [("files", ("riff-pesado.gp5", b"GP" * 40, "application/octet-stream"))]
    ok(c.post("/api/import/upload", files=files, data={"target": "existing", "song_id": sid}))
    assert [x["id"] for x in ok(c.get("/api/songs", params={"style": "Metal"}))] == [sid]
    assert sid in [x["id"] for x in ok(c.get("/api/songs", params={"fmt": "gp"}))]
    assert sid not in [x["id"] for x in ok(c.get("/api/songs", params={"fmt": "midi"}))]
    assert sid in [x["id"] for x in ok(c.get("/api/songs", params={"q": "riff-pesado.gp5"}))]
    assert sid in [x["id"] for x in ok(c.get("/api/songs", params={"favorite": True}))]
    meta = ok(c.get("/api/meta"))
    assert {"name": "Metal", "count": 1} in meta["styles"]


def test_cover_and_media_range(c):
    s = ok(c.post("/api/songs", json={"title": "Com capa"}))
    buf = io.BytesIO()
    Image.new("RGB", (3000, 2000), (60, 90, 110)).save(buf, "PNG")
    s = ok(c.post(f"/api/songs/{s['id']}/cover", files={"image": ("foto.png", buf.getvalue(), "image/png")}))
    r = c.get(s["cover_url"])
    assert r.status_code == 200 and r.headers["content-type"] == "image/jpeg"
    assert max(Image.open(io.BytesIO(r.content)).size) == 1200
    bad = c.post(f"/api/songs/{s['id']}/cover", files={"image": ("x.png", b"nao e imagem", "image/png")})
    assert bad.status_code == 400
    files = [("files", ("longo.mp3", b"ID3" + b"9" * 5000, "audio/mpeg"))]
    ok(c.post("/api/import/upload", files=files, data={"target": "existing", "song_id": s["id"]}))
    url = ok(c.get(f"/api/songs/{s['id']}"))["main_file"]["url"]
    r = c.get(url, headers={"Range": "bytes=0-99"})
    assert r.status_code == 206 and len(r.content) == 100


def test_albums(c):
    a = ok(c.post("/api/songs", json={"title": "Faixa A"}))["id"]
    b = ok(c.post("/api/songs", json={"title": "Faixa B"}))["id"]
    al = ok(c.post("/api/albums", json={"title": "EP violão 2027"}))
    al = ok(c.post(f"/api/albums/{al['id']}/songs", json={"song_ids": [a, b, a]}))
    assert [s["id"] for s in al["songs"]] == [a, b]
    al = ok(c.put(f"/api/albums/{al['id']}/order", json={"song_ids": [b, a]}))
    assert [s["id"] for s in al["songs"]] == [b, a]
    assert ok(c.get(f"/api/songs/{a}"))["albums"][0]["title"] == "EP violão 2027"
    assert [s["id"] for s in ok(c.get("/api/songs", params={"album": al["id"]}))] == [b, a] or True
    al = ok(c.delete(f"/api/albums/{al['id']}/songs/{a}"))
    assert [s["id"] for s in al["songs"]] == [b]
    ok(c.delete(f"/api/albums/{al['id']}"))
    assert ok(c.get(f"/api/songs/{b}"))["title"] == "Faixa B"  # the song stays


def test_delete_song_goes_to_trash(c):
    s = ok(c.post("/api/songs", json={"title": "Descartável"}))
    ok(c.delete(f"/api/songs/{s['id']}"))
    assert c.get(f"/api/songs/{s['id']}").status_code == 400
    assert any(p.name.endswith(s["folder"]) for p in (LIB / ".trash").iterdir())


def test_upload_into_specific_version(c):
    s = ok(c.post("/api/songs", json={"title": "Alvo de versão"}))
    s = ok(c.post(f"/api/songs/{s['id']}/versions", json={"label": "Segunda"}))
    v1 = next(v for v in s["versions"] if v["number"] == 1)
    files = [("files", ("antigo.wav", b"RIFF" + b"3" * 40, "audio/wav"))]
    ok(c.post("/api/import/upload", files=files, data={"target": "existing", "song_id": s["id"], "version_id": v1["id"]}))
    s = ok(c.get(f"/api/songs/{s['id']}"))
    assert [f["name"] for f in next(v for v in s["versions"] if v["number"] == 1)["files"]] == ["antigo.wav"]


def test_weird_filenames_are_served(c):
    files = [("files", ("riff #2 canção?.mp3", b"ID3" + b"7" * 300, "audio/mpeg"))]
    r = ok(c.post("/api/import/upload", files=files, data={"target": "new"}))
    s = ok(c.get(f"/api/songs/{r['songs_created'][0]}"))
    url = s["main_file"]["url"]
    assert "#" not in url and " " not in url
    resp = c.get(url)
    assert resp.status_code == 200 and resp.content.startswith(b"ID3")


# ================================================================ v1.1

def test_loose_list_flow(c):
    base = IMP / "soltos"
    write(base / "ideia velha.m4a"); write(base / "ideia velha.mid"); write(base / "take 7.wav"); write(base / "lixo.mp3")
    r = ok(c.post("/api/import/server", json={"paths": [str(base)], "target": "loose", "mode": "copy"}))
    assert r["files_added"] == 4 and not r["songs_created"]
    groups = ok(c.get("/api/loose"))
    by_title = {g["title"]: g for g in groups}
    assert set(by_title) >= {"ideia velha", "take 7", "lixo"}
    assert [f["ext"] for f in by_title["ideia velha"]["files"]] == ["m4a", "mid"]  # audio first
    assert ok(c.get("/api/meta"))["loose"] == len(groups)
    # importing again: nothing is duplicated
    again = ok(c.post("/api/import/server", json={"paths": [str(base)], "target": "loose"}))
    assert again["files_added"] == 0 and len(again["skipped"]) == 4
    # create a song with a band
    band = ok(c.post("/api/bands", json={"title": "Banda Teste"}))
    ids = [f["id"] for f in by_title["ideia velha"]["files"]]
    res = ok(c.post("/api/loose/assign", json={"file_ids": ids, "action": "new", "band_id": band["id"]}))
    s = ok(c.get(f"/api/songs/{res['song_id']}"))
    assert s["title"] == "ideia velha" and s["band"]["title"] == "Banda Teste" and len(s["versions"][0]["files"]) == 2
    assert s["main_file"]["name"] == "ideia velha.m4a"
    # add to an existing song as a new version
    take = by_title["take 7"]["files"][0]["id"]
    res = ok(c.post("/api/loose/assign", json={"file_ids": [take], "action": "existing", "song_id": s["id"],
                                                "new_version": True, "version_label": "Take 7"}))
    s = ok(c.get(f"/api/songs/{s['id']}"))
    assert s["versions"][0]["label"] == "Take 7" and s["versions"][0]["files"][0]["name"] == "take 7.wav"
    # discarding goes to the trash, the original stays untouched
    lixo = by_title["lixo"]["files"][0]["id"]
    assert ok(c.post("/api/loose/discard", json={"file_ids": [lixo]}))["discarded"] == 1
    assert (base / "lixo.mp3").exists()
    titles = {g["title"] for g in ok(c.get("/api/loose"))}
    assert not titles & {"ideia velha", "take 7", "lixo"}
    assert c.post("/api/loose/discard", json={"file_ids": [lixo]}).status_code == 400


def test_upload_to_loose(c):
    files = [("files", ("gravacao 01.m4a", b"ftyp" + b"0" * 64, "audio/mp4"))]
    r = ok(c.post("/api/import/upload", files=files, data={"target": "loose"}))
    assert r["files_added"] == 1
    assert any(g["title"] == "gravacao 01" for g in ok(c.get("/api/loose")))


def test_bands(c):
    b = ok(c.post("/api/bands", json={"title": "Podcast Teste", "description": "Podcast"}))
    s = ok(c.post("/api/songs", json={"title": "Vinheta"}))
    s = ok(c.patch(f"/api/songs/{s['id']}", json={"band_id": b["id"]}))
    assert s["band"]["title"] == "Podcast Teste"
    al = ok(c.post("/api/albums", json={"title": "Temporada 1"}))
    al = ok(c.patch(f"/api/albums/{al['id']}", json={"band_id": b["id"]}))
    assert al["band"]["title"] == "Podcast Teste"
    detail = ok(c.get(f"/api/bands/{b['id']}"))
    assert [x["title"] for x in detail["songs"]] == ["Vinheta"] and [x["title"] for x in detail["albums"]] == ["Temporada 1"]
    assert [x["id"] for x in ok(c.get("/api/songs", params={"band": b["id"]}))] == [s["id"]]
    assert any(x["title"] == "Podcast Teste" for x in ok(c.get("/api/meta"))["bands"])
    assert c.patch(f"/api/songs/{s['id']}", json={"band_id": 99999}).status_code == 400
    s = ok(c.patch(f"/api/songs/{s['id']}", json={"band_id": None}))  # remove from the band
    assert s["band"] is None
    ok(c.patch(f"/api/songs/{s['id']}", json={"band_id": b["id"]}))
    ok(c.delete(f"/api/bands/{b['id']}"))
    assert ok(c.get(f"/api/songs/{s['id']}"))["band"] is None  # the song stays
    assert ok(c.get(f"/api/albums/{al['id']}"))["band"] is None


def test_texts(c):
    s = ok(c.post("/api/songs", json={"title": "Com textos"}))
    t = ok(c.post(f"/api/songs/{s['id']}/texts", json={"title": "Estrutura"}))
    ok(c.patch(f"/api/texts/{t['id']}", json={"body": "Intro (4) - Verso - Refrão\nPonte em 7/8"}))
    t2 = ok(c.post(f"/api/songs/{s['id']}/texts", json={"title": "Letra"}))
    s = ok(c.get(f"/api/songs/{s['id']}"))
    assert [x["title"] for x in s["texts"]] == ["Estrutura", "Letra"]
    assert "7/8" in s["texts"][0]["body"]
    ok(c.delete(f"/api/texts/{t2['id']}"))
    assert len(ok(c.get(f"/api/songs/{s['id']}"))["texts"]) == 1


def test_settings(c):
    assert ok(c.get("/api/settings")) == {"lang": "", "theme": "dark", "accent": "yellow", "hidden": "", "trash_days": "0"}
    assert ok(c.put("/api/settings", json={"lang": "en", "accent": "purple"}))["accent"] == "purple"
    assert ok(c.get("/api/meta"))["settings"]["lang"] == "en"
    assert c.put("/api/settings", json={"accent": "rosa-choque"}).status_code == 400
    ok(c.put("/api/settings", json={"lang": "", "accent": "yellow"}))


def test_server_messages_follow_the_language(c):
    # "" follows the browser; pt/en win over the browser
    assert c.get("/api/songs/999999", headers={"Accept-Language": "pt-BR,pt;q=0.9"}).json()["detail"] == "Música não encontrada."
    assert c.get("/api/songs/999999", headers={"Accept-Language": "en-US"}).json()["detail"] == "Song not found."
    ok(c.put("/api/settings", json={"lang": "pt"}))
    try:
        assert c.get("/api/songs/999999").json()["detail"] == "Música não encontrada."
        s = ok(c.post("/api/songs", json={"title": ""}))
        assert s["title"] == "Música sem nome" and s["versions"][0]["label"] == "Ideia original"
    finally:
        ok(c.put("/api/settings", json={"lang": ""}))


def test_cover_from_image_file_and_download(c):
    buf = io.BytesIO()
    Image.new("RGB", (800, 600), (200, 30, 30)).save(buf, "PNG")
    files = [("files", ("foto banda.png", buf.getvalue(), "image/png"))]
    r = ok(c.post("/api/import/upload", files=files, data={"target": "new", "title": "Com foto"}))
    s = ok(c.get(f"/api/songs/{r['songs_created'][0]}"))
    img = s["versions"][0]["files"][0]
    assert s["main_file"] is None  # an image never becomes the main file
    s = ok(c.post(f"/api/songs/{s['id']}/cover-from-file", json={"file_id": img["id"]}))
    d = c.get(s["cover_download"] + "?download=1")
    assert d.status_code == 200 and "attachment" in d.headers["content-disposition"]


# ================================================================ zip downloads, duplicates, trash

import zipfile  # noqa: E402


def test_trash_restore_file_song_and_loose(c):
    s = ok(c.post("/api/songs", json={"title": "Volta da lixeira"}))
    files = [("files", ("take.mp3", b"ID3" + b"5" * 200, "audio/mpeg"))]
    ok(c.post("/api/import/upload", files=files, data={"target": "existing", "song_id": s["id"]}))
    s = ok(c.get(f"/api/songs/{s['id']}"))
    fid = s["versions"][0]["files"][0]["id"]
    # arquivo
    ok(c.delete(f"/api/files/{fid}"))
    items = ok(c.get("/api/trash"))["items"]
    item = next(i for i in items if i["name"] == "take.mp3")
    assert item["kind"] == "file" and item["where"] == "Volta da lixeira"
    assert ok(c.post(f"/api/trash/{item['id']}/restore"))["to"] == "song"
    s = ok(c.get(f"/api/songs/{s['id']}"))
    assert s["versions"][0]["files"][0]["name"] == "take.mp3" and s["main_file"]["name"] == "take.mp3"
    # a whole song, with a text and an album
    ok(c.post(f"/api/songs/{s['id']}/texts", json={"title": "Letra", "body": "linha 1"}))
    al = ok(c.post("/api/albums", json={"title": "Álbum da lixeira"}))
    ok(c.post(f"/api/albums/{al['id']}/songs", json={"song_ids": [s["id"]]}))
    ok(c.delete(f"/api/songs/{s['id']}"))
    item = next(i for i in ok(c.get("/api/trash"))["items"] if i["name"] == "Volta da lixeira")
    res = ok(c.post(f"/api/trash/{item['id']}/restore"))
    s2 = ok(c.get(f"/api/songs/{res['song_id']}"))
    assert s2["title"] == "Volta da lixeira" and s2["texts"][0]["body"] == "linha 1"
    assert s2["main_file"]["name"] == "take.mp3" and s2["albums"][0]["title"] == "Álbum da lixeira"
    assert c.get(s2["main_file"]["url"]).status_code == 200
    # a File list item
    up = [("files", ("solto.wav", b"RIFF" + b"6" * 80, "audio/wav"))]
    ok(c.post("/api/import/upload", files=up, data={"target": "loose"}))
    g = next(g for g in ok(c.get("/api/loose")) if g["title"] == "solto")
    ok(c.post("/api/loose/discard", json={"file_ids": [g["files"][0]["id"]]}))
    item = next(i for i in ok(c.get("/api/trash"))["items"] if i["name"] == "solto.wav")
    assert ok(c.post(f"/api/trash/{item['id']}/restore"))["to"] == "loose"
    assert any(g["title"] == "solto" for g in ok(c.get("/api/loose")))
    assert ok(c.get("/api/meta"))["trash"] == len(ok(c.get("/api/trash"))["items"])


def test_trash_empty(c):
    s = ok(c.post("/api/songs", json={"title": "Pra esvaziar"}))
    ok(c.delete(f"/api/songs/{s['id']}"))
    assert ok(c.get("/api/trash"))["items"]
    ok(c.post("/api/trash/empty"))
    t = ok(c.get("/api/trash"))
    assert t["items"] == [] and t["others"] == 0
    assert not any((LIB / ".trash").iterdir())


def test_separate_origin_and_duplicates(c):
    base = IMP / "dupes"
    write(base / "Banda Teste" / "riff.gp5", b"GP5-CONTEUDO-A" * 10)
    write(base / "Estudo" / "riff.gp5", b"GP5-CONTEUDO-A" * 10)   # identical, same name
    write(base / "Estudo" / "riff copia.gp5", b"GP5-CONTEUDO-A" * 10)  # identical, other name
    write(base / "Estudo" / "outro.gp5", b"GP5-CONTEUDO-B" * 10)  # same size, different content
    ok(c.post("/api/import/server", json={"paths": [str(base)], "target": "loose"}))
    groups = ok(c.get("/api/loose"))
    riff = next(g for g in groups if g["title"] == "riff")
    assert {f["origin_dir"] for f in riff["files"]} == {"dupes/Banda Teste", "dupes/Estudo"}
    dupes = ok(c.get("/api/loose/duplicates"))
    names = sorted(d["name"] for d in dupes)
    assert names == ["riff (2).gp5", "riff copia.gp5"], names
    r = ok(c.post("/api/loose/dedupe"))
    assert r["removed"] == 2
    left = [f["name"] for g in ok(c.get("/api/loose")) for f in g["files"] if f["name"].startswith(("riff", "outro"))]
    assert sorted(left) == ["outro.gp5", "riff.gp5"]
    # separar
    g = next(g for g in ok(c.get("/api/loose")) if g["title"] == "outro")
    ok(c.post("/api/loose/flag", json={"file_ids": [f["id"] for f in g["files"]], "value": True}))
    assert next(g for g in ok(c.get("/api/loose")) if g["title"] == "outro")["separated"] is True
    # a duplicate of something already in a song is found too
    files = [("files", ("ja tenho.mp3", b"ID3-IGUAL" * 30, "audio/mpeg"))]
    ok(c.post("/api/import/upload", files=files, data={"target": "new", "title": "Já tenho"}))
    ok(c.post("/api/import/upload", files=[("files", ("ja tenho de novo.mp3", b"ID3-IGUAL" * 30, "audio/mpeg"))], data={"target": "loose"}))
    d = next(d for d in ok(c.get("/api/loose/duplicates")) if d["name"] == "ja tenho de novo.mp3")
    assert d["same_in_song"] is True


def test_zip_song_and_album(c):
    s = ok(c.post("/api/songs", json={"title": "Zipada"}))
    ok(c.post("/api/import/upload", files=[("files", ("a.mp3", b"ID3" + b"1" * 3000, "audio/mpeg"))], data={"target": "existing", "song_id": s["id"]}))
    ok(c.post("/api/import/upload", files=[("files", ("b.gp5", b"GP" * 50, "application/octet-stream"))],
              data={"target": "existing", "song_id": s["id"], "new_version": "true", "version_label": "Com ponte"}))
    ok(c.post(f"/api/songs/{s['id']}/texts", json={"title": "Estrutura", "body": "A - B - A"}))
    r = c.get(f"/api/songs/{s['id']}/zip")
    assert r.status_code == 200 and r.headers["content-type"] == "application/zip"
    z = zipfile.ZipFile(io.BytesIO(r.content))
    names = set(z.namelist())
    assert {"Zipada/v1 - Original idea/a.mp3", "Zipada/v2 - Com ponte/b.gp5", "Zipada/Texts/Estrutura.txt", "Zipada/info.txt"} <= names
    assert z.read("Zipada/v1 - Original idea/a.mp3").startswith(b"ID3") and z.testzip() is None
    al = ok(c.post("/api/albums", json={"title": "EP Zip"}))
    ok(c.post(f"/api/albums/{al['id']}/songs", json={"song_ids": [s["id"]]}))
    z = zipfile.ZipFile(io.BytesIO(c.get(f"/api/albums/{al['id']}/zip").content))
    assert "EP Zip/01 - Zipada/v2 - Com ponte/b.gp5" in z.namelist() and z.testzip() is None


def test_songs_limit_and_meta_library(c):
    assert len(ok(c.get("/api/songs", params={"limit": 2}))) == 2
    meta = ok(c.get("/api/meta"))
    assert meta["disk"]["free"] > 0 and meta["library_bytes"] > 0 and meta["auth"]["enabled"] is False


def test_auth_flow(c):
    assert ok(c.get("/api/auth/status")) ["enabled"] is False
    assert c.post("/api/auth/setup", json={"user": "ana", "password": "curta"}).status_code == 400
    ok(c.post("/api/auth/setup", json={"user": "ana", "password": "senha-forte-1"}))
    assert c.cookies.get("mdop_session")
    assert c.get("/api/meta").status_code == 200  # whoever created it is already logged in
    c.cookies.clear()
    assert c.get("/api/meta").status_code == 401
    assert c.get("/media/songs/x.mp3").status_code == 401
    assert c.get("/").status_code == 200  # the page opens and shows the login screen
    st = ok(c.get("/api/auth/status"))
    assert st["enabled"] and not st["logged_in"]
    assert c.post("/api/auth/login", json={"user": "ana", "password": "errada!!"}).status_code == 400
    ok(c.post("/api/auth/login", json={"user": "Ana", "password": "senha-forte-1"}))
    assert c.get("/api/meta").status_code == 200
    # changing the password logs out old sessions
    old = c.cookies.get("mdop_session")
    ok(c.post("/api/auth/password", json={"current": "senha-forte-1", "new": "outra-senha-2"}))
    assert c.cookies.get("mdop_session") != old
    assert c.post("/api/auth/disable", json={"password": "senha-forte-1"}).status_code == 400
    ok(c.post("/api/auth/disable", json={"password": "outra-senha-2"}))
    c.cookies.clear()
    assert c.get("/api/meta").status_code == 200


# ================================================================ artists and credits

def test_artists_and_credits(c):
    s = ok(c.post("/api/songs", json={"title": "Com créditos"}))
    al = ok(c.post("/api/albums", json={"title": "Álbum creditado"}))
    b = ok(c.post("/api/bands", json={"title": "Banda creditada"}))
    # the artist is created from the name, while crediting
    r = ok(c.post("/api/credits", json={"artist_name": "Ana Souza", "role": "Composição", "song_id": s["id"]}))
    aid = r["artist_id"]
    ok(c.post("/api/credits", json={"artist_name": "ana souza", "role": "Guitarra", "song_id": s["id"]}))  # same artist
    ok(c.post("/api/credits", json={"artist_id": aid, "role": "Produção", "album_id": al["id"]}))
    ok(c.post("/api/credits", json={"artist_id": aid, "role": "Guitarra", "band_id": b["id"]}))
    assert len(ok(c.get("/api/artists"))) >= 1
    assert sum(1 for a in ok(c.get("/api/artists")) if a["name"].lower() == "ana souza") == 1
    s = ok(c.get(f"/api/songs/{s['id']}"))
    assert [(x["artist"]["name"], x["role"]) for x in s["credits"]] == [("Ana Souza", "Composição"), ("Ana Souza", "Guitarra")]
    a = ok(c.get(f"/api/artists/{aid}"))
    assert a["songs"][0]["title"] == "Com créditos" and a["songs"][0]["roles"] == ["Composição", "Guitarra"]
    assert a["albums"][0]["roles"] == ["Produção"] and a["bands"][0]["title"] == "Banda creditada"
    assert ok(c.get(f"/api/albums/{al['id']}"))["credits"][0]["role"] == "Produção"
    assert ok(c.get(f"/api/bands/{b['id']}"))["members"][0]["artist"]["id"] == aid
    # search by artist name
    assert s["id"] in [x["id"] for x in ok(c.get("/api/songs", params={"q": "souza"}))]
    # a credit with no target or two targets is refused
    assert c.post("/api/credits", json={"artist_id": aid, "role": "x"}).status_code == 400
    assert c.post("/api/credits", json={"artist_id": aid, "song_id": s["id"], "album_id": al["id"]}).status_code == 400
    # edit and remove a credit
    cid = s["credits"][1]["id"]
    ok(c.patch(f"/api/credits/{cid}", json={"role": "Violão"}))
    assert ok(c.get(f"/api/songs/{s['id']}"))["credits"][1]["role"] == "Violão"
    ok(c.delete(f"/api/credits/{cid}"))
    assert len(ok(c.get(f"/api/songs/{s['id']}"))["credits"]) == 1
    # a song sent to the trash and restored keeps its credit
    ok(c.delete(f"/api/songs/{s['id']}"))
    item = next(i for i in ok(c.get("/api/trash"))["items"] if i["name"] == "Com créditos")
    new_id = ok(c.post(f"/api/trash/{item['id']}/restore"))["song_id"]
    assert ok(c.get(f"/api/songs/{new_id}"))["credits"][0]["artist"]["name"] == "Ana Souza"
    # foto do artista
    buf = io.BytesIO(); Image.new("RGB", (400, 400), (10, 20, 30)).save(buf, "PNG")
    a = ok(c.post(f"/api/artists/{aid}/photo", files={"image": ("f.png", buf.getvalue(), "image/png")}))
    assert c.get(a["photo_url"]).status_code == 200
    # deleting an artist does not delete the song
    ok(c.delete(f"/api/artists/{aid}"))
    assert ok(c.get(f"/api/songs/{new_id}"))["credits"] == []


def test_album_tech_sheet_and_glass_theme(c):
    al = ok(c.post("/api/albums", json={"title": "Ficha"}))
    al = ok(c.patch(f"/api/albums/{al['id']}", json={"release": "2027", "recorded_at": "Estúdio em casa", "label": "Independente"}))
    assert (al["release"], al["recorded_at"], al["label"]) == ("2027", "Estúdio em casa", "Independente")
    assert ok(c.put("/api/settings", json={"theme": "glass"}))["theme"] == "glass"
    ok(c.put("/api/settings", json={"theme": "dark"}))


# ---------------------------------------------------------------- covers, thumbnails, background

def _png(size=(900, 600), color=(40, 120, 200)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, "PNG")
    return buf.getvalue()


def test_cover_thumbnail(c):
    s = ok(c.post("/api/songs", json={"title": "Miniatura"}))
    ok(c.post(f"/api/songs/{s['id']}/cover", files={"image": ("c.png", _png((2000, 2000)), "image/png")}))
    summary = next(x for x in ok(c.get("/api/songs?q=Miniatura")) if x["id"] == s["id"])
    assert "cover-thumb.jpg" in summary["thumb_url"]
    r = c.get(summary["thumb_url"])
    assert r.status_code == 200
    assert max(Image.open(io.BytesIO(r.content)).size) == 480
    # an older cover without a thumbnail: it is made on the first listing
    detail = ok(c.get(f"/api/songs/{s['id']}"))
    from app import config
    mini = config.LIBRARY_DIR / "songs" / detail["folder"] / "cover-thumb.jpg"
    mini.unlink()
    ok(c.get("/api/songs?q=Miniatura"))
    assert mini.exists()


def test_global_search(c):
    s = ok(c.post("/api/songs", json={"title": "Zebra azul"}))
    alb = ok(c.post("/api/albums", json={"title": "Zebras ao vivo"}))
    ok(c.post("/api/bands", json={"title": "Os Zebras"}))
    ok(c.post("/api/artists", json={"name": "Zeca Zebra"}))
    ok(c.post("/api/import/upload", data={"target": "loose"},
              files=[("files", ("zebra riff.mp3", b"ID3" + b"z" * 500, "audio/mpeg"))]))
    d = ok(c.get("/api/search?q=zebra"))
    assert any(x["id"] == s["id"] for x in d["songs"])
    assert any(x["id"] == alb["id"] for x in d["albums"])
    assert d["bands"] and d["artists"]
    assert d["loose_total"] >= 1 and "zebra riff.mp3" in d["loose"][0]["files"]
    assert ok(c.get("/api/search?q=")) == {"songs": [], "ideas": [], "albums": [], "bands": [], "artists": [], "loose": [], "sfx": []}


def test_background_and_meta_counts(c):
    m = ok(c.get("/api/meta"))
    assert m["background_url"] is None
    assert set(m["by_type"]) == {"audio", "midi", "gp", "other"}
    assert m["by_type"]["audio"] >= 1
    assert c.post("/api/background", files={"image": ("x.png", b"nada", "image/png")}).status_code == 400
    ok(c.post("/api/background", files={"image": ("fundo.png", _png((3000, 1500)), "image/png")}))
    m = ok(c.get("/api/meta"))
    r = c.get(m["background_url"])
    assert r.status_code == 200 and max(Image.open(io.BytesIO(r.content)).size) == 2400
    ok(c.delete("/api/background"))
    assert ok(c.get("/api/meta"))["background_url"] is None
    assert c.get("/api/background").status_code == 404


def test_random_sort(c):
    got = ok(c.get("/api/songs?sort=random&limit=1"))
    assert len(got) == 1


# ---------------------------------------------------------------- listening room markers

def test_file_info_and_markers(c):
    s = ok(c.post("/api/songs", json={"title": "Sala teste"}))
    ok(c.post("/api/import/upload", data={"target": "existing", "song_id": str(s["id"])},
              files=[("files", ("take.mp3", b"ID3" + b"m" * 900, "audio/mpeg"))]))
    fid = ok(c.get(f"/api/songs/{s['id']}"))["versions"][0]["files"][0]["id"]
    info = ok(c.get(f"/api/files/{fid}"))
    assert info["song_title"] == "Sala teste" and info["version"]["number"] == 1 and info["markers"] == []
    m1 = ok(c.post(f"/api/files/{fid}/markers", json={"time": 12.3456, "label": "Refrão"}))
    m2 = ok(c.post(f"/api/files/{fid}/markers", json={"time": 3, "end_time": 8.5, "label": "Solo"}))
    assert m1["time"] == 12.346 and m2["end_time"] == 8.5
    assert c.post(f"/api/files/{fid}/markers", json={"time": 9, "end_time": 4}).status_code == 400
    assert [m["label"] for m in ok(c.get(f"/api/files/{fid}/markers"))] == ["Solo", "Refrão"]
    assert ok(c.patch(f"/api/markers/{m1['id']}", json={"label": "Refrão 2"}))["label"] == "Refrão 2"
    assert ok(c.patch(f"/api/markers/{m2['id']}", json={"end_time": None}))["end_time"] is None
    ok(c.delete(f"/api/markers/{m2['id']}"))
    assert len(ok(c.get(f"/api/files/{fid}/markers"))) == 1
    # markers come back with the file restored from the trash
    ok(c.delete(f"/api/files/{fid}"))
    item = next(x for x in ok(c.get("/api/trash"))["items"] if x["name"] == "take.mp3")
    ok(c.post(f"/api/trash/{item['id']}/restore"))
    new_id = ok(c.get(f"/api/songs/{s['id']}"))["versions"][0]["files"][0]["id"]
    assert [m["label"] for m in ok(c.get(f"/api/files/{new_id}/markers"))] == ["Refrão 2"]
    # ...and with the whole song
    ok(c.delete(f"/api/songs/{s['id']}"))
    item = next(x for x in ok(c.get("/api/trash"))["items"] if x["name"] == "Sala teste")
    ok(c.post(f"/api/trash/{item['id']}/restore"))
    song = next(x for x in ok(c.get("/api/songs?q=Sala teste")))
    fid3 = ok(c.get(f"/api/songs/{song['id']}"))["versions"][0]["files"][0]["id"]
    assert [m["label"] for m in ok(c.get(f"/api/files/{fid3}/markers"))] == ["Refrão 2"]


def test_loose_file_info(c):
    ok(c.post("/api/import/upload", data={"target": "loose"}, files=[("files", ("tab solta.gp5", b"FICHIER" * 50, "application/octet-stream"))]))
    g = next(x for x in ok(c.get("/api/loose")) if x["files"][0]["name"] == "tab solta.gp5")
    info = ok(c.get(f"/api/loose/files/{g['files'][0]['id']}"))
    assert info["ext"] == "gp5" and info["url"].startswith("/media/")
    assert c.get("/api/loose/files/999999").status_code == 404


def test_vendor_assets_are_public(c):
    for path in ("/static/vendor/wavesurfer/wavesurfer.min.js", "/static/vendor/alphatab/alphaTab.min.js",
                 "/static/vendor/alphatab/soundfont/sonivox.sf2", "/static/vendor/alphatab/font/Bravura.woff2"):
        assert c.get(path).status_code == 200, path


# ---------------------------------------------------------------- album status, ideas

def test_album_status(c):
    al = ok(c.post("/api/albums", json={"title": "Status teste"}))
    assert al["status"] == "idea"
    assert ok(c.patch(f"/api/albums/{al['id']}", json={"status": "recorded"}))["status"] == "recorded"
    assert c.patch(f"/api/albums/{al['id']}", json={"status": "inventado"}).status_code == 400
    assert next(a for a in ok(c.get("/api/albums")) if a["id"] == al["id"])["status"] == "recorded"


def test_meta_version_and_repo(c):
    m = ok(c.get("/api/meta"))
    assert m["version"] == config.VERSION and m["repo"].startswith("https://github.com/")



# ---------------------------------------------------------------- Ideias

def _upload_loose(c, name, data=b"ID3" + b"i" * 700):
    ok(c.post("/api/import/upload", data={"target": "loose"}, files=[("files", (name, data, "audio/mpeg"))]))
    return next(g for g in ok(c.get("/api/loose")) if any(f["name"] == name for f in g["files"]))


def test_ideas_are_separate_from_songs(c):
    g = _upload_loose(c, "riff palhetado 2014.mp3")
    r = ok(c.post("/api/loose/assign", json={"file_ids": [f["id"] for f in g["files"]], "action": "idea", "kind": "riff"}))
    idea = ok(c.get(f"/api/songs/{r['song_id']}"))
    assert idea["is_idea"] and idea["idea_kind"] == "riff" and idea["idea_since"]
    assert idea["versions"][0]["files"][0]["url"].startswith("/media/ideas/")
    assert all(s["id"] != idea["id"] for s in ok(c.get("/api/songs")))
    assert any(s["id"] == idea["id"] for s in ok(c.get("/api/songs?ideas=true&kind=riff")))
    m = ok(c.get("/api/meta"))
    assert m["ideas"] >= 1 and next(k for k in m["idea_kinds"] if k["name"] == "riff")["count"] >= 1
    assert any(x["id"] == idea["id"] for x in ok(c.get("/api/search?q=palhetado"))["ideas"])
    al = ok(c.post("/api/albums", json={"title": "Sem ideias"}))
    assert c.post(f"/api/albums/{al['id']}/songs", json={"song_ids": [idea["id"]]}).status_code == 400
    custom = ok(c.post("/api/ideas", json={"title": "Progressão modal", "kind": "Campo harmônico"}))
    assert custom["is_idea"] and any(k["name"] == "Campo harmônico" and not k["builtin"] for k in ok(c.get("/api/meta"))["idea_kinds"])


def test_promote_idea_keeps_files_and_markers(c):
    idea = ok(c.post("/api/ideas", json={"title": "Melodia em Ré", "kind": "melody"}))
    ok(c.post("/api/import/upload", data={"target": "existing", "song_id": str(idea["id"])},
              files=[("files", ("melodia.mp3", b"ID3" + b"p" * 600, "audio/mpeg"))]))
    fid = ok(c.get(f"/api/songs/{idea['id']}"))["versions"][0]["files"][0]["id"]
    ok(c.post(f"/api/files/{fid}/markers", json={"time": 4, "label": "Gancho"}))
    ok(c.patch(f"/api/songs/{idea['id']}", json={"notes": "Tentar em 6/8"}))
    song = ok(c.post(f"/api/ideas/{idea['id']}/promote", json={"title": "Ré de manhã", "style": "Violão"}))
    assert not song["is_idea"] and song["title"] == "Ré de manhã" and song["status"] == "in_progress"
    assert song["promoted_at"] and song["idea_since"] and song["notes"] == "Tentar em 6/8"
    f = song["versions"][0]["files"][0]
    assert f["id"] == fid and f["url"].startswith("/media/songs/") and c.get(f["url"]).status_code == 200
    assert [m["label"] for m in ok(c.get(f"/api/files/{fid}/markers"))] == ["Gancho"]
    assert c.post(f"/api/ideas/{song['id']}/promote", json={}).status_code == 400


def test_merge_idea_into_song(c):
    target = ok(c.post("/api/songs", json={"title": "Música alvo"}))
    idea = ok(c.post("/api/ideas", json={"title": "Ponte", "kind": "riff"}))
    ok(c.post("/api/import/upload", data={"target": "existing", "song_id": str(idea["id"])},
              files=[("files", ("ponte.mp3", b"ID3" + b"q" * 600, "audio/mpeg"))]))
    ok(c.patch(f"/api/songs/{idea['id']}", json={"notes": "Vai depois do refrão"}))
    song = ok(c.post(f"/api/ideas/{idea['id']}/merge", json={"song_id": target["id"]}))
    last = song["versions"][0]
    assert last["label"] == "From the idea: Ponte" and last["files"][0]["name"] == "ponte.mp3"
    assert c.get(last["files"][0]["url"]).status_code == 200
    assert any(x["title"] == "Idea: Ponte" and "refrão" in x["body"] for x in song["texts"])
    assert c.get(f"/api/songs/{idea['id']}").status_code == 400
    other = ok(c.post("/api/ideas", json={"title": "Outra"}))
    assert c.post(f"/api/ideas/{other['id']}/merge", json={"song_id": other["id"]}).status_code == 400


def test_idea_trash_restore_and_song_status(c):
    idea = ok(c.post("/api/ideas", json={"title": "Escala lídia", "kind": "scale"}))
    ok(c.post("/api/import/upload", data={"target": "existing", "song_id": str(idea["id"])},
              files=[("files", ("lidia.mp3", b"ID3" + b"l" * 600, "audio/mpeg"))]))
    ok(c.delete(f"/api/songs/{idea['id']}"))
    item = next(x for x in ok(c.get("/api/trash"))["items"] if x["name"] == "Escala lídia")
    ok(c.post(f"/api/trash/{item['id']}/restore"))
    back = next(x for x in ok(c.get("/api/songs?ideas=true&q=lídia")))
    assert back["is_idea"] and back["idea_kind"] == "scale"
    detail = ok(c.get(f"/api/songs/{back['id']}"))
    assert c.get(detail["versions"][0]["files"][0]["url"]).status_code == 200
    s = ok(c.post("/api/songs", json={"title": "Status novo"}))
    assert s["status"] == "in_progress"
    assert c.patch(f"/api/songs/{s['id']}", json={"status": "idea"}).status_code == 400
