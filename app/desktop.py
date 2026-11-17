"""MDoP as a desktop app: python -m app.desktop (or the packaged MDoP program).

Runs the same server as Docker, but only on 127.0.0.1 and on a free port, and shows it
in its own window (pywebview: WebView2 on Windows, WebKit on macOS, Qt or GTK on Linux).
Without pywebview it opens the default browser instead.

The library and the folders the user picks are kept in desktop_prefs (a JSON file in the
system's settings folder), never in environment variables the user has to set.

Extra commands:
  MDoP disable-password   remove password protection (for when the password is forgotten)
  MDoP self-test          start without a window, check that everything answers, quit (used by the build)
"""
import json
import logging
import logging.handlers
import os
import socket
import sys
import threading
import time
import urllib.request
from pathlib import Path

from . import desktop_prefs as prefs

log = logging.getLogger("mdop")
TITLE = "MDoP · Musical Display of Power"


# ---------------------------------------------------------------- small helpers

def _setup_logging() -> Path:
    from platformdirs import user_log_dir
    folder = Path(os.environ.get("MDOP_DESKTOP_LOGS") or user_log_dir(prefs.APP_DIR_NAME, appauthor=False))
    folder.mkdir(parents=True, exist_ok=True)
    handlers: list[logging.Handler] = [logging.handlers.RotatingFileHandler(
        folder / "mdop.log", maxBytes=1_000_000, backupCount=2, encoding="utf-8")]
    if sys.stderr is not None:
        handlers.append(logging.StreamHandler())
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s", handlers=handlers)
    return folder


def _fix_std_streams() -> None:
    """Windowed builds (Windows, macOS) have no console: some libraries still write to stdout."""
    for name in ("stdout", "stderr"):
        if getattr(sys, name) is None:
            setattr(sys, name, open(os.devnull, "w", encoding="utf-8"))


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _instance_file() -> Path:
    return prefs.config_dir() / "instance.json"


def running_instance() -> str | None:
    """Address of an MDoP desktop that is already open, if any (two copies must not share one library)."""
    try:
        port = int(json.loads(_instance_file().read_text(encoding="utf-8"))["port"])
        url = f"http://127.0.0.1:{port}"
        with urllib.request.urlopen(f"{url}/api/health", timeout=1.5) as r:
            return url if json.load(r).get("ok") else None
    except Exception:
        return None


def _write_instance(port: int) -> None:
    prefs.config_dir().mkdir(parents=True, exist_ok=True)
    _instance_file().write_text(json.dumps({"port": port, "pid": os.getpid()}), encoding="utf-8")


def _clear_instance() -> None:
    try:
        if json.loads(_instance_file().read_text(encoding="utf-8")).get("pid") == os.getpid():
            _instance_file().unlink()
    except Exception:
        pass


# ---------------------------------------------------------------- server

class Server:
    """The FastAPI app in a background thread, on 127.0.0.1 only."""

    def __init__(self, port: int):
        import uvicorn
        from .main import app
        cfg = uvicorn.Config(app, host="127.0.0.1", port=port, log_config=None, access_log=False)
        self.server = uvicorn.Server(cfg)
        self.thread = threading.Thread(target=self.server.run, daemon=True, name="mdop-server")
        self.url = f"http://127.0.0.1:{port}"

    def start(self, timeout: float = 60) -> None:
        self.thread.start()
        end = time.monotonic() + timeout
        while not self.server.started:
            if not self.thread.is_alive() or time.monotonic() > end:
                raise RuntimeError("The MDoP server did not start. See mdop.log.")
            time.sleep(0.05)

    def stop(self) -> None:
        self.server.should_exit = True
        self.thread.join(timeout=15)


def _start_server() -> Server:
    """Apply the saved folders and start the server (app.config is imported only now)."""
    data = prefs.load()
    prefs.apply_env(data)
    port = free_port()
    server = Server(port)
    server.start()
    _write_instance(port)
    from . import config
    log.info("%s %s at %s (library: %s)", config.APP_NAME, config.VERSION, server.url, config.LIBRARY_DIR)
    return server


# ---------------------------------------------------------------- window

class Bridge:
    """Functions the page can call as window.pywebview.api.<name>() (system dialogs)."""

    # attributes start with "_" so pywebview does not expose them to the page
    def __init__(self):
        self._window = None
        self._chosen = threading.Event()

    def _folder_dialog(self, start: str = ""):
        import webview
        kind = getattr(getattr(webview, "FileDialog", None), "FOLDER", None)
        if kind is None:
            kind = webview.FOLDER_DIALOG  # pywebview < 5
        result = self._window.create_file_dialog(kind, directory=start or "")
        if not result:
            return ""
        return Path(result[0] if isinstance(result, (list, tuple)) else result).as_posix()

    # used by the app (Settings) and by the first-run page
    def pick_folder(self, start: str = "") -> str:
        return self._folder_dialog(start)

    # first-run page only
    def default_library(self) -> str:
        return prefs.default_library().as_posix()

    def use_library(self, path: str) -> str:
        error = prefs.check_library_folder(path)
        if not error:
            prefs.update(library=prefs.norm(path))
            self._chosen.set()
        return error


def _setup_html() -> str:
    return (Path(__file__).parent / "desktop_setup.html").read_text(encoding="utf-8")


