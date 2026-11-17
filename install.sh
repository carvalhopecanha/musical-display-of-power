#!/usr/bin/env bash
# Musical Display of Power — installer / instalador
#
#   ./install.sh          install, reconfigure or update   (instalar, reconfigurar ou atualizar)
#   ./install.sh move     move the library to another folder (mudar a biblioteca de pasta)
#   ./install.sh --build  build the image here instead of downloading it (montar a imagem aqui)
#
# Messages are in Portuguese when the system language is Portuguese, otherwise in English.
# Set MDOP_INSTALL_LANG=en or pt to choose.
set -euo pipefail
cd "$(dirname "$0")"

# ---------------------------------------------------------------- language
lang="${MDOP_INSTALL_LANG:-${LC_ALL:-${LC_MESSAGES:-${LANG:-en}}}}"
case "$lang" in pt*) PT=1 ;; *) PT="" ;; esac
say() { if [ -n "$PT" ]; then echo "$2"; else echo "$1"; fi; }   # say "English" "Português"
t()   { if [ -n "$PT" ]; then printf '%s' "$2"; else printf '%s' "$1"; fi; }

# ---------------------------------------------------------------- helpers
bold=$(tput bold 2>/dev/null || true); normal=$(tput sgr0 2>/dev/null || true)
title() { echo; echo "${bold}$*${normal}"; }
fail()  { echo "$(t ERROR ERRO): $*" >&2; exit 1; }
ask() {  # ask "question" "default" -> answer
  local resp
  read -r -p "$1 [$2]: " resp || true
  echo "${resp:-$2}"
}
yes_no() {  # yes_no "question" "y|n" -> 0 = yes
  local def="$2" resp hint
  if [ "$def" = y ]; then hint="$(t Y/n S/n)"; else hint="$(t y/N s/N)"; fi
  read -r -p "$1 [$hint]: " resp || true
  resp="${resp:-$def}"
  [[ "$resp" =~ ^[sSyY] ]]
}
# read a value from .env; the second name is the one used by early versions
env_value() {
  [ -f .env ] || return 0
  local v
  v="$(grep -E "^$1=" .env | head -n1 | cut -d= -f2- || true)"
  if [ -z "$v" ] && [ -n "${2:-}" ]; then v="$(grep -E "^$2=" .env | head -n1 | cut -d= -f2- || true)"; fi
  echo "$v"
}

BUILD=""
ACTION=""
for arg in "$@"; do
  case "$arg" in
    --build) BUILD=1 ;;
    move|mover) ACTION=move ;;
    *) fail "$(t "unknown option: $arg" "opção desconhecida: $arg")" ;;
  esac
done

# docker / docker compose (with sudo when needed)
SUDO=""
if [ -n "${MDOP_DRY_RUN:-}" ]; then
  COMPOSE="echo [dry-run] docker compose"
else
  command -v docker >/dev/null || fail "$(t "Docker not found. Install Docker first (CasaOS already has it)." "Docker não encontrado. Instale o Docker primeiro (o CasaOS já vem com ele).")"
  docker info >/dev/null 2>&1 || SUDO="sudo"
  if $SUDO docker compose version >/dev/null 2>&1; then COMPOSE="$SUDO docker compose"
  elif command -v docker-compose >/dev/null; then COMPOSE="$SUDO docker-compose"
  else fail "$(t "Docker Compose not found." "Docker Compose não encontrado.")"; fi
fi

USERNAME="${SUDO_USER:-$(id -un)}"
PUID=$(id -u "$USERNAME"); PGID=$(id -g "$USERNAME")
HOMEDIR=$(getent passwd "$USERNAME" | cut -d: -f6); HOMEDIR="${HOMEDIR:-$HOME}"

make_dir() {  # create the folder (with sudo if needed) and give it to the user
  local dir="$1"
  if mkdir -p "$dir" 2>/dev/null && [ -w "$dir" ]; then :; else
    sudo mkdir -p "$dir" || fail "$(t "Could not create $dir" "Não consegui criar $dir")"
  fi
  if [ "$(stat -c %u "$dir")" != "$PUID" ]; then
    sudo chown "$PUID:$PGID" "$dir" || fail "$(t "Could not set permissions on $dir" "Não consegui dar permissão em $dir")"
  fi
}

