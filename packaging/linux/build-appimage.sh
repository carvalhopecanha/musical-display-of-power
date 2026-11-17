#!/usr/bin/env bash
# Turn the PyInstaller folder (dist/MDoP) into MDoP-<version>.AppImage.
#   packaging/linux/build-appimage.sh <version> [dist folder] [output folder]
# Set APPIMAGETOOL to an appimagetool you already have; otherwise it is downloaded.
set -euo pipefail
VERSION="$1"
DIST="${2:-dist}"
OUT="${3:-dist}"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
APPDIR="$WORK/MDoP.AppDir"

mkdir -p "$APPDIR/usr/lib" "$APPDIR/usr/share/applications" "$APPDIR/usr/share/icons/hicolor/512x512/apps"
cp -a "$DIST/MDoP" "$APPDIR/usr/lib/mdop"
cp "$HERE/mdop.desktop" "$APPDIR/mdop.desktop"
cp "$HERE/mdop.desktop" "$APPDIR/usr/share/applications/mdop.desktop"
cp "$ROOT/packaging/icons/mdop.png" "$APPDIR/mdop.png"
cp "$ROOT/packaging/icons/mdop.png" "$APPDIR/usr/share/icons/hicolor/512x512/apps/mdop.png"
ln -s mdop.png "$APPDIR/.DirIcon"
install -m 755 "$HERE/AppRun" "$APPDIR/AppRun"

TOOL="${APPIMAGETOOL:-$WORK/appimagetool}"
if [ ! -x "$TOOL" ]; then
  curl -fsSL -o "$TOOL" "https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage"
  chmod +x "$TOOL"
fi
mkdir -p "$OUT"
# extract-and-run: works without FUSE (CI machines, containers)
ARCH=x86_64 APPIMAGE_EXTRACT_AND_RUN=1 "$TOOL" --no-appstream "$APPDIR" "$OUT/MDoP-$VERSION.AppImage"
echo "Built $OUT/MDoP-$VERSION.AppImage"
