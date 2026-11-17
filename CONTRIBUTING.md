# Contributing

**English** · *Português abaixo*

Thanks for your interest in MDoP! Bug reports, ideas and pull requests are welcome.

## Running locally

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
MDOP_LIBRARY=./library MDOP_IMPORT_ROOTS=~/Music python -m app   # http://localhost:8090
python -m pytest                                                    # tests
```

The desktop app (its own window instead of a browser tab):

```bash
pip install -r requirements-desktop.txt
python -m app.desktop              # first start asks for a library folder
python -m app.desktop self-test    # start without a window, check, quit
pyinstaller packaging/mdop.spec    # build the program into dist/ (installers: see .github/workflows/desktop.yml)
```

## How the code is organized

| Path | What's inside |
|---|---|
| `app/main.py` | FastAPI routes |
| `app/library.py` | Songs, versions, files, import, File list, covers |
| `app/db.py` | SQLite schema and automatic migrations |
| `app/migrate.py` | One-time rename of libraries from early builds (Portuguese folder names) |
| `app/i18n.py` | Server messages in English and Portuguese |
| `app/backup.py`, `app/sfx.py` | Backup and restore, sound-effect folders |
| `app/trash.py`, `app/artists.py`, `app/auth.py`, `app/zips.py` | Trash, artists and credits, optional login, ZIP downloads |
| `app/static/` | The interface: plain HTML, CSS and JavaScript, no build step |
| `app/static/vendor/` | Bundled third-party libraries (don't edit) |
| `tests/` | API tests (pytest); `tests/fixtures/` has a backup from an early build |
| `install.sh` | Installer (English and Portuguese); `instalar.sh` is the old name |
| `app/desktop.py`, `app/desktop_setup.html` | Desktop app: window, first-run page, local server |
| `app/desktop_prefs.py`, `app/opener.py` | Desktop settings file; "open with the default program" and "save as new version" |
| `packaging/` | PyInstaller recipe, icons, Windows installer (Inno Setup), AppImage and dmg scripts |

## Guidelines

- **Never delete user files.** Anything removed goes to the library's `.trash` folder and must be restorable.
- **Database changes** go through the `MIGRATIONS` list in `app/db.py` so existing libraries upgrade themselves.
- **Interface text** lives in the `STR` dictionary at the top of `app/static/app.js`, always in Portuguese and English.
- **Server messages** are written in English in the code and translated in `app/i18n.py`. Code, comments, folder names and stored values are in English.
- **No CDNs:** the app must work on a home network without internet.
- **Desktop-only features** stay hidden on the server: routes call `_desktop_only()` (404 on the server), and interface elements carry `data-desktop`. Interface text with a desktop wording uses a `<key>_dk` entry in `STR`.
- Add or update tests in `tests/` for backend changes, and keep `python -m pytest` green.

---

## Contribuindo (português)

Obrigado pelo interesse! Relatos de bugs, ideias e pull requests são bem-vindos.

- Para rodar localmente e rodar os testes, use os comandos acima.
- **Nunca apague arquivos do usuário:** o que é excluído vai para a pasta `.trash` e precisa poder ser restaurado.
- **Mudanças no banco** entram pela lista `MIGRATIONS` em `app/db.py`, para bibliotecas antigas se atualizarem sozinhas.
- **Textos da interface** ficam no dicionário `STR` no começo de `app/static/app.js`, sempre em português e inglês.
- **Mensagens do servidor** são escritas em inglês no código e traduzidas em `app/i18n.py`. Código, comentários, nomes de pastas e valores guardados ficam em inglês.
- **Nada de CDN:** o app precisa funcionar na rede de casa, sem internet.
- **Recursos só do programa para computador** ficam escondidos no servidor: as rotas chamam `_desktop_only()` (404 no servidor) e os elementos da interface levam `data-desktop`. Textos com versão para o computador usam uma chave `<chave>_dk` no `STR`.
- Para rodar o programa para computador: `pip install -r requirements-desktop.txt` e `python -m app.desktop`.
- Mudou o backend? Adicione ou ajuste os testes em `tests/` e deixe o `python -m pytest` passando.
