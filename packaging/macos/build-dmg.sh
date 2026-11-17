#!/usr/bin/env bash
# Turn dist/MDoP.app into MDoP-<version>.dmg (a disk image with the app and a shortcut to Applications).
#   packaging/macos/build-dmg.sh <version> [dist folder] [output folder]
set -euo pipefail
VERSION="$1"
DIST="${2:-dist}"
OUT="${3:-dist}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# the app is not signed with an Apple certificate: an ad-hoc signature keeps Apple Silicon happy
codesign --force --deep --sign - "$DIST/MDoP.app"

cp -R "$DIST/MDoP.app" "$WORK/"
ln -s /Applications "$WORK/Applications"
mkdir -p "$OUT"
hdiutil create -volname "MDoP $VERSION" -srcfolder "$WORK" -ov -format UDZO "$OUT/MDoP-$VERSION.dmg"
echo "Built $OUT/MDoP-$VERSION.dmg"