port_free() {  # 0 = free
  if command -v ss >/dev/null; then
    ! (ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]$1\$")
  else  # no "ss": try to connect
    ! (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null
  fi
}

local_ip() { hostname -I 2>/dev/null | awk '{print $1}'; }

write_env() {  # write_env library import sfx backups port
  cat > .env <<EOF
# $(t "Created by ./install.sh — run it again to change." "Criado pelo ./install.sh — rode de novo para mudar.")
MDOP_LIBRARY=$1
MDOP_IMPORT=$2
MDOP_SFX=$3
MDOP_BACKUPS=$4
MDOP_PORT=$5
PUID=$PUID
PGID=$PGID
MDOP_MAX_UPLOAD_MB=$(env_value MDOP_MAX_UPLOAD_MB | grep . || echo 2048)
EOF
}

# ---------------------------------------------------------------- move the library
if [ "$ACTION" = move ]; then
  [ -f .env ] || fail "$(t "Not installed yet. Run ./install.sh first." "Ainda não instalado. Rode ./install.sh primeiro.")"
  current="$(env_value MDOP_LIBRARY MDOP_BIBLIOTECA)"
  title "$(t "Move the library" "Mover a biblioteca")"
  say "The library is at: $current ($(du -sh "$current" 2>/dev/null | cut -f1))" "A biblioteca está em: $current ($(du -sh "$current" 2>/dev/null | cut -f1))"
  new="$(ask "$(t "Which folder do you want to move it to?" "Para qual pasta você quer mover?")" "")"
  [ -n "$new" ] || fail "$(t "No folder given." "Nenhuma pasta informada.")"
  new="$(realpath -m "$new")"
  [ "$new" != "$(realpath -m "$current")" ] || fail "$(t "It is the same folder." "É a mesma pasta.")"
  case "$new/" in "$(realpath -m "$current")/"*) fail "$(t "The new folder cannot be inside the current one." "A pasta nova não pode ficar dentro da atual.")";; esac
  if [ -d "$new" ] && [ -n "$(ls -A "$new" 2>/dev/null)" ]; then
    fail "$(t "$new already has files. Pick an empty or new folder." "A pasta $new já tem arquivos. Escolha uma pasta vazia ou nova.")"
  fi
  existing="$new"; while [ ! -d "$existing" ]; do existing="$(dirname "$existing")"; done
  free=$(df -P "$existing" | awk 'NR==2{print $4*1024}')
  used=$(du -sb "$current" | cut -f1)
  [ "$free" -gt "$used" ] || fail "$(t "Not enough space at the destination." "Não há espaço suficiente no destino.")"
  yes_no "$(t "Copy $current to $new? MDoP stops while copying." "Copiar $current para $new? O MDoP fica parado durante a cópia.")" y || exit 0
  $COMPOSE stop
  make_dir "$new"
  say "Copying…" "Copiando…"
  if command -v rsync >/dev/null; then rsync -a "$current"/ "$new"/; else cp -a "$current"/. "$new"/; fi
  n1=$(find "$current" -type f | wc -l); n2=$(find "$new" -type f | wc -l)
  s1=$(du -sb --apparent-size "$current" | cut -f1); s2=$(du -sb --apparent-size "$new" | cut -f1)
  if [ "$n1" != "$n2" ] || [ "$s1" != "$s2" ]; then
    $COMPOSE start
    fail "$(t "The copy does not match ($n1 x $n2 files). Nothing was switched; the old library is still in use." "A cópia não confere ($n1 x $n2 arquivos). Nada foi trocado; a biblioteca antiga continua em uso.")"
  fi
  write_env "$new" "$(env_value MDOP_IMPORT MDOP_IMPORTAR)" "$(env_value MDOP_SFX MDOP_EFEITOS)" \
            "$(env_value MDOP_BACKUPS)" "$(env_value MDOP_PORT MDOP_PORTA | grep . || echo 8090)"
  $COMPOSE up -d
  title "$(t "Done! The library is now at $new" "Pronto! A biblioteca agora está em $new")"
  say "The old folder ($current) was kept, to be safe." "A pasta antiga ($current) foi mantida por segurança."
  say "After checking that everything is fine in MDoP, you can delete it." "Depois de conferir que está tudo certo no MDoP, você pode apagá-la."
  exit 0
fi

# ---------------------------------------------------------------- install / reconfigure
title "Musical Display of Power — $(t installation instalação)"

if [ -f .env ] && ! yes_no "$(t "A configuration (.env) already exists. Answer the questions again?" "Já existe uma configuração (.env). Quer refazer as perguntas?")" n; then
  say "Keeping the current configuration and updating MDoP…" "Mantendo a configuração atual e atualizando o MDoP…"
  # early versions used Portuguese names in .env: rewrite it with the current names, same values
  if ! grep -qE "^MDOP_LIBRARY=" .env; then
    cp .env .env.before-update
    write_env "$(env_value MDOP_LIBRARY MDOP_BIBLIOTECA)" "$(env_value MDOP_IMPORT MDOP_IMPORTAR)" "$(env_value MDOP_SFX MDOP_EFEITOS)" \
              "$(env_value MDOP_BACKUPS)" "$(env_value MDOP_PORT MDOP_PORTA | grep . || echo 8090)"
    say "→ .env updated to the new names (the old one is in .env.before-update)." "→ .env atualizado para os nomes novos (o antigo ficou em .env.before-update)."
  fi