def _message_html(pt: str, en: str) -> str:
    return f"""<!doctype html><meta charset="utf-8"><body style="margin:0;display:grid;place-items:center;height:100vh;
      background:#121212;color:#eee;font:16px system-ui,sans-serif;text-align:center;padding:24px">
      <div><p id="m"></p></div><script>document.getElementById('m').textContent =
      (navigator.language||'').toLowerCase().startsWith('pt') ? {json.dumps(pt)} : {json.dumps(en)};</script>"""


def run_window(first_run: bool) -> None:
    import webview
    if hasattr(webview, "settings"):
        webview.settings["ALLOW_DOWNLOADS"] = True          # ZIP and backup downloads
        webview.settings["OPEN_EXTERNAL_LINKS_IN_BROWSER"] = True
    bridge = Bridge()
    holder: dict = {}
    window = webview.create_window(
        TITLE, html=_setup_html() if first_run else _message_html("Abrindo o MDoP…", "Opening MDoP…"),
        js_api=bridge, width=1280, height=840, min_size=(900, 600), background_color="#121212")
    bridge._window = window

    def boot():
        try:
            if first_run:
                bridge._chosen.wait()
            holder["server"] = _start_server()
            window.load_url(holder["server"].url)
        except Exception as exc:
            log.exception("Could not start MDoP")
            window.load_html(_message_html(f"O MDoP não conseguiu abrir: {exc}", f"MDoP could not start: {exc}"))

    gui = os.environ.get("MDOP_GUI") or None   # "qt" in the AppImage; otherwise pywebview decides
    webview.start(boot, gui=gui, private_mode=False, storage_path=str(prefs.config_dir() / "webview"))
    if "server" in holder:
        holder["server"].stop()


def run_browser() -> None:
    """Fallback without pywebview: the default browser, until Ctrl+C."""
    import webbrowser
    if not prefs.load()["library"]:
        prefs.update(library=prefs.default_library().as_posix())
    server = _start_server()
    print(f"MDoP is running at {server.url} — press Ctrl+C to quit.")
    webbrowser.open(server.url)
    try:
        while server.thread.is_alive():
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass
    server.stop()


def disable_password() -> None:
    data = prefs.load()
    if not data["library"]:
        print("No library yet.")
        return
    prefs.apply_env(data)
    from . import auth, db, migrate
    if migrate.needed():
        migrate.run(full_backup=False)
    db.init()
    with db.connect() as conn:
        auth.disable(conn, force=True)
    print("Password protection removed. / Proteção por senha removida.")


def self_test() -> int:
    """Start the packaged app without a window, check that it answers, and quit (used by the build)."""
    import shutil
    import tempfile
    import traceback
    tmp = Path(tempfile.mkdtemp(prefix="mdop-selftest-"))
    os.environ["MDOP_DESKTOP_CONFIG"] = str(tmp / "settings")
    os.environ["MDOP_DESKTOP_CACHE"] = str(tmp / "cache")
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    server = None
    try:
        prefs.update(library=(tmp / "Biblioteca de Teste Ação").as_posix())
        server = _start_server()
        get = lambda path: urllib.request.urlopen(server.url + path, timeout=10).read()  # noqa: E731
        meta = json.loads(get("/api/meta"))
        assert meta["desktop"] is True, "not in desktop mode"
        assert b"app.js" in get("/"), "interface missing"
        assert len(get("/static/app.js")) > 10_000, "app.js missing"
        assert get("/static/vendor/alphatab/alphaTab.min.js"), "tab viewer missing"
        assert (Path(__file__).parent / "desktop_setup.html").is_file(), "first-run page missing"
        import webview  # noqa: F401  (the window library is bundled)
        print(f"MDoP {meta['version']} self-test OK ({sys.platform})")
        return 0
    except Exception:
        traceback.print_exc()
        return 1
    finally:
        if server:
            server.stop()
        shutil.rmtree(tmp, ignore_errors=True)


def _attach_console() -> None:
    """Windows: the packaged program has no console of its own; show command output in the terminal that ran it."""
    if sys.platform != "win32" or not getattr(sys, "frozen", False):
        return
    try:
        import ctypes
        if ctypes.windll.kernel32.AttachConsole(-1):
            sys.stdout = open("CONOUT$", "w", encoding="utf-8")
            sys.stderr = sys.stdout
    except Exception:
        pass


def main() -> None:
    command = sys.argv[1] if len(sys.argv) > 1 else ""
    if command:
        _attach_console()
    _fix_std_streams()
    if command in ("disable-password", "desligar-senha"):
        disable_password()
        return
    if command == "self-test":
        sys.exit(self_test())
    logs = _setup_logging()
    if sys.platform.startswith("linux") and getattr(sys, "frozen", False):
        # QtWebEngine's sandbox needs user namespaces that some distributions block for AppImages.
        # The window only shows MDoP itself, served from this computer.
        os.environ.setdefault("QTWEBENGINE_DISABLE_SANDBOX", "1")
    log.info("Logs: %s · settings: %s", logs, prefs.prefs_path())

    try:
        import webview  # noqa: F401
    except Exception as exc:
        log.warning("pywebview is not available (%s): using the browser instead.", exc)
        if running_instance():
            print("MDoP is already open.")
            return
        run_browser()
        return

    if running_instance():
        import webview
        webview.create_window(TITLE, html=_message_html(
            "O MDoP já está aberto em outra janela.", "MDoP is already open in another window."), width=520, height=220)
        webview.start(gui=os.environ.get("MDOP_GUI") or None)
        return
    try:
        run_window(first_run=not prefs.load()["library"])
    finally:
        _clear_instance()


if __name__ == "__main__":
    main()
