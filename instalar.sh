#!/usr/bin/env bash
# Nome antigo do instalador, mantido para quem já usava: chama o ./install.sh em português.
# Old name of the installer, kept for existing installs: runs ./install.sh in Portuguese.
cd "$(dirname "$0")"
args=()
for a in "$@"; do [ "$a" = mover ] && args+=(move) || args+=("$a"); done
MDOP_INSTALL_LANG="${MDOP_INSTALL_LANG:-pt}" exec ./install.sh "${args[@]}"