else
  [ -d /DATA ] && base="/DATA" || base="$HOMEDIR"

  title "1. $(t "Library folder" "Pasta da biblioteca")"
  say "Where MDoP keeps the organized songs, covers and the database." "É onde o MDoP guarda as músicas organizadas, as capas e o banco de dados."
  library="$(ask "$(t "Library folder" "Pasta da biblioteca")" "$(env_value MDOP_LIBRARY MDOP_BIBLIOTECA | grep . || echo "$base/mdop-library")")"
  library="$(realpath -m "$library")"
  if [ -d "$library/.mdop" ]; then say "→ Found an MDoP library in this folder. It will be used." "→ Encontrei uma biblioteca do MDoP nessa pasta. Ela será usada."; fi

  title "2. $(t "Import folder" "Pasta de importação")"
  say "The folder with your files (recordings, GP5, MIDI…) shown in" "É a pasta com os seus arquivos (gravações, GP5, MIDI…) que aparece em"
  say "\"Add files → From the server\". It can be a big folder, like a whole drive." "\"Adicionar arquivos → Do servidor\". Pode ser uma pasta grande, como um HD inteiro."
  import="$(ask "$(t "Import folder" "Pasta de importação")" "$(env_value MDOP_IMPORT MDOP_IMPORTAR | grep . || echo "$base")")"
  import="$(realpath -m "$import")"
  [ -d "$import" ] || fail "$(t "The folder $import does not exist." "A pasta $import não existe.")"

  title "3. $(t "Sound effects (optional)" "Efeitos sonoros (opcional)")"
  say "If you have a sound-effect (SFX) library, give its root folder, for example a whole drive." "Se você tem uma biblioteca de efeitos (SFX), informe a pasta raiz dela, por exemplo um HD inteiro."
  say "MDoP only READS this folder: nothing is copied, changed or deleted." "O MDoP só LÊ essa pasta: nada é copiado, alterado ou apagado."
  say "Then, in Settings → Sound effects, choose which subfolders to use." "Depois, em Configurações → Efeitos sonoros, você escolhe quais subpastas usar."
  say "Leave it empty if you do not use sound effects." "Deixe em branco se não usa efeitos."
  sfx="$(ask "$(t "Sound-effects root folder" "Pasta raiz dos efeitos")" "$(env_value MDOP_SFX MDOP_EFEITOS)")"
  if [ -n "$sfx" ]; then
    sfx="$(realpath -m "$sfx")"
    [ -d "$sfx" ] || fail "$(t "The folder $sfx does not exist." "A pasta $sfx não existe.")"
  fi

  title "4. $(t "Backup folder" "Pasta de backups")"
  say "Where the backups made in Settings → Backup are stored." "Onde ficam os backups criados em Configurações → Backup."
  say "Ideally another drive, not the one with the library." "O ideal é outro HD, diferente do da biblioteca."
  backups="$(ask "$(t "Backup folder" "Pasta de backups")" "$(env_value MDOP_BACKUPS | grep . || echo "$base/mdop-backups")")"
  backups="$(realpath -m "$backups")"

  title "5. $(t Port Porta)"
  port="$(env_value MDOP_PORT MDOP_PORTA | grep . || echo 8090)"
  while true; do
    port="$(ask "$(t "Port to open in the browser" "Porta para abrir no navegador")" "$port")"
    [[ "$port" =~ ^[0-9]+$ ]] || { say "Numbers only." "Digite só números."; continue; }
    if [ "$port" = "$(env_value MDOP_PORT MDOP_PORTA)" ] || port_free "$port"; then break; fi
    say "Port $port is already used by another service. Pick another one." "A porta $port já está em uso por outro serviço. Escolha outra."
  done

  title "$(t Summary Resumo)"
  echo "  $(t "Library:   " "Biblioteca:")  $library"
  echo "  $(t "Import:    " "Importação:")  $import"
  echo "  $(t "Effects:   " "Efeitos:   ")  ${sfx:-$(t "(none)" "(nenhuma)")}"
  echo "  $(t "Backups:   " "Backups:   ")  $backups"
  echo "  $(t "Address:   " "Endereço:  ")  http://$(local_ip):$port"
  echo "  $(t "User:      " "Usuário:   ")  $USERNAME ($PUID:$PGID)"
  yes_no "$(t "Is this right?" "Está certo?")" y || fail "$(t "Cancelled. Nothing was changed." "Cancelado. Nada foi alterado.")"

  make_dir "$library"
  make_dir "$backups"
  write_env "$library" "$import" "$sfx" "$backups" "$port"
  say "→ Configuration saved in .env" "→ Configuração salva em .env"
fi

# configurations without the newer questions use folders inside the MDoP folder
[ -n "$(env_value MDOP_BACKUPS)" ] || make_dir "$PWD/backups"
[ -n "$(env_value MDOP_SFX MDOP_EFEITOS)" ] || mkdir -p "$PWD/no-sfx"

title "$(t "Starting MDoP…" "Subindo o MDoP…")"
if [ -z "$BUILD" ] && $COMPOSE pull 2>/dev/null; then
  $COMPOSE up -d
else
  [ -n "$BUILD" ] || say "Could not download the ready-made image; building it here (a few minutes the first time)…" \
                         "Não consegui baixar a imagem pronta; montando aqui (alguns minutos na primeira vez)…"
  $COMPOSE up -d --build
fi
title "$(t "Done! Open in the browser:" "Pronto! Abra no navegador:") http://$(local_ip):$(env_value MDOP_PORT MDOP_PORTA)"
say "To protect it with a password: Settings → Security." "Para proteger com senha: Configurações → Segurança."
