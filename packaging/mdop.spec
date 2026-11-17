# PyInstaller recipe for the desktop app (Windows, macOS, Linux).
#   pyinstaller packaging/mdop.spec --noconfirm      -> dist/MDoP (and dist/MDoP.app on macOS)
import re
import sys
from pathlib import Path

from PyInstaller.utils.hooks import collect_submodules

ROOT = Path(SPECPATH).parent
ICONS = ROOT / "packaging" / "icons"
VERSION = re.search(r'^VERSION = "([^"]+)"', (ROOT / "app" / "config.py").read_text(encoding="utf-8"), re.M).group(1)

hidden = collect_submodules("uvicorn") + ["app.main"]
excludes = ["tkinter", "pytest", "PyQt5", "PySide2", "PySide6"]
if sys.platform == "win32":
    hidden += ["webview.platforms.edgechromium", "webview.platforms.winforms", "clr"]
    icon = ICONS / "mdop.ico"
elif sys.platform == "darwin":
    hidden += ["webview.platforms.cocoa"]
    icon = ICONS / "mdop.icns"
else:
    # Qt WebEngine travels inside the AppImage; GTK from the build machine must not
    hidden += ["webview.platforms.qt", "qtpy", "PyQt6.QtWebEngineWidgets", "PyQt6.QtWebEngineCore",
               "PyQt6.QtWebChannel", "PyQt6.QtNetwork"]
    excludes += ["gi"]
    icon = ICONS / "mdop.png"

a = Analysis(
    [str(ROOT / "packaging" / "mdop_launcher.py")],
    pathex=[str(ROOT)],
    datas=[(str(ROOT / "app" / "static"), "app/static"), (str(ROOT / "app" / "desktop_setup.html"), "app")],
    hiddenimports=hidden,
    excludes=excludes,
)
# Linux: the PyQt6 wheels carry all of Qt. Keep only what Qt WebEngine needs (checked with ldd),
# English and Portuguese translations, and no GTK theme (it would pull the build machine's GTK in).
QT_UNUSED = re.compile(
    r"libQt6(Quick3D|QuickControls2|QuickDialogs2|QuickEffects|QuickLayouts|QuickParticles|QuickShapes|"
    r"QuickTemplates2|QuickTest|QuickTimeline|QuickVectorImage|Multimedia|Pdf|RemoteObjects|Sensors|SerialPort|"
    r"ShaderTools|SpatialAudio|StateMachine|Test|TextToSpeech|WebEngineQuick|WebChannelQuick|WebSockets|"
    r"Concurrent|OpenGLWidgets|PositioningQuick)")


def _keep(dest: str) -> bool:
    d = dest.replace("\\", "/")
    name = d.rsplit("/", 1)[-1]
    if name.startswith(("libgtk-3.", "libgdk-3.")):
        return False
    if "PyQt6/Qt6/" not in d:
        return True
    if "/qml/" in d or ("/platformthemes/" in d and "gtk" in name) or QT_UNUSED.match(name):
        return False
    if "/translations/" in d:
        if "qtwebengine_locales" in d:
            return name in {"en-US.pak", "pt-BR.pak", "pt-PT.pak"}
        return name.endswith(("_en.qm", "_pt_BR.qm"))
    return True


if sys.platform.startswith("linux"):
    a.binaries = [x for x in a.binaries if _keep(x[0])]
    a.datas = [x for x in a.datas if _keep(x[0])]

pyz = PYZ(a.pure)
exe = EXE(pyz, a.scripts, [], exclude_binaries=True, name="MDoP", console=False, icon=str(icon),
          upx=False, disable_windowed_traceback=False)
coll = COLLECT(exe, a.binaries, a.datas, name="MDoP", upx=False)

if sys.platform == "darwin":
    app = BUNDLE(
        coll, name="MDoP.app", icon=str(icon), bundle_identifier="org.mdop.desktop", version=VERSION,
        info_plist={
            "CFBundleName": "MDoP", "CFBundleDisplayName": "MDoP",
            "CFBundleShortVersionString": VERSION, "CFBundleVersion": VERSION,
            "NSHighResolutionCapable": True, "LSMinimumSystemVersion": "11.0",
            "LSApplicationCategoryType": "public.app-category.music",
        },
    )
