"""Server messages in the user's language.

Messages are written in English in the code; PT holds the Portuguese version.
The language of the current request comes from Settings (or the browser when
Settings says "follow the browser") and is kept in a context variable.
"""
from contextvars import ContextVar

LANG: ContextVar[str] = ContextVar("mdop_lang", default="en")


def pick_lang(setting: str, accept_language: str = "") -> str:
    if setting in ("pt", "en"):
        return setting
    return "pt" if (accept_language or "").strip().lower().startswith("pt") else "en"


def tr(text: str, **params) -> str:
    """Translate an English message to the current language and fill in {placeholders}."""
    if LANG.get() == "pt":
        text = PT.get(text, text)
    return text.format(**params) if params else text


PT = {
    # library and songs
    "Invalid path.": "Caminho inválido.",
    "Request refused: it came from another site.": "Pedido recusado: ele veio de outro site.",
    "Song not found.": "Música não encontrada.",
    "Version not found.": "Versão não encontrada.",
    "A song needs at least one version.": "A música precisa ter pelo menos uma versão.",
    "Only an empty version can be deleted. Move or delete its files first.":
        "Só é possível apagar uma versão vazia. Mova ou apague os arquivos dela antes.",
    "File not found.": "Arquivo não encontrado.",
    "This is already a song, not an idea.": "Isso já é uma música, não uma ideia.",
    "Pick a song, not another idea.": "Escolha uma música, não outra ideia.",
    "Invalid time.": "Tempo inválido.",
    "The end of the section must come after the start.": "O fim do trecho precisa vir depois do início.",
    "Marker not found.": "Marcador não encontrado.",
    "This file is not a valid image.": "Esse arquivo não é uma imagem válida.",
    "Folder not allowed or missing.": "Pasta não permitida ou inexistente.",
    "No permission to read this folder.": "Sem permissão para ler essa pasta.",
    "Path outside the allowed folders: {path}": "Caminho fora das pastas permitidas: {path}",
    "Invalid mode.": "Modo inválido.",
    "Pick the song.": "Escolha a música.",
    "Pick at least one audio file.": "Escolha pelo menos um áudio.",
    "Some audio file is no longer in the list. Refresh the page.": "Algum áudio não está mais na lista. Atualize a página.",
    "Invalid action.": "Ação inválida.",
    "Band not found.": "Banda não encontrada.",
    "Text not found.": "Texto não encontrado.",
    "Unknown menu part.": "Parte do menu desconhecida.",
    "Invalid setting: {key}": "Configuração inválida: {key}",
    "“{name}” was copied, but the original could not be removed (no permission).":
        "“{name}” foi copiado, mas o original não pôde ser removido (sem permissão).",
    "Invalid status.": "Status inválido.",
    "This file does not belong to this song.": "Esse arquivo não é desta música.",
    "Pick at least one file or folder.": "Escolha pelo menos um arquivo ou pasta.",
    "No files found in the chosen folders.": "Nenhum arquivo encontrado nas pastas escolhidas.",
    "No file received.": "Nenhum arquivo recebido.",
    "The file is larger than the {mb} MB limit.": "O arquivo passa do limite de {mb} MB.",
    "Album not found.": "Álbum não encontrado.",
    "Ideas cannot go into albums. Turn it into a song first.": "Ideias não entram em álbuns. Transforme em música antes.",
    "No background image.": "Sem imagem de fundo.",
    # artists
    "Artist not found.": "Artista não encontrado.",
    "Enter the artist's name.": "Informe o nome do artista.",
    "A credit must belong to a song, an album or a band.": "O crédito precisa ser de uma música, um álbum ou uma banda.",
    "Credit not found.": "Crédito não encontrado.",
    # trash
    "Item not found in the trash.": "Item não encontrado na lixeira.",
    "The file for this item is no longer in the .trash folder.": "O arquivo deste item não está mais na pasta .trash.",
    "This item cannot be restored.": "Este item não pode ser restaurado.",
    # login
    "Wrong username or password.": "Usuário ou senha incorretos.",
    "Too many attempts. Try again in {s} seconds.": "Muitas tentativas. Tente de novo em {s} segundos.",
    "Enter the username.": "Informe o usuário.",
    "The password must have at least 8 characters.": "A senha precisa ter pelo menos 8 caracteres.",
    "Protection is already on.": "A proteção já está ligada.",
    "The current password is wrong.": "A senha atual está incorreta.",
    "The password is wrong.": "A senha está incorreta.",
    # sound effects
    "Folder outside the allowed sound-effect folders.": "Pasta fora das pastas de efeitos liberadas.",
    "This folder is outside the sound-effect folders allowed for MDoP.":
        "Essa pasta está fora das pastas de efeitos liberadas para o MDoP.",
    "Folder not found.": "Pasta não encontrada.",
    "This folder is already included in {other}.": "Essa pasta já está incluída em {other}.",
    "This folder contains {other}, which is already linked. Remove it first.":
        "Essa pasta contém {other}, que já está vinculada. Remova-a antes.",
    "Sound effect not found.": "Efeito não encontrado.",
    "This file is not available right now (the drive may be disconnected).":
        "Esse arquivo não está disponível agora (o HD pode estar desconectado).",
    # backup
    "Invalid backup name.": "Nome de backup inválido.",
    "Backup not found.": "Backup não encontrado.",
    "The backup folder is not writable.": "A pasta de backups não aceita gravação.",
    "This file is not an MDoP backup.": "Esse arquivo não é um backup do MDoP.",
    "A backup or restore is already running.": "Já tem um backup ou uma restauração em andamento.",
    "The backup folder is not writable. Check the folder chosen in the installer.":
        "A pasta de backups não aceita gravação. Confira a pasta escolhida no instalador.",
    "The backup is incomplete (the database is missing).": "O backup está incompleto (falta o banco de dados).",
    "The backup has invalid paths and will not be restored.": "O backup tem caminhos inválidos e não será restaurado.",
    "To restore, the backup folder must be writable (the safety copy goes there).":
        "Para restaurar, a pasta de backups precisa aceitar gravação (lá fica a cópia de segurança).",
    # names given to new things
    "Untitled song": "Música sem nome",
    "Untitled idea": "Ideia sem nome",
    "Untitled album": "Álbum sem nome",
    "Original idea": "Ideia original",
    "Version {n}": "Versão {n}",
    "From the idea: {title}": "Da ideia: {title}",
    "Idea: {title}": "Ideia: {title}",
    # info.txt inside song downloads
    "Style": "Estilo", "Key": "Tom", "Tuning": "Afinação", "Status": "Status", "Main file": "Arquivo principal",
    "Credits": "Créditos", "Band": "Banda", "Tempo": "Andamento",
    "Idea": "Ideia", "In progress": "Desenvolvendo", "Ready": "Pronta", "Recorded": "Gravada",
    # desktop app
    "Pick a folder outside the MDoP library.": "Escolha uma pasta fora da biblioteca do MDoP.",
    "Could not open the file with the default program.": "Não foi possível abrir o arquivo com o programa padrão.",
    "This edit is no longer available.": "Essa edição não está mais disponível.",
    "MDoP cannot write to this folder. Choose another one.": "O MDoP não consegue gravar nessa pasta. Escolha outra.",
}
