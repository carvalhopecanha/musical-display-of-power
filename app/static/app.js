'use strict';
/* Musical Display of Power — interface (plain JavaScript, no build step). */

// ================================================================ languages (pt / en)
// Each text: [Portuguese, English]. Plurals: [[um, vários], [one, many]].
const STR = {
  nav_home: ['Início', 'Home'], nav_trash: ['Lixeira', 'Trash'],
  nav_songs: ['Músicas', 'Songs'], nav_loose: ['Lista de arquivos', 'File list'], nav_albums: ['Álbuns', 'Albums'],
  nav_bands: ['Bandas', 'Bands'], nav_favs: ['Favoritas', 'Favorites'], nav_styles: ['Estilos', 'Styles'],
  nav_my_albums: ['Meus álbuns', 'My albums'], nav_more: ['Estilos e álbuns', 'Styles and albums'], nav_settings: ['Configurações', 'Settings'],
  styles_empty: ['Defina o estilo dentro de cada música.', 'Set the style inside each song.'],
  albums_empty: ['Nenhum álbum ainda.', 'No albums yet.'], library: ['Biblioteca', 'Library'],
  files_n: [['{n} arquivo', '{n} arquivos'], ['{n} file', '{n} files']],
  songs_n: [['{n} música', '{n} músicas'], ['{n} song', '{n} songs']],
  albums_n: [['{n} álbum', '{n} álbuns'], ['{n} album', '{n} albums']],
  versions_n: [['{n} versão', '{n} versões'], ['{n} version', '{n} versions']],
  found_n: [['{n} música encontrada', '{n} músicas encontradas'], ['{n} song found', '{n} songs found']],
  search_ph: ['Buscar por nome, estilo, anotação ou arquivo', 'Search by name, style, note or file'], search: ['Buscar', 'Search'],
  add_files: ['Adicionar arquivos', 'Add files'], create_song: ['Criar música', 'Create song'],
  lib_sub: ['{songs} · {albums} · cada música é uma pasta com todos os seus arquivos', '{songs} · {albums} · each song is a folder with all its files'],
  format: ['Formato', 'Format'], all: ['Todos', 'All'], f_audio: ['Áudio', 'Audio'], f_midi: ['MIDI', 'MIDI'], f_gp: ['Guitar Pro', 'Guitar Pro'],
  status: ['Status', 'Status'], album: ['Álbum', 'Album'], band: ['Banda', 'Band'], order: ['Ordem', 'Order'],
  sort_updated: ['Alteradas recentemente', 'Recently changed'], sort_created: ['Criadas recentemente', 'Recently created'], sort_title: ['Nome (A–Z)', 'Name (A–Z)'],
  empty_lib_t: ['Sua biblioteca está vazia', 'Your library is empty'],
  empty_lib_p: ['Crie uma música ou adicione seus áudios. Dá para mandar uma pasta inteira para a Lista de arquivos e decidir depois.', 'Create a song or add your audio. You can send a whole folder to the File list and decide later.'],
  nothing_t: ['Nada encontrado', 'Nothing found'], nothing_p: ['Tente outra busca ou limpe os filtros.', 'Try another search or clear the filters.'], clear_filters: ['Limpar filtros', 'Clear filters'],
  st_idea: ['Ideia', 'Idea'], st_in_progress: ['Desenvolvendo', 'In progress'], st_ready: ['Pronta', 'Ready'], st_recorded: ['Gravada', 'Recorded'],
  add_cover: ['Adicionar capa', 'Add cover'], no_album: ['Sem álbum', 'No album'], fav: ['Favoritar', 'Add to favorites'], unfav: ['Tirar dos favoritos', 'Remove from favorites'],
  play_x: ['Tocar {x}', 'Play {x}'], open_x: ['Abrir {x}', 'Open {x}'],
  back_songs: ['Músicas', 'Songs'], eyebrow_song: ['Música', 'Song'], song_name: ['Nome da música', 'Song name'],
  albums_label: ['Álbuns', 'Albums'], none: ['nenhum', 'none'], play_main: ['Tocar principal', 'Play main'], new_version: ['Nova versão', 'New version'],
  tab_audio: ['Áudios', 'Audio'], tab_score: ['Partituras e MIDI', 'Scores & MIDI'], tab_image: ['Imagens', 'Images'], tab_other: ['Outros', 'Other'],
  files_title: ['Versões e arquivos', 'Versions and files'], star_hint: ['A estrela marca o arquivo principal, o que toca no card.', 'The star marks the main file, the one the card plays.'],
  versions_note: ['Arquivos de versões antigas nunca são substituídos. Excluir manda para a lixeira da biblioteca.', 'Files in old versions are never replaced. Deleting sends them to the library trash.'],
  delete_song: ['Excluir música', 'Delete song'], details: ['Detalhes', 'Details'],
  style: ['Estilo', 'Style'], style_ph: ['Ex.: Violão, Metal', 'E.g. Acoustic, Metal'], key: ['Tom', 'Key'], key_ph: ['Ex.: Ré maior', 'E.g. D major'],
  bpm: ['Andamento', 'Tempo'], bpm_ph: ['Ex.: 84 bpm', 'E.g. 84 bpm'], tuning: ['Afinação', 'Tuning'], tuning_ph: ['Ex.: Drop D', 'E.g. Drop D'],
  no_band: ['Sem banda', 'No band'], new_band_opt: ['+ Nova banda…', '+ New band…'],
  notes: ['Anotações rápidas', 'Quick notes'], notes_ph: ['Lembretes curtos: acordes, o que falta…', 'Short reminders: chords, what is missing…'],
  texts: ['Textos', 'Texts'], texts_hint: ['Estrutura, ideias, letra: escreva à vontade. Salva sozinho.', 'Structure, ideas, lyrics: write freely. Saves automatically.'],
  new_text: ['Novo texto', 'New text'], text_title: ['Título do texto', 'Text title'], text_ph: ['Escreva aqui…', 'Write here…'], delete_text: ['Excluir texto', 'Delete text'],
  no_texts: ['Nenhum texto ainda. Crie um para anotar a estrutura, ideias ou a letra.', 'No texts yet. Create one for the structure, ideas or lyrics.'],
  text_suggestions: [['Estrutura', 'Ideias', 'Letra', 'Referências'], ['Structure', 'Ideas', 'Lyrics', 'References']],
  saving: ['Salvando…', 'Saving…'], saved: ['Salvo', 'Saved'],
  change_cover: ['Trocar capa', 'Change cover'], download_cover: ['Baixar', 'Download'], remove: ['Remover', 'Remove'], choose_cover: ['Escolher capa', 'Choose cover'],
  empty_version: ['Versão vazia.', 'Empty version.'], add_here: ['Adicionar arquivos aqui', 'Add files here'], no_files_type: ['Nenhum arquivo deste tipo nesta versão.', 'No files of this type in this version.'],
  rename: ['Renomear', 'Rename'], delete_version: ['Excluir versão', 'Delete version'], main: ['Principal', 'Main'], only_download: ['somente download', 'download only'],
  mark_main: ['Marcar como principal', 'Set as main'], is_main: ['Arquivo principal', 'Main file'], download_x: ['Baixar {x}', 'Download {x}'], more_x: ['Mais opções para {x}', 'More options for {x}'],
  use_as_cover: ['Usar como capa', 'Use as cover'], no_files_tab: ['Nenhum arquivo nesta aba.', 'No files in this tab.'],
  back_albums: ['Álbuns', 'Albums'], eyebrow_album: ['Álbum', 'Album'], album_name: ['Nome do álbum', 'Album name'], desc_ph: ['Descrição (opcional)', 'Description (optional)'],
  mosaic_note: ['Sem capa própria: mostrando as capas das músicas', 'No cover of its own: showing the song covers'], play_album: ['Tocar álbum', 'Play album'],
  add_songs: ['Adicionar músicas', 'Add songs'], delete_album: ['Excluir álbum', 'Delete album'], album_songs: ['Músicas do álbum', 'Songs in this album'],
  empty_album: ['Álbum vazio', 'Empty album'], album_note: ['Tirar uma música do álbum não apaga nada: ela continua na biblioteca.', 'Removing a song from the album deletes nothing: it stays in the library.'],
  move_up: ['Subir {x}', 'Move {x} up'], move_down: ['Descer {x}', 'Move {x} down'], remove_from: ['Tirar {x} do álbum', 'Remove {x} from album'],
  albums_title: ['Álbuns', 'Albums'], albums_sub: ['um álbum junta músicas sem duplicar arquivos', 'an album groups songs without duplicating files'],
  new_album: ['Novo álbum', 'New album'], no_albums_t: ['Nenhum álbum ainda', 'No albums yet'], no_albums_p: ['Crie um álbum e adicione as músicas que fazem parte dele.', 'Create an album and add the songs that belong to it.'],
  bands_title: ['Bandas', 'Bands'], bands_sub: ['agrupe músicas e álbuns por banda ou projeto', 'group songs and albums by band or project'], new_band: ['Nova banda', 'New band'],
  no_bands_t: ['Nenhuma banda ainda', 'No bands yet'], no_bands_p: ['Crie uma banda ou projeto (sua banda de metal, seu podcast, seu trabalho solo) e escolha a banda dentro de cada música.', 'Create a band or project (your metal band, your podcast, your solo work) and pick it inside each song.'],
  band_eyebrow: ['Banda', 'Band'], band_name: ['Nome da banda', 'Band name'], delete_band: ['Excluir banda', 'Delete band'],
  band_no_songs: ['Nenhuma música nesta banda. Escolha a banda no painel Detalhes de cada música.', 'No songs in this band. Pick the band in the Details panel of each song.'],
  loose_title: ['Lista de arquivos', 'File list'], loose_n: [['{n} item para revisar', '{n} itens para revisar'], ['{n} item to review', '{n} items to review']],
  loose_desc: ['Ouça um por um e decida: criar uma música, juntar a uma música que já existe ou descartar.', 'Listen one by one and decide: create a song, add it to an existing song or discard it.'],
  add_audios: ['Adicionar arquivos', 'Add files'], loose_empty_t: ['Nenhum arquivo na lista', 'No files in the list'],
  loose_empty_p: ['Adicione uma pasta inteira de gravações: elas entram aqui soltas, sem virar música, para você ouvir com calma.', 'Add a whole folder of recordings: they come in loose, without becoming songs, so you can listen calmly.'],
  kbd_hint: ['Atalhos: {down} próximo e {up} anterior (já tocam), {space} tocar/pausar.', 'Shortcuts: {down} next and {up} previous (they play), {space} play/pause.'],
  select_all: ['Selecionar todos', 'Select all'], selected_n: [['{n} selecionado', '{n} selecionados'], ['{n} selected', '{n} selected']],
  make_song: ['Criar música', 'Create song'], join: ['Juntar a uma música', 'Add to a song'], discard: ['Descartar', 'Discard'],
  created_toast: ['Música “{t}” criada.', 'Song “{t}” created.'], joined_toast: ['Adicionado a “{t}”.', 'Added to “{t}”.'], open: ['Abrir', 'Open'],
  discarded_toast: [['{n} item descartado.', '{n} itens descartados.'], ['{n} item discarded.', '{n} items discarded.']],
  discard_t: ['Descartar da lista?', 'Discard from the list?'],
  discard_p: ['Os arquivos saem da lista e vão para a lixeira da biblioteca (.trash). Se você importou mantendo os originais, eles continuam intactos.', 'The files leave the list and go to the library trash (.trash). If you imported keeping the originals, they stay untouched.'],
  from_files: ['Com {files}: {names}', 'With {files}: {names}'], choose_song: ['Escolha a música', 'Choose the song'], filter_songs: ['Filtrar músicas', 'Filter songs'],
  as_new_version: ['Colocar numa nova versão (os arquivos atuais continuam guardados)', 'Put in a new version (current files stay saved)'],
  version_name: ['Nome da versão', 'Version name'], version_ph: ['Ex.: Com ponte nova', 'E.g. With new bridge'], join_btn: ['Juntar', 'Add'],
  imp_title: ['Adicionar arquivos', 'Add files'], imp_sub: ['Escolha de onde vêm e para onde vão.', 'Choose where they come from and where they go.'],
  tab_computer: ['Do meu computador', 'From my computer'], tab_server: ['Do servidor', 'From the server'], where: ['Para onde vão?', 'Where do they go?'],
  t_loose: ['Lista de arquivos', 'File list'], t_loose_d: ['Entram soltos para você ouvir e decidir depois. Ideal para muitos arquivos.', 'They come in loose so you can listen and decide later. Best for many files.'],
  t_new: ['Criar uma nova música', 'Create a new song'], t_new_d: ['Tudo vai para uma pasta nova.', 'Everything goes into a new folder.'],
  t_existing: ['Adicionar a uma música', 'Add to a song'], t_existing_d: ['Coloca os arquivos numa música que já existe.', 'Puts the files in an existing song.'],
  t_grouped: ['Uma música por nome', 'One song per name'], t_grouped_d: ['“riff 1.m4a” e “riff 1.mid” viram a música “riff 1”.', '“riff 1.m4a” and “riff 1.mid” become the song “riff 1”.'],
  new_name: ['Nome da nova música', 'New song name'], new_name_ph: ['Se deixar vazio, usa o nome do primeiro arquivo', 'If empty, uses the first file name'],
  song_label: ['Música', 'Song'], originals: ['E os arquivos originais?', 'What about the original files?'],
  copy_t: ['Manter os originais e fazer uma cópia', 'Keep the originals and make a copy'], copy_d: ['Seus arquivos continuam onde estão. O MDoP guarda uma cópia.', 'Your files stay where they are. MDoP keeps a copy.'],
  move_t: ['Mover para a biblioteca', 'Move into the library'], move_d: ['Os arquivos saem do lugar atual e passam a ficar só na biblioteca. Economiza espaço.', 'The files leave their current place and live only in the library. Saves space.'],
  recommended: ['Recomendado', 'Recommended'], computer_note: ['Os arquivos do seu computador não são alterados: o MDoP envia e guarda uma cópia.', 'Files on your computer are not changed: MDoP uploads and keeps a copy.'],
  drop: ['Arraste arquivos aqui ou', 'Drag files here or'], pick_files: ['Escolher arquivos', 'Choose files'], pick_folder: ['Escolher pasta', 'Choose folder'],
  files_selected_n: [['{n} arquivo selecionado', '{n} arquivos selecionados'], ['{n} file selected', '{n} files selected']],
  clear: ['Limpar', 'Clear'], playable: ['Tocável', 'Playable'], stored: ['Guardado', 'Stored'], and_more: ['e mais {n}…', 'and {n} more…'],
  no_roots_t: ['Nenhuma pasta do servidor configurada', 'No server folder configured'],
  no_roots_p: ['Para navegar nas pastas do servidor, configure MDOP_IMPORT_ROOTS (no Docker: o volume /importar). Veja o README.', 'To browse server folders, set MDOP_IMPORT_ROOTS (in Docker: the /importar volume). See the README.'],
  loading: ['Carregando…', 'Loading…'], folders_available: ['Pastas disponíveis', 'Available folders'], back: ['Voltar', 'Back'], empty_folder: ['Pasta vazia', 'Empty folder'],
  items_selected_n: [['{n} item selecionado (pastas incluem as subpastas)', '{n} itens selecionados (pastas incluem as subpastas)'], ['{n} item selected (folders include subfolders)', '{n} items selected (folders include subfolders)']],
  mark_hint: ['Marque arquivos ou pastas inteiras.', 'Tick files or whole folders.'], select_x: ['Selecionar {x}', 'Select {x}'],
  nothing_selected: ['Nada selecionado ainda', 'Nothing selected yet'], cancel: ['Cancelar', 'Cancel'], add: ['Adicionar', 'Add'],
  add_n: [['Adicionar {n} arquivo', 'Adicionar {n} arquivos'], ['Add {n} file', 'Add {n} files']], adding: ['Adicionando…', 'Adding…'],
  sending: ['Enviando… {p}%', 'Uploading… {p}%'], organizing: ['Organizando os arquivos…', 'Organizing the files…'], done: ['Pronto!', 'Done!'],
  r_songs: [['{n} música criada', '{n} músicas criadas'], ['{n} song created', '{n} songs created']],
  r_files: [['{n} arquivo adicionado', '{n} arquivos adicionados'], ['{n} file added', '{n} files added']],
  r_skipped: [['{n} arquivo já estava na biblioteca e foi pulado', '{n} arquivos já estavam na biblioteca e foram pulados'], ['{n} file was already in the library and was skipped', '{n} files were already in the library and were skipped']],
  warnings: ['Avisos', 'Warnings'], errors: ['Não foi possível adicionar', 'Could not add'], close: ['Fechar', 'Close'],
  open_song: ['Abrir a música', 'Open the song'], see_library: ['Ver na biblioteca', 'See in library'], see_loose: ['Abrir a Lista de arquivos', 'Open the file list'],
  new_song_t: ['Criar música', 'Create song'], create: ['Criar', 'Create'], song_ph: ['Ex.: Riff de domingo', 'E.g. Sunday riff'],
  album_ph: ['Ex.: EP violão 2027', 'E.g. Acoustic EP 2027'], band_ph: ['Ex.: Minha banda', 'E.g. My band'],
  create_version: ['Criar versão', 'Create version'], version_created: ['Versão v{n} criada. Agora adicione os arquivos dela.', 'Version v{n} created. Now add its files.'],
  rename_version_t: ['Renomear versão', 'Rename version'], delete_version_t: ['Excluir versão vazia?', 'Delete empty version?'],
  delete_version_p: ['A versão não tem arquivos. Ela será removida.', 'The version has no files. It will be removed.'],
  delete_song_t: ['Excluir música?', 'Delete song?'], delete_song_p: ['“{t}” e todos os arquivos dela vão para a lixeira da biblioteca (.trash).', '“{t}” and all its files go to the library trash (.trash).'],
  delete_album_t: ['Excluir álbum?', 'Delete album?'], delete_album_p: ['O álbum “{t}” será removido. As músicas continuam na biblioteca.', 'The album “{t}” will be removed. Its songs stay in the library.'],
  delete_band_t: ['Excluir banda?', 'Delete band?'], delete_band_p: ['A banda “{t}” será removida. Músicas e álbuns continuam, só ficam sem banda.', 'The band “{t}” will be removed. Songs and albums stay, just without a band.'],
  delete_file_t: ['Excluir arquivo?', 'Delete file?'], delete_file_p: ['“{t}” vai para a lixeira da biblioteca (.trash).', '“{t}” goes to the library trash (.trash).'],
  delete_text_t: ['Excluir texto?', 'Delete text?'], delete_text_p: ['O texto “{t}” será apagado.', 'The text “{t}” will be deleted.'],
  delete: ['Excluir', 'Delete'], confirm: ['Confirmar', 'Confirm'], save: ['Salvar', 'Save'],
  file_updated: ['Arquivo atualizado.', 'File updated.'], file_trashed: ['Arquivo enviado para a lixeira.', 'File moved to trash.'], cover_updated: ['Capa atualizada.', 'Cover updated.'],
  main_set: ['Arquivo principal definido.', 'Main file set.'], albums_updated: ['Álbuns atualizados.', 'Albums updated.'], song_trashed: ['Música enviada para a lixeira.', 'Song moved to trash.'],
  n_added: [['{n} música adicionada.', '{n} músicas adicionadas.'], ['{n} song added.', '{n} songs added.']],
  file_name: ['Nome do arquivo', 'File name'], move_to_version: ['Mover para a versão', 'Move to version'], delete_file: ['Excluir arquivo', 'Delete file'],
  version_x: ['Versão v{n} · {l}', 'Version v{n} · {l}'], song_albums_t: ['Álbuns desta música', 'Albums of this song'], no_albums_yet: ['Você ainda não tem álbuns.', 'You have no albums yet.'],
  or_new_album: ['Ou crie um álbum novo', 'Or create a new album'], new_album_name_ph: ['Nome do novo álbum', 'New album name'],
  none_selected: ['Nenhuma selecionada', 'None selected'], all_in_album: ['Todas as músicas já estão neste álbum.', 'All songs are already in this album.'],
  settings_title: ['Configurações', 'Settings'],
  set_general: ['Geral', 'General'], set_menu: ['Menu', 'Menu'], set_sfx: ['Efeitos sonoros', 'Sound effects'], set_backup: ['Backup', 'Backup'],
  set_library: ['Biblioteca', 'Library'], set_security: ['Segurança', 'Security'], set_about: ['Sobre', 'About'],
  lang_auto: ['Automático (idioma do navegador)', 'Automatic (browser language)'],
  trash_auto_t: ['Esvaziar a lixeira sozinho', 'Empty the trash automatically'],
  trash_auto_p: ['Itens que estão na lixeira há mais tempo que isso são apagados de vez, uma vez por dia. Desligado, nada sai da lixeira sem você mandar.', 'Items that have been in the trash longer than this are deleted for good, once a day. When off, nothing leaves the trash unless you say so.'],
  trash_keep: ['Nunca (só quando eu mandar)', 'Never (only when I say so)'], trash_after_n: [['Depois de {n} dia', 'Depois de {n} dias'], ['After {n} day', 'After {n} days']],
  items_n: [['{n} item', '{n} itens'], ['{n} item', '{n} items']], language: ['Idioma', 'Language'], theme: ['Tema', 'Theme'], theme_dark: ['Escuro', 'Dark'], theme_light: ['Claro', 'Light'],
  accent: ['Cor de destaque', 'Accent color'], acc_yellow: ['Amarelo (padrão)', 'Yellow (default)'], acc_blue: ['Azul', 'Blue'], acc_green: ['Verde', 'Green'], acc_red: ['Vermelho', 'Red'], acc_purple: ['Roxo', 'Purple'],
  about: ['Sobre', 'About'], version: ['Versão', 'Version'], library_folder: ['Pasta da biblioteca', 'Library folder'], import_folders: ['Pastas de importação', 'Import folders'],
  settings_note: ['As configurações ficam salvas no servidor e valem em qualquer computador.', 'Settings are saved on the server and apply on any computer.'],
  prev: ['Faixa anterior', 'Previous track'], next: ['Próxima faixa', 'Next track'], pause: ['Pausar', 'Pause'], play: ['Tocar', 'Play'],
  close_player: ['Fechar player', 'Close player'], position: ['Posição do áudio', 'Audio position'],
  cant_play: ['Não foi possível tocar este arquivo neste navegador.', 'This file cannot be played in this browser.'],
  no_connection: ['Sem conexão com o servidor.', 'No connection to the server.'], err_generic: ['Algo deu errado (erro {n}).', 'Something went wrong (error {n}).'],
  couldnt_open: ['Não foi possível abrir', 'Could not open'], back_library: ['Voltar para a biblioteca', 'Back to the library'],
  upload_failed: ['A conexão caiu durante o envio.', 'The connection dropped during upload.'],
  // home
  home_sub: ['Suas músicas organizadas e fáceis de achar.', 'Your music, organized and easy to find.'],
  stat_songs: ['músicas', 'songs'], stat_ready: ['prontas', 'ready'], stat_dev: ['em desenvolvimento', 'in progress'], stat_albums: ['álbuns', 'albums'],
  sec_recent: ['Alteradas recentemente', 'Recently changed'], sec_favs: ['Favoritas', 'Favorites'], see_all: ['Ver tudo', 'See all'],
  waiting_n: [['{n} item esperando você na Lista de arquivos', '{n} itens esperando você na Lista de arquivos'], ['{n} item waiting for you in the File list', '{n} items waiting for you in the File list']],
  waiting_p: ['Ouça um por um e decida o que vira música.', 'Listen one by one and decide what becomes a song.'], listen_now: ['Ouvir agora', 'Listen now'],
  welcome_t: ['Bem-vindo ao MDoP', 'Welcome to MDoP'],
  welcome_p: ['Comece adicionando seus arquivos: eles entram na Lista de arquivos para você ouvir e organizar com calma.', 'Start by adding your files: they go to the File list so you can listen and organize calmly.'],
  // file list
  search_list_ph: ['Buscar na lista', 'Search the list'], type: ['Tipo', 'Type'], tab_audio_s: ['Áudio', 'Audio'], tab_midi: ['MIDI', 'MIDI'], tab_gp: ['Guitar Pro', 'Guitar Pro'],
  origin: ['Pasta de origem', 'Source folder'], origin_upload: ['Enviados pelo navegador', 'Uploaded in the browser'],
  only_separated: ['Separados', 'Set aside'], separate: ['Separar', 'Set aside'], unseparate: ['Tirar dos separados', 'Remove from set aside'],
  sort_name: ['Nome', 'Name'], sort_date: ['Mais antigos primeiro', 'Oldest first'], sort_date_desc: ['Mais novos primeiro', 'Newest first'], sort_size: ['Maiores primeiro', 'Largest first'],
  dupes_btn: [['Remover {n} duplicado', 'Remover {n} duplicados'], ['Remove {n} duplicate', 'Remove {n} duplicates']],
  dupes_t: ['Remover duplicados idênticos?', 'Remove identical duplicates?'],
  dupes_p: ['{n} arquivo(s) são cópias exatas de outro: mesmo tamanho e mesmo conteúdo, byte a byte (o nome pode ser diferente). Arquivos de tamanho diferente nunca entram aqui. Eles vão para a Lixeira e sempre fica uma cópia de cada: {list}', '{n} file(s) are exact copies of another: same size and same content, byte for byte (the name may differ). Files of different sizes never count. They go to the Trash and one copy of each always stays: {list}'],
  dupes_done: [['{n} duplicado removido.', '{n} duplicados removidos.'], ['{n} duplicate removed.', '{n} duplicates removed.']],
  showing: ['Mostrando {x} de {y}', 'Showing {x} of {y}'], separated_tag: ['Separado', 'Set aside'],
  // song and album
  page_files: ['Arquivos', 'Files'], page_texts: ['Textos', 'Texts'], download_all: ['Baixar tudo (ZIP)', 'Download all (ZIP)'],
  // trash
  trash_title: ['Lixeira', 'Trash'], trash_sub: ['O que você excluiu fica aqui até esvaziar. Dá para restaurar para o lugar de onde saiu.', 'What you delete stays here until you empty it. You can restore it to where it was.'],
  empty_trash: ['Esvaziar lixeira', 'Empty trash'], restore: ['Restaurar', 'Restore'], delete_forever: ['Excluir de vez', 'Delete forever'],
  kind_file: ['Arquivo', 'File'], kind_song: ['Música', 'Song'], kind_loose: ['Lista de arquivos', 'File list'], from_song: ['de “{t}”', 'from “{t}”'],
  trash_empty_t: ['A lixeira está vazia', 'The trash is empty'], trash_empty_p: ['Arquivos, músicas e itens da lista que você excluir aparecem aqui.', 'Files, songs and list items you delete show up here.'],
  restored_song: ['Restaurado.', 'Restored.'], restored_loose: ['Restaurado para a Lista de arquivos.', 'Restored to the File list.'],
  empty_confirm_t: ['Esvaziar a lixeira?', 'Empty the trash?'], empty_confirm_p: ['Tudo na lixeira ({size}) será apagado de vez. Não dá para desfazer.', 'Everything in the trash ({size}) will be deleted forever. This cannot be undone.'],
  delete_forever_t: ['Excluir de vez?', 'Delete forever?'], delete_forever_p: ['“{t}” será apagado de vez. Não dá para desfazer.', '“{t}” will be deleted forever. This cannot be undone.'],
  trash_others: [['Mais {n} item antigo, de versões anteriores (sem restauração).', 'Mais {n} itens antigos, de versões anteriores (sem restauração).'], ['{n} more old item from earlier versions (cannot be restored).', '{n} more old items from earlier versions (cannot be restored).']],
  trash_emptied: ['Lixeira esvaziada.', 'Trash emptied.'], total: ['Total', 'Total'],
  // settings: library and security
  library_title: ['Biblioteca', 'Library'], path_server: ['Pasta no servidor', 'Folder on the server'], path_inside: ['Pasta dentro do container', 'Folder inside the container'],
  in_use: ['Ocupando', 'Using'], free_disk: ['Livre no disco', 'Free on disk'],
  move_hint: ['Para mudar a biblioteca de lugar, rode no servidor, dentro da pasta do MDoP:', 'To move the library, run on the server, inside the MDoP folder:'],
  security: ['Segurança', 'Security'], sec_off: ['Seu MDoP está aberto para qualquer pessoa na sua rede.', 'Your MDoP is open to anyone on your network.'],
  create_login: ['Criar usuário e senha', 'Create user and password'], user: ['Usuário', 'User'], password: ['Senha', 'Password'],
  confirm_password: ['Confirmar senha', 'Confirm password'], pw_min: ['Mínimo de 8 caracteres.', 'At least 8 characters.'], pw_mismatch: ['As senhas não são iguais.', 'Passwords do not match.'],
  sec_on: ['Protegido com senha. Usuário: {u}', 'Password protected. User: {u}'], change_password: ['Trocar senha', 'Change password'],
  current_password: ['Senha atual', 'Current password'], new_password: ['Nova senha', 'New password'], logout: ['Sair', 'Log out'],
  remove_protection: ['Remover proteção', 'Remove protection'], remove_protection_p: ['Digite a senha atual para remover a proteção.', 'Type the current password to remove the protection.'],
  protection_on: ['Proteção ligada. Este navegador já está logado.', 'Protection on. This browser is already logged in.'],
  protection_off: ['Proteção removida.', 'Protection removed.'], password_changed: ['Senha trocada. Outros navegadores precisarão entrar de novo.', 'Password changed. Other browsers will need to log in again.'],
  forgot: ['Esqueceu a senha? No servidor, rode:', 'Forgot the password? On the server, run:'],
  login_sub: ['Entre para abrir sua biblioteca.', 'Log in to open your library.'], login_btn: ['Entrar', 'Log in'],
  // artists, credits, details, glass
  nav_artists: ['Artistas', 'Artists'], artists_sub: ['as pessoas que participam das suas músicas, álbuns e bandas', 'the people who take part in your songs, albums and bands'],
  new_artist: ['Novo artista', 'New artist'], artist_name: ['Nome do artista', 'Artist name'], artist_ph: ['Ex.: Ana Souza', 'E.g. Jane Doe'],
  no_artists_t: ['Nenhum artista ainda', 'No artists yet'],
  no_artists_p: ['Adicione créditos numa música, num álbum ou numa banda: o artista é criado na hora. Ou crie aqui.', 'Add credits to a song, album or band: the artist is created on the spot. Or create one here.'],
  artist_eyebrow: ['Artista', 'Artist'], bio_ph: ['Sobre o artista (opcional)', 'About the artist (optional)'],
  delete_artist: ['Excluir artista', 'Delete artist'], delete_artist_t: ['Excluir artista?', 'Delete artist?'],
  delete_artist_p: ['“{t}” e os créditos dele serão removidos. Músicas, álbuns e bandas continuam.', '“{t}” and their credits will be removed. Songs, albums and bands stay.'],
  in_songs: ['Músicas em que participou', 'Songs they took part in'], in_albums: ['Álbuns', 'Albums'], in_bands: ['Bandas', 'Bands'],
  no_participation: ['Ainda sem participações. Adicione créditos nas músicas, álbuns ou bandas.', 'No participations yet. Add credits to songs, albums or bands.'],
  credits: ['Créditos', 'Credits'], add_credit: ['Adicionar crédito', 'Add credit'], credit_role: ['Função', 'Role'],
  role_ph: ['Ex.: Guitarra, Composição, Produção', 'E.g. Guitar, Songwriting, Production'], no_credits: ['Nenhum crédito ainda.', 'No credits yet.'],
  remove_credit: ['Remover crédito de {x}', 'Remove credit for {x}'], edit_role: ['Mudar a função de {x}', 'Change role for {x}'],
  members: ['Integrantes', 'Members'], add_member: ['Adicionar integrante', 'Add member'], no_members: ['Nenhum integrante ainda.', 'No members yet.'],
  credit_added: ['Crédito adicionado.', 'Credit added.'], artist_hint: ['Escolha um artista da lista ou digite um nome novo.', 'Pick an artist from the list or type a new name.'],
  roles: [['Composição', 'Letra', 'Vocal', 'Guitarra', 'Violão', 'Baixo', 'Bateria', 'Teclado', 'Produção', 'Gravação', 'Mixagem', 'Masterização', 'Arte da capa', 'Fotografia'],
          ['Songwriting', 'Lyrics', 'Vocals', 'Guitar', 'Acoustic guitar', 'Bass', 'Drums', 'Keys', 'Production', 'Recording', 'Mixing', 'Mastering', 'Cover art', 'Photography']],
  tech_sheet: ['Ficha técnica', 'Album details'], release: ['Lançamento', 'Release'], release_ph: ['Ex.: 2027', 'E.g. 2027'],
  recorded_at: ['Local de gravação', 'Recorded at'], recorded_ph: ['Ex.: Estúdio em casa', 'E.g. Home studio'],
  label: ['Gravadora / selo', 'Label'], label_ph: ['Ex.: Independente', 'E.g. Independent'],
  choose_photo: ['Escolher foto', 'Choose photo'], change_photo: ['Trocar foto', 'Change photo'],
  theme_glass: ['Vidro', 'Glass'],
  nav_sfx: ['Efeitos sonoros', 'Sound effects'], sfx_n: [['{n} efeito', '{n} efeitos'], ['{n} effect', '{n} effects']], folders_n: [['{n} pasta', '{n} pastas'], ['{n} folder', '{n} folders']],
  sfx_sub: ['Efeitos lidos direto das suas pastas, sem copiar nada.', 'Effects read straight from your folders, nothing is copied.'],
  sfx_empty_t: ['Vincule sua pasta de efeitos', 'Link your effects folder'],
  sfx_empty_p: ['O MDoP lê os efeitos direto da pasta, sem copiar nem mexer em nada. As subpastas viram categorias. Dá para vincular quantas pastas quiser.', 'MDoP reads the effects straight from the folder, without copying or changing anything. Subfolders become categories. Link as many folders as you like.'],
  sfx_noroot_p: ['Nenhuma pasta de efeitos foi liberada para o MDoP. Rode o instalador de novo e informe a pasta raiz dos seus efeitos (ela é liberada só para leitura).', 'No effects folder was made available to MDoP. Run the installer again and enter the root folder of your effects (it is made available read-only).'],
  sfx_link: ['Vincular pasta', 'Link folder'], sfx_link_p: ['Escolha a pasta com os efeitos. O MDoP só lê: nada é copiado, alterado ou apagado.', 'Pick the folder with the effects. MDoP only reads: nothing is copied, changed or deleted.'],
  sfx_link_this: ['Vincular esta pasta', 'Link this folder'], sfx_roots: ['Pastas liberadas', 'Available folders'], sfx_no_subfolders: ['Sem subpastas aqui.', 'No subfolders here.'],
  sfx_linked: ['Pasta vinculada. Lendo os efeitos…', 'Folder linked. Reading the effects…'], sfx_rescan: ['Reler pastas', 'Rescan folders'], sfx_folders: ['Pastas', 'Folders'],
  sfx_scanning: ['Lendo… {d} de {t}', 'Reading… {d} of {t}'], sfx_scan_done: ['Pastas lidas: {a} novos, {u} alterados, {m} sumiram.', 'Folders read: {a} new, {u} changed, {m} gone.'],
  sfx_search_ph: ['Buscar efeito por nome, categoria ou etiqueta (ex.: porta, chuva forte)', 'Search effects by name, category or tag (e.g. door, heavy rain)'],
  sfx_category: ['Categoria', 'Category'], sfx_sub_cat: ['Subcategoria', 'Subcategory'], sfx_no_cat: ['Sem categoria', 'No category'], sfx_duration: ['Duração', 'Duration'], sfx_tag: ['Etiqueta', 'Tag'],
  dur_short: ['Curtos (até 2 s)', 'Short (up to 2 s)'], dur_medium: ['Médios (2 a 10 s)', 'Medium (2 to 10 s)'], dur_long: ['Longos (10 s a 1 min)', 'Long (10 s to 1 min)'], dur_xlong: ['Muito longos (mais de 1 min)', 'Very long (over 1 min)'],
  sfx_sort_short: ['Mais curtos', 'Shortest'], sfx_sort_long: ['Mais longos', 'Longest'], sfx_sort_recent: ['Adicionados recentemente', 'Recently added'], sfx_sort_random: ['Aleatório', 'Random'],
  sfx_missing: ['indisponível', 'unavailable'], sfx_missing_n: [['{n} indisponível', '{n} indisponíveis'], ['{n} unavailable', '{n} unavailable']],
  sfx_edit_tags: ['Etiquetas', 'Tags'], sfx_tags_t: ['Etiquetas de "{n}"', 'Tags for "{n}"'], sfx_tags_label: ['Separe com vírgulas', 'Separate with commas'], sfx_tags_ph: ['porta, madeira, rangido', 'door, wood, creak'],
  save: ['Salvar', 'Save'], sfx_hide: ['Tirar da lista', 'Remove from list'], sfx_hidden_toast: ['Efeito tirado da lista. O arquivo continua na pasta.', 'Effect removed from the list. The file stays in the folder.'],
  sfx_unhide: [['Devolver {n} efeito tirado da lista', 'Devolver {n} efeitos tirados da lista'], ['Bring back {n} removed effect', 'Bring back {n} removed effects']],
  sfx_hint: ['Clique para ouvir. ↑ ↓ passam para o próximo efeito e já tocam; Espaço pausa. O MDoP só lê as pastas: tirar um efeito da lista nunca apaga o arquivo.', 'Click to listen. ↑ ↓ move to the next effect and play it; Space pauses. MDoP only reads the folders: removing an effect from the list never deletes the file.'],
  sfx_settings_note: ['Pastas de efeitos vinculadas. O MDoP só lê essas pastas: guarda nome, duração e categoria, sem copiar, alterar ou apagar nada. As subpastas viram categorias.', 'Linked effects folders. MDoP only reads them: it keeps name, duration and category, without copying, changing or deleting anything. Subfolders become categories.'],
  sfx_no_folders: ['Nenhuma pasta vinculada ainda.', 'No folders linked yet.'], sfx_unlink: ['Desvincular pasta', 'Unlink folder'],
  sfx_unlink_t: ['Desvincular "{n}"?', 'Unlink "{n}"?'], sfx_unlink_p: ['Os efeitos dessa pasta saem do MDoP, com etiquetas e favoritos. Os arquivos continuam na pasta, intactos.', 'The effects of this folder leave MDoP, with their tags and favorites. The files stay in the folder, untouched.'],
  sfx_folder_off: ['pasta não encontrada (HD desconectado?)', 'folder not found (drive disconnected?)'], sfx_scanned: ['lida em {d}', 'read on {d}'],
  res_sfx: ['Efeitos sonoros', 'Sound effects'], open_in_sfx: ['Ver todos em Efeitos sonoros', 'See all in Sound effects'],
  backup_title: ['Backup', 'Backup'], backup_note: ['Um arquivo .zip com o banco de dados e todas as pastas da biblioteca. Guarde fora do servidor de vez em quando (outro HD, o computador, a nuvem).', 'A .zip file with the database and every library folder. Keep a copy off the server now and then (another drive, your computer, the cloud).'],
  backup_folder: ['Pasta de backups', 'Backup folder'], backup_not_writable: ['A pasta de backups não aceita gravação. Rode o instalador e escolha outra pasta.', 'The backup folder is not writable. Run the installer and choose another folder.'],
  backup_with_trash: ['Incluir a Lixeira', 'Include the Trash'], backup_create: ['Criar backup no servidor', 'Create backup on the server'], backup_download: ['Baixar backup agora', 'Download backup now'],
  backup_upload: ['Enviar um backup', 'Upload a backup'], backup_uploading: ['Enviando o backup…', 'Uploading the backup…'], backup_uploaded: ['Backup recebido: {n}', 'Backup received: {n}'],
  backup_list: ['Backups guardados', 'Saved backups'], backup_unknown: ['não é um backup do MDoP', 'not an MDoP backup'], backup_restore: ['Restaurar', 'Restore'],
  backup_progress: ['Criando o backup… {p}%', 'Creating the backup… {p}%'], restore_progress: ['Restaurando… {p}%', 'Restoring… {p}%'], backup_done: ['Backup pronto: {n}', 'Backup ready: {n}'],
  restore_t: ['Restaurar este backup?', 'Restore this backup?'],
  restore_p: ['A biblioteca atual é trocada pela do backup "{n}". Antes disso, o MDoP guarda uma cópia de segurança da biblioteca atual na pasta de backups. Enquanto restaura, o app fica indisponível.', 'The current library is replaced by the backup "{n}". Before that, MDoP saves a safety copy of the current library in the backup folder. The app is unavailable while restoring.'],
  backup_delete_t: ['Apagar o backup "{n}"?', 'Delete the backup "{n}"?'], backup_delete_p: ['O arquivo de backup é apagado da pasta de backups. A biblioteca não é afetada.', 'The backup file is deleted from the backup folder. The library is not affected.'],
  restoring_t: ['Restaurando o backup', 'Restoring the backup'], restoring_p: ['A biblioteca está sendo trocada. Não feche o servidor.', 'The library is being replaced. Do not shut down the server.'], restore_done: ['Pronto! Recarregando…', 'Done! Reloading…'],
  migrate_t: ['Atualizando a biblioteca', 'Updating the library'],
  migrate_fail_t: ['Atualização desfeita', 'Update undone'],
  migrate_p: ['Esta versão usa nomes de pastas em inglês. O MDoP está renomeando as pastas da sua biblioteca (nada é apagado). Leva poucos segundos; não desligue o servidor.', 'This version uses English folder names. MDoP is renaming the folders of your library (nothing is deleted). It takes a few seconds; do not shut down the server.'],
  migrate_backup: ['Antes de atualizar, o MDoP faz um backup completo da biblioteca na pasta de backups… {p}%', 'Before updating, MDoP makes a full backup of the library in the backup folder… {p}%'],
  migrate_fail: ['A atualização não deu certo e foi desfeita: a sua biblioteca ficou exatamente como estava. Volte para a versão anterior do MDoP e abra um problema (issue) no GitHub com o detalhe abaixo.', 'The update did not work and was undone: your library is exactly as it was. Go back to the previous MDoP version and open an issue on GitHub with the detail below.'],
  menu_title: ['Menu', 'Menu'], menu_note: ['Desligue as partes que você não usa. Elas somem do menu e das outras telas, mas nada é apagado: ligou de novo, está tudo lá.', 'Turn off the parts you don\'t use. They disappear from the menu and other screens, but nothing is deleted: turn them back on and everything is there.'],
  mod_ideas: ['Riffs, melodias e exercícios', 'Riffs, melodies and exercises'], mod_sfx: ['Efeitos sonoros das suas pastas', 'Sound effects from your folders'],
  mod_albums: ['Coleções de músicas', 'Song collections'], mod_bands: ['Grupos e projetos', 'Groups and projects'], mod_artists: ['Pessoas e créditos', 'People and credits'], mod_favs: ['Músicas marcadas com o coração', 'Songs marked with the heart'],
  bands_n: [['{n} banda', '{n} bandas'], ['{n} band', '{n} bands']], artists_n: [['{n} artista', '{n} artistas'], ['{n} artist', '{n} artists']],
  dot_album: ['Álbum: {t}', 'Album: {t}'], dot_band: ['Banda: {t}', 'Band: {t}'], dot_more: [['e mais {n} álbum', 'e mais {n} álbuns'], ['and {n} more album', 'and {n} more albums']],
  nav_ideas: ['Ideias', 'Ideas'], idea_one: ['Ideia', 'Idea'], ideas_n: [['{n} ideia', '{n} ideias'], ['{n} idea', '{n} ideas']],
  ideas_sub: ['Riffs, melodias e exercícios que ainda não são músicas.', 'Riffs, melodies and exercises that are not songs yet.'],
  new_idea: ['Nova ideia', 'New idea'], new_idea_t: ['Nova ideia', 'New idea'], idea_name: ['Nome de trabalho', 'Working name'], idea_ph: ['Ex.: Riff em Mi palhetado 2014', 'E.g. Picked E riff 2014'],
  idea_kind: ['Tipo', 'Type'], no_kind: ['Sem tipo', 'No type'], kind_new: ['Novo tipo…', 'New type…'], kind_new_t: ['Novo tipo de ideia', 'New idea type'], kind_name: ['Nome do tipo', 'Type name'], kind_ph: ['Ex.: Progressão, Solo, Groove', 'E.g. Progression, Solo, Groove'],
  k_riff: ['Riff', 'Riff'], k_melody: ['Melodia', 'Melody'], k_harmony: ['Harmonia', 'Harmony'], k_scale: ['Escala', 'Scale'], k_exercise: ['Exercício', 'Exercise'],
  search_ideas_ph: ['Buscar por nome, tom, afinação, anotação ou tipo', 'Search by name, key, tuning, note or type'],
  ideas_empty_t: ['Nenhuma ideia ainda', 'No ideas yet'], ideas_empty_p: ['Na Lista de arquivos, use "Ideia" nos riffs e melodias que têm futuro. Eles chegam aqui para você trabalhar até virarem música.', 'In the File list, use "Idea" on the riffs and melodies worth keeping. They land here for you to work on until they become songs.'],
  to_ideas: ['Enviar para Ideias', 'Send to Ideas'], to_ideas_short: ['Ideia', 'Idea'], to_ideas_many: [['{n} item vira {n} ideia', '{n} itens viram {n} ideias, uma para cada'], ['{n} item becomes {n} idea', '{n} items become {n} ideas, one each']],
  to_ideas_hint: ['Cada item vira uma ideia própria, com os arquivos dele. Depois, na ideia, você pode transformá-la em música.', 'Each item becomes its own idea with its files. Later, on the idea, you can turn it into a song.'],
  idea_created: ['Ideia criada: {t}', 'Idea created: {t}'], ideas_created: [['{n} ideia criada', '{n} ideias criadas'], ['{n} idea created', '{n} ideas created']],
  idea_since: ['Ideia desde {d}', 'Idea since {d}'], idea_no_files: ['Adicione o áudio, a tablatura ou o MIDI desta ideia.', 'Add the audio, tab or MIDI of this idea.'],
  idea_files_hint: ['Ideias guardam áudio, tablatura, partitura e MIDI. Use a Sala de audição para estudar e o visualizador de tablatura para tocar junto.', 'Ideas hold audio, tabs, scores and MIDI. Use the Listening room to study and the tab viewer to play along.'],
  idea_notes_ph: ['Acordes, digitação, para onde a ideia pode ir…', 'Chords, fingering, where the idea could go…'],
  promote: ['Transformar em música', 'Turn into a song'], promote_p: ['A ideia sai de Ideias e vira uma música, com todos os arquivos, anotações e marcadores.', 'The idea leaves Ideas and becomes a song, with every file, note and marker.'],
  promoted_toast: ['"{t}" agora é uma música.', '"{t}" is now a song.'], merge: ['Juntar a uma música', 'Add to a song'],
  merge_p: ['Os arquivos de "{t}" entram como uma versão nova da música escolhida, e as anotações viram um texto dela. A ideia deixa de existir.', 'The files of "{t}" become a new version of the chosen song, and the notes become one of its texts. The idea stops existing.'],
  merged_toast: ['Ideia juntada a "{t}".', 'Idea added to "{t}".'], delete_idea: ['Excluir ideia', 'Delete idea'], delete_idea_t: ['Excluir esta ideia?', 'Delete this idea?'],
  delete_idea_p: ['A ideia e os arquivos dela vão para a Lixeira. Dá para restaurar depois.', 'The idea and its files go to the Trash. You can restore them later.'],
  no_songs_yet: ['Você ainda não tem músicas. Use "Transformar em música".', 'You have no songs yet. Use "Turn into a song".'],
  born_as_idea: ['Nasceu como ideia em {a} e virou música em {b}.', 'Started as an idea on {a} and became a song on {b}.'],
  sec_ideas: ['Ideias recentes', 'Recent ideas'], idea_trashed: ['Ideia enviada para a Lixeira.', 'Idea moved to the Trash.'], res_ideas: ['Ideias', 'Ideas'],
  midi_title: ['Player de MIDI', 'MIDI player'], loading_midi: ['Carregando MIDI…', 'Loading MIDI…'], open_midi_x: ['Tocar {x}', 'Play {x}'],
  midi_hint: ['Clique no piano roll para tocar dali. Solo e Mudo valem por faixa. Espaço toca e pausa, F tela cheia.', 'Click the piano roll to play from there. Solo and Mute work per track. Space plays and pauses, F full screen.'],
  midi_error: ['Não deu para ler este MIDI. O arquivo pode estar corrompido ou usar um formato raro (SMPTE).', 'Could not read this MIDI. The file may be damaged or use a rare format (SMPTE).'],
  midi_empty: ['Este MIDI não tem notas.', 'This MIDI has no notes.'], midi_no_audio: ['Este navegador não consegue tocar MIDI.', 'This browser cannot play MIDI.'],
  drums: ['Bateria', 'Drums'], tracks_n: [['{n} faixa', '{n} faixas'], ['{n} track', '{n} tracks']], notes_n: [['{n} nota', '{n} notas'], ['{n} note', '{n} notes']],
  ast_idea: ['Ideia', 'Idea'], ast_in_progress: ['Em desenvolvimento', 'In progress'], ast_ready: ['Pronto', 'Ready'], ast_recorded: ['Gravado', 'Recorded'],
  group_by: ['Agrupar', 'Group by'], group_none: ['Nada', 'Nothing'], group_style: ['Estilo', 'Style'], group_status: ['Status', 'Status'], group_band: ['Banda', 'Band'],
  no_style: ['Sem estilo', 'No style'], no_band_group: ['Sem banda', 'No band'], search_albums_ph: ['Buscar álbum, banda, gravadora…', 'Search album, band, label…'],
  search_bands_ph: ['Buscar banda', 'Search band'], search_artists_ph: ['Buscar artista ou função', 'Search artist or role'],
  sort_recent: ['Alterados recentemente', 'Recently changed'], sort_name: ['Nome (A–Z)', 'Name (A–Z)'],
  open_in_sala: ['Abrir na Sala de audição', 'Open in the Listening room'], fullscreen: ['Tela cheia', 'Full screen'], exit_fullscreen: ['Sair da tela cheia', 'Exit full screen'], volume: ['Volume', 'Volume'],
  app_about: ['O MDoP é para você guardar, organizar e achar fácil as suas músicas: cada ideia gravada, cada versão, tablatura, MIDI, letra e capa num lugar só, no seu próprio servidor.', 'MDoP is for keeping, organizing and easily finding your music: every recorded idea, version, tab, MIDI, lyric and cover in one place, on your own server.'],
  sala_title: ['Sala de audição', 'Listening room'], open_sala_x: ['Abrir {x} na Sala de audição', 'Open {x} in the Listening room'],
  tab_view_x: ['Ver a tablatura de {x}', 'View the tab of {x}'], sala_file: ['Arquivo', 'File'],
  loading_wave: ['Desenhando a forma de onda…', 'Drawing the waveform…'], big_file: ['Arquivo grande: pode demorar um pouco.', 'Large file: this may take a moment.'],
  wave_error: ['Não deu para abrir este áudio aqui. O navegador pode não suportar esse formato.', 'Could not open this audio here. The browser may not support this format.'],
  vendor_fail: ['Não deu para carregar o visualizador. Recarregue a página.', 'Could not load the viewer. Reload the page.'],
  speed: ['Velocidade', 'Speed'], pitch_note: ['A afinação não muda.', 'Pitch stays the same.'], zoom: ['Zoom', 'Zoom'], zoom_in: ['Aproximar', 'Zoom in'], zoom_out: ['Afastar', 'Zoom out'],
  loop: ['Trecho', 'Loop'], set_a: ['Ponto A', 'Point A'], set_b: ['Ponto B', 'Point B'], loop_on: ['Repetir', 'Repeat'], loop_clear: ['Limpar trecho', 'Clear loop'], loop_save: ['Salvar trecho', 'Save loop'],
  loop_hint: ['Arraste na forma de onda para marcar um trecho, ou use os pontos A e B.', 'Drag on the waveform to mark a loop, or use points A and B.'],
  need_a: ['Marque o ponto A antes do B.', 'Set point A before B.'],
  markers: ['Marcadores e trechos', 'Markers and loops'], add_marker: ['Marcador', 'Marker'], marker_n: ['Marcador {n}', 'Marker {n}'], loop_n: ['Trecho {n}', 'Loop {n}'],
  marker_added: ['Marcador em {x}.', 'Marker at {x}.'], loop_saved: ['Trecho salvo.', 'Loop saved.'],
  no_markers: ['Nenhum marcador ainda. Aperte M enquanto a música toca para marcar um momento, ou salve um trecho.', 'No markers yet. Press M while the song plays to mark a moment, or save a loop.'],
  marker_label: ['Nome do marcador', 'Marker name'], go_to: ['Ir para {x}', 'Go to {x}'], delete_marker: ['Excluir marcador', 'Delete marker'],
  back5: ['Voltar 5 segundos', 'Back 5 seconds'], fwd5: ['Avançar 5 segundos', 'Forward 5 seconds'], shortcuts: ['Atalhos', 'Shortcuts'],
  shortcuts_text: ['Espaço toca e pausa · ← → 5 s (Shift: 1 s) · A e B marcam o trecho · L repete · M marcador · 1 a 9 vão ao marcador · + − zoom · [ ] velocidade', 'Space play/pause · ← → 5 s (Shift: 1 s) · A and B set the loop · L repeat · M marker · 1 to 9 jump to marker · + − zoom · [ ] speed'],
  about_song: ['Sobre a música', 'About the song'], edit_song: ['Editar música', 'Edit song'], sala_other: ['Outros arquivos', 'Other files'],
  no_audio_t: ['Nenhum áudio nesta música', 'No audio in this song'], no_audio_p: ['Adicione um áudio para ouvir na Sala de audição.', 'Add an audio file to listen in the Listening room.'],
  untitled: ['Sem título', 'Untitled'], download: ['Baixar', 'Download'],
  tab_title: ['Tablatura', 'Tab'], tracks: ['Faixas', 'Tracks'], track: ['Faixa', 'Track'], metronome: ['Metrônomo', 'Metronome'], count_in: ['Contagem', 'Count-in'], loop_sel: ['Repetir', 'Repeat'],
  layout: ['Layout', 'Layout'], layout_page: ['Página', 'Page'], layout_h: ['Horizontal', 'Horizontal'], stop: ['Parar', 'Stop'],
  loading_score: ['Carregando partitura…', 'Loading score…'], rendering: ['Desenhando…', 'Rendering…'], loading_sound: ['Carregando sons… {p}%', 'Loading sounds… {p}%'],
  tab_error: ['Não deu para abrir esta tablatura. O visualizador lê Guitar Pro 3 a 8 (.gp3, .gp4, .gp5, .gpx, .gp) e MusicXML.', 'Could not open this tab. The viewer reads Guitar Pro 3 to 8 (.gp3, .gp4, .gp5, .gpx, .gp) and MusicXML.'],
  mute: ['Mudo', 'Mute'], solo: ['Solo', 'Solo'],
  tab_hint: ['Clique numa nota para tocar dali. Arraste para selecionar um trecho e ligue Repetir. Espaço toca e pausa.', 'Click a note to play from there. Drag to select a passage and turn on Repeat. Space plays and pauses.'],
  glass_note: ['Na página de uma música, álbum, banda ou artista, o fundo é a capa dela. Com uma música tocando, a capa da música. No resto, a imagem abaixo. Em computadores mais fracos pode pesar um pouco.', 'On a song, album, band or artist page the background is its cover. While a song plays, that song\'s cover. Everywhere else, the image below. It may be a bit heavier on slower computers.'],
  bg_title: ['Imagem de fundo', 'Background image'], bg_none: ['Sem imagem: usa um degradê com a cor de destaque.', 'No image: uses a gradient with the accent color.'],
  bg_choose: ['Escolher imagem', 'Choose image'], bg_change: ['Trocar imagem', 'Change image'], bg_saved: ['Imagem de fundo salva.', 'Background image saved.'], bg_removed: ['Imagem de fundo removida.', 'Background image removed.'],
  home_search_ph: ['Buscar em tudo: músicas, álbuns, bandas, artistas e Lista de arquivos', 'Search everything: songs, albums, bands, artists and File list'],
  res_songs: ['Músicas', 'Songs'], res_loose: ['Na Lista de arquivos', 'In the File list'], res_none_t: ['Nada encontrado', 'Nothing found'], res_none_p: ['Tente outra palavra, um pedaço do nome ou o nome de um artista.', 'Try another word, part of a name or an artist name.'],
  res_loose_more: [['e mais {n} item', 'e mais {n} itens'], ['and {n} more item', 'and {n} more items']], open_in_list: ['Abrir na Lista', 'Open in list'],
  dash_library: ['Seu acervo', 'Your collection'], dash_done: ['{p}% prontas ou gravadas', '{p}% ready or recorded'], dash_files: ['Arquivos', 'Files'],
  dash_used: ['{s} em uso', '{s} in use'], dash_random: ['Redescubra', 'Rediscover'], dash_random_p: ['Uma música sua, ao acaso.', 'One of your songs, at random.'],
  another: ['Outra', 'Another'], open: ['Abrir', 'Open'], gp_short: ['Guitar Pro', 'Guitar Pro'], other_files: ['Outros', 'Other'],
  view_grid: ['Cards grandes', 'Large cards'], view_mini: ['Miniaturas', 'Thumbnails'], view_list: ['Lista', 'List'], view_mode: ['Modo de exibição', 'View mode'],
  show_more: ['Mostrar mais', 'Show more'], col_title: ['Nome', 'Name'], col_status: ['Status', 'Status'], col_formats: ['Formatos', 'Formats'], col_updated: ['Alterada', 'Changed'],
  // desktop app only (app/desktop.py). A key ending in _dk replaces the plain key in the desktop app.
  open_with: ['Abrir com o programa padrão', 'Open with the default program'], open_with_x: ['Abrir {x} com o programa padrão', 'Open {x} with the default program'],
  opened_x: ['“{x}” aberto. Ao salvar lá, o MDoP oferece guardar como nova versão.', '“{x}” opened. When you save it there, MDoP offers to keep it as a new version.'],
  edit_found: ['“{x}” foi alterado em outro programa.', '“{x}” was changed in another program.'], edit_in: ['Em “{t}”', 'In “{t}”'],
  edit_save: ['Salvar como nova versão', 'Save as new version'], edit_ignore: ['Ignorar', 'Ignore'],
  edit_label: ['Editado: {x}', 'Edited: {x}'], edit_saved: ['Salvo como v{n}. O original não foi alterado.', 'Saved as v{n}. The original was not changed.'], open_song: ['Abrir', 'Open'],
  folder_path: ['Caminho da pasta', 'Folder path'], choose_folder: ['Escolher pasta', 'Choose folder'],
  show_folder: ['Mostrar a pasta', 'Show the folder'], import_add: ['Adicionar pasta de importação', 'Add import folder'], remove_x: ['Remover {x}', 'Remove {x}'],
  import_folders_note: ['Pastas que aparecem em Adicionar arquivos → Pastas de importação. O MDoP só lê essas pastas, a não ser que você escolha mover os arquivos.', 'Folders shown in Add files → Import folders. MDoP only reads them, unless you choose to move the files.'],
  library_other: ['Usar outra pasta…', 'Use another folder…'], no_import_roots: ['Nenhuma pasta ainda.', 'No folders yet.'],
  library_switch_t: ['Usar esta pasta como biblioteca?', 'Use this folder as the library?'],
  library_switch_p: ['O MDoP passa a usar “{p}” na próxima vez que for aberto. Nada é movido nem copiado: para levar sua biblioteca atual, feche o MDoP e copie a pasta inteira para lá antes de abrir de novo.', 'MDoP will use “{p}” the next time it opens. Nothing is moved or copied: to take your current library along, close MDoP and copy the whole folder there before opening it again.'],
  library_switch_ok: ['Pronto. Feche e abra o MDoP para usar a nova pasta.', 'Done. Close and reopen MDoP to use the new folder.'],
  library_next: ['Na próxima abertura: {p}', 'On the next start: {p}'], use_folder: ['Usar esta pasta', 'Use this folder'],
  sfx_add_root: ['Adicionar pasta de efeitos', 'Add effects folder'],
  tab_server_dk: ['Pastas de importação', 'Import folders'],
  no_roots_t_dk: ['Nenhuma pasta de importação', 'No import folder'],
  no_roots_p_dk: ['Escolha as pastas de onde você quer importar em Configurações → Biblioteca.', 'Choose the folders you want to import from in Settings → Library.'],
  settings_note_dk: ['As configurações ficam salvas na sua biblioteca.', 'Settings are saved in your library.'],
  no_connection_dk: ['O MDoP parou de responder. Feche e abra de novo.', 'MDoP stopped responding. Close it and open it again.'],
  path_server_dk: ['Pasta da biblioteca', 'Library folder'],
  forgot_dk: ['Esqueceu a senha? Abra um terminal e rode o MDoP assim:', 'Forgot the password? Open a terminal and run MDoP like this:'],
  backup_note_dk: ['Um arquivo .zip com o banco de dados e todas as pastas da biblioteca. Guarde uma cópia fora deste computador de vez em quando (outro HD, a nuvem).', 'A .zip file with the database and every library folder. Keep a copy off this computer now and then (another drive, the cloud).'],
  backup_create_dk: ['Criar backup na pasta de backups', 'Create backup in the backup folder'],
  restoring_p_dk: ['A biblioteca está sendo trocada. Não feche o MDoP.', 'The library is being replaced. Do not close MDoP.'],
  migrate_p_dk: ['Esta versão usa nomes de pastas em inglês. O MDoP está renomeando as pastas da sua biblioteca (nada é apagado). Leva poucos segundos; não feche o MDoP.', 'This version uses English folder names. MDoP is renaming the folders of your library (nothing is deleted). It takes a few seconds; do not close MDoP.'],
  sfx_noroot_p_dk: ['Nenhuma pasta de efeitos ainda. Adicione em Configurações → Efeitos sonoros (o MDoP só lê essas pastas).', 'No effects folder yet. Add one in Settings → Sound effects (MDoP only reads these folders).'],
  app_about_dk: ['O MDoP é para você guardar, organizar e achar fácil as suas músicas: cada ideia gravada, cada versão, tablatura, MIDI, letra e capa num lugar só, no seu próprio computador.', 'MDoP is for keeping, organizing and easily finding your music: every recorded idea, version, tab, MIDI, lyric and cover in one place, on your own computer.'],
};
// "" in Settings = follow the browser
const BROWSER_LANG = (navigator.language || 'en').toLowerCase().startsWith('pt') ? 'pt' : 'en';
const pickLang = (v) => (v === 'pt' || v === 'en' ? v : BROWSER_LANG);
let LANG = BROWSER_LANG;
let IS_DESKTOP = false;  // desktop app (set from /api/meta)
function t(key, vars = {}) {
  const v = (IS_DESKTOP && STR[`${key}_dk`]) || STR[key];
  let s = v ? v[LANG === 'en' ? 1 : 0] : key;
  if (Array.isArray(s)) s = s[(vars.n ?? 0) === 1 ? 0 : 1];
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}
const tn = (key, n) => t(key, { n });

// ================================================================ utilities
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const STATUSES = ['idea', 'in_progress', 'ready', 'recorded'];  // albums
const SONG_STATUSES = ['in_progress', 'ready', 'recorded'];        // songs: ideas live in the Ideas tab
const stLabel = (s) => t(`st_${s}`);
const TUNINGS = ['Padrão (E)', 'Meio tom abaixo (Eb)', 'Drop D', 'Drop C#', 'Drop C', 'D padrão', 'DADGAD', 'Open G', 'Open D', '7 cordas (B)', '8 cordas (F#)'];
const ACCENTS = { yellow: '#F2B544', blue: '#6AA5F5', green: '#4CC38A', red: '#F07A6E', purple: '#A98BF0' };

const CAT = {
  audio: new Set(['mp3', 'wav', 'm4a', 'mp4', 'aac', 'ogg', 'oga', 'opus', 'flac', 'aif', 'aiff', 'wma', 'amr', '3gp', 'caf', 'webm']),
  score: new Set(['mid', 'midi', 'gp', 'gp3', 'gp4', 'gp5', 'gpx', 'gtp', 'tg', 'ptb', 'xml', 'musicxml', 'mxl', 'mscz']),
  image: new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']),
};
const GP_EXTS = new Set(['gp', 'gp3', 'gp4', 'gp5', 'gpx', 'gtp', 'tg', 'ptb']);
const TEXT_EXTS = new Set(['txt', 'md', 'pdf', 'doc', 'docx', 'rtf', 'odt']);
function fileIcon(ext) {
  if (CAT.audio.has(ext)) return ICON.ftAudio;
  if (ext === 'mid' || ext === 'midi') return ICON.ftMidi;
  if (GP_EXTS.has(ext)) return ICON.ftGp;
  if (CAT.score.has(ext)) return ICON.ftScore;
  if (CAT.image.has(ext)) return ICON.ftImage;
  if (TEXT_EXTS.has(ext)) return ICON.ftText;
  return ICON.ftOther;
}
const category = (ext) => (CAT.audio.has(ext) ? 'audio' : CAT.score.has(ext) ? 'score' : CAT.image.has(ext) ? 'image' : 'other');

const USERS_PATH = '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>';
const svg = (w, body, fill = 'none') => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="${fill}" stroke="${fill === 'none' ? 'currentColor' : 'none'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const ICON = {
  refresh: svg(16, '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
  eyeOff: svg(16, '<path d="M3 3l18 18"/><path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-2.6 3.2M6.6 6.6C4.3 8.1 3 12 3 12s4 6 9 6a9.4 9.4 0 0 0 4.4-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  notes: '<svg viewBox="0 0 24 24" width="44" height="44" fill="currentColor" aria-hidden="true"><path d="M9 18.5V6.2L20 3.5v12.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8.6 20 5.9" fill="none" stroke="currentColor" stroke-width="3.2"/><ellipse cx="6.6" cy="18.6" rx="3" ry="2.3" transform="rotate(-20 6.6 18.6)"/><ellipse cx="17.6" cy="15.8" rx="3" ry="2.3" transform="rotate(-20 17.6 15.8)"/></svg>',
  bulb: svg(18, '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2l.1.7h4.8l.1-.7c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z"/>'),
  arrowUp: svg(16, '<path d="M12 19V5M5 12l7-7 7 7"/>'),
  expand: svg(18, '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>'),
  shrink: svg(18, '<path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5"/>'),
  volume: svg(16, '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  headphones: svg(18, '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'),
  back5: svg(20, '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><text x="12" y="15.5" font-size="7.5" text-anchor="middle" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">5</text>'),
  fwd5: svg(20, '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/><text x="12" y="15.5" font-size="7.5" text-anchor="middle" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">5</text>'),
  repeat: svg(16, '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>'),
  flag: svg(16, '<path d="M4 22V4M4 4h12l-2 4 2 4H4"/>'),
  stop: svg(18, '<rect x="6" y="6" width="12" height="12" rx="1.5"/>', 'currentColor'),
  metronome: svg(16, '<path d="M8 3h8l4 18H4z"/><path d="M12 15l5-9"/>'),
  viewGrid: svg(18, '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>'),
  viewMini: svg(18, '<rect x="3" y="3" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="3" width="4.5" height="4.5" rx="1"/><rect x="16.5" y="3" width="4.5" height="4.5" rx="1"/><rect x="3" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="16.5" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="3" y="16.5" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="16.5" width="4.5" height="4.5" rx="1"/><rect x="16.5" y="16.5" width="4.5" height="4.5" rx="1"/>'),
  viewList: svg(18, '<path d="M9 6h12M9 12h12M9 18h12"/><rect x="3" y="4.5" width="3" height="3" rx=".5"/><rect x="3" y="10.5" width="3" height="3" rx=".5"/><rect x="3" y="16.5" width="3" height="3" rx=".5"/>'),
  shuffle: svg(16, '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
  play: svg(20, '<path d="M8 5v14l11-7z"/>', 'currentColor'),
  pause: svg(20, '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>', 'currentColor'),
  prev: svg(18, '<path d="M6 5h2v14H6zM20 5v14L9 12z"/>', 'currentColor'),
  next: svg(18, '<path d="M16 5h2v14h-2zM4 5v14l11-7z"/>', 'currentColor'),
  plus: svg(18, '<path d="M12 5v14M5 12h14"/>'),
  upload: svg(18, '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>'),
  download: svg(18, '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>'),
  downloadSm: svg(15, '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>'),
  search: svg(18, '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  grid: svg(18, '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
  disc: svg(18, '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>'),
  discLg: svg(64, '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>'),
  wave: svg(18, '<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"/>'),
  users: svg(18, USERS_PATH),
  usersSm: svg(13, USERS_PATH),
  heart: svg(18, '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  heartFull: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  star: svg(18, '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.4l-5.6 2.9 1.1-6.2L3 9.7l6.2-.9z"/>'),
  starFull: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.4l-5.6 2.9 1.1-6.2L3 9.7l6.2-.9z"/></svg>',
  image: svg(26, '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
  imageSm: svg(15, '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
  folder: svg(15, '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  file: svg(20, '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
  music: svg(20, '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  more: svg(18, '<circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>', 'currentColor'),
  close: svg(18, '<path d="M6 6l12 12M18 6L6 18"/>'),
  back: svg(16, '<path d="M15 18l-6-6 6-6"/>'),
  up: svg(16, '<path d="M18 15l-6-6-6 6"/>'),
  down: svg(16, '<path d="M6 9l6 6 6-6"/>'),
  minus: svg(16, '<path d="M5 12h14"/>'),
  tag: svg(16, '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  layers: svg(18, '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'),
  gear: svg(18, '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  mic: svg(18, '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>'),
  edit: svg(15, '<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
  home: svg(18, '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  inbox: svg(18, '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v6H3v-6z"/>'),
  bookmark: svg(18, '<path d="M6 3h12v18l-6-4-6 4z"/>'),
  bookmarkFull: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  copy: svg(18, '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'),
  restore: svg(17, '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  zip: svg(18, '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M11 7h2M11 10h2M11 13h2v3h-2z"/>'),
  lock: svg(18, '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  ftAudio: svg(22, '<path d="M3 12h2M7 8v8M11 4v16M15 7v10M19 10v4M21 12h0"/>'),
  ftMidi: svg(22, '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v10M12 4v10M16 4v10M6 14h4M14 14h4M8 14v6M16 14v6"/>'),
  ftGp: svg(22, '<path d="M12 3c4.5 0 8 2.3 8 6.2 0 5-5 11.8-8 11.8S4 14.2 4 9.2C4 5.3 7.5 3 12 3z"/><path d="M8.5 9h7M9.5 12.5h5"/>'),
  ftScore: svg(22, '<path d="M3 7h18M3 11h18M3 15h18"/><circle cx="9" cy="17" r="2"/><path d="M11 17V5l5 2"/>'),
  ftImage: svg(22, '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
  ftText: svg(22, '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'),
  ftOther: svg(22, '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
  trash: svg(17, '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  text: svg(18, '<path d="M4 6h16M4 12h16M4 18h10"/>'),
  external: svg(18, '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
};

const probe = document.createElement('audio');
// m4a/mp4 ask for the AAC codec: "audio/mp4" alone says "maybe" even where AAC cannot play (Linux Qt window, some browsers)
const MIME = { mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4; codecs="mp4a.40.2"', mp4: 'audio/mp4; codecs="mp4a.40.2"', aac: 'audio/mp4; codecs="mp4a.40.2"', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg; codecs=opus', flac: 'audio/flac', webm: 'audio/webm' };
const canPlay = (ext) => !!MIME[ext] && probe.canPlayType(MIME[ext]) !== '';

function fmtSize(b) {
  const dec = LANG === 'en' ? '.' : ',';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1073741824) return `${(b / 1048576).toFixed(1).replace('.', dec)} MB`;
  return `${(b / 1073741824).toFixed(2).replace('.', dec)} GB`;
}
function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s.replace(' ', 'T') + 'Z');
  return isNaN(d) ? s : d.toLocaleDateString(LANG === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(x) {
  if (!isFinite(x)) return '0:00';
  return `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
}
const debounce = (fn, ms) => { let h; return (...a) => { clearTimeout(h); h = setTimeout(() => fn(...a), ms); }; };
const initialsOf = (s) => (s || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
const bgImg = (url) => (url ? `background-image:url('${esc(url)}')` : '');

async function api(method, url, body) {
  const opt = { method, headers: {} };
  if (url.startsWith('/api/desktop')) opt.headers['X-MDoP-Desktop'] = '1';  // desktop-only routes ask for it
  if (body instanceof FormData) opt.body = body;
  else if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(url, opt); } catch { throw new Error(t('no_connection')); }
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (res.status === 401) { showLogin(); throw new Error('login'); }
  if (res.status === 503 && data?.detail === 'restoring') { showRestoring(); throw new Error('login'); }
  if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : t('err_generic', { n: res.status }));
  return data;
}

function toast(msg, { error = false, link = null } = {}) {
  const el = document.createElement('div');
  el.className = 'toast' + (error ? ' error' : '');
  el.innerHTML = `<span>${esc(msg)}</span>${link ? `<a href="${esc(link.href)}">${esc(link.label)}</a>` : ''}`;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), error ? 7000 : link ? 6000 : 3500);
}
async function run(fn) {
  try { return await fn(); } catch (e) { if (e.message !== 'login') toast(e.message, { error: true }); return undefined; }
}

// ================================================================ state, settings and navigation
const state = { meta: null, albums: [] };
let viewCleanup = null;  // pages with their own player (Listening room, tab viewer) stop everything when left

// menu parts that can be switched off (Settings → Menu). Switching off only hides: nothing is deleted.
const OPTIONAL_MODULES = ['ideas', 'sfx', 'albums', 'bands', 'artists', 'favorites'];
const isOn = (mod) => !(state.meta?.settings?.hidden || '').split(',').includes(mod);
function applySettings(s) {
  LANG = pickLang(s.lang);
  const root = document.documentElement;
  const hidden = (s.hidden || '').split(',');
  OPTIONAL_MODULES.forEach((m) => root.classList.toggle(`hide-${m}`, hidden.includes(m)));
  root.lang = LANG === 'en' ? 'en' : 'pt-BR';
  root.dataset.theme = s.theme || 'dark';
  root.dataset.accent = s.accent || 'yellow';
  $('#player-prev').setAttribute('aria-label', t('prev'));
  $('#player-prev').innerHTML = ICON.prev;
  $('#player-next').setAttribute('aria-label', t('next'));
  $('#player-next').innerHTML = ICON.next;
  $('#player-sala').setAttribute('aria-label', t('open_in_sala'));
  $('#player-sala').setAttribute('title', t('open_in_sala'));
  $('#player-sala').innerHTML = ICON.headphones;
  $('#player-close').setAttribute('aria-label', t('close_player'));
  $('#player-close').innerHTML = ICON.close;
  $('#player-seek').setAttribute('aria-label', t('position'));
  updatePlayButton();
}

// addresses used by early versions (bookmarks keep working)
const OLD_ROUTES = { musicas: 'songs', musica: 'song', favoritas: 'favorites', albuns: 'albums', bandas: 'bands', banda: 'band',
  arquivos: 'files', audios: 'files', artistas: 'artists', artista: 'artist', sala: 'listen', tablatura: 'tab', ideias: 'ideas',
  ideia: 'idea', lixeira: 'trash', configuracoes: 'settings' };
function route() {
  const h = location.hash.slice(1) || '/';
  const [path, qs] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  if (OLD_ROUTES[parts[0]] || parts[1] === 'lista') {
    if (OLD_ROUTES[parts[0]]) parts[0] = OLD_ROUTES[parts[0]];
    if (parts[1] === 'lista') parts[1] = 'list';
    history.replaceState(null, '', `#/${parts.join('/')}${qs ? `?${qs}` : ''}`);
  }
  return { parts, params: new URLSearchParams(qs || '') };
}
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

async function refreshNav() {
  const [meta, albums] = await Promise.all([api('GET', '/api/meta'), api('GET', '/api/albums')]);
  state.meta = meta; state.albums = albums;
  IS_DESKTOP = !!meta.desktop;
  document.documentElement.classList.toggle('is-desktop', IS_DESKTOP);
  if (IS_DESKTOP) startEditWatch();  // also catches files opened before a page reload
  applySettings(meta.settings);
  const r = route();
  const p0 = r.parts[0];
  const link = (href, icon, label, count, active, badge = false) =>
    `<a class="nav-link ${active ? 'active' : ''}" href="${href}">${icon}<span>${esc(label)}</span>${count !== null ? `<span class="${badge && count ? 'badge' : 'count'}">${count}</span>` : ''}</a>`;
  $('#sidebar').innerHTML = `
    <a class="brand" href="#/" aria-label="MDoP — Musical Display of Power"><span class="brand-mark" aria-hidden="true">MDoP</span><span class="brand-name" aria-hidden="true">Musical Display<br>of Power</span></a>
    <div class="nav-group nav-main">
      ${link('#/', ICON.home, t('nav_home'), null, !p0)}
      ${link('#/songs', ICON.grid, t('nav_songs'), meta.songs, p0 === 'songs')}
      ${isOn('ideas') ? link('#/ideas', ICON.bulb, t('nav_ideas'), meta.ideas, p0 === 'ideas' || p0 === 'idea') : ''}
      ${isOn('sfx') ? link('#/sfx', ICON.wave, t('nav_sfx'), meta.sfx?.count || null, p0 === 'sfx') : ''}
      ${isOn('albums') ? link('#/albums', ICON.disc, t('nav_albums'), meta.albums, p0 === 'albums' || p0 === 'album') : ''}
      ${isOn('bands') ? link('#/bands', ICON.users, t('nav_bands'), meta.bands.length, p0 === 'bands' || p0 === 'band') : ''}
      ${isOn('artists') ? link('#/artists', ICON.mic, t('nav_artists'), meta.artists, p0 === 'artists' || p0 === 'artist') : ''}
      ${isOn('favorites') ? link('#/favorites', ICON.heart, t('nav_favs'), meta.favorites, p0 === 'favorites') : ''}
      ${link('#/files', ICON.inbox, t('nav_loose'), meta.loose, p0 === 'files', true)}
    </div>
    <div class="sidebar-bottom">
      ${link('#/trash', ICON.trash, t('nav_trash'), meta.trash || null, p0 === 'trash')}
      ${link('#/settings', ICON.gear, t('nav_settings'), null, p0 === 'settings')}
      <div class="library-box"><span>${esc(t('library'))}</span><strong>${esc(meta.library_host || meta.library)}</strong><span>${tn('files_n', meta.files)} · ${fmtSize(meta.bytes)}</span></div>
    </div>`;
}

async function render() {
  const r = route();
  const view = $('#view');
  await run(refreshNav);
  if (!state.meta) return;
  if (r.parts[0] !== 'files') loose.active = false;
  if (viewCleanup) { const fn = viewCleanup; viewCleanup = null; try { fn(); } catch { /* nothing to clean up */ } }
  pageRerender = null;
  glass.page = null;
  refreshGlass();
  try {
    const [p0, p1] = r.parts;
    
    if (!p0) await viewHome(view);
    else if (p0 === 'songs') await viewLibrary(view, r.params);
    else if (p0 === 'favorites') await viewLibrary(view, r.params, true);
    else if (p0 === 'song') await viewSong(view, Number(p1));
    else if (p0 === 'albums') await viewAlbums(view);
    else if (p0 === 'album') await viewAlbum(view, Number(p1));
    else if (p0 === 'bands') await viewBands(view);
    else if (p0 === 'band') await viewBand(view, Number(p1));
    else if (p0 === 'files') await viewLoose(view);
    else if (p0 === 'artists') await viewArtists(view);
    else if (p0 === 'artist') await viewArtist(view, Number(p1));
    else if (p0 === 'listen') await viewSala(view, Number(p1), r.params);
    else if (p0 === 'tab') await viewTab(view, r.parts);
    else if (p0 === 'midi') await viewMidi(view, r.parts, r.params);
    else if (p0 === 'ideas') await viewIdeas(view);
    else if (p0 === 'sfx') await viewSfx(view);
    else if (p0 === 'idea') await viewIdea(view, Number(p1));
    else if (p0 === 'trash') await viewTrash(view);
    else if (p0 === 'settings') viewSettings(view, p1);
    else go('#/');
  } catch (e) {
    if (e.message === 'login') { showLogin(); return; }
    view.innerHTML = `<div class="empty"><h2>${esc(t('couldnt_open'))}</h2><p>${esc(e.message)}</p><a class="btn" href="#/">${esc(t('back_library'))}</a></div>`;
  }
}

// ================================================================ covers
function pickImage() {
  return new Promise((resolve) => {
    const input = $('#hidden-image-input');
    input.value = '';
    input.onchange = () => resolve(input.files[0] || null);
    input.click();
  });
}
async function uploadCover(kind, id) {
  const file = await pickImage();
  if (!file) return false;
  const fd = new FormData();
  fd.append('image', file);
  const ok = await run(() => api('POST', `/api/${kind}/${id}/${kind === 'artists' ? 'photo' : 'cover'}`, fd));
  if (ok) toast(t('cover_updated'));
  return !!ok;
}

// ================================================================ cards
// song cover without an image: two eighth notes (any image can replace it on the song page)
const noteCover = (extra = '') => `<span class="note-mark" aria-hidden="true">${ICON.notes}</span>${extra}`;
// album and band circles: hovering shows the name, clicking opens the page
function linkDots(s, small = false) {
  const dots = [];
  const dot = (href, img, title, tip, round) => `<a class="link-dot${round ? ' round' : ''}" href="${href}" style="${bgImg(img)}" data-tip="${esc(tip)}" aria-label="${esc(tip)}">${img ? '' : esc(initialsOf(title))}</a>`;
  if (isOn('albums') && s.albums?.length) dots.push(dot(`#/album/${s.albums[0].id}`, s.albums[0].thumb, s.albums[0].title, t('dot_album', { t: s.albums[0].title }), false));
  if (isOn('bands') && s.band) dots.push(dot(`#/band/${s.band.id}`, s.band.thumb, s.band.title, t('dot_band', { t: s.band.title }), true));
  const more = isOn('albums') && s.albums?.length > 1 ? `<span class="link-more" title="${esc(s.albums.slice(1).map((a) => a.title).join(', '))}">+${s.albums.length - 1}</span>` : '';
  return dots.length ? `<span class="link-dots${small ? ' small' : ''}">${dots.join('')}${more}</span>` : '';
}
function songCard(s, mode = 'grid') {
  if (mode === 'mini') return songMini(s);
  if (mode === 'list') return songRow(s);
  const main = s.main_file;
  const playable = main && canPlay(main.ext);
  const playBtn = playable ? `<button class="play-btn" data-action="play-song" data-id="${s.id}" aria-label="${esc(t('play_x', { x: s.title }))}">${ICON.play}</button>` : '';
  const cover = s.cover_url
    ? `<div class="cover" style="${bgImg(s.thumb_url || s.cover_url)}">${linkDots(s)}${playBtn}</div>`
    : `<div class="cover note-cover">${noteCover()}${linkDots(s)}${playBtn}</div>`;
  const albums = s.albums.length ? s.albums.map((a) => esc(a.title)).join(', ') : esc(t('no_album'));
  const chips = s.formats.map((f) => `<span class="chip ${canPlay(f.toLowerCase()) ? 'play' : ''}">${esc(f)}</span>`).join('');
  return `<article class="card" data-href="#/song/${s.id}">
    ${cover}
    <div class="card-body">
      <div class="card-title"><a href="#/song/${s.id}">${esc(s.title)}</a><span class="status ${s.status}">${esc(stLabel(s.status))}</span></div>
      <div class="card-meta">${ICON.folder}<span>${tn('files_n', s.file_count)} · ${albums}</span></div>
      <div class="card-foot">
        <div class="chips">${s.band ? `<span class="tag band" data-mod="bands">${ICON.usersSm}${esc(s.band.title)}</span>` : ''}${s.style ? `<span class="tag">${esc(s.style)}</span>` : ''}${chips}</div>
        <button class="icon-btn small ${s.favorite ? 'on' : ''}" data-mod="favorites" data-action="fav" data-id="${s.id}" data-on="${s.favorite ? 1 : 0}" aria-pressed="${s.favorite}" aria-label="${esc(s.favorite ? t('unfav') : t('fav'))}">${s.favorite ? ICON.heartFull : ICON.heart}</button>
      </div>
    </div>
  </article>`;
}

const songPlayable = (s) => s.main_file && canPlay(s.main_file.ext);
const favBtn = (s) => `<button class="icon-btn small ${s.favorite ? 'on' : ''}" data-mod="favorites" data-action="fav" data-id="${s.id}" data-on="${s.favorite ? 1 : 0}" aria-pressed="${s.favorite}" aria-label="${esc(s.favorite ? t('unfav') : t('fav'))}">${s.favorite ? ICON.heartFull : ICON.heart}</button>`;
function songMini(s) {
  const play = songPlayable(s) ? `<button class="play-btn" data-action="play-song" data-id="${s.id}" aria-label="${esc(t('play_x', { x: s.title }))}">${ICON.play}</button>` : '';
  return `<article class="card mini" data-href="#/song/${s.id}">
    <div class="cover${s.thumb_url ? '' : ' note-cover'}" style="${bgImg(s.thumb_url)}">${s.thumb_url ? '' : noteCover()}${linkDots(s, true)}${play}</div>
    <div class="mini-body"><a href="#/song/${s.id}" title="${esc(s.title)}">${esc(s.title)}</a>
      <span class="mini-meta"><span class="dot ${s.status}" aria-hidden="true"></span>${esc(stLabel(s.status))}${s.favorite ? ` ${ICON.heartFull}` : ''}</span></div>
  </article>`;
}
function songRow(s) {
  const sub = [s.band?.title, s.style, s.albums.map((a) => a.title).join(', ')].filter(Boolean).map(esc).join(' · ');
  const play = songPlayable(s) ? `<button class="icon-btn small" data-action="play-song" data-id="${s.id}" aria-label="${esc(t('play_x', { x: s.title }))}">${ICON.play}</button>` : '<span class="icon-spacer"></span>';
  return `<div class="song-row card" data-href="#/song/${s.id}" role="row">
    ${play}
    <span class="row-thumb${s.thumb_url ? '' : ' note-cover'}" style="${bgImg(s.thumb_url)}">${s.thumb_url ? '' : noteCover()}</span>
    <span class="row-title" role="cell"><a href="#/song/${s.id}">${esc(s.title)}</a>${sub ? `<span>${sub}</span>` : ''}</span>
    <span class="row-status" role="cell"><span class="status ${s.status}">${esc(stLabel(s.status))}</span></span>
    <span class="row-formats chips" role="cell">${s.formats.map((f) => `<span class="chip ${canPlay(f.toLowerCase()) ? 'play' : ''}">${esc(f)}</span>`).join('')}</span>
    <span class="row-date" role="cell">${esc(fmtDate(s.updated_at))}</span>
    ${favBtn(s)}
  </div>`;
}

// show big lists bit by bit: 60 items at a time, the rest as scrolling nears the end
const CHUNK = 60;
function renderChunked(container, items, renderItem, wrapClass) {
  container.innerHTML = `<div class="${wrapClass}"></div>`;
  const wrap = container.firstElementChild;
  let shown = 0;
  let observer = null;
  const more = () => {
    const next = items.slice(shown, shown + CHUNK);
    wrap.insertAdjacentHTML('beforeend', next.map(renderItem).join(''));
    shown += next.length;
    container.querySelector('.more-sentinel')?.remove();
    if (shown < items.length) {
      container.insertAdjacentHTML('beforeend', `<div class="more-sentinel"><button class="btn" type="button">${esc(t('show_more'))} (${items.length - shown})</button></div>`);
      const sentinel = container.querySelector('.more-sentinel');
      sentinel.querySelector('button').addEventListener('click', more);
      if ('IntersectionObserver' in window) {
        observer?.disconnect();
        observer = new IntersectionObserver((entries) => { if (entries.some((x) => x.isIntersecting)) more(); }, { rootMargin: '600px' });
        observer.observe(sentinel);
      }
    } else observer?.disconnect();
  };
  more();
}

// each page remembers its mode (cards, thumbnails or list) in this browser
let viewMode = 'grid', viewPage = 'songs', pageRerender = null;
function useViewMode(page) {
  viewPage = page;
  let v = null;
  try { v = localStorage.getItem(`mdop-view-${page}`) || (page === 'songs' ? localStorage.getItem('mdop-view') : null); } catch { /* no storage */ }
  viewMode = ['grid', 'mini', 'list'].includes(v) ? v : 'grid';
}
function viewSwitch() {
  const b = (mode, icon) => `<button class="seg-btn" data-action="view-mode" data-value="${mode}" aria-pressed="${viewMode === mode}" aria-label="${esc(t(`view_${mode}`))}" title="${esc(t(`view_${mode}`))}">${icon}</button>`;
  return `<div class="seg" role="group" aria-label="${esc(t('view_mode'))}">${b('grid', ICON.viewGrid)}${b('mini', ICON.viewMini)}${b('list', ICON.viewList)}</div>`;
}
const wrapClass = () => (viewMode === 'list' ? 'song-list' : viewMode === 'mini' ? 'grid mini-grid' : 'grid');
const groupHead = (x) => `<h2 class="group-head">${esc(x.title)} <span class="count-pill">${x.count}</span></h2>`;
function renderSongs(container, songs, group = '') {
  const items = group ? groupSongs(songs, group) : songs;
  renderChunked(container, items, (s) => (s.groupHead ? groupHead(s) : songCard(s, viewMode)), wrapClass());
}
function groupSongs(songs, by) {
  const keyOf = { style: (s) => s.style || '', status: (s) => s.status, band: (s) => s.band?.title || '' }[by];
  if (!keyOf) return songs;
  const groups = new Map();
  songs.forEach((s) => { const k = keyOf(s); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); });
  let keys = [...groups.keys()];
  if (by === 'status') keys = SONG_STATUSES.filter((k) => groups.has(k));
  else keys.sort((a, b) => (!a) - (!b) || a.localeCompare(b, LANG === 'en' ? 'en' : 'pt-BR', { sensitivity: 'base' }));
  const label = (k) => (by === 'status' ? stLabel(k) : k || (by === 'style' ? t('no_style') : t('no_band_group')));
  return keys.flatMap((k) => [{ groupHead: true, title: label(k), count: groups.get(k).length }, ...groups.get(k)]);
}

// albums, bands and artists in the three modes
function entityItem(e, mode) {
  const thumb = (cls) => `<span class="${cls}" style="${bgImg(e.img)}">${e.img ? '' : esc(initialsOf(e.title))}</span>`;
  if (mode === 'list') {
    return `<div class="ent-row card" data-href="${e.href}">${thumb(`row-thumb${e.round ? ' round' : ''}`)}
      <span class="row-title"><a href="${e.href}">${esc(e.title)}</a>${e.sub ? `<span>${esc(e.sub)}</span>` : ''}</span>
      <span class="row-status">${e.badge || ''}</span><span class="row-date">${esc(e.extra || '')}</span></div>`;
  }
  if (mode === 'mini') {
    return `<article class="card mini" data-href="${e.href}"><div class="cover${e.round ? ' round-cover' : ''}" style="${bgImg(e.img)}">${e.img ? '' : `<span class="initials">${esc(initialsOf(e.title))}</span>`}</div>
      <div class="mini-body"><a href="${e.href}" title="${esc(e.title)}">${esc(e.title)}</a><span class="mini-meta">${e.miniMeta || esc(e.sub || '')}</span></div></article>`;
  }
  return `<article class="card" data-href="${e.href}">
    ${e.coverHtml || `<div class="cover${e.round ? ' round-cover' : ''}" style="${bgImg(e.img)}">${e.img ? '' : `<span class="initials">${esc(initialsOf(e.title))}</span>`}</div>`}
    <div class="card-body"><div class="card-title"><a href="${e.href}">${esc(e.title)}</a>${e.badge || ''}</div>${e.sub ? `<div class="card-meta">${esc(e.sub)}</div>` : ''}</div></article>`;
}
const albumStatus = (st) => `<span class="status ${st}">${esc(t(`ast_${st}`))}</span>`;
const albumEntity = (a) => ({
  href: `#/album/${a.id}`, img: a.thumb_url || a.mosaic[0], title: a.title, coverHtml: albumCover(a),
  sub: [tn('songs_n', a.song_count), a.band?.title, a.release].filter(Boolean).join(' · '),
  badge: albumStatus(a.status || 'idea'), extra: a.label || '',
  miniMeta: `<span class="dot ${a.status || 'idea'}" aria-hidden="true"></span>${esc(t(`ast_${a.status || 'idea'}`))}`,
});
const bandEntity = (b) => ({ href: `#/band/${b.id}`, img: b.cover_url, title: b.title, sub: `${tn('songs_n', b.song_count)} · ${tn('albums_n', b.album_count)}` });
const artistEntity = (a) => ({ href: `#/artist/${a.id}`, img: a.photo_url, title: a.name, round: true, sub: a.roles.join(' · ') || tn('songs_n', a.song_count), extra: tn('songs_n', a.song_count) });

// list page with search and filters done right here (a few dozen items at most)
const listFilters = { albums: { q: '', status: '', band: '', sort: 'recent' }, bands: { q: '' }, artists: { q: '' } };
function listPage(view, { page, title, sub, newAction, newLabel, items, toEntity, match, emptyHtml, extraFilters = '', sorter }) {
  useViewMode(page);
  const F = listFilters[page];
  view.innerHTML = `
    <div class="page-head"><div><h1>${esc(title)}</h1><p>${sub}</p></div>
      <div class="actions">${items.length ? viewSwitch() : ''}<button class="btn primary" data-action="${newAction}">${ICON.plus}${esc(newLabel)}</button></div></div>
    ${items.length ? `<div class="filters">
      <label class="search compact">${ICON.search}<span class="sr-only">${esc(t('search'))}</span><input type="search" id="list-q" value="${esc(F.q)}" placeholder="${esc(t(`search_${page}_ph`))}"></label>
      ${extraFilters}</div>` : ''}
    <div id="list-grid"></div>`;
  const draw = () => {
    const box = $('#list-grid');
    if (!items.length) { box.innerHTML = emptyHtml; return; }
    const q = F.q.trim().toLowerCase();
    let list = items.filter((x) => match(x, q, F));
    if (sorter) list = sorter(list, F);
    if (!list.length) { box.innerHTML = `<div class="empty"><h2>${esc(t('nothing_t'))}</h2><p>${esc(t('nothing_p'))}</p></div>`; return; }
    const ents = list.map(toEntity);
    renderChunked(box, ents, (e) => entityItem(e, viewMode), viewMode === 'list' ? 'song-list' : viewMode === 'mini' ? 'grid mini-grid' : 'grid');
  };
  pageRerender = draw;
  draw();
  $('#list-q')?.addEventListener('input', debounce((e) => { F.q = e.target.value; draw(); }, 150));
  $$('[data-lfilter]', view).forEach((sel) => sel.addEventListener('change', () => { F[sel.dataset.lfilter] = sel.value; draw(); }));
}

function albumCover(a, size = 'card') {
  const cls = size === 'card' ? 'cover' : 'hero-cover';
  if (a.cover_url) return `<div class="${cls}" style="${bgImg(size === 'card' ? a.thumb_url || a.cover_url : a.cover_url)}"></div>`;
  if (a.mosaic.length) {
    const tiles = [0, 1, 2, 3].map((i) => `<span style="${bgImg(a.mosaic[i % a.mosaic.length])}"></span>`).join('');
    return size === 'card' ? `<div class="cover mosaic">${tiles}</div>` : `<div class="hero-cover"><div class="mosaic">${tiles}</div></div>`;
  }
  return `<div class="${cls}">${ICON.discLg}</div>`;
}
function albumCard(a) {
  return `<article class="card" data-href="#/album/${a.id}">
    ${albumCover(a)}
    <div class="card-body">
      <div class="card-title"><a href="#/album/${a.id}">${esc(a.title)}</a>${albumStatus(a.status || 'idea')}</div>
      <div class="card-meta">${tn('songs_n', a.song_count)}${a.band ? ` · ${esc(a.band.title)}` : ''}</div>
    </div>
  </article>`;
}

// ================================================================ library
let librarySongs = [];
async function viewLibrary(view, params, favOnly = false) {
  const q = params.get('q') || '', style = params.get('style') || '', status = params.get('status') || '';
  const fmt = params.get('fmt') || '', album = params.get('album') || '', band = params.get('band') || '', sort = params.get('sort') || 'updated';
  const group = params.get('group') || '';
  useViewMode('songs');
  const title = favOnly ? t('nav_favs') : style || t('nav_songs');
  const fchip = (id, label) => `<button class="fchip" data-action="filter" data-key="fmt" data-value="${id}" aria-pressed="${fmt === id}">${esc(label)}</button>`;
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(label)}</option>`;
  view.innerHTML = `
    <div class="topbar">
      <label class="search">${ICON.search}<span class="sr-only">${esc(t('search'))}</span><input type="search" id="search" value="${esc(q)}" placeholder="${esc(t('search_ph'))}"></label>
      <button class="btn" data-action="import">${ICON.upload}${esc(t('add_files'))}</button>
      <button class="btn primary" data-action="new-song">${ICON.plus}${esc(t('create_song'))}</button>
    </div>
    <div class="page-head"><div><h1>${esc(title)}</h1><p id="lib-count">&nbsp;</p></div>${viewSwitch()}</div>
    <div class="filters">
      <span class="label">${esc(t('format'))}</span>
      ${fchip('', t('all'))}${fchip('audio', t('f_audio'))}${fchip('midi', t('f_midi'))}${fchip('gp', t('f_gp'))}
      <span class="sep"></span>
      <label class="label">${esc(t('status'))}<select class="pill-select" data-filter="status">${opt('', t('all'), status)}${SONG_STATUSES.map((s) => opt(s, stLabel(s), status)).join('')}</select></label>
      ${state.meta.bands.length ? `<label class="label" data-mod="bands">${esc(t('band'))}<select class="pill-select" data-filter="band">${opt('', t('all'), band)}${state.meta.bands.map((b) => opt(b.id, b.title, band)).join('')}</select></label>` : ''}
      ${state.meta.styles.length ? `<label class="label">${esc(t('style'))}<select class="pill-select" data-filter="style">${opt('', t('all'), style)}${state.meta.styles.map((x) => opt(x.name, `${x.name} (${x.count})`, style)).join('')}</select></label>` : ''}
      <label class="label" data-mod="albums">${esc(t('album'))}<select class="pill-select" data-filter="album">${opt('', t('all'), album)}${state.albums.map((a) => opt(a.id, a.title, album)).join('')}</select></label>
      <label class="label">${esc(t('order'))}<select class="pill-select" data-filter="sort">${opt('updated', t('sort_updated'), sort)}${opt('created', t('sort_created'), sort)}${opt('title', t('sort_title'), sort)}</select></label>
      <label class="label">${esc(t('group_by'))}<select class="pill-select" data-filter="group">${opt('', t('group_none'), group)}${opt('style', t('group_style'), group)}${opt('status', t('group_status'), group)}${isOn('bands') ? opt('band', t('group_band'), group) : ''}</select></label>
    </div>
    <div id="lib-grid"></div>`;

  const load = async () => {
    const p = new URLSearchParams(route().params);
    p.delete('group');
    if (favOnly) p.set('favorite', 'true');
    librarySongs = await api('GET', `/api/songs?${p}`);
    const total = state.meta.songs;
    $('#lib-count').textContent = librarySongs.length === total && !favOnly
      ? t('lib_sub', { songs: tn('songs_n', total), albums: tn('albums_n', state.meta.albums) })
      : tn('found_n', librarySongs.length);
    const grid = $('#lib-grid');
    if (!librarySongs.length) {
      grid.innerHTML = total === 0
        ? `<div class="empty"><h2>${esc(t('empty_lib_t'))}</h2><p>${esc(t('empty_lib_p'))}</p><div class="actions"><button class="btn" data-action="import">${ICON.upload}${esc(t('add_files'))}</button><button class="btn primary" data-action="new-song">${ICON.plus}${esc(t('create_song'))}</button></div></div>`
        : `<div class="empty"><h2>${esc(t('nothing_t'))}</h2><p>${esc(t('nothing_p'))}</p><a class="btn" href="#${favOnly ? '/favoritas' : '/musicas'}">${esc(t('clear_filters'))}</a></div>`;
    } else {
      renderSongs(grid, librarySongs, group);
    }
  };
  pageRerender = () => { if ($('#lib-grid') && librarySongs.length) renderSongs($('#lib-grid'), librarySongs, group); };
  await load();
  $('#search').addEventListener('input', debounce(async (e) => { setParam('q', e.target.value.trim(), false); await run(load); }, 250));
  $$('[data-filter]', view).forEach((sel) => sel.addEventListener('change', () => setParam(sel.dataset.filter, sel.dataset.filter === 'sort' && sel.value === 'updated' ? '' : sel.value)));
}

function setParam(key, value, navigate = true) {
  const r = route();
  if (value) r.params.set(key, value); else r.params.delete(key);
  const qs = r.params.toString();
  const hash = `#/${r.parts.join('/')}${qs ? `?${qs}` : ''}`;
  if (navigate) go(hash); else history.replaceState(null, '', hash);
}

// ================================================================ song
let songCache = null;
let songTab = { id: null, tab: 'audio' };

function bandSelect(id, current) {
  return `<select class="select" id="${id}">
    <option value="">${esc(t('no_band'))}</option>
    ${state.meta.bands.map((b) => `<option value="${b.id}" ${current === b.id ? 'selected' : ''}>${esc(b.title)}</option>`).join('')}
    <option value="__new">${esc(t('new_band_opt'))}</option></select>`;
}
async function handleBandSelect(sel, current, save) {
  let value = sel.value;
  if (value === '__new') {
    const title = await promptModal({ title: t('new_band'), label: t('band_name'), confirm: t('create'), placeholder: t('band_ph') });
    if (!title) { sel.value = current ? String(current) : ''; return; }
    const b = await run(() => api('POST', '/api/bands', { title }));
    if (!b) { sel.value = current ? String(current) : ''; return; }
    value = String(b.id);
  }
  await save(value ? Number(value) : null);
}

async function viewSong(view, id) {
  const s = await api('GET', `/api/songs/${id}`);
  if (s.is_idea) { history.replaceState(null, '', `#/idea/${id}`); return viewIdea(view, id); }
  songCache = s;
  setPageCover(s.cover_url);
  const main = s.main_file;
  const mainPlayable = main && canPlay(main.ext);
  const coverHtml = s.cover_url
    ? `<div class="hero-cover" style="${bgImg(s.cover_url)}"><div class="cover-actions">
        <button class="overlay-btn" data-action="song-cover" data-id="${s.id}">${ICON.imageSm}${esc(t('change_cover'))}</button>
        <a class="overlay-btn" href="${esc(s.cover_download)}?download=1" download>${ICON.downloadSm}${esc(t('download_cover'))}</a>
        <button class="overlay-btn" data-action="song-cover-remove" data-id="${s.id}">${esc(t('remove'))}</button></div></div>`
    : `<div class="hero-cover empty-cover note-cover">${noteCover()}<button class="btn small" data-action="song-cover" data-id="${s.id}">${ICON.imageSm}${esc(t('add_cover'))}</button></div>`;
  const albums = s.albums.length ? s.albums.map((a) => `<a href="#/album/${a.id}">${esc(a.title)}</a>`).join(', ') : esc(t('none'));
  const all = s.versions.flatMap((v) => v.files);
  const counts = { audio: 0, score: 0, image: 0, other: 0 };
  all.forEach((f) => { counts[category(f.ext)]++; });
  // type tabs: only the ones with files (with no files at all, shows "Audio" so files can be added)
  let tabs = ['audio', 'score', 'image', 'other'].filter((c) => counts[c]);
  if (!tabs.length) tabs = ['audio'];
  if (songTab.id !== s.id) songTab = { id: s.id, tab: tabs[0], page: 'files' };
  if (!tabs.includes(songTab.tab)) songTab.tab = tabs[0];

  view.innerHTML = `
    <nav class="crumbs" aria-label="breadcrumb"><a class="btn small" href="#/songs">${ICON.back}${esc(t('back_songs'))}</a><span>/</span><span class="here">${esc(s.title)}</span></nav>
    <section class="hero">
      ${coverHtml}
      <div class="hero-info">
        <span class="eyebrow">${esc(t('eyebrow_song'))}${s.band ? ` · <a href="#/band/${s.band.id}">${esc(s.band.title)}</a>` : ''}</span>
        <label class="sr-only" for="song-title">${esc(t('song_name'))}</label>
        <input class="title-input" id="song-title" data-field="title" value="${esc(s.title)}">
        <div class="hero-meta">
          <span>${ICON.disc} ${esc(t('albums_label'))}: ${albums}</span>
          <span>${tn('versions_n', s.versions.length)} · ${tn('files_n', all.length)}</span>
          ${main ? `<span style="color:var(--accent-text)">${ICON.starFull} ${esc(main.name)}</span>` : ''}
        </div>
        <div class="actions">
          ${mainPlayable ? `<button class="btn primary" data-action="play-song-detail">${ICON.play}${esc(t('play_main'))}</button>` : ''}
          ${all.some((f) => canPlay(f.ext)) ? `<a class="btn" href="#/listen/${s.id}">${ICON.headphones}${esc(t('sala_title'))}</a>` : ''}
          <button class="btn" data-action="import" data-song="${s.id}">${ICON.upload}${esc(t('add_files'))}</button>
          <button class="btn" data-action="new-version" data-id="${s.id}">${ICON.layers}${esc(t('new_version'))}</button>
          <button class="btn" data-mod="albums" data-action="song-albums" data-id="${s.id}">${ICON.disc}${esc(t('albums_label'))}</button>
          <a class="btn" href="/api/songs/${s.id}/zip" download>${ICON.zip}${esc(t('download_all'))}</a>
          <button class="icon-btn ${s.favorite ? 'on' : ''}" data-mod="favorites" data-action="fav" data-id="${s.id}" data-on="${s.favorite ? 1 : 0}" aria-pressed="${s.favorite}" aria-label="${esc(s.favorite ? t('unfav') : t('fav'))}">${s.favorite ? ICON.heartFull : ICON.heart}</button>
        </div>
      </div>
    </section>
    <div class="two-col">
      <div class="col-main">
        <div class="ftabs page-tabs" role="tablist">
          <button role="tab" data-action="song-page" data-page="files" aria-selected="${songTab.page === 'files'}">${ICON.folder}${esc(t('page_files'))}<span class="n">${all.length}</span></button>
          <button role="tab" data-action="song-page" data-page="texts" aria-selected="${songTab.page === 'texts'}">${ICON.text}${esc(t('page_texts'))}<span class="n">${s.texts.length}</span></button>
        </div>
        ${songTab.page === 'files' ? `
        <section aria-label="${esc(t('files_title'))}" style="display:flex;flex-direction:column;gap:14px">
          <div class="section-head">
            ${tabs.length > 1 ? `<div class="ftabs sub" role="tablist">${tabs.map((c) => `<button role="tab" data-action="song-tab" data-tab="${c}" aria-selected="${songTab.tab === c}">${esc(t(`tab_${c}`))}<span class="n">${counts[c]}</span></button>`).join('')}</div>` : '<span></span>'}
            <span class="muted" style="font-size:13px">${esc(t('star_hint'))}</span>
          </div>
          ${s.versions.map((v) => versionBlock(s, v, songTab.tab)).join('')}
          <p class="muted" style="margin:0;font-size:13px;line-height:1.6">${esc(t('versions_note'))}</p>
        </section>` : `
        <section aria-label="${esc(t('texts'))}" style="display:flex;flex-direction:column;gap:14px">
          <div class="section-head"><span class="muted" style="font-size:14px">${esc(t('texts_hint'))}</span>
            <button class="btn small" data-action="new-text">${ICON.plus}${esc(t('new_text'))}</button></div>
          <div id="texts" style="display:flex;flex-direction:column;gap:14px">${s.texts.length ? s.texts.map(textCard).join('') : `<div class="empty" style="padding:36px"><p>${esc(t('no_texts'))}</p><button class="btn primary" data-action="new-text">${ICON.plus}${esc(t('new_text'))}</button></div>`}</div>
        </section>`}
        <div style="margin-top:8px"><button class="btn danger small" data-action="delete-song" data-id="${s.id}">${esc(t('delete_song'))}</button></div>
      </div>
      <aside class="col-side">
        <div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:center"><h2>${esc(t('details'))}</h2><span class="saved" id="saved"></span></div>
          <label class="field" data-mod="bands">${esc(t('band'))}${bandSelect('song-band', s.band?.id ?? null)}</label>
          <label class="field">${esc(t('status'))}<select class="select" data-field="status">${SONG_STATUSES.map((k) => `<option value="${k}" ${s.status === k ? 'selected' : ''}>${esc(stLabel(k))}</option>`).join('')}</select></label>
          <label class="field">${esc(t('style'))}<input class="input" data-field="style" list="dl-styles" value="${esc(s.style)}" placeholder="${esc(t('style_ph'))}"><datalist id="dl-styles">${state.meta.styles.map((x) => `<option value="${esc(x.name)}">`).join('')}</datalist></label>
          <div class="row2">
            <label class="field">${esc(t('key'))}<input class="input" data-field="music_key" value="${esc(s.music_key)}" placeholder="${esc(t('key_ph'))}"></label>
            <label class="field">${esc(t('bpm'))}<input class="input" data-field="bpm" value="${esc(s.bpm)}" placeholder="${esc(t('bpm_ph'))}"></label>
          </div>
          ${s.promoted_at ? `<p class="tg-hint born-line">${ICON.bulb} ${esc(t('born_as_idea', { a: fmtDate(s.idea_since), b: fmtDate(s.promoted_at) }))}</p>` : ''}
          <label class="field">${esc(t('tuning'))}<input class="input" data-field="tuning" list="dl-tunings" value="${esc(s.tuning)}" placeholder="${esc(t('tuning_ph'))}"><datalist id="dl-tunings">${TUNINGS.map((x) => `<option value="${esc(x)}">`).join('')}</datalist></label>
        </div>
        <div class="panel" data-mod="artists">${creditsBlock(s.credits, { song_id: s.id }, t('credits'), t('add_credit'), t('no_credits'))}</div>
        <div class="panel">
          <label for="notes" style="font-size:17px;font-weight:600">${esc(t('notes'))}</label>
          <textarea class="textarea" id="notes" data-field="notes" rows="5" style="min-height:110px" placeholder="${esc(t('notes_ph'))}">${esc(s.notes)}</textarea>
        </div>
      </aside>
    </div>`;

  const save = async (field, value) => {
    if ($('#saved')) $('#saved').textContent = t('saving');
    const res = await run(() => api('PATCH', `/api/songs/${s.id}`, { [field]: value }));
    if ($('#saved')) $('#saved').textContent = res ? t('saved') : '';
    if (res) { songCache = res; if (['style', 'title', 'band_id'].includes(field)) refreshNav(); }
    return res;
  };
  $$('[data-field]', view).forEach((el) => {
    if (el.tagName === 'TEXTAREA') el.addEventListener('input', debounce(() => save(el.dataset.field, el.value), 700));
    else el.addEventListener('change', () => save(el.dataset.field, el.value));
  });
  $('#song-title').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
  $('#song-band').addEventListener('change', (e) => handleBandSelect(e.target, s.band?.id, async (bid) => { if (await save('band_id', bid)) render(); }));
  bindTexts(view);
}

function versionBlock(s, v, tab) {
  const canDelete = s.versions.length > 1 && !v.files.length;
  const files = v.files.filter((f) => category(f.ext) === tab);
  let body;
  if (!v.files.length) {
    body = `<div class="version-empty">${esc(t('empty_version'))} <button class="btn small" data-action="import" data-song="${s.id}" data-version="${v.id}">${ICON.upload}${esc(t('add_here'))}</button></div>`;
  } else if (!files.length) {
    if (tab !== 'audio') return '';  // in the other tabs, only versions with files of that type are shown
    body = `<div class="version-empty">${esc(t('no_files_type'))}</div>`;
  } else if (tab === 'image') {
    body = `<div class="img-grid">${files.map((f) => `
      <div class="img-card"><img src="${esc(f.url)}" alt="${esc(f.name)}" loading="lazy">
        <div class="img-info">${esc(f.name)}<div class="muted" style="font-size:12px">${fmtSize(f.size)}</div></div>
        <div class="img-actions">
          <button class="btn small" data-action="cover-from-file" data-id="${f.id}">${esc(t('use_as_cover'))}</button>
          <button class="icon-btn small" data-desktop data-action="desktop-open" data-id="${f.id}" aria-label="${esc(t('open_with_x', { x: f.name }))}" title="${esc(t('open_with'))}">${ICON.external}</button>
          <a class="icon-btn small" href="${esc(f.url)}?download=1" download="${esc(f.name)}" aria-label="${esc(t('download_x', { x: f.name }))}">${ICON.downloadSm}</a>
          <button class="icon-btn small" data-action="file-menu" data-id="${f.id}" aria-label="${esc(t('more_x', { x: f.name }))}">${ICON.more}</button>
        </div></div>`).join('')}</div>`;
  } else {
    body = files.map(fileRow).join('');
  }
  return `<div class="version">
    <div class="version-head">
      <span class="version-num">v${v.number}</span><span class="version-label">${esc(v.label)}</span><span class="version-date">${fmtDate(v.created_at)}</span>
      <button class="btn small" data-action="rename-version" data-id="${v.id}" data-label="${esc(v.label)}">${esc(t('rename'))}</button>
      ${canDelete ? `<button class="btn small danger" data-action="delete-version" data-id="${v.id}">${esc(t('delete_version'))}</button>` : ''}
    </div>
    <div>${body}</div>
  </div>`;
}

function fileRow(f) {
  const playable = canPlay(f.ext);
  const midi = isMidi(f.ext);
  const lead = playable
    ? `<button class="play-btn ghost" data-action="play-file" data-id="${f.id}" aria-label="${esc(t('play_x', { x: f.name }))}">${ICON.play}</button>`
    : midi ? `<a class="play-btn ghost" href="#/midi/${f.id}?play=1" aria-label="${esc(t('open_midi_x', { x: f.name }))}" title="${esc(t('midi_title'))}">${ICON.play}</a>`
      : `<div class="file-icon">${fileIcon(f.ext)}</div>`;
  return `<div class="file-row ${f.main ? 'is-main' : ''}" data-file="${f.id}">
    ${lead}
    <div class="file-name"><strong>${esc(f.name)}</strong><span>${f.main ? `<span class="main-badge">${esc(t('main'))} · </span>` : ''}${fmtSize(f.size)} · ${fmtDate(f.created_at)}${playable || midi || TAB_EXTS.has(f.ext) ? '' : ` · ${esc(t('only_download'))}`}</span></div>
    <span class="chip ${playable || midi ? 'play' : ''}">${esc((f.ext || '?').toUpperCase())}</span>
    ${playable && songCache ? `<a class="icon-btn" href="#/listen/${songCache.id}?f=${f.id}" aria-label="${esc(t('open_sala_x', { x: f.name }))}" title="${esc(t('sala_title'))}">${ICON.headphones}</a>` : ''}
    ${TAB_EXTS.has(f.ext) ? `<a class="icon-btn" href="#/tab/${f.id}" aria-label="${esc(t('tab_view_x', { x: f.name }))}" title="${esc(t('tab_title'))}">${ICON.ftGp}</a>` : ''}
    <button class="icon-btn" data-desktop data-action="desktop-open" data-id="${f.id}" aria-label="${esc(t('open_with_x', { x: f.name }))}" title="${esc(t('open_with'))}">${ICON.external}</button>
    <button class="icon-btn ${f.main ? 'on' : ''}" data-action="set-main" data-id="${f.id}" aria-pressed="${f.main}" aria-label="${esc(f.main ? t('is_main') : t('mark_main'))}" title="${esc(f.main ? t('is_main') : t('mark_main'))}">${f.main ? ICON.starFull : ICON.star}</button>
    <a class="icon-btn" href="${esc(f.url)}?download=1" download="${esc(f.name)}" aria-label="${esc(t('download_x', { x: f.name }))}">${ICON.download}</a>
    <button class="icon-btn" data-action="file-menu" data-id="${f.id}" aria-label="${esc(t('more_x', { x: f.name }))}">${ICON.more}</button>
  </div>`;
}

function findFile(id) {
  for (const v of songCache.versions) {
    const f = v.files.find((x) => x.id === id);
    if (f) return { f, v };
  }
  return {};
}

// ---------------------------------------------------------------- texts
function textCard(x) {
  return `<div class="text-card" data-text="${x.id}">
    <div class="text-head">
      <label class="sr-only" for="tt-${x.id}">${esc(t('text_title'))}</label>
      <input class="text-title" id="tt-${x.id}" value="${esc(x.title)}">
      <span class="saved" data-saved></span>
      <button class="icon-btn small" data-action="delete-text" data-id="${x.id}" data-title="${esc(x.title)}" aria-label="${esc(t('delete_text'))}">${ICON.trash}</button>
    </div>
    <textarea class="textarea" aria-label="${esc(x.title)}" placeholder="${esc(t('text_ph'))}">${esc(x.body)}</textarea>
  </div>`;
}
function bindTexts(view) {
  $$('.text-card', view).forEach((card) => {
    const id = card.dataset.text;
    const savedEl = $('[data-saved]', card);
    const area = $('textarea', card);
    const grow = () => { area.style.height = 'auto'; area.style.height = `${Math.max(240, area.scrollHeight + 4)}px`; };
    grow();
    const save = async (body) => {
      savedEl.textContent = t('saving');
      const res = await run(() => api('PATCH', `/api/texts/${id}`, body));
      savedEl.textContent = res ? t('saved') : '';
    };
    area.addEventListener('input', () => { grow(); savedEl.textContent = ''; });
    area.addEventListener('input', debounce(() => save({ body: area.value }), 800));
    $('.text-title', card).addEventListener('change', (e) => save({ title: e.target.value }));
  });
}

// ================================================================ albums
async function viewAlbums(view) {
  const albums = state.albums;
  const F = listFilters.albums;
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(label)}</option>`;
  listPage(view, {
    page: 'albums', title: t('albums_title'), sub: `${tn('albums_n', albums.length)} · ${esc(t('albums_sub'))}`,
    newAction: 'new-album', newLabel: t('new_album'), items: albums, toEntity: albumEntity,
    extraFilters: `
      <label class="label">${esc(t('status'))}<select class="pill-select" data-lfilter="status">${opt('', t('all'), F.status)}${STATUSES.map((x) => opt(x, t(`ast_${x}`), F.status)).join('')}</select></label>
      ${state.meta.bands.length ? `<label class="label" data-mod="bands">${esc(t('band'))}<select class="pill-select" data-lfilter="band">${opt('', t('all'), F.band)}${state.meta.bands.map((x) => opt(x.id, x.title, F.band)).join('')}</select></label>` : ''}
      <label class="label">${esc(t('order'))}<select class="pill-select" data-lfilter="sort">${opt('recent', t('sort_recent'), F.sort)}${opt('name', t('sort_name'), F.sort)}</select></label>`,
    match: (a, q, f) => (!f.status || (a.status || 'idea') === f.status) && (!f.band || String(a.band?.id) === f.band)
      && (!q || [a.title, a.description, a.band?.title, a.label, a.recorded_at, a.release].some((x) => (x || '').toLowerCase().includes(q))),
    sorter: (list, f) => [...list].sort(f.sort === 'name' ? (x, y) => x.title.localeCompare(y.title, 'pt-BR', { sensitivity: 'base' }) : (x, y) => (y.updated_at || '').localeCompare(x.updated_at || '')),
    emptyHtml: `<div class="empty"><h2>${esc(t('no_albums_t'))}</h2><p>${esc(t('no_albums_p'))}</p><button class="btn primary" data-action="new-album">${ICON.plus}${esc(t('new_album'))}</button></div>`,
  });
}

let albumCache = null;
async function viewAlbum(view, id) {
  const a = await api('GET', `/api/albums/${id}`);
  albumCache = a;
  setPageCover(a.cover_url || a.mosaic[0]);
  const playable = a.songs.filter((s) => s.main_file && canPlay(s.main_file.ext));
  view.innerHTML = `
    <nav class="crumbs" aria-label="breadcrumb"><a class="btn small" href="#/albums">${ICON.back}${esc(t('back_albums'))}</a><span>/</span><span class="here">${esc(a.title)}</span></nav>
    <section class="hero">
      <div style="position:relative">
        ${albumCover(a, 'hero')}
        <div class="cover-actions">
          <button class="overlay-btn" data-action="album-cover" data-id="${a.id}">${ICON.imageSm}${esc(a.cover_url ? t('change_cover') : t('choose_cover'))}</button>
          ${a.cover_url ? `<a class="overlay-btn" href="${esc(a.cover_url.split('?')[0])}?download=1" download>${ICON.downloadSm}${esc(t('download_cover'))}</a><button class="overlay-btn" data-action="album-cover-remove" data-id="${a.id}">${esc(t('remove'))}</button>` : ''}
        </div>
      </div>
      <div class="hero-info">
        <span class="eyebrow">${esc(t('eyebrow_album'))}${a.band ? ` · <a href="#/band/${a.band.id}">${esc(a.band.title)}</a>` : ''}</span>
        <label class="sr-only" for="album-title">${esc(t('album_name'))}</label>
        <input class="title-input" id="album-title" value="${esc(a.title)}">
        <div style="display:flex;flex-wrap:wrap;gap:10px;max-width:640px">
          <label class="sr-only" for="album-desc">${esc(t('desc_ph'))}</label>
          <input class="input" id="album-desc" value="${esc(a.description)}" placeholder="${esc(t('desc_ph'))}" style="flex:2 1 260px">
          <label class="sr-only" for="album-band">${esc(t('band'))}</label>
          <div style="flex:1 1 180px" data-mod="bands">${bandSelect('album-band', a.band?.id ?? null)}</div>
          <label class="sr-only" for="album-status">${esc(t('status'))}</label>
          <select class="select" id="album-status" style="flex:1 1 180px">${STATUSES.map((x) => `<option value="${x}" ${(a.status || 'idea') === x ? 'selected' : ''}>${esc(t(`ast_${x}`))}</option>`).join('')}</select>
        </div>
        <div class="hero-meta"><span>${tn('songs_n', a.songs.length)}</span>${!a.cover_url && a.mosaic.length ? `<span>${esc(t('mosaic_note'))}</span>` : ''}</div>
        <div class="actions">
          ${playable.length ? `<button class="btn primary" data-action="play-album">${ICON.play}${esc(t('play_album'))}</button>` : ''}
          <button class="btn" data-action="album-add" data-id="${a.id}">${ICON.plus}${esc(t('add_songs'))}</button>
          ${a.songs.length ? `<a class="btn" href="/api/albums/${a.id}/zip" download>${ICON.zip}${esc(t('download_all'))}</a>` : ''}
          <button class="btn danger" data-action="delete-album" data-id="${a.id}">${esc(t('delete_album'))}</button>
        </div>
      </div>
    </section>
    <div class="two-col">
    <section class="col-main" aria-labelledby="t-tracks" style="gap:10px">
      <h2 class="section-title" id="t-tracks">${esc(t('album_songs'))}</h2>
      ${a.songs.length ? a.songs.map((s, i) => `
        <div class="track">
          <span class="track-n">${i + 1}</span>
          <div class="track-cover" style="${bgImg(s.cover_url)}"></div>
          <div class="track-info"><a href="#/song/${s.id}">${esc(s.title)}</a><div>${tn('files_n', s.file_count)}${s.formats.length ? ' · ' + esc(s.formats.join(', ')) : ''}</div></div>
          <span class="status ${s.status}">${esc(stLabel(s.status))}</span>
          ${s.main_file && canPlay(s.main_file.ext) ? `<button class="play-btn ghost" data-action="play-album" data-index="${playable.indexOf(s)}" aria-label="${esc(t('play_x', { x: s.title }))}">${ICON.play}</button>` : ''}
          <button class="icon-btn" data-action="album-move" data-id="${s.id}" data-dir="-1" aria-label="${esc(t('move_up', { x: s.title }))}" ${i === 0 ? 'disabled' : ''}>${ICON.up}</button>
          <button class="icon-btn" data-action="album-move" data-id="${s.id}" data-dir="1" aria-label="${esc(t('move_down', { x: s.title }))}" ${i === a.songs.length - 1 ? 'disabled' : ''}>${ICON.down}</button>
          <button class="icon-btn" data-action="album-remove" data-id="${s.id}" aria-label="${esc(t('remove_from', { x: s.title }))}">${ICON.minus}</button>
        </div>`).join('')
      : `<div class="empty"><h2>${esc(t('empty_album'))}</h2><button class="btn primary" data-action="album-add" data-id="${a.id}">${ICON.plus}${esc(t('add_songs'))}</button></div>`}
      <p class="muted" style="margin:6px 0 0;font-size:13px">${esc(t('album_note'))}</p>
    </section>
    <aside class="col-side">
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center"><h2>${esc(t('tech_sheet'))}</h2><span class="saved" id="album-saved"></span></div>
        <label class="field">${esc(t('release'))}<input class="input" data-afield="release" value="${esc(a.release)}" placeholder="${esc(t('release_ph'))}"></label>
        <label class="field">${esc(t('recorded_at'))}<input class="input" data-afield="recorded_at" value="${esc(a.recorded_at)}" placeholder="${esc(t('recorded_ph'))}"></label>
        <label class="field">${esc(t('label'))}<input class="input" data-afield="label" value="${esc(a.label)}" placeholder="${esc(t('label_ph'))}"></label>
      </div>
      <div class="panel" data-mod="artists">${creditsBlock(a.credits, { album_id: a.id }, t('credits'), t('add_credit'), t('no_credits'))}</div>
    </aside>
    </div>`;
  const save = (body) => run(async () => { albumCache = await api('PATCH', `/api/albums/${a.id}`, body); refreshNav(); return albumCache; });
  $('#album-title').addEventListener('change', (e) => save({ title: e.target.value }));
  $('#album-desc').addEventListener('change', (e) => save({ description: e.target.value }));
  $('#album-status').addEventListener('change', async (e) => { if (await save({ status: e.target.value })) toast(t('saved')); });
  $$('[data-afield]', view).forEach((el) => el.addEventListener('change', async () => {
    $('#album-saved').textContent = t('saving');
    const ok = await save({ [el.dataset.afield]: el.value });
    $('#album-saved').textContent = ok ? t('saved') : '';
  }));
  $('#album-title').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
  $('#album-band').addEventListener('change', (e) => handleBandSelect(e.target, a.band?.id, async (bid) => { if (await save({ band_id: bid })) render(); }));
}

// ================================================================ bands
async function viewBands(view) {
  const bands = await api('GET', '/api/bands');
  listPage(view, {
    page: 'bands', title: t('bands_title'), sub: esc(t('bands_sub')), newAction: 'new-band', newLabel: t('new_band'),
    items: bands, toEntity: bandEntity, match: (b, q) => !q || [b.title, b.description].some((x) => (x || '').toLowerCase().includes(q)),
    emptyHtml: `<div class="empty"><h2>${esc(t('no_bands_t'))}</h2><p>${esc(t('no_bands_p'))}</p><button class="btn primary" data-action="new-band">${ICON.plus}${esc(t('new_band'))}</button></div>`,
  });
}

let bandCache = null;
async function viewBand(view, id) {
  const b = await api('GET', `/api/bands/${id}`);
  bandCache = b;
  setPageCover(b.cover_url);
  librarySongs = b.songs;
  view.innerHTML = `
    <nav class="crumbs" aria-label="breadcrumb"><a class="btn small" href="#/bands">${ICON.back}${esc(t('bands_title'))}</a><span>/</span><span class="here">${esc(b.title)}</span></nav>
    <section class="hero">
      <div class="hero-cover round" style="${bgImg(b.cover_url)}">${b.cover_url ? '' : `<span class="initials">${esc(initialsOf(b.title))}</span>`}
        <div class="cover-actions">
          <button class="overlay-btn" data-action="band-cover" data-id="${b.id}">${ICON.imageSm}${esc(b.cover_url ? t('change_cover') : t('choose_cover'))}</button>
          ${b.cover_url ? `<button class="overlay-btn" data-action="band-cover-remove" data-id="${b.id}">${esc(t('remove'))}</button>` : ''}
        </div>
      </div>
      <div class="hero-info">
        <span class="eyebrow">${esc(t('band_eyebrow'))}</span>
        <label class="sr-only" for="band-title">${esc(t('band_name'))}</label>
        <input class="title-input" id="band-title" value="${esc(b.title)}">
        <label class="sr-only" for="band-desc">${esc(t('desc_ph'))}</label>
        <input class="input" id="band-desc" value="${esc(b.description)}" placeholder="${esc(t('desc_ph'))}" style="max-width:560px">
        <div class="hero-meta"><span>${tn('songs_n', b.songs.length)} · ${tn('albums_n', b.albums.length)}</span></div>
        <div class="actions"><button class="btn danger small" data-action="delete-band" data-id="${b.id}">${esc(t('delete_band'))}</button></div>
      </div>
    </section>
    <section style="display:flex;flex-direction:column;gap:14px;margin-bottom:32px">
      <h2 class="section-title">${esc(t('nav_songs'))}</h2>
      ${b.songs.length ? `<div class="grid">${b.songs.map(songCard).join('')}</div>` : `<p class="muted" style="margin:0">${esc(t('band_no_songs'))}</p>`}
    </section>
    ${b.albums.length ? `<section style="display:flex;flex-direction:column;gap:14px;margin-bottom:32px"><h2 class="section-title">${esc(t('nav_albums'))}</h2><div class="grid">${b.albums.map(albumCard).join('')}</div></section>` : ''}
    <section class="panel" style="max-width:640px">${creditsBlock(b.members, { band_id: b.id }, t('members'), t('add_member'), t('no_members'))}</section>`;
  const save = (body) => run(async () => { bandCache = await api('PATCH', `/api/bands/${b.id}`, body); refreshNav(); });
  $('#band-title').addEventListener('change', (e) => save({ title: e.target.value }));
  $('#band-desc').addEventListener('change', (e) => save({ description: e.target.value }));
  $('#band-title').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
}

// ================================================================ file list
const loose = { active: false, groups: [], visible: [], current: -1, selected: new Set(), dupes: [],
  f: { q: '', type: '', origin: '', sep: false, sort: 'date' } };
const groupId = (g) => g.files.map((f) => f.id).join('-');
const fineType = (ext) => (CAT.audio.has(ext) ? 'audio' : (ext === 'mid' || ext === 'midi') ? 'midi' : GP_EXTS.has(ext) ? 'gp' : CAT.image.has(ext) ? 'image' : 'other');

function filterLoose() {
  const { q, type, origin, sep, sort } = loose.f;
  const qq = q.trim().toLowerCase();
  let list = loose.groups.filter((g) =>
    (!qq || g.title.toLowerCase().includes(qq) || g.files.some((f) => f.name.toLowerCase().includes(qq)))
    && (!type || g.files.some((f) => fineType(f.ext) === type))
    && (!origin || g.files.some((f) => (f.origin_dir || '__upload') === origin))
    && (!sep || g.separated));
  const by = {
    name: (a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }),
    date: (a, b) => a.created_at.localeCompare(b.created_at),
    date_desc: (a, b) => b.created_at.localeCompare(a.created_at),
    size: (a, b) => b.size - a.size,
  }[sort] || null;
  if (by) list = [...list].sort(by);
  loose.visible = list;
}

async function viewLoose(view) {
  loose.active = true;
  loose.groups = await api('GET', '/api/loose');
  const ids = new Set(loose.groups.map(groupId));
  loose.selected = new Set([...loose.selected].filter((x) => ids.has(x)));
  const n = loose.groups.length;
  const origins = [...new Set(loose.groups.flatMap((g) => g.files.map((f) => f.origin_dir || '__upload')))].sort();
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(label)}</option>`;
  const F = loose.f;
  view.innerHTML = `
    <div class="page-head"><div><h1>${esc(t('loose_title'))}</h1><p>${n ? `${tn('loose_n', n)} · ` : ''}${esc(t('loose_desc'))}</p></div>
      <button class="btn primary" data-action="import" data-target="loose">${ICON.upload}${esc(t('add_audios'))}</button></div>
    ${n ? `
      <div class="topbar" style="margin-bottom:14px">
        <label class="search">${ICON.search}<span class="sr-only">${esc(t('search_list_ph'))}</span><input type="search" id="loose-q" value="${esc(F.q)}" placeholder="${esc(t('search_list_ph'))}"></label>
        <button class="btn" id="loose-dupes" data-action="loose-dedupe" hidden>${ICON.copy}<span></span></button>
      </div>
      <div class="filters">
        <label class="label">${esc(t('type'))}<select class="pill-select" data-lf="type">${opt('', t('all'), F.type)}${opt('audio', t('tab_audio_s'), F.type)}${opt('midi', t('tab_midi'), F.type)}${opt('gp', t('tab_gp'), F.type)}${opt('image', t('tab_image'), F.type)}${opt('other', t('tab_other'), F.type)}</select></label>
        ${origins.length > 1 ? `<label class="label">${esc(t('origin'))}<select class="pill-select" data-lf="origin">${opt('', t('all'), F.origin)}${origins.map((o) => opt(o, o === '__upload' ? t('origin_upload') : o, F.origin)).join('')}</select></label>` : ''}
        <label class="label">${esc(t('order'))}<select class="pill-select" data-lf="sort">${opt('date', t('sort_date'), F.sort)}${opt('date_desc', t('sort_date_desc'), F.sort)}${opt('name', t('sort_name'), F.sort)}${opt('size', t('sort_size'), F.sort)}</select></label>
        <button class="fchip" data-action="loose-sep-filter" aria-pressed="${F.sep}">${F.sep ? ICON.bookmarkFull : ICON.bookmark} ${esc(t('only_separated'))}</button>
      </div>
      <p class="kbd-hint">${t('kbd_hint', { down: '<kbd>↓</kbd>', up: '<kbd>↑</kbd>', space: `<kbd>${LANG === 'en' ? 'Space' : 'Espaço'}</kbd>` })}</p>
      <div id="loose-body"></div>`
    : `<div class="empty"><h2>${esc(t('loose_empty_t'))}</h2><p>${esc(t('loose_empty_p'))}</p><button class="btn primary" data-action="import" data-target="loose">${ICON.upload}${esc(t('add_audios'))}</button></div>`}`;
  if (!n) return;
  renderLooseList();
  $('#loose-q').addEventListener('input', debounce((e) => { loose.f.q = e.target.value; loose.current = -1; renderLooseList(); }, 200));
  $$('[data-lf]', view).forEach((sel) => sel.addEventListener('change', () => { loose.f[sel.dataset.lf] = sel.value; loose.current = -1; renderLooseList(); }));
  run(async () => {
    loose.dupes = await api('GET', '/api/loose/duplicates');
    const b = $('#loose-dupes');
    if (b && loose.dupes.length) { b.hidden = false; $('span', b).textContent = tn('dupes_btn', loose.dupes.length); }
  });
}

function renderLooseList() {
  filterLoose();
  const body = $('#loose-body');
  if (!body) return;
  const vis = loose.visible;
  const nSel = loose.selected.size;
  body.innerHTML = `
    <div class="loose-bar">
      <label class="check"><input type="checkbox" id="loose-all" ${vis.length && vis.every((g) => loose.selected.has(groupId(g))) ? 'checked' : ''}><span>${nSel ? tn('selected_n', nSel) : esc(t('select_all'))}</span></label>
      ${nSel ? `
        <button class="btn small" data-mod="ideas" data-action="loose-idea" data-bulk="1">${ICON.bulb}${esc(t('to_ideas'))}</button>
        <button class="btn small primary" data-action="loose-new" data-bulk="1">${ICON.plus}${esc(t('make_song'))}</button>
        <button class="btn small" data-action="loose-join" data-bulk="1">${esc(t('join'))}</button>
        <button class="btn small" data-action="loose-sep" data-bulk="1">${ICON.bookmark}${esc(t('separate'))}</button>
        <button class="btn small danger" data-action="loose-discard" data-bulk="1">${esc(t('discard'))}</button>` : `<span class="muted" style="font-size:13px">${esc(t('showing', { x: vis.length, y: loose.groups.length }))}</span>`}
    </div>
    ${vis.length ? `<div class="loose-list">${vis.map(looseRow).join('')}</div>`
    : `<div class="empty"><h2>${esc(t('nothing_t'))}</h2><p>${esc(t('nothing_p'))}</p></div>`}`;
  $('#loose-all').addEventListener('change', (e) => {
    vis.forEach((g) => (e.target.checked ? loose.selected.add(groupId(g)) : loose.selected.delete(groupId(g))));
    renderLooseList();
  });
  $$('.loose-row > input', body).forEach((c) => c.addEventListener('change', () => {
    if (c.checked) loose.selected.add(c.dataset.gid); else loose.selected.delete(c.dataset.gid);
    renderLooseList();
  }));
  markCurrentLoose();
}

function looseRow(g, i) {
  const audioFile = g.files.find((f) => canPlay(f.ext));
  const gid = groupId(g);
  const origins = [...new Set(g.files.map((f) => f.origin_dir).filter(Boolean))];
  return `<div class="loose-row ${g.separated ? 'separated' : ''}" data-index="${i}">
    <input type="checkbox" data-gid="${gid}" ${loose.selected.has(gid) ? 'checked' : ''} aria-label="${esc(t('select_x', { x: g.title }))}">
    ${audioFile ? `<button class="play-btn ghost" data-action="loose-play" data-index="${i}" aria-label="${esc(t('play_x', { x: g.title }))}">${ICON.play}</button>`
      : g.files.some((f) => isMidi(f.ext)) ? `<a class="play-btn ghost" href="#/midi/list/${g.files.find((f) => isMidi(f.ext)).id}?play=1" aria-label="${esc(t('open_midi_x', { x: g.title }))}">${ICON.play}</a>`
        : `<div class="file-icon">${fileIcon(g.files[0].ext)}</div>`}
    <div class="loose-info"><strong>${esc(g.title)}${g.separated ? ` <span class="sep-badge">${ICON.bookmarkFull}${esc(t('separated_tag'))}</span>` : ''}</strong>
      <div class="loose-files">${g.files.map((f) => `<span class="chip ${canPlay(f.ext) ? 'play' : ''}">${esc((f.ext || '?').toUpperCase())}</span><span>${esc(f.name)}</span>`).join(' ')}<span>· ${fmtSize(g.size)}${origins.length ? ` · ${ICON.folder} ${esc(origins.join(', '))}` : ''}</span></div>
    </div>
    <div class="loose-actions">
      <button class="icon-btn ${g.separated ? 'on' : ''}" data-action="loose-sep" data-index="${i}" aria-pressed="${g.separated}" aria-label="${esc(g.separated ? t('unseparate') : t('separate'))}: ${esc(g.title)}" title="${esc(g.separated ? t('unseparate') : t('separate'))}">${g.separated ? ICON.bookmarkFull : ICON.bookmark}</button>
      ${g.files.filter((f) => TAB_EXTS.has(f.ext)).slice(0, 1).map((f) => `<a class="icon-btn" href="#/tab/list/${f.id}" aria-label="${esc(t('tab_view_x', { x: f.name }))}" title="${esc(t('tab_title'))}">${ICON.ftGp}</a>`).join('')}
      <button class="btn small" data-mod="ideas" data-action="loose-idea" data-index="${i}" title="${esc(t('to_ideas'))}">${ICON.bulb}${esc(t('to_ideas_short'))}</button>
      <button class="btn small primary" data-action="loose-new" data-index="${i}">${ICON.plus}${esc(t('make_song'))}</button>
      <button class="btn small" data-action="loose-join" data-index="${i}">${esc(t('join'))}</button>
      <button class="icon-btn" data-action="loose-discard" data-index="${i}" aria-label="${esc(t('discard'))}: ${esc(g.title)}" title="${esc(t('discard'))}">${ICON.trash}</button>
    </div>
  </div>`;
}

function markCurrentLoose() {
  $$('.loose-row').forEach((row) => {
    const i = Number(row.dataset.index);
    const cur = i === loose.current;
    row.classList.toggle('current', cur);
    const btn = $('.play-btn', row);
    if (btn) {
      btn.classList.toggle('playing', cur);
      btn.innerHTML = cur && !audio.paused ? ICON.pause : ICON.play;
    }
  });
}

function playLoose(i) {
  const g = loose.visible[i];
  if (!g) return;
  loose.current = i;
  const f = g.files.find((x) => canPlay(x.ext));
  if (f) playQueue([{ title: g.title, file: f.name, url: f.url, cover: null, looseIndex: i }]);
  else audio.pause();
  markCurrentLoose();
  $(`.loose-row[data-index="${i}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function looseTargets(el) {
  if (el.dataset.bulk) return loose.groups.filter((g) => loose.selected.has(groupId(g)));
  const g = loose.visible[Number(el.dataset.index)];
  return g ? [g] : [];
}

async function afterLooseAction(groups) {
  const idx = groups.map((g) => loose.visible.indexOf(g)).filter((i) => i >= 0);
  const wasCurrent = idx.includes(loose.current);
  const firstIndex = idx.length ? Math.min(...idx) : 0;
  groups.forEach((g) => loose.selected.delete(groupId(g)));
  await render();
  if (wasCurrent && loose.visible.length) playLoose(Math.min(firstIndex, loose.visible.length - 1));
  else if (wasCurrent) { audio.pause(); loose.current = -1; }
}

async function looseSeparate(groups) {
  const value = !groups.every((g) => g.separated);
  const ids = groups.flatMap((g) => g.files.map((f) => f.id));
  if (!await run(() => api('POST', '/api/loose/flag', { file_ids: ids, value }))) return;
  groups.forEach((g) => { g.separated = value; g.files.forEach((f) => { f.separated = value; }); loose.selected.delete(groupId(g)); });
  renderLooseList();
}

async function looseDedupe() {
  const d = loose.dupes;
  if (!d.length) return;
  const list = d.slice(0, 6).map((x) => x.name).join(', ') + (d.length > 6 ? '…' : '');
  if (!await confirmModal({ title: t('dupes_t'), text: t('dupes_p', { n: d.length, list }), confirm: tn('dupes_btn', d.length), danger: true })) return;
  const res = await run(() => api('POST', '/api/loose/dedupe'));
  if (!res) return;
  toast(tn('dupes_done', res.removed));
  loose.current = -1;
  render();
}

async function looseNewModal(groups) {
  const files = groups.flatMap((g) => g.files);
  const m = openModal(`${modalHead(t('make_song'), t('from_files', { files: tn('files_n', files.length), names: files.slice(0, 3).map((f) => f.name).join(', ') + (files.length > 3 ? '…' : '') }))}
    <form class="modal-body" id="ln-form">
      <label class="field">${esc(t('song_name'))}<input class="input" id="ln-title" value="${esc(groups[0].title)}" autofocus></label>
      ${state.meta.bands.length ? `<label class="field">${esc(t('band'))}<select class="select" id="ln-band"><option value="">${esc(t('no_band'))}</option>${state.meta.bands.map((b) => `<option value="${b.id}">${esc(b.title)}</option>`).join('')}</select></label>` : ''}
    </form>
    <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" type="submit" form="ln-form">${esc(t('create'))}</button></div></div>`, { small: true });
  $('#ln-form', m).addEventListener('submit', async (e) => {
    e.preventDefault();
    const band = $('#ln-band', m)?.value;
    const res = await run(() => api('POST', '/api/loose/assign', { file_ids: files.map((f) => f.id), action: 'new', title: $('#ln-title', m).value, band_id: band ? Number(band) : null }));
    if (!res) return;
    closeModal();
    toast(t('created_toast', { t: res.song.title }), { link: { href: `#/song/${res.song_id}`, label: t('open') } });
    afterLooseAction(groups);
  });
}

async function looseJoinModal(groups) {
  const files = groups.flatMap((g) => g.files);
  const songs = await run(() => api('GET', '/api/songs?sort=title')) || [];
  const m = openModal(`${modalHead(t('join'), t('from_files', { files: tn('files_n', files.length), names: files.slice(0, 3).map((f) => f.name).join(', ') + (files.length > 3 ? '…' : '') }))}
    <div class="modal-body">
      <label class="search" style="min-height:44px">${ICON.search}<span class="sr-only">${esc(t('filter_songs'))}</span><input type="search" id="lj-filter" placeholder="${esc(t('filter_songs'))}" autofocus></label>
      <div class="song-pick" id="lj-list" role="radiogroup" aria-label="${esc(t('choose_song'))}">${songs.map((s, i) => `<label data-title="${esc(s.title.toLowerCase())}"><input type="radio" name="lj-song" value="${s.id}" ${i === 0 ? 'checked' : ''}><span class="track-cover" style="width:40px;height:40px;${bgImg(s.cover_url)}"></span><span>${esc(s.title)}</span><span class="status ${s.status}" style="margin-left:auto">${esc(stLabel(s.status))}</span></label>`).join('')}</div>
      <label class="check"><input type="checkbox" id="lj-newv"><span>${esc(t('as_new_version'))}</span></label>
      <label class="field" id="lj-vlabel-box" hidden>${esc(t('version_name'))}<input class="input" id="lj-vlabel" value="${esc(groups[0].title)}" placeholder="${esc(t('version_ph'))}"></label>
    </div>
    <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" id="lj-go" ${songs.length ? '' : 'disabled'}>${esc(t('join_btn'))}</button></div></div>`);
  $('#lj-filter', m).addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    $$('#lj-list label', m).forEach((l) => { l.hidden = !l.dataset.title.includes(q); });
  });
  $('#lj-newv', m).addEventListener('change', (e) => { $('#lj-vlabel-box', m).hidden = !e.target.checked; });
  $('#lj-go', m).addEventListener('click', async () => {
    const sel = $('#lj-list input:checked', m);
    if (!sel) { toast(t('choose_song'), { error: true }); return; }
    const res = await run(() => api('POST', '/api/loose/assign', {
      file_ids: files.map((f) => f.id), action: 'existing', song_id: Number(sel.value),
      new_version: $('#lj-newv', m).checked, version_label: $('#lj-vlabel', m).value,
    }));
    if (!res) return;
    closeModal();
    toast(t('joined_toast', { t: res.song.title }), { link: { href: `#/song/${res.song_id}`, label: t('open') } });
    afterLooseAction(groups);
  });
}

async function looseDiscard(groups) {
  if (!await confirmModal({ title: t('discard_t'), text: t('discard_p'), confirm: t('discard'), danger: true })) return;
  const ids = groups.flatMap((g) => g.files.map((f) => f.id));
  const res = await run(() => api('POST', '/api/loose/discard', { file_ids: ids }));
  if (!res) return;
  toast(tn('discarded_toast', groups.length));
  afterLooseAction(groups);
}

document.addEventListener('keydown', (e) => {
  if (!loose.active || $('#modal-root').innerHTML) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!loose.visible.length) return;
    e.preventDefault();
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    playLoose(Math.max(0, Math.min(loose.visible.length - 1, loose.current < 0 ? 0 : loose.current + dir)));
  } else if (e.key === ' ' && !e.target.closest('button, a')) {
    e.preventDefault();
    if (loose.current < 0) playLoose(0);
    else if (audio.paused) audio.play(); else audio.pause();
  }
});

// ================================================================ artists and credits
const avatar = (a, size = 36) => `<span class="avatar" style="width:${size}px;height:${size}px;${bgImg(a.photo_url)}">${a.photo_url ? '' : esc(initialsOf(a.name))}</span>`;

function creditsBlock(list, target, title, addLabel, emptyText) {
  const key = Object.keys(target)[0];
  return `<div class="credits">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 style="margin:0;font-size:17px">${esc(title)}</h2>
      <button class="btn small" data-action="add-credit" data-key="${key}" data-id="${target[key]}" data-title="${esc(addLabel)}">${ICON.plus}${esc(addLabel)}</button></div>
    ${list.length ? `<ul class="credit-list">${list.map((c) => `
      <li><a class="credit-artist" href="#/artist/${c.artist.id}">${avatar(c.artist)}<span><strong>${esc(c.artist.name)}</strong>${c.role ? `<span>${esc(c.role)}</span>` : ''}</span></a>
        <button class="icon-btn small" data-action="edit-credit" data-id="${c.id}" data-role="${esc(c.role)}" data-name="${esc(c.artist.name)}" aria-label="${esc(t('edit_role', { x: c.artist.name }))}">${ICON.edit}</button>
        <button class="icon-btn small" data-action="remove-credit" data-id="${c.id}" aria-label="${esc(t('remove_credit', { x: c.artist.name }))}">${ICON.minus}</button></li>`).join('')}</ul>`
    : `<p class="muted" style="margin:0;font-size:14px">${esc(emptyText)}</p>`}
  </div>`;
}

async function creditModal(key, id, title) {
  const artists = await run(() => api('GET', '/api/artists')) || [];
  const roles = STR.roles[LANG === 'en' ? 1 : 0];
  const m = openModal(`${modalHead(title)}
    <form class="modal-body" id="cr-form">
      <label class="field">${esc(t('artist_eyebrow'))}<input class="input" id="cr-artist" list="cr-artists" autocomplete="off" placeholder="${esc(t('artist_ph'))}" autofocus required>
        <span>${esc(t('artist_hint'))}</span></label>
      <datalist id="cr-artists">${artists.map((a) => `<option value="${esc(a.name)}">`).join('')}</datalist>
      <label class="field">${esc(t('credit_role'))}<input class="input" id="cr-role" list="cr-roles" placeholder="${esc(t('role_ph'))}"></label>
      <datalist id="cr-roles">${roles.map((r) => `<option value="${esc(r)}">`).join('')}</datalist>
      <div class="chips">${roles.slice(0, 10).map((r) => `<button type="button" class="tag" data-role="${esc(r)}" style="border:0">${esc(r)}</button>`).join('')}</div>
    </form>
    <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" type="submit" form="cr-form">${esc(t('add'))}</button></div></div>`, { small: true });
  $$('[data-role]', m).forEach((b) => b.addEventListener('click', () => { $('#cr-role', m).value = b.dataset.role; }));
  $('#cr-form', m).addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#cr-artist', m).value.trim();
    const found = artists.find((a) => a.name.toLowerCase() === name.toLowerCase());
    const body = { role: $('#cr-role', m).value, [key]: Number(id), ...(found ? { artist_id: found.id } : { artist_name: name }) };
    if (await run(() => api('POST', '/api/credits', body))) { closeModal(); toast(t('credit_added')); render(); }
  });
}

async function viewArtists(view) {
  const artists = await api('GET', '/api/artists');
  listPage(view, {
    page: 'artists', title: t('nav_artists'), sub: esc(t('artists_sub')), newAction: 'new-artist', newLabel: t('new_artist'),
    items: artists, toEntity: artistEntity,
    match: (a, q) => !q || [a.name, a.bio, ...a.roles].some((x) => (x || '').toLowerCase().includes(q)),
    emptyHtml: `<div class="empty"><h2>${esc(t('no_artists_t'))}</h2><p>${esc(t('no_artists_p'))}</p><button class="btn primary" data-action="new-artist">${ICON.plus}${esc(t('new_artist'))}</button></div>`,
  });
}

let artistCache = null;
async function viewArtist(view, id) {
  const a = await api('GET', `/api/artists/${id}`);
  artistCache = a;
  setPageCover(a.photo_url);
  librarySongs = a.songs;
  const none = !a.songs.length && !a.albums.length && !a.bands.length;
  view.innerHTML = `
    <nav class="crumbs" aria-label="breadcrumb"><a class="btn small" href="#/artists">${ICON.back}${esc(t('nav_artists'))}</a><span>/</span><span class="here">${esc(a.name)}</span></nav>
    <section class="hero">
      <div class="hero-cover round" style="${bgImg(a.photo_url)}">${a.photo_url ? '' : `<span class="initials">${esc(initialsOf(a.name))}</span>`}
        <div class="cover-actions">
          <button class="overlay-btn" data-action="artist-photo" data-id="${a.id}">${ICON.imageSm}${esc(a.photo_url ? t('change_photo') : t('choose_photo'))}</button>
          ${a.photo_url ? `<button class="overlay-btn" data-action="artist-photo-remove" data-id="${a.id}">${esc(t('remove'))}</button>` : ''}
        </div>
      </div>
      <div class="hero-info">
        <span class="eyebrow">${esc(t('artist_eyebrow'))}${a.roles.length ? ` · ${esc(a.roles.join(', '))}` : ''}</span>
        <label class="sr-only" for="artist-name">${esc(t('artist_name'))}</label>
        <input class="title-input" id="artist-name" value="${esc(a.name)}">
        <label class="sr-only" for="artist-bio">${esc(t('bio_ph'))}</label>
        <textarea class="textarea" id="artist-bio" rows="3" style="min-height:90px;max-width:640px" placeholder="${esc(t('bio_ph'))}">${esc(a.bio)}</textarea>
        <div class="hero-meta"><span>${tn('songs_n', a.song_count)} · ${tn('albums_n', a.album_count)}</span></div>
        <div class="actions"><button class="btn danger small" data-action="delete-artist" data-id="${a.id}">${esc(t('delete_artist'))}</button></div>
      </div>
    </section>
    ${none ? `<p class="muted">${esc(t('no_participation'))}</p>` : ''}
    ${a.songs.length ? `<section class="home-row"><h2 class="section-title">${esc(t('in_songs'))}</h2><div class="loose-list">${a.songs.map((s) => `
      <div class="track">
        <div class="track-cover" style="${bgImg(s.cover_url)}"></div>
        <div class="track-info"><a href="#/song/${s.id}">${esc(s.title)}</a><div>${esc(s.roles.join(', '))}${s.band ? ` · ${esc(s.band.title)}` : ''}</div></div>
        <span class="status ${s.status}">${esc(stLabel(s.status))}</span>
        ${s.main_file && canPlay(s.main_file.ext) ? `<button class="play-btn ghost" data-action="play-song" data-id="${s.id}" aria-label="${esc(t('play_x', { x: s.title }))}">${ICON.play}</button>` : ''}
      </div>`).join('')}</div></section>` : ''}
    ${a.albums.length ? `<section class="home-row"><h2 class="section-title">${esc(t('in_albums'))}</h2><div class="row-scroll">${a.albums.map((al) => albumCard({ ...al, band: al.roles.length ? { title: al.roles.join(', ') } : al.band })).join('')}</div></section>` : ''}
    ${a.bands.length ? `<section class="home-row"><h2 class="section-title">${esc(t('in_bands'))}</h2><div class="loose-list">${a.bands.map((b) => `
      <div class="track">${avatar({ name: b.title, photo_url: b.cover_url }, 52)}
        <div class="track-info"><a href="#/band/${b.id}">${esc(b.title)}</a><div>${esc(b.roles.join(', '))}</div></div></div>`).join('')}</div></section>` : ''}`;
  const save = (body) => run(async () => { artistCache = await api('PATCH', `/api/artists/${a.id}`, body); return artistCache; });
  $('#artist-name').addEventListener('change', (e) => save({ name: e.target.value }));
  $('#artist-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
  $('#artist-bio').addEventListener('change', (e) => save({ bio: e.target.value }));
}

// ================================================================ third-party libraries (loaded only when needed)
const VENDOR = '/static/vendor/';
const vendorLoaded = {};
function loadScript(src) {
  if (!vendorLoaded[src]) {
    vendorLoaded[src] = new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = () => { delete vendorLoaded[src]; el.remove(); reject(new Error(t('vendor_fail'))); };
      document.head.appendChild(el);
    });
  }
  return vendorLoaded[src];
}
async function loadWaveSurfer() {
  await loadScript(`${VENDOR}wavesurfer/wavesurfer.min.js?v=7.12.12`);
  await Promise.all(['regions', 'timeline', 'minimap', 'hover'].map((p) => loadScript(`${VENDOR}wavesurfer/${p}.min.js?v=7.12.12`)));
}
const isMidi = (ext) => ext === 'mid' || ext === 'midi';
const TAB_EXTS = new Set(['gp3', 'gp4', 'gp5', 'gpx', 'gp', 'gp6', 'gp7', 'xml', 'musicxml', 'capx']);
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const typingIn = (e) => e.target.closest('input, textarea, select, [contenteditable]') || $('#modal-root').innerHTML;
function fmtTimeP(x) {  // 1:05.3
  if (!isFinite(x)) return '0:00.0';
  const m = Math.floor(x / 60), s = x - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`;
}

// ================================================================ Listening room
const sala = { ws: null, regions: null, loop: null, loopOn: false, a: null, b: null, markers: [], file: null, song: null, rate: 1, zoom: 0 };

function salaFiles(song) {
  return song.versions.flatMap((v) => v.files.filter((f) => canPlay(f.ext)).map((f) => ({ ...f, v })));
}

async function viewSala(view, songId, params) {
  const song = await api('GET', `/api/songs/${songId}`);
  songCache = song;
  setPageCover(song.cover_url);
  const files = salaFiles(song);
  const back = `<nav class="crumbs" aria-label="breadcrumb"><a class="btn small" href="#/${song.is_idea ? 'idea' : 'song'}/${song.id}">${ICON.back}${esc(song.title)}</a><span>/</span><span class="here">${esc(t('sala_title'))}</span></nav>`;
  if (!files.length) {
    view.innerHTML = `${back}<div class="empty"><h2>${esc(t('no_audio_t'))}</h2><p>${esc(t('no_audio_p'))}</p><a class="btn" href="#/song/${song.id}">${esc(t('back'))}</a></div>`;
    return;
  }
  const wanted = Number(params.get('f'));
  const file = files.find((f) => f.id === wanted) || files.find((f) => f.main) || files[0];
  const info = await api('GET', `/api/files/${file.id}`);
  sala.song = song; sala.file = file; sala.markers = info.markers;
  sala.loop = null; sala.loopOn = false; sala.a = null; sala.b = null;
  sala.startAt = Number(params.get('t')) || 0;
  if (!audio.paused) audio.pause();  // the bottom player stops, so two sounds never play together

  const byVersion = song.versions.filter((v) => v.files.some((f) => canPlay(f.ext)));
  const fileSelect = `<select class="select" id="sala-file" aria-label="${esc(t('sala_file'))}">${byVersion.map((v) => `<optgroup label="v${v.number}${v.label ? ` · ${esc(v.label)}` : ''}">${v.files.filter((f) => canPlay(f.ext)).map((f) => `<option value="${f.id}" ${f.id === file.id ? 'selected' : ''}>${esc(f.name)}${f.main ? ' ★' : ''}</option>`).join('')}</optgroup>`).join('')}</select>`;
  const speeds = [0.5, 0.6, 0.75, 0.9, 1];
  const tabs = song.versions.flatMap((v) => v.files.filter((f) => TAB_EXTS.has(f.ext)));
  const others = song.versions.flatMap((v) => v.files.filter((f) => !canPlay(f.ext) && !TAB_EXTS.has(f.ext) && category(f.ext) !== 'image'));
  const field = (label, value) => value ? `<div class="sala-field"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>` : '';

  view.innerHTML = `
    ${back}
    <section class="sala-head">
      <span class="sala-cover${song.cover_url ? '' : ' note-cover'}" style="${bgImg(song.thumb_url || song.cover_url)}">${song.cover_url ? '' : noteCover()}</span>
      <div class="sala-title"><span class="eyebrow">${ICON.headphones} ${esc(t('sala_title'))}</span><h1>${esc(song.title)}</h1></div>
      <label class="sala-file">${esc(t('sala_file'))}${fileSelect}</label>
    </section>

    <section class="sala-deck panel">
      <div class="wave-wrap">
        <div id="wave" class="wave"><div class="wave-loading" id="wave-loading">${esc(t('loading_wave'))}${file.size > 150e6 ? `<br><small>${esc(t('big_file'))}</small>` : ''}</div></div>
        <div id="wave-mini" class="wave-mini"></div>
      </div>
      <div class="transport">
        <div class="transport-main">
          <button class="icon-btn" data-action="sala-seek" data-d="-5" aria-label="${esc(t('back5'))}" title="${esc(t('back5'))}">${ICON.back5}</button>
          <button class="play-btn big" id="sala-play" data-action="sala-play" aria-label="${esc(t('play'))}" disabled>${ICON.play}</button>
          <button class="icon-btn" data-action="sala-seek" data-d="5" aria-label="${esc(t('fwd5'))}" title="${esc(t('fwd5'))}">${ICON.fwd5}</button>
          <span class="sala-time"><strong id="sala-now">0:00.0</strong> / <span id="sala-dur">0:00.0</span></span>
        </div>
        <div class="transport-group">
          <span class="tg-label">${esc(t('speed'))} <strong id="sala-rate-label">${Math.round(sala.rate * 100)}%</strong></span>
          <div class="speed-chips">${speeds.map((x) => `<button class="fchip small" data-action="sala-rate" data-rate="${x}" aria-pressed="${sala.rate === x}">${Math.round(x * 100)}%</button>`).join('')}</div>
          <input type="range" id="sala-rate" min="25" max="150" step="5" value="${Math.round(sala.rate * 100)}" aria-label="${esc(t('speed'))}">
          <span class="tg-hint">${esc(t('pitch_note'))}</span>
        </div>
        <div class="transport-group">
          <span class="tg-label">${esc(t('zoom'))}</span>
          <div class="zoom-row">
            <button class="icon-btn small" data-action="sala-zoom" data-d="-1" aria-label="${esc(t('zoom_out'))}">${ICON.minus}</button>
            <input type="range" id="sala-zoom" min="0" max="600" step="10" value="${sala.zoom}" aria-label="${esc(t('zoom'))}">
            <button class="icon-btn small" data-action="sala-zoom" data-d="1" aria-label="${esc(t('zoom_in'))}">${ICON.plus}</button>
          </div>
        </div>
        <div class="transport-group">
          <span class="tg-label">${esc(t('loop'))} <strong id="sala-loop-label">—</strong></span>
          <div class="loop-row">
            <button class="btn small" data-action="sala-a">${esc(t('set_a'))}</button>
            <button class="btn small" data-action="sala-b">${esc(t('set_b'))}</button>
            <button class="btn small" id="sala-loop-toggle" data-action="sala-loop" aria-pressed="false" disabled>${ICON.repeat}${esc(t('loop_on'))}</button>
            <button class="btn small" id="sala-loop-save" data-action="sala-loop-save" disabled>${ICON.bookmark}${esc(t('loop_save'))}</button>
            <button class="icon-btn small" id="sala-loop-clear" data-action="sala-loop-clear" aria-label="${esc(t('loop_clear'))}" title="${esc(t('loop_clear'))}" disabled>${ICON.close}</button>
          </div>
          <span class="tg-hint">${esc(t('loop_hint'))}</span>
        </div>
      </div>
      <p class="shortcuts"><strong>${esc(t('shortcuts'))}:</strong> ${esc(t('shortcuts_text'))}</p>
    </section>

    <div class="sala-grid">
      <section class="panel">
        <div class="panel-head"><h2>${esc(t('markers'))}</h2><button class="btn small" data-action="sala-marker">${ICON.flag}${esc(t('add_marker'))}</button></div>
        <div id="sala-markers"></div>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>${esc(t('about_song'))}</h2><a class="btn small" href="#/${song.is_idea ? 'idea' : 'song'}/${song.id}">${ICON.edit}${esc(t('edit_song'))}</a></div>
        <div class="sala-fields">
          ${song.is_idea ? field(t('idea_kind'), kindLabel(song.idea_kind)) : `${field(t('status'), stLabel(song.status))}${field(t('band'), song.band?.title)}${field(t('style'), song.style)}`}
          ${field(t('key'), song.music_key)}${field(t('bpm'), song.bpm)}${field(t('tuning'), song.tuning)}
          ${song.is_idea ? '' : field(t('album'), song.albums.map((a) => a.title).join(', '))}
          ${field(t('version'), `v${file.v.number}${file.v.label ? ` · ${file.v.label}` : ''}`)}
        </div>
        ${song.notes ? `<div class="sala-notes">${esc(song.notes)}</div>` : ''}
        ${song.credits.length ? `<div class="sala-credits">${song.credits.map((c) => `<a href="#/artist/${c.artist.id}">${avatar(c.artist, 28)}<span><strong>${esc(c.artist.name)}</strong>${c.role ? ` · ${esc(c.role)}` : ''}</span></a>`).join('')}</div>` : ''}
        ${tabs.length || others.length ? `<h3 class="sala-sub">${esc(t('sala_other'))}</h3><div class="sala-other">
          ${tabs.map((f) => `<a class="btn small" href="#/tab/${f.id}">${ICON.ftGp}${esc(f.name)}</a>`).join('')}
          ${others.map((f) => (isMidi(f.ext) ? `<a class="btn small" href="#/midi/${f.id}">${ICON.ftMidi}${esc(f.name)}</a>` : `<a class="btn small" href="${esc(f.url)}?download=1" download>${fileIcon(f.ext)}${esc(f.name)}</a>`)).join('')}</div>` : ''}
      </section>
    </div>
    ${song.texts.length ? `<section class="sala-texts">${song.texts.map((x) => `<article class="panel sala-text"><h3>${esc(x.title || t('untitled'))}</h3><div>${esc(x.body)}</div></article>`).join('')}</section>` : ''}`;

  renderSalaMarkers();
  $('#sala-file').addEventListener('change', (e) => { history.replaceState(null, '', `#/listen/${song.id}?f=${e.target.value}`); render(); });
  $('#sala-rate').addEventListener('input', (e) => setSalaRate(Number(e.target.value) / 100));
  $('#sala-zoom').addEventListener('input', (e) => setSalaZoom(Number(e.target.value)));
  $('#sala-markers').addEventListener('change', async (e) => {
    const input = e.target.closest('[data-marker-label]');
    if (!input) return;
    const m = await run(() => api('PATCH', `/api/markers/${input.dataset.markerLabel}`, { label: input.value }));
    if (m) { sala.markers = sala.markers.map((x) => (x.id === m.id ? m : x)); drawMarkerRegions(); }
  });

  const onKey = (e) => salaKey(e);
  document.addEventListener('keydown', onKey);
  viewCleanup = () => {
    document.removeEventListener('keydown', onKey);
    sala.ws?.destroy();
    sala.ws = null; sala.regions = null; sala.loop = null;
  };

  try { await loadWaveSurfer(); } catch (err) { $('#wave-loading').textContent = err.message; return; }
  if (route().parts[0] !== 'listen' || sala.file !== file) return;  // the user left while it was loading
  buildWave(file);
}

function buildWave(file) {
  const accent = cssVar('--accent') || '#f2b544';
  const muted = cssVar('--muted') || '#9aa0a6';
  const regions = WaveSurfer.Regions.create();
  const ws = WaveSurfer.create({
    container: '#wave', url: file.url, height: 170, normalize: true,
    waveColor: muted, progressColor: accent, cursorColor: cssVar('--text') || '#fff', cursorWidth: 2,
    barWidth: 2, barGap: 1, barRadius: 2, minPxPerSec: sala.zoom, autoScroll: true, autoCenter: true, dragToSeek: false,
    plugins: [
      regions,
      WaveSurfer.Timeline.create({ height: 18, style: { color: muted, fontSize: '11px' } }),
      WaveSurfer.Minimap.create({ container: '#wave-mini', height: 34, waveColor: muted, progressColor: accent, cursorWidth: 0, overlayColor: 'rgba(127,127,127,.18)' }),
      WaveSurfer.Hover.create({ lineColor: accent, lineWidth: 1, labelBackground: 'rgba(0,0,0,.75)', labelColor: '#fff', labelSize: '11px' }),
    ],
  });
  sala.ws = ws; sala.regions = regions;
  regions.enableDragSelection({ color: `color-mix(in srgb, ${accent} 24%, transparent)` });
  regions.on('region-created', (r) => {
    if (r.id.startsWith('mk-')) return;
    if (sala.loop && sala.loop !== r) sala.loop.remove();
    sala.loop = r; sala.a = r.start; sala.b = r.end;
    if (!sala.loopOn) setLoopOn(true);
    updateLoopUi();
  });
  regions.on('region-updated', (r) => { if (r === sala.loop) { sala.a = r.start; sala.b = r.end; updateLoopUi(); } });
  regions.on('region-clicked', (r, e) => {
    if (!r.id.startsWith('mk-')) return;
    e.stopPropagation();
    const m = sala.markers.find((x) => `mk-${x.id}` === r.id);
    if (m) jumpToMarker(m);
  });
  ws.on('ready', () => {
    $('#wave-loading')?.remove();
    $('#sala-play').disabled = false;
    $('#sala-dur').textContent = fmtTimeP(ws.getDuration());
    ws.setPlaybackRate(sala.rate, true);
    drawMarkerRegions();
    if (sala.startAt) { ws.setTime(Math.min(sala.startAt, ws.getDuration() - 0.1)); ws.play().catch(() => {}); sala.startAt = 0; }
  });
  ws.on('error', () => { const l = $('#wave-loading'); if (l) l.textContent = t('wave_error'); });
  ws.on('timeupdate', (time) => {
    if (sala.loopOn && sala.loop && time >= sala.loop.end - 0.01) { ws.setTime(sala.loop.start); return; }
    const now = $('#sala-now');
    if (now) now.textContent = fmtTimeP(time);
  });
  ws.on('play', () => {
    if (sala.loopOn && sala.loop) { const x = ws.getCurrentTime(); if (x < sala.loop.start || x > sala.loop.end) ws.setTime(sala.loop.start); }
    salaPlayButton(true);
  });
  ws.on('pause', () => salaPlayButton(false));
  ws.on('finish', () => salaPlayButton(false));
}

function salaPlayButton(playing) {
  const b = $('#sala-play');
  if (!b) return;
  b.innerHTML = playing ? ICON.pause : ICON.play;
  b.setAttribute('aria-label', playing ? t('pause') : t('play'));
}
function setSalaRate(rate) {
  sala.rate = Math.max(0.25, Math.min(1.5, Math.round(rate * 100) / 100));
  sala.ws?.setPlaybackRate(sala.rate, true);  // true = keep the pitch
  const label = $('#sala-rate-label'); if (label) label.textContent = `${Math.round(sala.rate * 100)}%`;
  const range = $('#sala-rate'); if (range) range.value = Math.round(sala.rate * 100);
  $$('[data-action="sala-rate"]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.rate) === sala.rate)));
}
function setSalaZoom(px) {
  sala.zoom = Math.max(0, Math.min(600, px));
  if (sala.ws && sala.ws.getDuration()) sala.ws.zoom(sala.zoom);
  const range = $('#sala-zoom'); if (range) range.value = sala.zoom;
}
function setLoopOn(on) {
  sala.loopOn = on && !!sala.loop;
  const b = $('#sala-loop-toggle');
  if (b) b.setAttribute('aria-pressed', String(sala.loopOn));
  if (sala.loop) sala.loop.setOptions({ color: `color-mix(in srgb, ${cssVar('--accent')} ${sala.loopOn ? 26 : 10}%, transparent)` });
}
function setLoop(start, end) {
  if (!sala.regions) return;
  if (sala.loop) sala.loop.remove();
  sala.loop = null;
  sala.a = start; sala.b = end;
  // region-created stores it as the current section and turns on looping
  sala.regions.addRegion({ start, end, color: `color-mix(in srgb, ${cssVar('--accent')} 26%, transparent)`, drag: true, resize: true });
}
function updateLoopUi() {
  const has = !!sala.loop;
  const label = $('#sala-loop-label');
  if (label) label.textContent = has ? `${fmtTimeP(sala.loop.start)} – ${fmtTimeP(sala.loop.end)}` : sala.a != null ? `A ${fmtTimeP(sala.a)}` : '—';
  ['#sala-loop-toggle', '#sala-loop-save', '#sala-loop-clear'].forEach((id) => { const b = $(id); if (b) b.disabled = !has; });
}
function clearLoop() {
  sala.loop?.remove();
  sala.loop = null; sala.a = null; sala.b = null;
  setLoopOn(false);
  updateLoopUi();
}
function markA() {
  if (!sala.ws) return;
  const x = sala.ws.getCurrentTime();
  if (sala.loop && x < sala.loop.end) { setLoop(x, sala.loop.end); return; }
  if (sala.loop) clearLoop();
  sala.a = x; sala.b = null;
  updateLoopUi();
}
function markB() {
  if (!sala.ws) return;
  const x = sala.ws.getCurrentTime();
  const a = sala.loop ? sala.loop.start : sala.a;
  if (a == null || x <= a + 0.05) { toast(t('need_a'), { error: true }); return; }
  setLoop(a, x);
}

function drawMarkerRegions() {
  if (!sala.regions || !sala.ws?.getDuration()) return;
  sala.regions.getRegions().filter((r) => r.id.startsWith('mk-')).forEach((r) => r.remove());
  const accent = cssVar('--accent');
  sala.markers.forEach((m, i) => {
    const content = document.createElement('span');
    content.className = 'mk-label';
    // the waveform lives in a shadow DOM: the style goes straight on the element
    Object.assign(content.style, { display: 'inline-block', width: 'max-content', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis',
      whiteSpace: 'nowrap', margin: '2px 0 0 4px', padding: '1px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
      background: accent, color: cssVar('--on-accent') || '#111', pointerEvents: 'none', fontFamily: 'inherit' });
    content.textContent = `${i + 1}${m.label ? ` · ${m.label}` : ''}`;
    sala.regions.addRegion({
      id: `mk-${m.id}`, start: m.time, end: m.end_time ?? undefined, content, drag: false, resize: false,
      color: m.end_time != null ? 'rgba(127,127,127,.14)' : accent,
    });
  });
}
function renderSalaMarkers() {
  const box = $('#sala-markers');
  if (!box) return;
  if (!sala.markers.length) { box.innerHTML = `<p class="muted" style="margin:0;font-size:14px">${esc(t('no_markers'))}</p>`; return; }
  box.innerHTML = `<div class="marker-list">${sala.markers.map((m, i) => `
    <div class="marker-row">
      <span class="marker-n">${i + 1}</span>
      <button class="btn small mono" data-action="sala-goto" data-id="${m.id}" aria-label="${esc(t('go_to', { x: fmtTimeP(m.time) }))}">${m.end_time != null ? `${ICON.repeat}${fmtTimeP(m.time)} – ${fmtTimeP(m.end_time)}` : `${ICON.flag}${fmtTimeP(m.time)}`}</button>
      <label class="sr-only" for="mk-${m.id}">${esc(t('marker_label'))}</label>
      <input class="input" id="mk-${m.id}" data-marker-label="${m.id}" value="${esc(m.label)}" placeholder="${esc(t('marker_label'))}">
      <button class="icon-btn small" data-action="sala-marker-del" data-id="${m.id}" aria-label="${esc(t('delete_marker'))}" title="${esc(t('delete_marker'))}">${ICON.trash}</button>
    </div>`).join('')}</div>`;
}
function jumpToMarker(m) {
  if (!sala.ws) return;
  if (m.end_time != null) setLoop(m.time, m.end_time);
  sala.ws.setTime(m.time);
  if (!sala.ws.isPlaying()) sala.ws.play();
}
async function addSalaMarker() {
  if (!sala.ws) return;
  const n = sala.markers.filter((x) => x.end_time == null).length + 1;
  const m = await run(() => api('POST', `/api/files/${sala.file.id}/markers`, { time: sala.ws.getCurrentTime(), label: t('marker_n', { n }) }));
  if (!m) return;
  sala.markers = [...sala.markers, m].sort((a, b) => a.time - b.time);
  renderSalaMarkers(); drawMarkerRegions();
  toast(t('marker_added', { x: fmtTimeP(m.time) }));
}

function salaKey(e) {
  if (!sala.ws || typingIn(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  const ws = sala.ws;
  const k = e.key;
  let handled = true;
  if (k === ' ') { if (!e.target.closest('button, a')) ws.playPause(); else handled = false; }
  else if (k === 'ArrowLeft' || k === 'ArrowRight') ws.setTime(Math.max(0, ws.getCurrentTime() + (k === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 1 : 5)));
  else if (k === 'a' || k === 'A') markA();
  else if (k === 'b' || k === 'B') markB();
  else if (k === 'l' || k === 'L') setLoopOn(!sala.loopOn);
  else if (k === 'm' || k === 'M') addSalaMarker();
  else if (k === '+' || k === '=') setSalaZoom(sala.zoom + 40);
  else if (k === '-' || k === '_') setSalaZoom(sala.zoom - 40);
  else if (k === '[') setSalaRate(sala.rate - 0.05);
  else if (k === ']') setSalaRate(sala.rate + 0.05);
  else if (k === 'Home') ws.setTime(sala.loopOn && sala.loop ? sala.loop.start : 0);
  else if (/^[1-9]$/.test(k)) { const m = sala.markers[Number(k) - 1]; if (m) jumpToMarker(m); else handled = false; }
  else handled = false;
  if (handled) e.preventDefault();
}

// ================================================================ Tab viewer (alphaTab)
const tabState = { api: null, tracks: [], shown: 0, playing: false };

async function viewTab(view, parts) {
  const fromList = parts[1] === 'list';
  const id = Number(fromList ? parts[2] : parts[1]);
  const info = await api('GET', fromList ? `/api/loose/files/${id}` : `/api/files/${id}`);
  const backHref = fromList ? '#/files' : `#/song/${info.song_id}`;
  const backLabel = fromList ? t('nav_loose') : info.song_title;
  if (!audio.paused) audio.pause();
  if (!fromList) api('GET', `/api/songs/${info.song_id}`).then((s) => { if (route().parts[0] === 'tab') setPageCover(s.cover_url); }).catch(() => {});
  const speeds = [0.25, 0.5, 0.75, 0.9, 1, 1.25];
  view.innerHTML = `
    <nav class="crumbs" aria-label="breadcrumb"><a class="btn small" href="${backHref}">${ICON.back}${esc(backLabel)}</a><span>/</span><span class="here">${esc(info.name)}</span></nav>
    <section class="tab-head">
      <div><span class="eyebrow">${ICON.ftGp} ${esc(t('tab_title'))}</span><h1 id="tab-title">${esc(info.name)}</h1><p class="muted" id="tab-sub"></p></div>
      <a class="btn small" href="${esc(info.url)}?download=1" download="${esc(info.name)}">${ICON.download}${esc(t('download'))}</a>
    </section>
    <div class="tab-stage" id="tab-stage">
    <div class="tab-toolbar panel">
      <button class="play-btn" id="tab-play" data-action="tab-play" aria-label="${esc(t('play'))}" disabled>${ICON.play}</button>
      <button class="icon-btn" data-action="tab-stop" aria-label="${esc(t('stop'))}" title="${esc(t('stop'))}">${ICON.stop}</button>
      <span class="sala-time" id="tab-time">0:00 / 0:00</span>
      <span class="sep"></span>
      <label class="label">${esc(t('speed'))}<select class="pill-select" id="tab-speed">${speeds.map((x) => `<option value="${x}" ${x === 1 ? 'selected' : ''}>${Math.round(x * 100)}%</option>`).join('')}</select></label>
      <button class="fchip small" data-action="tab-toggle" data-key="metronome" aria-pressed="false">${ICON.metronome}${esc(t('metronome'))}</button>
      <button class="fchip small" data-action="tab-toggle" data-key="countin" aria-pressed="false">${esc(t('count_in'))}</button>
      <button class="fchip small" data-action="tab-toggle" data-key="loop" aria-pressed="false">${ICON.repeat}${esc(t('loop_sel'))}</button>
      <span class="sep"></span>
      <label class="label">${esc(t('zoom'))}<select class="pill-select" id="tab-zoom">${[0.6, 0.8, 1, 1.2, 1.5].map((x) => `<option value="${x}" ${x === 1 ? 'selected' : ''}>${Math.round(x * 100)}%</option>`).join('')}</select></label>
      <label class="label">${esc(t('layout'))}<select class="pill-select" id="tab-layout"><option value="page">${esc(t('layout_page'))}</option><option value="horizontal">${esc(t('layout_h'))}</option></select></label>
      <span class="sep"></span>
      <label class="label vol">${ICON.volume}<span class="sr-only">${esc(t('volume'))}</span><input type="range" id="tab-volume" min="0" max="400" step="10" value="${tabVolume()}" aria-label="${esc(t('volume'))}"><span id="tab-volume-label">${tabVolume()}%</span></label>
      <button class="icon-btn" id="tab-full" data-action="tab-full" aria-label="${esc(t('fullscreen'))}" title="${esc(t('fullscreen'))} (F)">${ICON.expand}</button>
    </div>
    <div class="tab-body">
      <aside class="panel tab-tracks"><h2>${esc(t('tracks'))}</h2><div id="tab-track-list"><p class="muted" style="font-size:13px">${esc(t('loading_score'))}</p></div>
        <p class="tg-hint" style="margin-top:12px">${esc(t('tab_hint'))}</p></aside>
      <div class="tab-viewport" id="tab-viewport">
        <div class="tab-status" id="tab-status">${esc(t('loading_score'))}</div>
        <div id="tab-score"></div>
      </div>
    </div>
    </div>`;

  const onKey = (e) => {
    if (!tabState.api || typingIn(e)) return;
    if (e.key === ' ' && !e.target.closest('button, a')) { e.preventDefault(); tabState.api.playPause(); }
    else if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleTabFullscreen(); }
  };
  const onFull = () => {
    const on = document.fullscreenElement === $('#tab-stage');
    const b = $('#tab-full');
    if (b) { b.innerHTML = on ? ICON.shrink : ICON.expand; b.setAttribute('aria-label', on ? t('exit_fullscreen') : t('fullscreen')); b.title = `${on ? t('exit_fullscreen') : t('fullscreen')} (F)`; }
  };
  document.addEventListener('keydown', onKey);
  document.addEventListener('fullscreenchange', onFull);
  viewCleanup = () => {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('fullscreenchange', onFull);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    try { tabState.api?.destroy(); } catch { /* already destroyed */ }
    tabState.api = null;
  };

  try { await loadScript(`${VENDOR}alphatab/alphaTab.min.js?v=1.9.0`); } catch (err) { $('#tab-status').textContent = err.message; return; }
  if (route().parts[0] !== 'tab') return;
  const at = new alphaTab.AlphaTabApi($('#tab-score'), {
    // alphaTab runs parts in a worker, which needs full addresses (with http://server)
    core: { file: info.url, fontDirectory: `${location.origin}${VENDOR}alphatab/font/`, scriptFile: `${location.origin}${VENDOR}alphatab/alphaTab.min.js?v=1.9.0` },
    display: { layoutMode: alphaTab.LayoutMode.Page, scale: 1 },
    player: { playerMode: alphaTab.PlayerMode.EnabledSynthesizer, soundFont: `${location.origin}${VENDOR}alphatab/soundfont/sonivox.sf2`, scrollElement: $('#tab-viewport'), scrollOffsetY: -40 },
  });
  tabState.api = at; tabState.shown = 0;
  const status = (msg) => { const el = $('#tab-status'); if (el) { el.textContent = msg || ''; el.hidden = !msg; } };
  at.error.on(() => status(t('tab_error')));
  at.scoreLoaded.on((score) => {
    tabState.tracks = score.tracks;
    if (score.title) $('#tab-title').textContent = score.title;
    $('#tab-sub').textContent = [score.artist, score.album, score.tempo ? `${score.tempo} bpm` : ''].filter(Boolean).join(' · ');
    renderTabTracks();
  });
  at.renderStarted.on(() => status(t('rendering')));
  at.renderFinished.on(() => status(''));
  at.soundFontLoad.on((e) => { if (e.total) $('#tab-play')?.setAttribute('title', t('loading_sound', { p: Math.round((e.loaded / e.total) * 100) })); });
  at.playerReady.on(() => { const b = $('#tab-play'); if (b) { b.disabled = false; b.removeAttribute('title'); } at.masterVolume = tabVolume() / 100; });
  at.masterVolume = tabVolume() / 100;
  $('#tab-volume').addEventListener('input', (e) => {
    const v = Number(e.target.value);
    at.masterVolume = v / 100;
    $('#tab-volume-label').textContent = `${v}%`;
    try { localStorage.setItem('mdop-tab-volume', String(v)); } catch { /* no storage */ }
  });
  at.playerStateChanged.on((e) => {
    tabState.playing = e.state === 1;
    const b = $('#tab-play');
    if (b) { b.innerHTML = tabState.playing ? ICON.pause : ICON.play; b.setAttribute('aria-label', tabState.playing ? t('pause') : t('play')); }
  });
  let lastSec = -1;
  at.playerPositionChanged.on((e) => {
    const sec = Math.floor(e.currentTime / 1000);
    if (sec === lastSec) return;
    lastSec = sec;
    const el = $('#tab-time');
    if (el) el.textContent = `${fmtTime(e.currentTime / 1000)} / ${fmtTime(e.endTime / 1000)}`;
  });
  $('#tab-speed').addEventListener('change', (e) => { at.playbackSpeed = Number(e.target.value); });
  $('#tab-zoom').addEventListener('change', (e) => { at.settings.display.scale = Number(e.target.value); at.updateSettings(); at.render(); });
  $('#tab-layout').addEventListener('change', (e) => {
    at.settings.display.layoutMode = e.target.value === 'horizontal' ? alphaTab.LayoutMode.Horizontal : alphaTab.LayoutMode.Page;
    $('#tab-viewport').classList.toggle('horizontal', e.target.value === 'horizontal');
    at.updateSettings(); at.render();
  });
  $('#tab-track-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-track]');
    if (!b) return;
    const track = tabState.tracks[Number(b.dataset.track)];
    if (!track) return;
    const what = b.dataset.what;
    if (what === 'show') { tabState.shown = track.index; at.renderTracks([track]); }
    else if (what === 'mute') at.changeTrackMute([track], b.getAttribute('aria-pressed') !== 'true');
    else if (what === 'solo') at.changeTrackSolo([track], b.getAttribute('aria-pressed') !== 'true');
    if (what !== 'show') b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    else renderTabTracks();
  });
}
// the built-in sound bank is quiet: start at 200% and remember what is chosen
function tabVolume() {
  try {
    const raw = localStorage.getItem('mdop-tab-volume');
    if (raw !== null && raw !== '' && !isNaN(Number(raw))) return Number(raw);
  } catch { /* no storage */ }
  return 200;
}
function toggleTabFullscreen() {
  const stage = $('#tab-stage');
  if (!stage) return;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else stage.requestFullscreen?.().catch(() => toast(t('err_generic', { n: 'fullscreen' }), { error: true }));
}
function renderTabTracks() {
  const box = $('#tab-track-list');
  if (!box) return;
  box.innerHTML = tabState.tracks.map((tr, i) => `
    <div class="track-item ${tabState.shown === i ? 'on' : ''}">
      <button class="track-name" data-track="${i}" data-what="show" aria-pressed="${tabState.shown === i}">${ICON.ftGp}<span>${esc(tr.name || `${t('track')} ${i + 1}`)}</span></button>
      <div class="track-btns">
        <button class="fchip small" data-track="${i}" data-what="solo" aria-pressed="false">${esc(t('solo'))}</button>
        <button class="fchip small" data-track="${i}" data-what="mute" aria-pressed="false">${esc(t('mute'))}</button>
      </div>
    </div>`).join('');
}

// ================================================================ MIDI player (piano roll + alphaTab synthesizer)
const GM = ['Acoustic Grand Piano', 'Bright Acoustic Piano', 'Electric Grand Piano', 'Honky-tonk Piano', 'Electric Piano 1', 'Electric Piano 2', 'Harpsichord', 'Clavinet', 'Celesta', 'Glockenspiel', 'Music Box', 'Vibraphone', 'Marimba', 'Xylophone', 'Tubular Bells', 'Dulcimer', 'Drawbar Organ', 'Percussive Organ', 'Rock Organ', 'Church Organ', 'Reed Organ', 'Accordion', 'Harmonica', 'Tango Accordion', 'Nylon Guitar', 'Steel Guitar', 'Jazz Guitar', 'Clean Guitar', 'Muted Guitar', 'Overdriven Guitar', 'Distortion Guitar', 'Guitar Harmonics', 'Acoustic Bass', 'Fingered Bass', 'Picked Bass', 'Fretless Bass', 'Slap Bass 1', 'Slap Bass 2', 'Synth Bass 1', 'Synth Bass 2', 'Violin', 'Viola', 'Cello', 'Contrabass', 'Tremolo Strings', 'Pizzicato Strings', 'Orchestral Harp', 'Timpani', 'String Ensemble 1', 'String Ensemble 2', 'Synth Strings 1', 'Synth Strings 2', 'Choir Aahs', 'Voice Oohs', 'Synth Voice', 'Orchestra Hit', 'Trumpet', 'Trombone', 'Tuba', 'Muted Trumpet', 'French Horn', 'Brass Section', 'Synth Brass 1', 'Synth Brass 2', 'Soprano Sax', 'Alto Sax', 'Tenor Sax', 'Baritone Sax', 'Oboe', 'English Horn', 'Bassoon', 'Clarinet', 'Piccolo', 'Flute', 'Recorder', 'Pan Flute', 'Blown Bottle', 'Shakuhachi', 'Whistle', 'Ocarina', 'Square Lead', 'Sawtooth Lead', 'Calliope Lead', 'Chiff Lead', 'Charang Lead', 'Voice Lead', 'Fifths Lead', 'Bass + Lead', 'New Age Pad', 'Warm Pad', 'Polysynth Pad', 'Choir Pad', 'Bowed Pad', 'Metallic Pad', 'Halo Pad', 'Sweep Pad', 'Rain', 'Soundtrack', 'Crystal', 'Atmosphere', 'Brightness', 'Goblins', 'Echoes', 'Sci-fi', 'Sitar', 'Banjo', 'Shamisen', 'Koto', 'Kalimba', 'Bagpipe', 'Fiddle', 'Shanai', 'Tinkle Bell', 'Agogo', 'Steel Drums', 'Woodblock', 'Taiko Drum', 'Melodic Tom', 'Synth Drum', 'Reverse Cymbal', 'Guitar Fret Noise', 'Breath Noise', 'Seashore', 'Bird Tweet', 'Telephone Ring', 'Helicopter', 'Applause', 'Gunshot'];
const ROLL_COLORS = ['#F2B544', '#6AA5F5', '#4CC38A', '#EF7B6E', '#B48CF2', '#F28CC0', '#5FD3D3', '#C9D45C'];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// read a .mid file (format 0 or 1) with no dependencies
function parseMidi(buf) {
  const d = new DataView(buf);
  const bytes = new Uint8Array(buf);
  const tag = (at) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
  if (buf.byteLength < 14 || tag(0) !== 'MThd') throw new Error('not-midi');
  const division = d.getUint16(12);
  if (division & 0x8000) throw new Error('smpte');
  const nTracks = d.getUint16(10);
  const decoder = new TextDecoder('latin1');
  let p = 8 + d.getUint32(4);
  const tracks = [];
  while (tracks.length < nTracks && p + 8 <= buf.byteLength) {
    const id = tag(p), len = d.getUint32(p + 4);
    p += 8;
    const end = Math.min(p + len, buf.byteLength);
    if (id !== 'MTrk') { p = end; continue; }
    const tr = { name: '', events: [] };
    let tick = 0, status = 0;
    const vlq = () => { let v = 0, b; do { b = bytes[p++]; v = (v << 7) | (b & 0x7f); } while (b & 0x80 && p < end); return v; };
    while (p < end) {
      tick += vlq();
      if (p >= end) break;
      if (bytes[p] & 0x80) status = bytes[p++];
      else if (!status) break;  // data without a status byte: broken file, stop here
      if (status === 0xff) {
        const type = bytes[p++];
        const l = vlq();
        const data = bytes.subarray(p, p + l);
        p += l;
        if (type === 0x03 && !tr.name) tr.name = decoder.decode(data).replace(/\0/g, '').trim();
        else if (type === 0x51 && l === 3) tr.events.push({ tick, kind: 'tempo', us: (data[0] << 16) | (data[1] << 8) | data[2] });
        else if (type === 0x58 && l >= 2) tr.events.push({ tick, kind: 'timesig', num: data[0], den: 2 ** data[1] });
        status = 0;
      } else if (status === 0xf0 || status === 0xf7) {
        p += vlq();
        status = 0;
      } else {
        const hi = status & 0xf0, ch = status & 0x0f;
        const a = bytes[p++];
        const b = hi === 0xc0 || hi === 0xd0 ? 0 : bytes[p++];
        tr.events.push({ tick, kind: 'ch', hi, ch, a, b });
      }
    }
    tr.endTick = tick;
    tracks.push(tr);
    p = end;
  }
  return { division, tracks };
}

// notes (start, end, key) per track, to draw the piano roll
function midiNotes(parsed) {
  const out = [];
  parsed.tracks.forEach((tr, ti) => {
    const open = new Map();
    tr.events.forEach((e) => {
      if (e.kind !== 'ch') return;
      const k = `${e.ch}:${e.a}`;
      if (e.hi === 0x90 && e.b > 0) { if (!open.has(k)) open.set(k, []); open.get(k).push({ start: e.tick, vel: e.b }); }
      else if (e.hi === 0x80 || (e.hi === 0x90 && e.b === 0)) {
        const st = open.get(k)?.shift();
        if (st) out.push({ track: ti, ch: e.ch, key: e.a, start: st.start, end: Math.max(e.tick, st.start + 1), vel: st.vel });
      }
    });
    open.forEach((list, k) => list.forEach((st) => out.push({ track: ti, ch: Number(k.split(':')[0]), key: Number(k.split(':')[1]), start: st.start, end: tr.endTick || st.start + parsed.division, vel: st.vel })));
  });
  return out.sort((x, y) => x.start - y.start);
}

// build the file in the alphaTab synthesizer's format
function toAlphaMidi(parsed) {
  const M = alphaTab.midi;
  const midi = new M.MidiFile();
  midi.format = 1;
  midi.division = parsed.division;
  let hasTempo = false;
  parsed.tracks.forEach((tr, ti) => {
    tr.events.forEach((e) => {
      if (e.kind === 'tempo') { midi.addEvent(new M.TempoChangeEvent(e.tick, e.us)); hasTempo = true; return; }
      if (e.kind !== 'ch') return;
      if (e.hi === 0x90 && e.b > 0) midi.addEvent(new M.NoteOnEvent(ti, e.tick, e.ch, e.a, e.b));
      else if (e.hi === 0x80 || e.hi === 0x90) midi.addEvent(new M.NoteOffEvent(ti, e.tick, e.ch, e.a, e.b));
      else if (e.hi === 0xb0) midi.addEvent(new M.ControlChangeEvent(ti, e.tick, e.ch, e.a, e.b));
      else if (e.hi === 0xc0) midi.addEvent(new M.ProgramChangeEvent(ti, e.tick, e.ch, e.a));
      else if (e.hi === 0xe0) midi.addEvent(new M.PitchBendEvent(ti, e.tick, e.ch, (e.b << 7) | e.a));
    });
  });
  if (!hasTempo) midi.addEvent(new M.TempoChangeEvent(0, 500000));
  const last = Math.max(0, ...parsed.tracks.map((tr) => tr.endTick || 0));
  parsed.tracks.forEach((_, ti) => midi.addEvent(new M.EndOfTrackEvent(ti, last)));
  return midi;
}

function createSynth() {
  const settings = new alphaTab.Settings();
  settings.core.scriptFile = `${location.origin}${VENDOR}alphatab/alphaTab.min.js?v=1.9.0`;
  const worker = new Worker(URL.createObjectURL(new Blob([`importScripts('${settings.core.scriptFile}')`], { type: 'application/javascript' })));
  const S = alphaTab.synth;
  const output = window.isSecureContext && 'AudioWorkletNode' in window ? new S.AlphaSynthAudioWorkletOutput(settings) : new S.AlphaSynthScriptProcessorOutput();
  return new S.AlphaSynthWebWorkerApi(output, settings, worker);
}

const midiState = { player: null, parsed: null, notes: [], tracks: [], tick: 0, endTick: 0, pxPerBeat: 70, playing: false, keyLo: 40, keyHi: 80, follow: true };

function midiVolume() {
  try { const raw = localStorage.getItem('mdop-midi-volume'); if (raw !== null && raw !== '' && !isNaN(Number(raw))) return Number(raw); } catch { /* no storage */ }
  return 200;
}

async function viewMidi(view, parts, params) {
  const fromList = parts[1] === 'list';
  const id = Number(fromList ? parts[2] : parts[1]);
  const info = await api('GET', fromList ? `/api/loose/files/${id}` : `/api/files/${id}`);
  const backHref = fromList ? '#/files' : `#/song/${info.song_id}`;
  if (!audio.paused) audio.pause();
  if (!fromList) api('GET', `/api/songs/${info.song_id}`).then((s) => { if (route().parts[0] === 'midi') setPageCover(s.cover_url); }).catch(() => {});
  const speeds = [0.25, 0.5, 0.75, 0.9, 1, 1.25, 1.5];
  view.innerHTML = `
    <nav class="crumbs" aria-label="breadcrumb"><a class="btn small" href="${backHref}">${ICON.back}${esc(fromList ? t('nav_loose') : info.song_title)}</a><span>/</span><span class="here">${esc(info.name)}</span></nav>
    <section class="tab-head">
      <div><span class="eyebrow">${ICON.ftMidi} ${esc(t('midi_title'))}</span><h1>${esc(info.name)}</h1><p class="muted" id="midi-sub"></p></div>
      <a class="btn small" href="${esc(info.url)}?download=1" download="${esc(info.name)}">${ICON.download}${esc(t('download'))}</a>
    </section>
    <div class="tab-stage" id="tab-stage">
      <div class="tab-toolbar panel">
        <button class="play-btn" id="midi-play" data-action="midi-play" aria-label="${esc(t('play'))}" disabled>${ICON.play}</button>
        <button class="icon-btn" data-action="midi-stop" aria-label="${esc(t('stop'))}" title="${esc(t('stop'))}">${ICON.stop}</button>
        <span class="sala-time" id="midi-time">0:00 / 0:00</span>
        <span class="sep"></span>
        <label class="label">${esc(t('speed'))}<select class="pill-select" id="midi-speed">${speeds.map((x) => `<option value="${x}" ${x === 1 ? 'selected' : ''}>${Math.round(x * 100)}%</option>`).join('')}</select></label>
        <button class="fchip small" data-action="midi-loop" aria-pressed="false">${ICON.repeat}${esc(t('loop_on'))}</button>
        <span class="sep"></span>
        <span class="label">${esc(t('zoom'))}</span>
        <button class="icon-btn small" data-action="midi-zoom" data-d="-1" aria-label="${esc(t('zoom_out'))}">${ICON.minus}</button>
        <button class="icon-btn small" data-action="midi-zoom" data-d="1" aria-label="${esc(t('zoom_in'))}">${ICON.plus}</button>
        <span class="sep"></span>
        <label class="label vol">${ICON.volume}<span class="sr-only">${esc(t('volume'))}</span><input type="range" id="midi-volume" min="0" max="400" step="10" value="${midiVolume()}" aria-label="${esc(t('volume'))}"><span id="midi-volume-label">${midiVolume()}%</span></label>
        <button class="icon-btn" id="tab-full" data-action="tab-full" aria-label="${esc(t('fullscreen'))}" title="${esc(t('fullscreen'))} (F)">${ICON.expand}</button>
      </div>
      <div class="tab-body">
        <aside class="panel tab-tracks"><h2>${esc(t('tracks'))}</h2><div id="midi-tracks"><p class="muted" style="font-size:13px">${esc(t('loading_midi'))}</p></div>
          <p class="tg-hint" style="margin-top:12px">${esc(t('midi_hint'))}</p></aside>
        <div class="roll-wrap">
          <div class="tab-status" id="midi-status">${esc(t('loading_midi'))}</div>
          <div class="roll-scroll" id="roll-scroll"><div class="roll-spacer" id="roll-spacer"></div><canvas id="roll" class="roll-canvas"></canvas></div>
        </div>
      </div>
    </div>`;

  const status = (msg) => { const el = $('#midi-status'); if (el) { el.textContent = msg || ''; el.hidden = !msg; } };
  const onKey = (e) => {
    if (typingIn(e)) return;
    if (e.key === ' ' && !e.target.closest('button, a')) { e.preventDefault(); midiState.player?.playPause(); }
    else if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleTabFullscreen(); }
  };
  const onFull = () => {
    const on = document.fullscreenElement === $('#tab-stage');
    const b = $('#tab-full');
    if (b) { b.innerHTML = on ? ICON.shrink : ICON.expand; b.setAttribute('aria-label', on ? t('exit_fullscreen') : t('fullscreen')); }
    setTimeout(drawRoll, 50);
  };
  const onResize = debounce(() => drawRoll(), 100);
  document.addEventListener('keydown', onKey);
  document.addEventListener('fullscreenchange', onFull);
  window.addEventListener('resize', onResize);
  viewCleanup = () => {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('fullscreenchange', onFull);
    window.removeEventListener('resize', onResize);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    try { midiState.player?.destroy(); } catch { /* already destroyed */ }
    midiState.player = null;
  };

  let parsed;
  try {
    const [buf] = await Promise.all([fetch(info.url, { credentials: 'same-origin' }).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.arrayBuffer(); }),
      loadScript(`${VENDOR}alphatab/alphaTab.min.js?v=1.9.0`)]);
    parsed = parseMidi(buf);
  } catch (err) {
    status(err.message === 'not-midi' || err.message === 'smpte' ? t('midi_error') : err.message);
    return;
  }
  if (route().parts[0] !== 'midi') return;
  const notes = midiNotes(parsed);
  Object.assign(midiState, { parsed, notes, tick: 0, playing: false, follow: true });
  midiState.endTick = Math.max(parsed.division * 4, ...parsed.tracks.map((tr) => tr.endTick || 0), ...notes.map((n) => n.end));
  const keys = notes.map((n) => n.key);
  midiState.keyLo = keys.length ? Math.max(0, Math.min(...keys) - 2) : 48;
  midiState.keyHi = keys.length ? Math.min(127, Math.max(...keys) + 2) : 72;
  // tracks with notes: name, instrument (first "program change") and channels
  midiState.tracks = parsed.tracks.map((tr, i) => {
    const own = notes.filter((n) => n.track === i);
    const channels = [...new Set(own.map((n) => n.ch))];
    const prog = tr.events.find((e) => e.kind === 'ch' && e.hi === 0xc0);
    const drums = channels.includes(9);
    return { index: i, name: tr.name, count: own.length, channels, color: ROLL_COLORS[i % ROLL_COLORS.length],
      instrument: drums ? t('drums') : GM[prog ? prog.a : 0], mute: false, solo: false };
  }).filter((x) => x.count);
  const tempo = parsed.tracks.flatMap((tr) => tr.events).find((e) => e.kind === 'tempo');
  $('#midi-sub').textContent = [tn('tracks_n', midiState.tracks.length), tn('notes_n', notes.length), `${Math.round(60e6 / (tempo ? tempo.us : 500000))} bpm`].join(' · ');
  renderMidiTracks();
  status(notes.length ? '' : t('midi_empty'));
  drawRoll();

  const scroll = $('#roll-scroll');
  scroll.addEventListener('scroll', () => { drawRoll(); }, { passive: true });
  scroll.addEventListener('wheel', () => { midiState.follow = false; }, { passive: true });
  $('#roll').addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    const tick = Math.max(0, Math.round((e.clientX - rect.left + scroll.scrollLeft - ROLL_KEYS_W) / pxPerTick()));
    midiState.tick = tick; midiState.follow = true;
    if (midiState.player) midiState.player.tickPosition = tick;
    drawRoll();
  });

  // the synthesizer: same sound bank as the tab viewer
  let player;
  try { player = createSynth(); } catch { status(t('midi_no_audio')); return; }
  midiState.player = player;
  player.ready.on(async () => {
    try {
      const sf = await fetch(`${VENDOR}alphatab/soundfont/sonivox.sf2`).then((r) => r.arrayBuffer());
      if (midiState.player !== player) return;
      player.loadSoundFont(new Uint8Array(sf), false);
      player.loadMidiFile(toAlphaMidi(parsed));
    } catch (err) { status(err.message); }
  });
  player.readyForPlayback.on(() => {
    player.masterVolume = midiVolume() / 100;
    const b = $('#midi-play'); if (b) b.disabled = false;
    applyMidiChannels();
    if (params.get('play') === '1') player.play();
  });
  player.midiLoadFailed?.on(() => status(t('midi_error')));
  player.stateChanged.on((e) => {
    midiState.playing = e.state === 1;
    if (midiState.playing) midiState.follow = true;
    const b = $('#midi-play');
    if (b) { b.innerHTML = midiState.playing ? ICON.pause : ICON.play; b.setAttribute('aria-label', midiState.playing ? t('pause') : t('play')); }
  });
  let lastSec = -1;
  player.positionChanged.on((e) => {
    midiState.tick = e.currentTick;
    drawRoll();
    const sec = Math.floor(e.currentTime / 1000);
    if (sec !== lastSec) { lastSec = sec; const el = $('#midi-time'); if (el) el.textContent = `${fmtTime(e.currentTime / 1000)} / ${fmtTime(e.endTime / 1000)}`; }
  });
  $('#midi-speed').addEventListener('change', (e) => { player.playbackSpeed = Number(e.target.value); });
  $('#midi-volume').addEventListener('input', (e) => {
    const v = Number(e.target.value);
    player.masterVolume = v / 100;
    $('#midi-volume-label').textContent = `${v}%`;
    try { localStorage.setItem('mdop-midi-volume', String(v)); } catch { /* no storage */ }
  });
}

const ROLL_KEYS_W = 44;
const pxPerTick = () => midiState.pxPerBeat / (midiState.parsed?.division || 480);

function drawRoll() {
  const canvas = $('#roll'), scroll = $('#roll-scroll'), spacer = $('#roll-spacer');
  if (!canvas || !scroll || !midiState.parsed) return;
  const st = midiState;
  const totalW = Math.ceil(st.endTick * pxPerTick()) + ROLL_KEYS_W + 40;
  if (spacer.style.width !== `${totalW}px`) spacer.style.width = `${totalW}px`;
  const w = scroll.clientWidth, h = scroll.clientHeight - (scroll.offsetHeight - scroll.clientHeight > 0 ? 0 : 0);
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
  }
  // follow playback: the line stays at 30% of the width
  const ppt = pxPerTick();
  if (st.playing && st.follow) {
    const x = st.tick * ppt;
    const target = Math.max(0, x - (w - ROLL_KEYS_W) * 0.3);
    if (Math.abs(scroll.scrollLeft - target) > 2) scroll.scrollLeft = target;
  }
  const left = scroll.scrollLeft;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const css = getComputedStyle(document.documentElement);
  const textC = css.getPropertyValue('--muted').trim() || '#999';
  const lineC = css.getPropertyValue('--line').trim() || 'rgba(255,255,255,.1)';
  const dark = !['light'].includes(document.documentElement.dataset.theme);
  ctx.clearRect(0, 0, w, h);
  const keys = st.keyHi - st.keyLo + 1;
  const rowH = h / keys;
  const yOf = (key) => (st.keyHi - key) * rowH;
  // rows of the black keys
  for (let k = st.keyLo; k <= st.keyHi; k++) {
    if ([1, 3, 6, 8, 10].includes(k % 12)) { ctx.fillStyle = dark ? 'rgba(0,0,0,.22)' : 'rgba(0,0,0,.05)'; ctx.fillRect(ROLL_KEYS_W, yOf(k), w, rowH); }
    if (k % 12 === 0) { ctx.fillStyle = lineC; ctx.fillRect(ROLL_KEYS_W, yOf(k) + rowH - 1, w, 1); }
  }
  // bars and beats
  const div = st.parsed.division;
  const ts = st.parsed.tracks.flatMap((tr) => tr.events).find((e) => e.kind === 'timesig');
  const beatsPerBar = ts ? ts.num * (4 / ts.den) : 4;
  const firstBeat = Math.floor(left / ppt / div);
  for (let b = firstBeat; b * div * ppt - left < w; b++) {
    const x = ROLL_KEYS_W + b * div * ppt - left;
    const bar = Math.abs(b % beatsPerBar) < 1e-6;
    ctx.fillStyle = bar ? (dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.16)') : (dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)');
    ctx.fillRect(Math.round(x), 0, 1, h);
    if (bar && st.pxPerBeat * beatsPerBar > 26) { ctx.fillStyle = textC; ctx.font = '11px system-ui, sans-serif'; ctx.fillText(String(Math.round(b / beatsPerBar) + 1), x + 4, 12); }
  }
  // notes
  const visible = new Map(st.tracks.map((tr) => [tr.index, tr]));
  const anySolo = st.tracks.some((tr) => tr.solo);
  const t0 = left / ppt, t1 = (left + w) / ppt;
  for (const n of st.notes) {
    if (n.end < t0) continue;
    if (n.start > t1) break;
    const tr = visible.get(n.track);
    if (!tr) continue;
    const silent = tr.mute || (anySolo && !tr.solo);
    const x = ROLL_KEYS_W + n.start * ppt - left, nw = Math.max(2, (n.end - n.start) * ppt - 1);
    const active = st.tick >= n.start && st.tick < n.end;
    ctx.globalAlpha = silent ? 0.18 : active ? 1 : 0.55 + 0.4 * (n.vel / 127);
    ctx.fillStyle = tr.color;
    ctx.fillRect(x, yOf(n.key) + 1, nw, Math.max(2, rowH - 2));
    if (active) { ctx.globalAlpha = 1; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, yOf(n.key) + 1.5, nw - 1, Math.max(1, rowH - 3)); }
  }
  ctx.globalAlpha = 1;
  // keyboard on the left
  ctx.fillStyle = dark ? '#1b1d21' : '#f4f3f0';
  ctx.fillRect(0, 0, ROLL_KEYS_W, h);
  for (let k = st.keyLo; k <= st.keyHi; k++) {
    const black = [1, 3, 6, 8, 10].includes(k % 12);
    ctx.fillStyle = black ? (dark ? '#0d0e10' : '#3a3d42') : (dark ? '#2a2d33' : '#ffffff');
    ctx.fillRect(0, yOf(k), black ? ROLL_KEYS_W * 0.62 : ROLL_KEYS_W - 2, Math.max(1, rowH - 0.5));
    if (k % 12 === 0 && rowH > 5) { ctx.fillStyle = dark ? '#cfd3d8' : '#333'; ctx.font = `${Math.min(10, rowH + 2)}px system-ui, sans-serif`; ctx.fillText(`C${Math.floor(k / 12) - 1}`, ROLL_KEYS_W - 24, yOf(k) + rowH - 1); }
  }
  // playhead
  const px = ROLL_KEYS_W + st.tick * ppt - left;
  if (px >= ROLL_KEYS_W && px <= w) {
    ctx.fillStyle = css.getPropertyValue('--accent').trim() || '#F2B544';
    ctx.fillRect(Math.round(px) - 1, 0, 2, h);
  }
}

function renderMidiTracks() {
  const box = $('#midi-tracks');
  if (!box) return;
  box.innerHTML = midiState.tracks.map((tr) => `
    <div class="track-item">
      <div class="track-name static"><span class="swatch-dot" style="background:${tr.color}"></span><span><strong>${esc(tr.name || `${t('track')} ${tr.index + 1}`)}</strong><small>${esc(tr.instrument)} · ${tn('notes_n', tr.count)}</small></span></div>
      <div class="track-btns">
        <button class="fchip small" data-action="midi-track" data-what="solo" data-index="${tr.index}" aria-pressed="${tr.solo}">${esc(t('solo'))}</button>
        <button class="fchip small" data-action="midi-track" data-what="mute" data-index="${tr.index}" aria-pressed="${tr.mute}">${esc(t('mute'))}</button>
      </div>
    </div>`).join('');
}
function applyMidiChannels() {
  const p = midiState.player;
  if (!p) return;
  p.resetChannelStates();
  const anySolo = midiState.tracks.some((tr) => tr.solo);
  midiState.tracks.forEach((tr) => tr.channels.forEach((ch) => {
    if (tr.mute) p.setChannelMute(ch, true);
    if (anySolo && tr.solo) p.setChannelSolo(ch, true);
  }));
}

// ================================================================ Ideas (riffs, melodies, exercises that are not songs yet)
const KIND_COLORS = { riff: '#EF7B6E', melody: '#6AA5F5', harmony: '#B48CF2', scale: '#4CC38A', exercise: '#F2B544' };
const kindLabel = (k) => (k ? (KIND_COLORS[k] ? t(`k_${k}`) : k) : t('no_kind'));
function kindColor(k) {
  if (KIND_COLORS[k]) return KIND_COLORS[k];
  if (!k) return '#8A9099';
  let h = 0;
  for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 55% 62%)`;
}
const kindBadge = (k) => `<span class="kind-badge" style="--kind:${kindColor(k)}">${esc(kindLabel(k))}</span>`;
const ideaSub = (s) => [s.music_key, s.tuning, s.bpm ? `${s.bpm} bpm` : ''].filter(Boolean).join(' · ');

function ideaCard(s, mode = 'grid') {
  const play = songPlayable(s) ? `<button class="play-btn${mode === 'list' ? ' small-play' : ''}" data-action="play-song" data-id="${s.id}" aria-label="${esc(t('play_x', { x: s.title }))}">${ICON.play}</button>` : '';
  const formats = s.formats.map((f) => `<span class="chip ${canPlay(f.toLowerCase()) ? 'play' : ''}">${esc(f)}</span>`).join('');
  const sub = ideaSub(s);
  if (mode === 'list') {
    return `<div class="song-row card idea-row" data-href="#/idea/${s.id}">
      ${songPlayable(s) ? `<button class="icon-btn small" data-action="play-song" data-id="${s.id}" aria-label="${esc(t('play_x', { x: s.title }))}">${ICON.play}</button>` : '<span class="icon-spacer"></span>'}
      <span class="row-thumb idea-thumb" style="--kind:${kindColor(s.idea_kind)}">${ICON.bulb}</span>
      <span class="row-title"><a href="#/idea/${s.id}">${esc(s.title)}</a>${sub ? `<span>${esc(sub)}</span>` : ''}</span>
      <span class="row-status">${kindBadge(s.idea_kind)}</span>
      <span class="row-formats chips">${formats}</span>
      <span class="row-date">${esc(fmtDate(s.updated_at))}</span>
      ${songPlayable(s) ? `<a class="icon-btn small" href="#/listen/${s.id}" aria-label="${esc(t('open_sala_x', { x: s.title }))}" title="${esc(t('sala_title'))}">${ICON.headphones}</a>` : '<span class="icon-spacer"></span>'}
    </div>`;
  }
  const tile = `<div class="idea-tile" style="--kind:${kindColor(s.idea_kind)}">
      <span class="idea-tile-kind">${ICON.bulb}${esc(kindLabel(s.idea_kind))}</span>${play}</div>`;
  if (mode === 'mini') {
    return `<article class="card mini idea-card" data-href="#/idea/${s.id}">${tile}
      <div class="mini-body"><a href="#/idea/${s.id}" title="${esc(s.title)}">${esc(s.title)}</a><span class="mini-meta">${esc(sub || fmtDate(s.updated_at))}</span></div></article>`;
  }
  return `<article class="card idea-card" data-href="#/idea/${s.id}">${tile}
    <div class="card-body">
      <div class="card-title"><a href="#/idea/${s.id}">${esc(s.title)}</a></div>
      <div class="card-meta">${ICON.folder} ${tn('files_n', s.file_count)}${sub ? ` · ${esc(sub)}` : ''}</div>
      ${formats ? `<div class="chips">${formats}</div>` : ''}
    </div></article>`;
}

const ideasFilter = { q: '', kind: '', key: '', sort: 'updated' };
async function viewIdeas(view) {
  const ideas = await api('GET', '/api/songs?ideas=true&sort=updated');
  librarySongs = ideas;
  useViewMode('ideas');
  const F = ideasFilter;
  const kinds = state.meta.idea_kinds.filter((k) => k.count || F.kind === k.name);  // only kinds in use
  const keys = [...new Set(ideas.map((s) => s.music_key).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(label)}</option>`;
  const noKind = ideas.filter((s) => !s.idea_kind).length;
  view.innerHTML = `
    <div class="page-head"><div><h1>${esc(t('nav_ideas'))}</h1><p>${ideas.length ? `${tn('ideas_n', ideas.length)} · ` : ''}${esc(t('ideas_sub'))}</p></div>
      <div class="actions">${ideas.length ? viewSwitch() : ''}<button class="btn primary" data-action="new-idea">${ICON.plus}${esc(t('new_idea'))}</button></div></div>
    ${ideas.length ? `
      <div class="topbar" style="margin-bottom:14px">
        <label class="search">${ICON.search}<span class="sr-only">${esc(t('search'))}</span><input type="search" id="ideas-q" value="${esc(F.q)}" placeholder="${esc(t('search_ideas_ph'))}"></label>
      </div>
      <div class="filters">
        <div class="kind-chips" role="group" aria-label="${esc(t('idea_kind'))}">
          <button class="fchip" data-kind="" aria-pressed="${!F.kind}">${esc(t('all'))} <span class="count-pill">${ideas.length}</span></button>
          ${kinds.map((k) => `<button class="fchip kind-chip" style="--kind:${kindColor(k.name)}" data-kind="${esc(k.name)}" aria-pressed="${F.kind === k.name}"><span class="dot" style="background:${kindColor(k.name)}"></span>${esc(kindLabel(k.name))} <span class="count-pill">${k.count}</span></button>`).join('')}
          ${noKind ? `<button class="fchip" data-kind="__none" aria-pressed="${F.kind === '__none'}">${esc(t('no_kind'))} <span class="count-pill">${noKind}</span></button>` : ''}
        </div>
        ${keys.length ? `<label class="label">${esc(t('key'))}<select class="pill-select" id="ideas-key">${opt('', t('all'), F.key)}${keys.map((k) => opt(k, k, F.key)).join('')}</select></label>` : ''}
        <label class="label">${esc(t('order'))}<select class="pill-select" id="ideas-sort">${opt('updated', t('sort_updated'), F.sort)}${opt('created', t('sort_created'), F.sort)}${opt('title', t('sort_title'), F.sort)}</select></label>
      </div>
      <div id="ideas-grid"></div>`
    : `<div class="empty"><span class="logo-big idea-empty" aria-hidden="true">${ICON.bulb}</span><h2>${esc(t('ideas_empty_t'))}</h2><p>${esc(t('ideas_empty_p'))}</p>
        <div class="actions"><a class="btn primary" href="#/files">${ICON.inbox}${esc(t('nav_loose'))}</a><button class="btn" data-action="new-idea">${ICON.plus}${esc(t('new_idea'))}</button></div></div>`}`;
  if (!ideas.length) return;
  const draw = () => {
    const q = F.q.trim().toLowerCase();
    let list = ideas.filter((s) => (!F.kind || (F.kind === '__none' ? !s.idea_kind : s.idea_kind === F.kind)) && (!F.key || s.music_key === F.key)
      && (!q || [s.title, s.notes, s.music_key, s.tuning, s.idea_kind, kindLabel(s.idea_kind), s.formats.join(' ')].some((x) => (x || '').toLowerCase().includes(q))));
    list = [...list].sort(F.sort === 'title' ? (a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
      : F.sort === 'created' ? (a, b) => (b.created_at || '').localeCompare(a.created_at || '') : (a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
    const box = $('#ideas-grid');
    if (!list.length) { box.innerHTML = `<div class="empty"><h2>${esc(t('nothing_t'))}</h2><p>${esc(t('nothing_p'))}</p></div>`; return; }
    renderChunked(box, list, (s) => ideaCard(s, viewMode), wrapClass());
  };
  pageRerender = draw;
  draw();
  $('#ideas-q').addEventListener('input', debounce((e) => { F.q = e.target.value; draw(); }, 150));
  $('#ideas-key')?.addEventListener('change', (e) => { F.key = e.target.value; draw(); });
  $('#ideas-sort').addEventListener('change', (e) => { F.sort = e.target.value; draw(); });
  $$('[data-kind]', view).forEach((b) => b.addEventListener('click', () => {
    F.kind = b.dataset.kind;
    $$('[data-kind]', view).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.kind === F.kind)));
    draw();
  }));
}

function kindSelect(id, current) {
  const kinds = state.meta.idea_kinds.map((k) => k.name);
  if (current && !kinds.includes(current)) kinds.push(current);
  return `<select class="select" id="${id}"><option value="">${esc(t('no_kind'))}</option>${kinds.map((k) => `<option value="${esc(k)}" ${current === k ? 'selected' : ''}>${esc(kindLabel(k))}</option>`).join('')}<option value="__new">${esc(t('kind_new'))}</option></select>`;
}
async function handleKindSelect(sel, previous) {
  if (sel.value !== '__new') return sel.value;
  const name = await promptModal({ title: t('kind_new_t'), label: t('kind_name'), confirm: t('create'), placeholder: t('kind_ph') });
  const clean = (name || '').trim();
  if (!clean) { sel.value = previous || ''; return null; }
  const builtin = Object.keys(KIND_COLORS).find((k) => t(`k_${k}`).toLowerCase() === clean.toLowerCase() || k === clean.toLowerCase());
  const value = builtin || clean;
  if (![...sel.options].some((o) => o.value === value)) sel.insertBefore(new Option(kindLabel(value), value), sel.querySelector('option[value="__new"]'));
  sel.value = value;
  return value;
}

async function viewIdea(view, id) {
  const s = await api('GET', `/api/songs/${id}`);
  if (!s.is_idea) { history.replaceState(null, '', `#/song/${id}`); return viewSong(view, id); }
  songCache = s;
  const files = s.versions.flatMap((v) => v.files.map((f) => ({ ...f, v })));
  const playable = s.main_file && canPlay(s.main_file.ext);
  const field = (k, label, ph = '') => `<label class="field">${esc(label)}<input class="input" data-ifield="${k}" value="${esc(s[k] || '')}" placeholder="${esc(ph)}"></label>`;
  view.innerHTML = `
    <nav class="crumbs" aria-label="breadcrumb"><a class="btn small" href="#/ideas">${ICON.back}${esc(t('nav_ideas'))}</a></nav>
    <section class="idea-head" style="--kind:${kindColor(s.idea_kind)}">
      <span class="idea-head-icon">${ICON.bulb}</span>
      <div class="idea-head-main">
        <span class="eyebrow">${esc(t('idea_one'))} · ${esc(kindLabel(s.idea_kind))}</span>
        <label class="sr-only" for="idea-title">${esc(t('idea_name'))}</label>
        <input class="title-input" id="idea-title" value="${esc(s.title)}">
        <p class="muted">${esc(t('idea_since', { d: fmtDate(s.idea_since || s.created_at) }))} · ${tn('files_n', files.length)}</p>
      </div>
      <div class="actions idea-actions">
        ${playable ? `<button class="btn" data-action="play-song-detail">${ICON.play}${esc(t('play'))}</button>` : ''}
        ${files.some((f) => canPlay(f.ext)) ? `<a class="btn" href="#/listen/${s.id}">${ICON.headphones}${esc(t('sala_title'))}</a>` : ''}
        <button class="btn" data-action="import" data-song="${s.id}" data-target="existing">${ICON.upload}${esc(t('add_files'))}</button>
        <button class="btn primary" data-action="idea-promote">${ICON.arrowUp}${esc(t('promote'))}</button>
        <button class="btn" data-action="idea-merge">${esc(t('merge'))}</button>
        <button class="icon-btn" data-action="idea-delete" aria-label="${esc(t('delete_idea'))}" title="${esc(t('delete_idea'))}">${ICON.trash}</button>
      </div>
    </section>
    <div class="idea-grid">
      <section class="panel">
        <div class="panel-head"><h2>${esc(t('page_files'))}</h2></div>
        ${files.length ? `<div class="file-list">${files.map((f) => fileRow(f, f.v)).join('')}</div>`
          : `<div class="empty small"><p>${esc(t('idea_no_files'))}</p><button class="btn" data-action="import" data-song="${s.id}" data-target="existing">${ICON.upload}${esc(t('add_files'))}</button></div>`}
        <p class="tg-hint" style="margin-top:12px">${esc(t('idea_files_hint'))}</p>
      </section>
      <aside class="col-side">
        <section class="panel">
          <h2 style="margin:0 0 12px;font-size:17px">${esc(t('details'))}</h2>
          <div class="idea-fields">
            <label class="field">${esc(t('idea_kind'))}${kindSelect('idea-kind', s.idea_kind)}</label>
            ${field('music_key', t('key'), t('key_ph'))}
            ${field('tuning', t('tuning'), t('tuning_ph'))}
            ${field('bpm', t('bpm'), '90')}
          </div>
        </section>
        <section class="panel">
          <h2 style="margin:0 0 12px;font-size:17px">${esc(t('notes'))}</h2>
          <label class="sr-only" for="idea-notes">${esc(t('notes'))}</label>
          <textarea class="textarea idea-notes" id="idea-notes" placeholder="${esc(t('idea_notes_ph'))}">${esc(s.notes)}</textarea>
          <span class="tg-hint" id="idea-saved"></span>
        </section>
      </aside>
    </div>`;
  const save = async (body) => {
    const r = await run(() => api('PATCH', `/api/songs/${s.id}`, body));
    if (r) { Object.assign(s, body); const el = $('#idea-saved'); if (el) el.textContent = t('saved'); }
    return r;
  };
  $('#idea-title').addEventListener('change', (e) => save({ title: e.target.value }).then(() => refreshNav()));
  $$('[data-ifield]', view).forEach((inp) => inp.addEventListener('change', () => save({ [inp.dataset.ifield]: inp.value })));
  $('#idea-notes').addEventListener('input', debounce((e) => save({ notes: e.target.value }), 600));
  $('#idea-kind').addEventListener('change', async (e) => {
    const value = await handleKindSelect(e.target, s.idea_kind);
    if (value === null) return;
    if (await save({ idea_kind: value })) { await refreshNav(); render(); }
  });
}

async function looseIdeaModal(groups) {
  const files = groups.flatMap((g) => g.files);
  const single = groups.length === 1;
  const m = openModal(`${modalHead(t('to_ideas'), single ? t('from_files', { files: tn('files_n', files.length), names: files.slice(0, 3).map((f) => f.name).join(', ') + (files.length > 3 ? '…' : '') }) : tn('to_ideas_many', groups.length))}
    <form class="modal-body" id="li-form">
      ${single ? `<label class="field">${esc(t('idea_name'))}<input class="input" id="li-title" value="${esc(groups[0].title)}" autofocus></label>` : ''}
      <label class="field">${esc(t('idea_kind'))}${kindSelect('li-kind', '')}</label>
      <p class="tg-hint" style="margin:0">${esc(t('to_ideas_hint'))}</p>
    </form>
    <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" type="submit" form="li-form">${ICON.bulb}${esc(t('to_ideas'))}</button></div></div>`, { small: true });
  let kind = '';
  $('#li-kind', m).addEventListener('change', async (e) => { const v = await handleKindSelect(e.target, kind); if (v !== null) kind = v; });
  $('#li-form', m).addEventListener('submit', async (e) => {
    e.preventDefault();
    const k = $('#li-kind', m).value === '__new' ? '' : $('#li-kind', m).value;
    let last = null;
    for (const g of groups) {
      last = await run(() => api('POST', '/api/loose/assign', { file_ids: g.files.map((f) => f.id), action: 'idea', title: single ? $('#li-title', m).value : g.title, kind: k }));
      if (!last) return;
    }
    closeModal();
    toast(single ? t('idea_created', { t: last.song.title }) : tn('ideas_created', groups.length), single ? { link: { href: `#/idea/${last.song_id}`, label: t('open') } } : { link: { href: '#/ideas', label: t('nav_ideas') } });
    afterLooseAction(groups);
  });
}

async function ideaPromoteModal() {
  const s = songCache;
  const m = openModal(`${modalHead(t('promote'), t('promote_p'))}
    <form class="modal-body" id="ip-form">
      <label class="field">${esc(t('song_name'))}<input class="input" id="ip-title" value="${esc(s.title)}" autofocus></label>
      <label class="field">${esc(t('style'))}<input class="input" id="ip-style" list="ip-styles" placeholder="${esc(t('style_ph'))}"><datalist id="ip-styles">${state.meta.styles.map((x) => `<option value="${esc(x.name)}">`).join('')}</datalist></label>
      ${state.meta.bands.length ? `<label class="field">${esc(t('band'))}<select class="select" id="ip-band"><option value="">${esc(t('no_band'))}</option>${state.meta.bands.map((b) => `<option value="${b.id}">${esc(b.title)}</option>`).join('')}</select></label>` : ''}
    </form>
    <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" type="submit" form="ip-form">${ICON.arrowUp}${esc(t('promote'))}</button></div></div>`, { small: true });
  $('#ip-form', m).addEventListener('submit', async (e) => {
    e.preventDefault();
    const band = $('#ip-band', m)?.value;
    const song = await run(() => api('POST', `/api/ideas/${s.id}/promote`, { title: $('#ip-title', m).value, style: $('#ip-style', m).value, band_id: band ? Number(band) : null }));
    if (!song) return;
    closeModal();
    toast(t('promoted_toast', { t: song.title }));
    go(`#/song/${song.id}`);
  });
}

async function ideaMergeModal() {
  const s = songCache;
  const songs = await run(() => api('GET', '/api/songs?sort=title')) || [];
  const m = openModal(`${modalHead(t('merge'), t('merge_p', { t: s.title }))}
    <div class="modal-body">
      <label class="search" style="min-height:44px">${ICON.search}<span class="sr-only">${esc(t('filter_songs'))}</span><input type="search" id="im-filter" placeholder="${esc(t('filter_songs'))}" autofocus></label>
      <div class="song-pick" id="im-list" role="radiogroup" aria-label="${esc(t('choose_song'))}">${songs.length ? songs.map((x, i) => `<label data-title="${esc(x.title.toLowerCase())}"><input type="radio" name="im-song" value="${x.id}" ${i === 0 ? 'checked' : ''}><span class="track-cover" style="width:40px;height:40px;${bgImg(x.thumb_url)}"></span><span>${esc(x.title)}</span><span class="status ${x.status}" style="margin-left:auto">${esc(stLabel(x.status))}</span></label>`).join('') : `<p class="muted">${esc(t('no_songs_yet'))}</p>`}</div>
    </div>
    <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" id="im-go" ${songs.length ? '' : 'disabled'}>${esc(t('merge'))}</button></div></div>`);
  $('#im-filter', m).addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    $$('#im-list label', m).forEach((l) => { l.hidden = !l.dataset.title.includes(q); });
  });
  $('#im-go', m).addEventListener('click', async () => {
    const sel = $('#im-list input:checked', m);
    if (!sel) return;
    const song = await run(() => api('POST', `/api/ideas/${s.id}/merge`, { song_id: Number(sel.value) }));
    if (!song) return;
    closeModal();
    toast(t('merged_toast', { t: song.title }));
    go(`#/song/${song.id}`);
  });
}

// ================================================================ Sound effects (SFX): linked folders, read-only
const sfxState = { items: [], total: 0, loading: false, f: { q: '', category: '', sub: '', tag: '', dur: '', fmt: '', favorite: false, sort: 'name' }, current: -1, facets: null };
const sfxAudio = new Audio();
sfxAudio.preload = 'none';
const fmtDur = (d) => (d == null ? '–' : d < 60 ? `${d < 10 ? d.toLocaleString(LANG === 'en' ? 'en' : 'pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.round(d)} s` : fmtTime(d));

function sfxRow(x, i, compact = false) {
  const path = [x.category, x.subcategory].filter(Boolean).join(' › ');
  const playing = sfxState.current === i && !sfxAudio.paused;
  return `<div class="sfx-row${x.missing ? ' missing' : ''}${sfxState.current === i ? ' current' : ''}" data-sfx-index="${i}">
    <button class="icon-btn sfx-play" data-action="sfx-play" data-index="${i}" aria-label="${esc(t('play_x', { x: x.name }))}" ${x.missing ? 'disabled' : ''}>${playing ? ICON.pause : ICON.play}</button>
    <div class="sfx-info"><strong title="${esc(x.name)}">${esc(x.name)}</strong>
      <span>${path ? `${esc(path)} · ` : ''}${esc(x.folder)}${x.missing ? ` · <em>${esc(t('sfx_missing'))}</em>` : ''}</span>
      ${x.tags.length ? `<span class="sfx-tags">${x.tags.map((tg) => `<button class="tag" data-action="sfx-tag-filter" data-tag="${esc(tg)}">#${esc(tg)}</button>`).join('')}</span>` : ''}
    </div>
    <span class="sfx-dur">${esc(fmtDur(x.duration))}</span>
    <span class="chip">${esc(x.ext.toUpperCase())}</span>
    ${compact ? '' : `
    <button class="icon-btn small ${x.favorite ? 'on' : ''}" data-action="sfx-fav" data-index="${i}" aria-pressed="${x.favorite}" aria-label="${esc(x.favorite ? t('unfav') : t('fav'))}">${x.favorite ? ICON.heartFull : ICON.heart}</button>
    <button class="icon-btn small" data-action="sfx-tags" data-index="${i}" aria-label="${esc(t('sfx_edit_tags'))}" title="${esc(t('sfx_edit_tags'))}">${ICON.tag}</button>
    <a class="icon-btn small" href="${esc(x.url)}?download=1" download aria-label="${esc(t('download'))}" title="${esc(t('download'))}" ${x.missing ? 'hidden' : ''}>${ICON.download}</a>
    <button class="icon-btn small" data-action="sfx-hide" data-index="${i}" aria-label="${esc(t('sfx_hide'))}" title="${esc(t('sfx_hide'))}">${ICON.eyeOff}</button>`}
    <span class="sfx-progress" aria-hidden="true"></span>
  </div>`;
}

async function viewSfx(view) {
  const m = state.meta.sfx;
  const F = sfxState.f;
  sfxState.current = -1;
  if (!m.folders) {
    view.innerHTML = `
      <div class="page-head"><div><h1>${esc(t('nav_sfx'))}</h1><p>${esc(t('sfx_sub'))}</p></div></div>
      <div class="empty"><span class="logo-big idea-empty" aria-hidden="true">${ICON.wave}</span>
        <h2>${esc(t('sfx_empty_t'))}</h2><p>${esc(m.roots_ok ? t('sfx_empty_p') : t('sfx_noroot_p'))}</p>
        ${m.roots_ok ? `<div class="actions"><button class="btn primary" data-action="sfx-add-folder">${ICON.plus}${esc(t('sfx_link'))}</button></div>`
          : '<p><code>./install.sh</code></p>'}</div>`;
    return;
  }
  sfxState.facets = await api('GET', '/api/sfx/facets');
  const fc = sfxState.facets;
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(label)}</option>`;
  const cat = fc.categories.find((c) => c.name === F.category);
  view.innerHTML = `
    <div class="page-head"><div><h1>${esc(t('nav_sfx'))}</h1><p>${tn('sfx_n', m.count)} · ${tn('folders_n', m.folders)}${m.missing ? ` · ${tn('sfx_missing_n', m.missing)}` : ''}</p></div>
      <div class="actions"><span class="scan-note" id="sfx-scan-note"></span>
        <button class="btn" data-action="sfx-rescan">${ICON.refresh}${esc(t('sfx_rescan'))}</button>
        <a class="btn" href="#/settings/sfx">${ICON.gear}${esc(t('sfx_folders'))}</a></div></div>
    <div class="topbar" style="margin-bottom:14px">
      <label class="search">${ICON.search}<span class="sr-only">${esc(t('search'))}</span><input type="search" id="sfx-q" value="${esc(F.q)}" placeholder="${esc(t('sfx_search_ph'))}"></label>
    </div>
    <div class="kind-chips" role="group" aria-label="${esc(t('sfx_category'))}" style="margin-bottom:12px">
      <button class="fchip" data-sfx-cat="" aria-pressed="${!F.category}">${esc(t('all'))} <span class="count-pill">${m.count}</span></button>
      ${fc.categories.map((c) => `<button class="fchip" data-sfx-cat="${esc(c.name || '__none')}" aria-pressed="${F.category === (c.name || '__none')}">${esc(c.name || t('sfx_no_cat'))} <span class="count-pill">${c.count}</span></button>`).join('')}
    </div>
    <div class="filters">
      ${cat && cat.subs.length ? `<label class="label">${esc(t('sfx_sub_cat'))}<select class="pill-select" data-sfx-f="sub">${opt('', t('all'), F.sub)}${cat.subs.map((x) => opt(x.name, `${x.name} (${x.count})`, F.sub)).join('')}</select></label>` : ''}
      <label class="label">${esc(t('sfx_duration'))}<select class="pill-select" data-sfx-f="dur">${opt('', t('all'), F.dur)}${opt('short', t('dur_short'), F.dur)}${opt('medium', t('dur_medium'), F.dur)}${opt('long', t('dur_long'), F.dur)}${opt('xlong', t('dur_xlong'), F.dur)}</select></label>
      ${fc.formats.length > 1 ? `<label class="label">${esc(t('col_formats'))}<select class="pill-select" data-sfx-f="fmt">${opt('', t('all'), F.fmt)}${fc.formats.map((x) => opt(x, x.toUpperCase(), F.fmt)).join('')}</select></label>` : ''}
      ${fc.tags.length ? `<label class="label">${esc(t('sfx_tag'))}<select class="pill-select" data-sfx-f="tag">${opt('', t('all'), F.tag)}${fc.tags.map((x) => opt(x.name, `#${x.name} (${x.count})`, F.tag)).join('')}</select></label>` : ''}
      <button class="fchip" data-action="sfx-fav-filter" aria-pressed="${F.favorite}">${ICON.heart}${esc(t('nav_favs'))}</button>
      <label class="label">${esc(t('order'))}<select class="pill-select" data-sfx-f="sort">${opt('name', t('sort_name'), F.sort)}${opt('duration', t('sfx_sort_short'), F.sort)}${opt('duration_desc', t('sfx_sort_long'), F.sort)}${opt('recent', t('sfx_sort_recent'), F.sort)}${opt('random', t('sfx_sort_random'), F.sort)}</select></label>
    </div>
    <p class="muted" id="sfx-count" style="margin:4px 0 10px;font-size:14px">&nbsp;</p>
    <div class="sfx-list" id="sfx-list" role="list"></div>
    <div class="more-sentinel" id="sfx-more" hidden><button class="btn" data-action="sfx-more">${esc(t('show_more'))}</button></div>
    <p class="tg-hint" style="margin-top:16px">${esc(t('sfx_hint'))}</p>`;
  $('#sfx-q').addEventListener('input', debounce((e) => { F.q = e.target.value; sfxLoad(true); }, 250));
  $$('[data-sfx-cat]', view).forEach((b) => b.addEventListener('click', () => { F.category = b.dataset.sfxCat; F.sub = ''; render(); }));
  $$('[data-sfx-f]', view).forEach((s) => s.addEventListener('change', () => { F[s.dataset.sfxF] = s.value; sfxLoad(true); }));
  const onKey = (e) => sfxKey(e);
  document.addEventListener('keydown', onKey);
  const sentinel = $('#sfx-more');
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) sfxLoad(false); }, { rootMargin: '600px' }) : null;
  io?.observe(sentinel);
  viewCleanup = () => { document.removeEventListener('keydown', onKey); io?.disconnect(); sfxAudio.pause(); sfxState.current = -1; };
  await sfxLoad(true);
  watchSfxScan();
}

async function sfxLoad(reset) {
  if (sfxState.loading) return;
  if (!reset && sfxState.items.length >= sfxState.total) return;
  sfxState.loading = true;
  try {
    const F = sfxState.f;
    const p = new URLSearchParams({ offset: reset ? 0 : sfxState.items.length, limit: 100, sort: F.sort });
    ['q', 'category', 'sub', 'tag', 'dur', 'fmt'].forEach((k) => { if (F[k]) p.set(k, F[k]); });
    if (F.favorite) p.set('favorite', 'true');
    const data = await api('GET', `/api/sfx?${p}`);
    if (route().parts[0] !== 'sfx') return;
    if (reset) { sfxState.items = []; sfxState.current = -1; sfxAudio.pause(); }
    const start = sfxState.items.length;
    sfxState.items.push(...data.items);
    sfxState.total = data.total;
    const list = $('#sfx-list');
    if (reset) list.innerHTML = data.total ? '' : `<div class="empty"><h2>${esc(t('nothing_t'))}</h2><p>${esc(t('nothing_p'))}</p></div>`;
    list.insertAdjacentHTML('beforeend', data.items.map((x, j) => sfxRow(x, start + j)).join(''));
    $('#sfx-count').textContent = tn('sfx_n', data.total);
    $('#sfx-more').hidden = sfxState.items.length >= sfxState.total;
  } catch (e) { toast(e.message, { error: true }); } finally { sfxState.loading = false; }
}

function sfxPlay(i) {
  const x = sfxState.items[i];
  if (!x || x.missing) return;
  if (sfxState.current === i) { if (sfxAudio.paused) sfxAudio.play().catch(() => {}); else sfxAudio.pause(); return; }
  if (!audio.paused) audio.pause();  // the song player stops
  sfxState.current = i;
  sfxAudio.src = x.url;
  sfxAudio.play().catch(() => toast(t('cant_play'), { error: true }));
  sfxPaint();
  $(`[data-sfx-index="${i}"]`)?.scrollIntoView({ block: 'nearest' });
}
function sfxPaint() {
  $$('.sfx-row').forEach((row) => {
    const i = Number(row.dataset.sfxIndex);
    const on = i === sfxState.current;
    row.classList.toggle('current', on);
    const b = row.querySelector('.sfx-play');
    if (b) b.innerHTML = on && !sfxAudio.paused ? ICON.pause : ICON.play;
    if (!on) row.style.removeProperty('--p');
  });
}
sfxAudio.addEventListener('play', sfxPaint);
sfxAudio.addEventListener('pause', sfxPaint);
sfxAudio.addEventListener('ended', sfxPaint);
sfxAudio.addEventListener('timeupdate', () => {
  const row = $(`.sfx-row[data-sfx-index="${sfxState.current}"]`);
  if (row && sfxAudio.duration) row.style.setProperty('--p', `${(sfxAudio.currentTime / sfxAudio.duration) * 100}%`);
});
function sfxKey(e) {
  if (typingIn(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  const n = sfxState.items.length;
  if (!n) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    let i = sfxState.current < 0 ? (e.key === 'ArrowDown' ? 0 : n - 1) : sfxState.current + (e.key === 'ArrowDown' ? 1 : -1);
    while (i >= 0 && i < n && sfxState.items[i].missing) i += e.key === 'ArrowDown' ? 1 : -1;
    if (i >= 0 && i < n) sfxPlay(i);
    if (i >= n - 5) sfxLoad(false);
  } else if (e.key === ' ' && sfxState.current >= 0 && !e.target.closest('button, a')) {
    e.preventDefault();
    sfxPlay(sfxState.current);
  }
}

let sfxScanTimer = null;
async function watchSfxScan() {
  clearTimeout(sfxScanTimer);
  let st;
  try { st = await api('GET', '/api/sfx/scan'); } catch { return; }
  const notes = $$('#sfx-scan-note, #sfx-settings-scan');
  notes.forEach((el) => { el.textContent = st.running ? t('sfx_scanning', { d: st.done, t: st.total }) : ''; });
  if (st.running) { sfxScanTimer = setTimeout(watchSfxScan, 1000); return; }
  if (notes.length && sfxScanTimer !== null && st.finished_at) {
    sfxScanTimer = null;
    toast(st.error ? st.error : t('sfx_scan_done', { a: st.added, u: st.updated, m: st.missing }), { error: !!st.error });
    await refreshNav();
    render();
  }
}

// ---------------------------------------------------------------- Settings: effects folders
function sfxSettingsPanel() {
  const m = state.meta.sfx;
  return `<h2>${ICON.wave} ${esc(t('nav_sfx'))}</h2>
    <p class="muted" style="margin:0;line-height:1.6">${esc(t('sfx_settings_note'))}</p>
    ${m.roots_ok ? `<div id="sfx-folder-list"><p class="muted">${esc(t('loading'))}</p></div>
      <div class="actions"><button class="btn" data-action="sfx-add-folder">${ICON.plus}${esc(t('sfx_link'))}</button>
        <button class="btn" data-action="sfx-rescan">${ICON.refresh}${esc(t('sfx_rescan'))}</button>
        ${m.hidden ? `<button class="btn" data-action="sfx-unhide">${esc(tn('sfx_unhide', m.hidden))}</button>` : ''}
        <span class="scan-note" id="sfx-settings-scan"></span></div>`
      : IS_DESKTOP ? `<div class="actions"><button class="btn" data-action="sfx-add-folder">${ICON.plus}${esc(t('sfx_add_root'))}</button></div>`
        : `<p style="margin:0;line-height:1.6">${esc(t('sfx_noroot_p'))} <code>./install.sh</code></p>`}`;
}
async function bindSfxSettings() {
  const box = $('#sfx-folder-list');
  if (!box) return;
  const data = await run(() => api('GET', '/api/sfx/folders'));
  if (!data || !$('#sfx-folder-list')) return;
  box.innerHTML = data.folders.length ? `<div class="folder-list">${data.folders.map((f) => `
    <div class="folder-row"><span class="mod-icon">${ICON.folder}</span>
      <span class="mod-text"><strong>${esc(f.name)}</strong><span>${esc(f.path)}</span>
        <span>${esc(tn('sfx_n', f.files - f.hidden))}${f.missing ? ` · ${esc(tn('sfx_missing_n', f.missing))}` : ''}${f.available ? '' : ` · <em>${esc(t('sfx_folder_off'))}</em>`}${f.scanned_at ? ` · ${esc(t('sfx_scanned', { d: fmtDate(f.scanned_at) }))}` : ''}</span></span>
      <button class="icon-btn small" data-action="sfx-remove-folder" data-id="${f.id}" data-name="${esc(f.name)}" aria-label="${esc(t('sfx_unlink'))}" title="${esc(t('sfx_unlink'))}">${ICON.close}</button>
    </div>`).join('')}</div>` : `<p class="muted" style="margin:0">${esc(t('sfx_no_folders'))}</p>`;
  watchSfxScan();
}
async function sfxFolderPicker() {
  let current = '';
  const m = openModal(`${modalHead(t('sfx_link'), t('sfx_link_p'))}
    <div class="modal-body"><div class="crumbs" id="sp-path"></div><div class="browser" id="sp-list"></div></div>
    <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" id="sp-go" disabled>${ICON.plus}${esc(t('sfx_link_this'))}</button></div></div>`);
  const load = async (path) => {
    const d = await run(() => api('GET', `/api/sfx/browse?path=${encodeURIComponent(path)}`));
    if (!d) return;
    current = d.path;
    $('#sp-path', m).innerHTML = current ? `<button class="btn small" data-sp="${esc(d.parent)}">${ICON.back}</button><span class="here">${esc(current)}</span>` : `<span class="here">${esc(t('sfx_roots'))}</span>`;
    $('#sp-list', m).innerHTML = d.entries.length ? d.entries.map((e) => `<div class="browser-row"><span class="file-icon">${ICON.folder}</span><button class="link" data-sp="${esc(e.path)}">${esc(e.name)}</button></div>`).join('') : `<p class="muted" style="padding:12px">${esc(t('sfx_no_subfolders'))}</p>`;
    $('#sp-go', m).disabled = !current;
  };
  m.addEventListener('click', (e) => { const b = e.target.closest('[data-sp]'); if (b) load(b.dataset.sp); });
  $('#sp-go', m).addEventListener('click', async () => {
    if (!current) return;
    const r = await run(() => api('POST', '/api/sfx/folders', { path: current }));
    if (!r) return;
    closeModal();
    toast(t('sfx_linked'));
    await refreshNav();
    render();
    sfxScanTimer = 0;
    watchSfxScan();
  });
  load('');
}

// ---------------------------------------------------------------- Settings: backup
function backupPanel() {
  return `<h2>${ICON.zip} ${esc(t('backup_title'))}</h2>
    <p class="muted" style="margin:0;line-height:1.6">${esc(t('backup_note'))}</p>
    <div id="backup-body"><p class="muted">${esc(t('loading'))}</p></div>`;
}
let backupTimer = null;
async function bindBackup() {
  const box = $('#backup-body');
  if (!box) return;
  const d = await run(() => api('GET', '/api/backup'));
  if (!d || !$('#backup-body')) return;
  const job = d.job;
  box.innerHTML = `
    <div class="about"><div>${esc(t('backup_folder'))}: <strong>${esc(d.host_dir || d.dir)}</strong>${d.free != null ? ` · ${esc(t('free_disk'))}: <strong>${fmtSize(d.free)}</strong>` : ''}</div>
      ${d.writable ? '' : `<div class="warn-text">${esc(t('backup_not_writable'))}</div>`}</div>
    <label class="check"><input type="checkbox" id="bk-trash" checked> ${esc(t('backup_with_trash'))}</label>
    <div class="actions">
      <button class="btn primary" data-action="backup-create" ${d.writable && !job.running ? '' : 'disabled'}>${ICON.zip}${esc(t('backup_create'))}</button>
      <a class="btn" id="bk-download" href="/api/backup/download?include_trash=true" download>${ICON.download}${esc(t('backup_download'))}</a>
      <label class="btn" ${d.writable ? '' : 'hidden'}>${ICON.upload}${esc(t('backup_upload'))}<input type="file" id="bk-upload" accept=".zip" hidden></label>
    </div>
    <p class="scan-note" id="bk-job">${job.running ? esc(jobText(job)) : job.error ? `<span class="warn-text">${esc(job.error)}</span>` : ''}</p>
    ${d.backups.length ? `<h3 class="sala-sub">${esc(t('backup_list'))}</h3><div class="folder-list">${d.backups.map((b) => `
      <div class="folder-row"><span class="mod-icon">${ICON.zip}</span>
        <span class="mod-text"><strong>${esc(b.name)}</strong>
          <span>${esc(fmtDate(b.date))} · ${fmtSize(b.size)}${b.manifest ? ` · MDoP ${esc(b.manifest.version)} · ${esc(tn('songs_n', b.manifest.songs || 0))}` : ` · ${esc(t('backup_unknown'))}`}</span></span>
        <a class="icon-btn small" href="/api/backup/files/${encodeURIComponent(b.name)}" download aria-label="${esc(t('download'))}" title="${esc(t('download'))}">${ICON.download}</a>
        ${b.manifest ? `<button class="btn small" data-action="backup-restore" data-name="${esc(b.name)}">${ICON.restore}${esc(t('backup_restore'))}</button>` : ''}
        <button class="icon-btn small" data-action="backup-delete" data-name="${esc(b.name)}" aria-label="${esc(t('delete'))}" title="${esc(t('delete'))}">${ICON.trash}</button>
      </div>`).join('')}</div>` : ''}`;
  $('#bk-trash').addEventListener('change', (e) => { $('#bk-download').href = `/api/backup/download?include_trash=${e.target.checked}`; });
  $('#bk-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    $('#bk-job').textContent = t('backup_uploading');
    const r = await run(() => api('POST', '/api/backup/upload', fd));
    if (r) { toast(t('backup_uploaded', { n: r.name })); bindBackup(); } else $('#bk-job').textContent = '';
  });
  if (job.running) { clearTimeout(backupTimer); backupTimer = setTimeout(watchBackup, 1000); }
}
const jobText = (j) => (j.kind === 'restore' ? t('restore_progress', { p: j.total ? Math.round((j.done / j.total) * 100) : 0 }) : t('backup_progress', { p: j.total ? Math.round((j.done / j.total) * 100) : 0 }));
async function watchBackup() {
  clearTimeout(backupTimer);
  let j;
  try { j = await api('GET', '/api/backup/status'); } catch { backupTimer = setTimeout(watchBackup, 1500); return; }
  const el = $('#bk-job');
  if (j.running) { if (el) el.textContent = jobText(j); backupTimer = setTimeout(watchBackup, 1000); return; }
  if (j.error) toast(j.error, { error: true });
  else toast(t('backup_done', { n: j.name }));
  bindBackup();
}
// while a backup is restored, or the library is updated to a new version, a waiting screen covers the app until it ends
let restoringShown = false;
async function showRestoring() {
  if (restoringShown) return;
  restoringShown = true;
  const el = document.createElement('div');
  el.className = 'restore-screen';
  el.innerHTML = `<div class="login-card"><span class="logo-big" aria-hidden="true">${ICON.restore}</span><h2 id="rs-title">${esc(t('restoring_t'))}</h2><p id="rs-text">${esc(t('restoring_p'))}</p><div class="type-track"><span id="rs-bar" style="width:0"></span></div><p class="muted" id="rs-extra" style="margin:0;font-size:13px;line-height:1.6"></p></div>`;
  document.body.append(el);
  const tick = async () => {
    let j;
    try { j = await (await fetch('/api/backup/status')).json(); } catch { setTimeout(tick, 1500); return; }
    const migrating = j.kind === 'migrate';
    const p = j.total ? Math.min(100, Math.round((j.done / j.total) * 100)) : 0;
    $('#rs-bar').style.width = `${p}%`;
    $('#rs-title').textContent = t(migrating ? (j.error && !j.running ? 'migrate_fail_t' : 'migrate_t') : 'restoring_t');
    $('#rs-bar').parentElement.hidden = Boolean(j.error && !j.running);
    if (j.running) $('#rs-text').textContent = migrating ? (j.total ? t('migrate_backup', { p }) : t('migrate_p')) : jobText(j);
    else if (j.error) {
      $('#rs-text').textContent = migrating ? t('migrate_fail') : j.error;
      $('#rs-extra').textContent = migrating ? j.error : '';
    } else $('#rs-text').textContent = t('restore_done');
    if (j.running) setTimeout(tick, 1000);
    else if (!j.error) setTimeout(() => location.reload(), 900);
  };
  tick();
}

// ================================================================ home
async function viewHome(view) {
  const m = state.meta;
  if (!m.songs && !m.loose && !m.ideas) {
    view.innerHTML = `
      <div class="page-head"><div><h1>${esc(t('nav_home'))}</h1></div></div>
      <div class="empty"><span class="logo-big" aria-hidden="true">MDoP</span><h2>${esc(t('welcome_t'))}</h2><p>${esc(t('welcome_p'))}</p>
        <div class="actions"><button class="btn primary" data-action="import" data-target="loose">${ICON.upload}${esc(t('add_files'))}</button><button class="btn" data-action="new-song">${ICON.plus}${esc(t('create_song'))}</button></div></div>`;
    return;
  }
  const q = route().params.get('q') || '';
  view.innerHTML = `
    <div class="topbar">
      <label class="search">${ICON.search}<span class="sr-only">${esc(t('search'))}</span><input type="search" id="home-search" value="${esc(q)}" placeholder="${esc(t('home_search_ph'))}"></label>
      <button class="btn" data-action="import">${ICON.upload}${esc(t('add_files'))}</button>
      <button class="btn primary" data-action="new-song">${ICON.plus}${esc(t('create_song'))}</button>
    </div>
    <div id="home-results" hidden></div>
    <div id="home-main"></div>`;
  const input = $('#home-search');
  const doSearch = async (term) => {
    const res = $('#home-results'), main = $('#home-main');
    if (!term) { res.hidden = true; main.hidden = false; return; }
    const data = await api('GET', `/api/search?q=${encodeURIComponent(term)}`);
    if (input.value.trim() !== term) return;  // the user already typed something else
    librarySongs = [...data.songs, ...(data.ideas || [])];
    sfxState.items = data.sfx || [];
    sfxState.current = -1;
    res.innerHTML = searchResults(data, term);
    res.hidden = false; main.hidden = true;
  };
  input.addEventListener('input', debounce(async (e) => {
    const term = e.target.value.trim();
    setParam('q', term, false);
    await run(() => doSearch(term));
  }, 250));
  await homeMain($('#home-main'));
  if (q) await doSearch(q);
}

function searchResults(d, term) {
  const total = d.songs.length + (isOn('ideas') ? (d.ideas || []).length : 0) + (isOn('sfx') ? (d.sfx || []).length : 0) + (isOn('albums') ? d.albums.length : 0) + d.bands.length + d.artists.length + d.loose.length;
  if (!total) return `<div class="empty"><h2>${esc(t('res_none_t'))}</h2><p>${esc(t('res_none_p'))}</p></div>`;
  const sec = (title, n, body) => n ? `<section class="home-row"><div class="section-head"><h2 class="section-title">${esc(title)} <span class="count-pill">${n}</span></h2></div>${body}</section>` : '';
  const person = (href, img, name, sub, round = true) => `<a class="res-person" href="${href}"><span class="avatar ${round ? '' : 'square'}" style="width:44px;height:44px;${bgImg(img)}">${img ? '' : esc(initialsOf(name))}</span><span><strong>${esc(name)}</strong><span>${esc(sub)}</span></span></a>`;
  return `
    ${sec(t('res_songs'), d.songs.length, `<div class="grid mini-grid">${d.songs.map(songMini).join('')}</div>`)}
    ${sec(t('res_sfx'), isOn('sfx') ? (d.sfx || []).length : 0, `<div class="sfx-list compact">${(d.sfx || []).map((x, i) => sfxRow(x, i, true)).join('')}</div>${d.sfx_total > (d.sfx || []).length ? `<div class="actions" style="margin-top:12px"><button class="btn" data-action="open-sfx-search" data-q="${esc(term)}">${ICON.wave}${esc(t('open_in_sfx'))}</button></div>` : ''}`)}
    ${sec(t('res_ideas'), isOn('ideas') ? (d.ideas || []).length : 0, `<div class="grid mini-grid">${(d.ideas || []).map((x) => ideaCard(x, 'mini')).join('')}</div>`)}
    ${sec(t('nav_albums'), isOn('albums') ? d.albums.length : 0, `<div class="res-people">${d.albums.map((a) => person(`#/album/${a.id}`, a.thumb_url || a.mosaic[0], a.title, tn('songs_n', a.song_count), false)).join('')}</div>`)}
    ${sec(t('nav_bands'), isOn('bands') ? d.bands.length : 0, `<div class="res-people">${d.bands.map((b) => person(`#/band/${b.id}`, b.cover_url, b.title, tn('songs_n', b.song_count))).join('')}</div>`)}
    ${sec(t('nav_artists'), isOn('artists') ? d.artists.length : 0, `<div class="res-people">${d.artists.map((a) => person(`#/artist/${a.id}`, a.photo_url, a.name, (a.roles || []).join(', ') || tn('songs_n', a.song_count || 0))).join('')}</div>`)}
    ${sec(t('res_loose'), d.loose_total, `<div class="loose-list">${d.loose.map((g) => `
      <div class="loose-row"><div class="file-icon">${fileIcon((g.files[0].split('.').pop() || '').toLowerCase())}</div>
        <div class="loose-info"><strong>${esc(g.title)}</strong><div class="loose-files"><span>${esc(g.files.join(' · '))}</span>${g.origin_dir ? `<span>· ${esc(g.origin_dir)}</span>` : ''}</div></div>
      </div>`).join('')}</div>
      <div class="actions" style="margin-top:12px">${d.loose_total > d.loose.length ? `<span class="muted" style="font-size:13px;align-self:center">${esc(tn('res_loose_more', d.loose_total - d.loose.length))}</span>` : ''}
        <button class="btn" data-action="open-loose-search" data-q="${esc(term)}">${ICON.inbox}${esc(t('open_in_list'))}</button></div>`)}`;
}

async function homeMain(box) {
  const m = state.meta;
  const [recent, favs, bands, pick, ideasRecent] = await Promise.all([
    api('GET', '/api/songs?sort=updated&limit=12'),
    m.favorites ? api('GET', '/api/songs?favorite=true&sort=updated&limit=12') : [],
    m.bands.length ? api('GET', '/api/bands') : [],
    m.songs ? api('GET', '/api/songs?sort=random&limit=1') : [],
    m.ideas ? api('GET', '/api/songs?ideas=true&sort=updated&limit=12') : [],
  ]);
  librarySongs = [...recent, ...favs, ...pick, ...ideasRecent];
  const row = (title, href, items) => items.length ? `
    <section class="home-row">
      <div class="section-head"><h2 class="section-title">${esc(title)}</h2>${href ? `<a href="${href}" class="see-all">${esc(t('see_all'))}</a>` : ''}</div>
      <div class="row-scroll">${items.join('')}</div>
    </section>` : '';
  const bandCard = (b) => `<article class="card" data-href="#/band/${b.id}">
      <div class="cover" style="${bgImg(b.cover_url)}">${b.cover_url ? '' : `<span class="initials">${esc(initialsOf(b.title))}</span>`}</div>
      <div class="card-body"><div class="card-title"><a href="#/band/${b.id}">${esc(b.title)}</a></div><div class="card-meta">${tn('songs_n', b.song_count)}</div></div></article>`;
  box.innerHTML = `
    <div class="page-head"><div><h1>${esc(t('nav_home'))}</h1><p>${esc(t('home_sub'))}</p></div></div>
    <div class="dash">${dashLibrary(m)}${dashFiles(m)}<div class="dash-card dash-pick" id="dash-pick">${dashPick(pick[0])}</div></div>
    ${row(t('sec_recent'), '#/songs', recent.map((x) => songCard(x)))}
    ${isOn('ideas') ? row(t('sec_ideas'), '#/ideas', ideasRecent.map((x) => ideaCard(x))) : ''}
    ${isOn('favorites') ? row(t('sec_favs'), '#/favorites', favs.map((x) => songCard(x))) : ''}
    ${isOn('albums') ? row(t('nav_albums'), '#/albums', state.albums.slice(0, 12).map(albumCard)) : ''}
    ${isOn('bands') ? row(t('nav_bands'), '#/bands', bands.slice(0, 12).map(bandCard)) : ''}`;
}

function dashLibrary(m) {
  const st = m.by_status || {};
  const total = m.songs || 0;
  const done = (st.ready || 0) + (st.recorded || 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const bar = SONG_STATUSES.filter((x) => st[x]).map((x) => `<a class="seg-${x}" href="#/songs?status=${x}" style="flex:${st[x]}" title="${esc(stLabel(x))}: ${st[x]}" aria-label="${esc(stLabel(x))}: ${st[x]}"></a>`).join('');
  return `<div class="dash-card dash-library">
    <div class="dash-head"><span class="dash-label">${esc(t('dash_library'))}</span><a class="see-all" href="#/songs">${esc(t('see_all'))}</a></div>
    <div class="dash-big"><strong>${total}</strong><span>${esc(t('stat_songs'))} · ${tn('albums_n', m.albums)}</span></div>
    <div class="pipeline" role="img" aria-label="${esc(t('dash_done', { p: pct }))}">${bar || '<span class="seg-empty"></span>'}</div>
    <div class="pipeline-legend">${SONG_STATUSES.map((x) => `<a href="#/songs?status=${x}"><span class="dot ${x}" aria-hidden="true"></span>${esc(stLabel(x))}<strong>${st[x] || 0}</strong></a>`).join('')}</div>
    <div class="dash-foot">${esc(t('dash_done', { p: pct }))}</div>
  </div>`;
}

function dashFiles(m) {
  const by = m.by_type || {};
  const kinds = [['audio', ICON.ftAudio, t('f_audio'), 'audio'], ['midi', ICON.ftMidi, 'MIDI', 'midi'], ['gp', ICON.ftGp, t('gp_short'), 'gp'], ['other', ICON.ftOther, t('other_files'), '']];
  const max = Math.max(1, ...kinds.map(([k]) => by[k] || 0));
  return `<div class="dash-card dash-files">
    <div class="dash-head"><span class="dash-label">${esc(t('dash_files'))}</span></div>
    <div class="dash-big"><strong>${m.files}</strong><span>${esc(t('dash_used', { s: fmtSize(m.bytes) }))}</span></div>
    <div class="type-bars">${kinds.filter(([k]) => k !== 'other' || by.other).map(([k, icon, label, fmt]) => `
      <${fmt ? `a href="#/songs?fmt=${fmt}"` : 'div'} class="type-bar"><span class="type-icon">${icon}</span><span class="type-name">${esc(label)}</span>
        <span class="type-track"><span style="width:${Math.round(((by[k] || 0) / max) * 100)}%"></span></span><strong>${by[k] || 0}</strong></${fmt ? 'a' : 'div'}>`).join('')}</div>
  </div>`;
}

function dashPick(s) {
  if (!s) return `<div class="dash-head"><span class="dash-label">${esc(t('dash_random'))}</span></div><p class="muted">${esc(t('empty_lib_p'))}</p>`;
  return `<div class="dash-head"><span class="dash-label">${esc(t('dash_random'))}</span>
      <button class="btn small ghost" data-action="home-shuffle">${ICON.shuffle}${esc(t('another'))}</button></div>
    <a class="pick" href="#/song/${s.id}">
      <span class="pick-cover${s.thumb_url ? '' : ' note-cover'}" style="${bgImg(s.thumb_url)}">${s.thumb_url ? '' : noteCover()}</span>
      <span class="pick-info"><strong>${esc(s.title)}</strong><span class="status ${s.status}">${esc(stLabel(s.status))}</span>
        <span class="muted">${[s.band?.title, s.style].filter(Boolean).map(esc).join(' · ') || esc(t('dash_random_p'))}</span></span></a>
    <div class="actions">${songPlayable(s) ? `<button class="btn primary" data-action="play-song" data-id="${s.id}">${ICON.play}${esc(t('play'))}</button>` : ''}<a class="btn" href="#/song/${s.id}">${esc(t('open'))}</a></div>`;
}

// ================================================================ trash
async function viewTrash(view) {
  const data = await api('GET', '/api/trash');
  const items = data.items;
  const kindIcon = { file: ICON.ftOther, song: ICON.music, loose: ICON.inbox };
  view.innerHTML = `
    <div class="page-head"><div><h1>${esc(t('trash_title'))}</h1><p>${esc(t('trash_sub'))}</p></div>
      ${items.length || data.others ? `<button class="btn danger" data-action="trash-empty" data-size="${esc(fmtSize(data.size + data.others_size))}">${ICON.trash}${esc(t('empty_trash'))}</button>` : ''}</div>
    ${items.length ? `<div class="loose-list">${items.map((it) => `
      <div class="loose-row">
        <div class="file-icon">${it.kind === 'file' ? fileIcon((it.name.split('.').pop() || '').toLowerCase()) : kindIcon[it.kind] || ICON.ftOther}</div>
        <div class="loose-info"><strong>${esc(it.name)}</strong>
          <div class="loose-files"><span class="chip">${esc(t(`kind_${it.kind}`))}</span>${it.where ? `<span>${esc(t('from_song', { t: it.where }))}</span>` : ''}<span>· ${fmtSize(it.size)} · ${fmtDate(it.deleted_at)}</span></div></div>
        <div class="loose-actions">
          <button class="btn small" data-action="trash-restore" data-id="${it.id}" ${it.exists ? '' : 'disabled'}>${ICON.restore}${esc(t('restore'))}</button>
          <button class="icon-btn" data-action="trash-delete" data-id="${it.id}" data-name="${esc(it.name)}" aria-label="${esc(t('delete_forever'))}: ${esc(it.name)}" title="${esc(t('delete_forever'))}">${ICON.trash}</button>
        </div>
      </div>`).join('')}</div>
      <p class="muted" style="font-size:13px;margin-top:14px">${esc(t('total'))}: ${fmtSize(data.size)}</p>`
    : `<div class="empty"><h2>${esc(t('trash_empty_t'))}</h2><p>${esc(t('trash_empty_p'))}</p></div>`}
    ${data.others ? `<p class="muted" style="font-size:13px">${esc(tn('trash_others', data.others))} (${fmtSize(data.others_size)})</p>` : ''}`;
}

// ================================================================ login
let loginOpen = false;
async function showLogin() {
  if (loginOpen) return;  // several refused requests at the same time open a single screen
  loginOpen = true;
  let st = { user: '', lang: LANG };
  try { st = await (await fetch('/api/auth/status')).json(); } catch { /* */ }
  LANG = pickLang(st.lang);
  closeModal();
  audio.pause();
  const el = document.createElement('div');
  el.id = 'login-screen';
  el.className = 'login-screen';
  el.innerHTML = `<form class="login-card" id="login-form">
      <span class="brand-mark big" aria-hidden="true">MDoP</span>
      <h1>Musical Display of Power</h1><p class="muted">${esc(t('login_sub'))}</p>
      <label class="field">${esc(t('user'))}<input class="input" id="login-user" autocomplete="username" autofocus></label>
      <label class="field">${esc(t('password'))}<input class="input" id="login-pass" type="password" autocomplete="current-password"></label>
      <p class="login-error" id="login-error" role="alert"></p>
      <button class="btn primary" type="submit">${esc(t('login_btn'))}</button>
    </form>`;
  document.body.append(el);
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#login-error').textContent = '';
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: $('#login-user').value, password: $('#login-pass').value }) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || t('err_generic', { n: res.status })); }
      el.remove();
      loginOpen = false;
      render();
    } catch (err) { $('#login-error').textContent = err.message; }
  });
  setTimeout(() => $('#login-user')?.focus(), 50);
}

// ================================================================ settings
const SETTINGS_TABS = ['general', 'menu', 'sfx', 'backup', 'library', 'security', 'about'];
function viewSettings(view, tab) {
  if (!SETTINGS_TABS.includes(tab)) tab = 'general';
  if (tab === 'sfx' && !isOn('sfx')) tab = 'general';
  const s = state.meta.settings;
  const radio = (name, value, label) => `<label class="option"><input type="radio" name="${name}" value="${value}" ${s[name] === value ? 'checked' : ''}><span><strong>${esc(label)}</strong></span></label>`;
  const icons = { general: ICON.gear, menu: ICON.grid, sfx: ICON.wave, backup: ICON.zip, library: ICON.folder, security: ICON.lock, about: ICON.bulb };
  const tabs = SETTINGS_TABS.filter((k) => k !== 'sfx' || isOn('sfx'));
  const panels = {
    general: () => `
      <div class="panel"><fieldset><legend>${esc(t('language'))}</legend><div class="options">${radio('lang', '', t('lang_auto'))}${radio('lang', 'pt', 'Português')}${radio('lang', 'en', 'English')}</div></fieldset></div>
      <div class="panel"><fieldset><legend>${esc(t('theme'))}</legend><div class="options">${radio('theme', 'dark', t('theme_dark'))}${radio('theme', 'light', t('theme_light'))}${radio('theme', 'glass', t('theme_glass'))}</div>
        ${s.theme === 'glass' ? `<p class="muted" style="margin:4px 0 0;font-size:13px;line-height:1.5">${esc(t('glass_note'))}</p>
        <div class="bg-pick"><span class="bg-preview" style="${bgImg(state.meta.background_url)}"></span>
          <div><strong>${esc(t('bg_title'))}</strong>${state.meta.background_url ? '' : `<p class="muted">${esc(t('bg_none'))}</p>`}
            <div class="actions"><button class="btn small" data-action="bg-choose">${ICON.imageSm}${esc(state.meta.background_url ? t('bg_change') : t('bg_choose'))}</button>
            ${state.meta.background_url ? `<button class="btn small" data-action="bg-remove">${esc(t('remove'))}</button>` : ''}</div></div></div>` : ''}</fieldset></div>
      <div class="panel"><fieldset><legend>${esc(t('accent'))}</legend><div class="swatches">${Object.entries(ACCENTS).map(([k, c]) => `<button class="swatch" data-action="set-accent" data-value="${k}" aria-pressed="${s.accent === k}"><span style="background:${c}"></span>${esc(t(`acc_${k}`))}</button>`).join('')}</div></fieldset></div>`,
    menu: () => `<div class="panel" id="menu-panel">${menuPanel()}</div>`,
    sfx: () => `<div class="panel" id="sfx-panel">${sfxSettingsPanel()}</div>`,
    backup: () => `<div class="panel" id="backup-panel">${backupPanel()}</div>`,
    library: () => `
      <div class="panel"><h2>${ICON.folder} ${esc(t('library_title'))}</h2><div class="about">
        <div>${esc(t('path_server'))}: <strong>${esc(state.meta.library_host || state.meta.library)}</strong></div>
        ${state.meta.library_host ? `<div>${esc(t('path_inside'))}: <strong>${esc(state.meta.library)}</strong></div>` : ''}
        <div>${esc(t('in_use'))}: <strong>${fmtSize(state.meta.library_bytes)}</strong> · ${esc(t('free_disk'))}: <strong>${fmtSize(state.meta.disk.free)}</strong></div>
        ${IS_DESKTOP ? `<div class="warn-text" id="library-next" hidden></div>
          <div class="actions"><button class="btn small" data-action="desktop-show-library">${ICON.folder}${esc(t('show_folder'))}</button>
            <button class="btn small" data-action="desktop-library">${esc(t('library_other'))}</button></div></div></div>
        <div class="panel" id="import-roots-panel"><h2>${ICON.upload} ${esc(t('import_folders'))}</h2><p class="muted" style="margin:0;line-height:1.6">${esc(t('import_folders_note'))}</p>${importRootsList()}</div>`
        : `<div>${esc(t('import_folders'))}: <strong>${esc(state.meta.import_roots.join(', ') || t('none'))}</strong></div>
        <div style="margin-top:8px">${esc(t('move_hint'))} <code>./install.sh move</code></div></div></div>`}
      <div class="panel"><fieldset><legend>${esc(t('trash_auto_t'))}</legend>
        <p class="muted" style="margin:0 0 4px;line-height:1.6">${esc(t('trash_auto_p'))}</p>
        <div class="options">${radio('trash_days', '0', t('trash_keep'))}${radio('trash_days', '30', tn('trash_after_n', 30))}${radio('trash_days', '90', tn('trash_after_n', 90))}</div>
        <p class="muted" style="margin:4px 0 0;font-size:13px"><a href="#/trash">${esc(t('nav_trash'))}</a> · ${esc(tn('items_n', state.meta.trash || 0))}</p></fieldset></div>`,
    security: () => `<div class="panel" id="security">${securityPanel()}</div>`,
    about: () => `<div class="panel"><h2>${esc(t('about'))}</h2><div class="about">
        <div>${esc(t('version'))}: <strong>${esc(state.meta.version)}</strong></div>
        <div><a href="${esc(state.meta.repo)}" target="_blank" rel="noopener">Musical Display of Power</a> · MIT</div></div>
        <p style="margin:0;line-height:1.6;color:var(--text-2)">${esc(t('app_about'))}</p></div>`,
  };
  view.innerHTML = `
    <div class="page-head"><div><h1>${esc(t('settings_title'))}</h1><p>${esc(t('settings_note'))}</p></div></div>
    <div class="settings">
      <nav class="ftabs settings-tabs" role="tablist" aria-label="${esc(t('settings_title'))}">${tabs.map((k) => `<a role="tab" href="#/settings/${k}" aria-selected="${k === tab}">${icons[k]}<span>${esc(t(`set_${k}`))}</span></a>`).join('')}</nav>
      ${panels[tab]()}
    </div>`;
  $$('input[type=radio]', view).forEach((r) => r.addEventListener('change', () => saveSetting(r.name, r.value)));
  $$('[data-mod-toggle]', view).forEach((c) => c.addEventListener('change', () => {
    const hidden = $$('[data-mod-toggle]', view).filter((x) => !x.checked).map((x) => x.dataset.modToggle);
    saveSetting('hidden', hidden.join(','));
  }));
  $('.settings-tabs [aria-selected=true]', view)?.scrollIntoView({ inline: 'center', block: 'nearest' });
  bindSecurity();
  bindSfxSettings();
  bindBackup();
  if (IS_DESKTOP && $('#library-next')) run(() => api('GET', '/api/desktop')).then(showNextLibrary);
}
function showNextLibrary(d) {
  const el = $('#library-next');
  if (!d || !el) return;
  const changed = d.next_library && d.next_library !== d.library.replaceAll('\\', '/');
  el.hidden = !changed;
  el.textContent = changed ? t('library_next', { p: d.next_library }) : '';
}
function importRootsList() {
  const roots = state.meta.import_roots;
  return `${roots.length ? `<div class="folder-list">${roots.map((r) => `
    <div class="folder-row"><span class="mod-icon">${ICON.folder}</span>
      <span class="mod-text"><strong>${esc(r.split(/[\\/]/).filter(Boolean).pop() || r)}</strong><span>${esc(r)}</span></span>
      <button class="icon-btn small" data-action="desktop-remove-import" data-path="${esc(r)}" aria-label="${esc(t('remove_x', { x: r }))}" title="${esc(t('remove'))}">${ICON.close}</button>
    </div>`).join('')}</div>` : `<p class="muted" style="margin:0">${esc(t('no_import_roots'))}</p>`}
    <div class="actions"><button class="btn" data-action="desktop-add-import">${ICON.plus}${esc(t('import_add'))}</button></div>`;
}
function menuPanel() {
  const m = state.meta;
  const items = [
    ['ideas', ICON.bulb, t('nav_ideas'), t('mod_ideas'), tn('ideas_n', m.ideas || 0)],
    ['sfx', ICON.wave, t('nav_sfx'), t('mod_sfx'), tn('sfx_n', m.sfx?.count || 0)],
    ['albums', ICON.disc, t('nav_albums'), t('mod_albums'), tn('albums_n', m.albums || 0)],
    ['bands', ICON.users, t('nav_bands'), t('mod_bands'), tn('bands_n', m.bands.length)],
    ['artists', ICON.mic, t('nav_artists'), t('mod_artists'), tn('artists_n', m.artists || 0)],
    ['favorites', ICON.heart, t('nav_favs'), t('mod_favs'), tn('songs_n', m.favorites || 0)],
  ];
  return `<h2>${ICON.grid} ${esc(t('menu_title'))}</h2><p class="muted" style="margin:0 0 4px;line-height:1.6">${esc(t('menu_note'))}</p>
    <div class="mod-list">${items.map(([k, icon, name, desc, count]) => `
      <label class="mod-row"><span class="mod-icon">${icon}</span>
        <span class="mod-text"><strong>${esc(name)}</strong><span>${esc(desc)} · ${esc(count)}</span></span>
        <input type="checkbox" class="switch" data-mod-toggle="${k}" ${isOn(k) ? 'checked' : ''} aria-label="${esc(name)}"></label>`).join('')}</div>`;
}
function securityPanel() {
  const a = state.meta.auth;
  const forgotCmd = IS_DESKTOP ? 'MDoP disable-password' : 'sudo docker exec mdop python -m app disable-password';
  const forgot = `<p class="muted" style="font-size:13px;margin:0;line-height:1.7">${esc(t('forgot'))}<br><code>${forgotCmd}</code></p>`;
  if (!a.enabled) {
    return `<h2>${ICON.lock} ${esc(t('security'))}</h2><p class="muted" style="margin:0">${esc(t('sec_off'))}</p>
      <form id="sec-create" style="display:flex;flex-direction:column;gap:12px;max-width:420px">
        <label class="field">${esc(t('user'))}<input class="input" id="sec-user" autocomplete="username" required></label>
        <label class="field">${esc(t('password'))}<input class="input" id="sec-pass" type="password" autocomplete="new-password" required minlength="8"><span>${esc(t('pw_min'))}</span></label>
        <label class="field">${esc(t('confirm_password'))}<input class="input" id="sec-pass2" type="password" autocomplete="new-password" required></label>
        <div><button class="btn primary" type="submit">${ICON.lock}${esc(t('create_login'))}</button></div>
      </form>${forgot}`;
  }
  return `<h2>${ICON.lock} ${esc(t('security'))}</h2><p style="margin:0">${esc(t('sec_on', { u: a.user }))}</p>
    <div class="actions"><button class="btn" data-action="sec-change">${esc(t('change_password'))}</button><button class="btn" data-action="sec-logout">${esc(t('logout'))}</button><button class="btn danger" data-action="sec-remove">${esc(t('remove_protection'))}</button></div>${forgot}`;
}

function bindSecurity() {
  const form = $('#sec-create');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if ($('#sec-pass').value !== $('#sec-pass2').value) { toast(t('pw_mismatch'), { error: true }); return; }
    if (await run(() => api('POST', '/api/auth/setup', { user: $('#sec-user').value, password: $('#sec-pass').value }))) { toast(t('protection_on')); render(); }
  });
}

function passwordModal({ title, fields, confirm, danger = false }) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    const m = openModal(`${modalHead(title)}<form class="modal-body" id="pw-form">${fields.map((f) => `<label class="field">${esc(f.label)}<input class="input" type="password" name="${f.name}" autocomplete="${f.ac || 'current-password'}" required></label>`).join('')}</form>
      <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn ${danger ? 'danger' : 'primary'}" type="submit" form="pw-form">${esc(confirm)}</button></div></div>`,
    { small: true, onClose: () => finish(null) });
    $('#pw-form', m).addEventListener('submit', (e) => {
      e.preventDefault();
      const out = {};
      $$('input', m).forEach((i) => { out[i.name] = i.value; });
      finish(out); closeModal();
    });
  });
}

async function saveSetting(key, value) {
  const res = await run(() => api('PUT', '/api/settings', { [key]: value }));
  if (res) { state.meta.settings = res; applySettings(res); render(); }
}

// ================================================================ modals
let modalCleanup = null;
function openModal(html, { small = false, onClose } = {}) {
  closeModal();
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-backdrop" data-backdrop><div class="modal ${small ? 'small' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
  const backdrop = $('[data-backdrop]', root);
  const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', onKey);
  modalCleanup = () => { document.removeEventListener('keydown', onKey); onClose?.(); };
  const first = $('[autofocus]', root) || $('input, select, textarea, button', root);
  setTimeout(() => first?.focus(), 30);
  return $('.modal', root);
}
function closeModal() {
  const root = $('#modal-root');
  if (!root.innerHTML) return;
  const fn = modalCleanup;
  modalCleanup = null;
  root.innerHTML = '';
  fn?.();
}
const modalHead = (title, sub = '') => `<div class="modal-head"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div><button class="icon-btn" data-action="close-modal" aria-label="${esc(t('close'))}">${ICON.close}</button></div>`;

function promptModal({ title, label, value = '', confirm, placeholder = '', suggestions = [] }) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    const m = openModal(`${modalHead(title)}
      <form class="modal-body" id="prompt-form"><label class="field">${esc(label)}<input class="input" id="prompt-input" value="${esc(value)}" placeholder="${esc(placeholder)}" autofocus ${suggestions.length ? 'list="prompt-dl"' : ''}></label>
      ${suggestions.length ? `<datalist id="prompt-dl">${suggestions.map((x) => `<option value="${esc(x)}">`).join('')}</datalist><div class="chips">${suggestions.map((x) => `<button type="button" class="tag" data-suggest="${esc(x)}" style="border:0">${esc(x)}</button>`).join('')}</div>` : ''}</form>
      <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" form="prompt-form" type="submit">${esc(confirm || t('save'))}</button></div></div>`,
    { small: true, onClose: () => finish(null) });
    $$('[data-suggest]', m).forEach((b) => b.addEventListener('click', () => { $('#prompt-input', m).value = b.dataset.suggest; $('#prompt-input', m).focus(); }));
    $('#prompt-form', m).addEventListener('submit', (e) => { e.preventDefault(); finish($('#prompt-input', m).value.trim()); closeModal(); });
  });
}
function confirmModal({ title, text, confirm, danger = false }) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    const m = openModal(`${modalHead(title)}<div class="modal-body"><p style="margin:0;line-height:1.6;color:var(--text-2)">${esc(text)}</p></div>
      <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn ${danger ? 'danger' : 'primary'}" id="confirm-yes">${esc(confirm || t('confirm'))}</button></div></div>`,
    { small: true, onClose: () => finish(false) });
    $('#confirm-yes', m).addEventListener('click', () => { finish(true); closeModal(); });
  });
}

function fileMenu(fileId) {
  const { f, v } = findFile(fileId);
  if (!f) return;
  const versions = songCache.versions;
  const m = openModal(`${modalHead(f.name, t('version_x', { n: v.number, l: v.label }))}
    <div class="modal-body">
      <label class="field">${esc(t('file_name'))}<input class="input" id="fm-name" value="${esc(f.name)}"></label>
      ${versions.length > 1 ? `<label class="field">${esc(t('move_to_version'))}<select class="select" id="fm-version">${versions.map((x) => `<option value="${x.id}" ${x.id === v.id ? 'selected' : ''}>v${x.number} · ${esc(x.label)}</option>`).join('')}</select></label>` : ''}
      <div><button class="btn danger small" id="fm-delete">${esc(t('delete_file'))}</button></div>
    </div>
    <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" id="fm-save">${esc(t('save'))}</button></div></div>`, { small: true });
  $('#fm-save', m).addEventListener('click', async () => {
    const body = {};
    const name = $('#fm-name', m).value.trim();
    if (name && name !== f.name) body.name = name;
    const sel = $('#fm-version', m);
    if (sel && Number(sel.value) !== v.id) body.version_id = Number(sel.value);
    if (Object.keys(body).length && await run(() => api('PATCH', `/api/files/${f.id}`, body))) toast(t('file_updated'));
    closeModal();
    render();
  });
  $('#fm-delete', m).addEventListener('click', async () => {
    closeModal();
    if (!await confirmModal({ title: t('delete_file_t'), text: t('delete_file_p', { t: f.name }), confirm: t('delete'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/files/${f.id}`))) { toast(t('file_trashed')); render(); }
  });
}

async function songAlbumsModal(songId) {
  const s = songCache;
  const inSet = new Set(s.album_ids);
  const m = openModal(`${modalHead(t('song_albums_t'), s.title)}
    <div class="modal-body">
      <div class="song-pick">${state.albums.length ? state.albums.map((a) => `<label><input type="checkbox" value="${a.id}" ${inSet.has(a.id) ? 'checked' : ''}><span>${esc(a.title)}</span></label>`).join('') : `<p class="muted" style="margin:0">${esc(t('no_albums_yet'))}</p>`}</div>
      <label class="field">${esc(t('or_new_album'))}<input class="input" id="sa-new" placeholder="${esc(t('new_album_name_ph'))}"></label>
    </div>
    <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" id="sa-save">${esc(t('save'))}</button></div></div>`, { small: true });
  $('#sa-save', m).addEventListener('click', async () => {
    const checked = new Set($$('.song-pick input:checked', m).map((i) => Number(i.value)));
    const newTitle = $('#sa-new', m).value.trim();
    await run(async () => {
      for (const a of state.albums) {
        if (checked.has(a.id) && !inSet.has(a.id)) await api('POST', `/api/albums/${a.id}/songs`, { song_ids: [songId] });
        if (!checked.has(a.id) && inSet.has(a.id)) await api('DELETE', `/api/albums/${a.id}/songs/${songId}`);
      }
      if (newTitle) {
        const al = await api('POST', '/api/albums', { title: newTitle });
        await api('POST', `/api/albums/${al.id}/songs`, { song_ids: [songId] });
      }
      toast(t('albums_updated'));
    });
    closeModal();
    render();
  });
}

async function albumAddModal(albumId) {
  const all = await api('GET', '/api/songs?sort=title');
  const inAlbum = new Set(albumCache.songs.map((s) => s.id));
  const options = all.filter((s) => !inAlbum.has(s.id));
  const m = openModal(`${modalHead(t('add_songs'), albumCache.title)}
    <div class="modal-body">
      <label class="search" style="min-height:44px">${ICON.search}<span class="sr-only">${esc(t('filter_songs'))}</span><input type="search" id="aa-filter" placeholder="${esc(t('filter_songs'))}"></label>
      <div class="song-pick" id="aa-list">${options.length ? options.map((s) => `<label data-title="${esc(s.title.toLowerCase())}"><input type="checkbox" value="${s.id}"><span class="track-cover" style="width:40px;height:40px;${bgImg(s.cover_url)}"></span><span>${esc(s.title)}</span><span class="status ${s.status}" style="margin-left:auto">${esc(stLabel(s.status))}</span></label>`).join('') : `<p class="muted" style="margin:0">${esc(t('all_in_album'))}</p>`}</div>
    </div>
    <div class="modal-foot"><span class="hint" id="aa-count">${esc(t('none_selected'))}</span><div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" id="aa-save">${esc(t('add'))}</button></div></div>`);
  $('#aa-filter', m).addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    $$('#aa-list label', m).forEach((l) => { l.hidden = !l.dataset.title.includes(q); });
  });
  $('#aa-list', m).addEventListener('change', () => {
    const n = $$('#aa-list input:checked', m).length;
    $('#aa-count', m).textContent = n ? tn('selected_n', n) : t('none_selected');
  });
  $('#aa-save', m).addEventListener('click', async () => {
    const ids = $$('#aa-list input:checked', m).map((i) => Number(i.value));
    if (ids.length && await run(() => api('POST', `/api/albums/${albumId}/songs`, { song_ids: ids }))) toast(tn('n_added', ids.length));
    closeModal();
    render();
  });
}

// ---------------------------------------------------------------- add files
async function importModal({ songId = null, versionId = null, target = null } = {}) {
  const songs = await run(() => api('GET', '/api/songs?sort=title')) || [];
  // an idea is not in the song list: it is added only when it is the one open
  if (songId && !songs.some((x) => x.id === songId)) {
    const extra = await run(() => api('GET', `/api/songs/${songId}`));
    if (extra) songs.unshift(extra);
  }
  const roots = state.meta.import_roots;
  const st = {
    tab: 'computer', files: [], serverSel: new Set(), listing: null,
    target: target || (songId ? 'existing' : 'loose'), title: '', songId: songId || (songs[0]?.id ?? null),
    newVersion: false, versionLabel: '', mode: 'copy', busy: false,
  };
  const presetVersion = versionId;
  const m = openModal(`${modalHead(t('imp_title'), t('imp_sub'))}<div id="imp"></div>`);

  const loadDir = async (path) => {
    st.listing = await run(() => api('GET', `/api/browse?path=${encodeURIComponent(path)}`));
    draw();
  };
  const option = (name, value, title, desc, checked, extra = '') =>
    `<label class="option"><input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''} ${extra}><span><strong>${title}</strong><span class="desc">${esc(desc)}</span></span></label>`;

  const destination = () => `
    <fieldset>
      <legend>${esc(t('where'))}</legend>
      <div class="options">
        ${option('target', 'loose', `${esc(t('t_loose'))}<span class="badge-rec">${esc(t('recommended'))}</span>`, t('t_loose_d'), st.target === 'loose')}
        ${option('target', 'new', esc(t('t_new')), t('t_new_d'), st.target === 'new')}
        ${option('target', 'existing', esc(t('t_existing')), t('t_existing_d'), st.target === 'existing', songs.length ? '' : 'disabled')}
        ${option('target', 'grouped', esc(t('t_grouped')), t('t_grouped_d'), st.target === 'grouped')}
      </div>
      ${st.target === 'new' ? `<label class="field">${esc(t('new_name'))}<input class="input" id="imp-title" value="${esc(st.title)}" placeholder="${esc(t('new_name_ph'))}"></label>` : ''}
      ${st.target === 'existing' && !presetVersion ? `
        <label class="field">${esc(t('song_label'))}<select class="select" id="imp-song">${songs.map((s) => `<option value="${s.id}" ${s.id === st.songId ? 'selected' : ''}>${esc(s.title)}</option>`).join('')}</select></label>
        <label class="check"><input type="checkbox" id="imp-newv" ${st.newVersion ? 'checked' : ''}><span>${esc(t('as_new_version'))}</span></label>
        ${st.newVersion ? `<label class="field">${esc(t('version_name'))}<input class="input" id="imp-vlabel" value="${esc(st.versionLabel)}" placeholder="${esc(t('version_ph'))}"></label>` : ''}` : ''}
    </fieldset>`;

  const originals = () => st.tab === 'server' ? `
    <fieldset>
      <legend>${esc(t('originals'))}</legend>
      ${option('mode', 'copy', `${esc(t('copy_t'))}<span class="badge-rec">${esc(t('recommended'))}</span>`, t('copy_d'), st.mode === 'copy')}
      ${option('mode', 'move', esc(t('move_t')), t('move_d'), st.mode === 'move')}
    </fieldset>` : `<p class="muted" style="margin:0;font-size:14px;line-height:1.6">${esc(t('computer_note'))}</p>`;

  const computerTab = () => {
    const shown = st.files.slice(0, 40);
    return `
      <div class="drop" id="imp-drop">${ICON.upload}<span>${esc(t('drop'))}</span>
        <label class="btn small">${esc(t('pick_files'))}<input type="file" id="imp-files" multiple hidden></label>
        <label class="btn small">${esc(t('pick_folder'))}<input type="file" id="imp-dir" webkitdirectory multiple hidden></label>
      </div>
      ${st.files.length ? `<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px" class="muted"><span>${tn('files_selected_n', st.files.length)} · ${fmtSize(st.files.reduce((n, f) => n + f.size, 0))}</span><button class="btn small" data-imp="clear">${esc(t('clear'))}</button></div>
      <div class="picked">${shown.map((f) => { const ext = f.name.split('.').pop().toLowerCase(); return `<div class="picked-row"><span class="chip ${canPlay(ext) ? 'play' : ''}">${esc(ext.toUpperCase())}</span><span class="name">${esc(f.webkitRelativePath || f.name)}</span><span class="note">${esc(canPlay(ext) ? t('playable') : t('stored'))}</span></div>`; }).join('')}${st.files.length > shown.length ? `<div class="picked-row"><span class="name">${esc(t('and_more', { n: st.files.length - shown.length }))}</span></div>` : ''}</div>` : ''}`;
  };

  const serverTab = () => {
    if (!roots.length) return `<div class="empty" style="padding:28px"><h2 style="font-size:18px">${esc(t('no_roots_t'))}</h2><p>${esc(t('no_roots_p'))}</p></div>`;
    const L = st.listing;
    if (!L) return `<p class="muted">${esc(t('loading'))}</p>`;
    const rows = L.entries.length ? L.entries.map((e) => `
      <div class="browser-row">
        <input type="checkbox" data-path="${esc(e.path)}" ${st.serverSel.has(e.path) ? 'checked' : ''} aria-label="${esc(t('select_x', { x: e.name }))}">
        ${e.dir ? `<button class="link" data-imp="open" data-path="${esc(e.path)}">${ICON.folder}<span>${esc(e.name)}</span></button>`
          : `<label><span class="chip ${canPlay(e.ext) ? 'play' : ''}">${esc((e.ext || '?').toUpperCase())}</span>${esc(e.name)}<span class="muted" style="margin-left:auto;font-size:12px">${fmtSize(e.size)}</span></label>`}
      </div>`).join('') : `<div class="browser-row muted">${esc(t('empty_folder'))}</div>`;
    return `
      <div class="browser">
        <div class="browser-path">${L.path ? `<button class="btn small" data-imp="open" data-path="${esc(L.parent || '')}">${ICON.back}${esc(t('back'))}</button>` : ''}<span>${esc(L.path || t('folders_available'))}</span></div>
        <div class="browser-list">${rows}</div>
      </div>
      <div class="muted" style="font-size:13px">${st.serverSel.size ? tn('items_selected_n', st.serverSel.size) : esc(t('mark_hint'))}</div>`;
  };

  const count = () => (st.tab === 'computer' ? st.files.length : st.serverSel.size);

  function draw() {
    const box = $('#imp', m);
    if (!box) return;
    const listScroll = $('.browser-list', m)?.scrollTop || 0;
    box.innerHTML = `
      <div class="modal-body">
        <div class="tabs" role="tablist">
          <button role="tab" aria-selected="${st.tab === 'computer'}" data-imp="tab" data-tab="computer">${esc(t('tab_computer'))}</button>
          <button role="tab" aria-selected="${st.tab === 'server'}" data-imp="tab" data-tab="server">${esc(t('tab_server'))}</button>
        </div>
        ${st.tab === 'computer' ? computerTab() : serverTab()}
        ${destination()}
        ${originals()}
        <div id="imp-progress" hidden><div class="progress"><div></div></div><p class="muted" style="margin:8px 0 0;font-size:13px" id="imp-progress-text"></p></div>
      </div>
      <div class="modal-foot">
        <span class="hint">${count() ? '' : esc(t('nothing_selected'))}</span>
        <div class="actions"><button class="btn" data-action="close-modal">${esc(t('cancel'))}</button><button class="btn primary" data-imp="go" ${count() && !st.busy ? '' : 'disabled'}>${esc(st.busy ? t('adding') : st.tab === 'computer' && count() ? tn('add_n', count()) : t('add'))}</button></div>
      </div>`;
    const list = $('.browser-list', m);
    if (list) list.scrollTop = listScroll;
    bind();
  }

  function bind() {
    const keep = (sel, key) => { const el = $(sel, m); if (el) el.addEventListener('input', () => { st[key] = el.value; }); };
    keep('#imp-title', 'title'); keep('#imp-vlabel', 'versionLabel');
    $('#imp-song', m)?.addEventListener('change', (e) => { st.songId = Number(e.target.value); });
    $('#imp-newv', m)?.addEventListener('change', (e) => { st.newVersion = e.target.checked; draw(); });
    $$('input[name="target"]', m).forEach((r) => r.addEventListener('change', () => { st.target = r.value; draw(); }));
    $$('input[name="mode"]', m).forEach((r) => r.addEventListener('change', () => { st.mode = r.value; }));
    const addFiles = (list) => { st.files.push(...[...list].filter((f) => !f.name.startsWith('.'))); draw(); };
    $('#imp-files', m)?.addEventListener('change', (e) => addFiles(e.target.files));
    $('#imp-dir', m)?.addEventListener('change', (e) => addFiles(e.target.files));
    const drop = $('#imp-drop', m);
    if (drop) {
      drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('over'));
      drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); addFiles(e.dataTransfer.files); });
    }
    $$('.browser-row input[type=checkbox]', m).forEach((c) => c.addEventListener('change', () => {
      if (c.checked) st.serverSel.add(c.dataset.path); else st.serverSel.delete(c.dataset.path);
      draw();
    }));
  }

  m.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-imp]');
    if (!el) return;
    const act = el.dataset.imp;
    if (act === 'tab') { st.tab = el.dataset.tab; if (st.tab === 'server' && roots.length && !st.listing) await loadDir(''); else draw(); }
    if (act === 'clear') { st.files = []; draw(); }
    if (act === 'open') await loadDir(el.dataset.path);
    if (act === 'go') submit();
  });

  async function submit() {
    if (st.target === 'existing' && !presetVersion && !st.songId) { toast(t('choose_song'), { error: true }); return; }
    st.busy = true; draw();
    const targetSong = presetVersion ? songId : st.songId;
    let result;
    try {
      if (st.tab === 'computer') {
        const fd = new FormData();
        st.files.forEach((f) => fd.append('files', f, f.name));
        fd.append('target', st.target);
        fd.append('title', st.title);
        if (st.target === 'existing') fd.append('song_id', targetSong);
        fd.append('new_version', String(st.newVersion));
        fd.append('version_label', st.versionLabel);
        if (presetVersion && st.target === 'existing') fd.append('version_id', presetVersion);
        result = await uploadWithProgress(fd);
      } else {
        result = await api('POST', '/api/import/server', {
          paths: [...st.serverSel], mode: st.mode, target: st.target, title: st.title,
          song_id: st.target === 'existing' ? targetSong : null, new_version: st.newVersion, version_label: st.versionLabel,
          version_id: presetVersion && st.target === 'existing' ? presetVersion : null,
        });
      }
    } catch (err) {
      st.busy = false; draw(); toast(err.message, { error: true }); return;
    }
    showResult(result, st.target === 'existing' ? targetSong : null);
  }

  function uploadWithProgress(fd) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const box = $('#imp-progress', m);
      if (box) box.hidden = false;
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const pct = Math.round((e.loaded / e.total) * 100);
        const bar = $('#imp-progress .progress div', m);
        if (bar) bar.style.width = `${pct}%`;
        const txt = $('#imp-progress-text', m);
        if (txt) txt.textContent = pct < 100 ? t('sending', { p: pct }) : t('organizing');
      };
      xhr.onload = () => {
        let data = null;
        try { data = JSON.parse(xhr.responseText); } catch { /* */ }
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data?.detail || t('err_generic', { n: xhr.status })));
      };
      xhr.onerror = () => reject(new Error(t('upload_failed')));
      xhr.open('POST', '/api/import/upload');
      xhr.send(fd);
    });
  }

  function showResult(r, existingSong) {
    const created = r.songs_created || [];
    const lines = [];
    if (created.length) lines.push(tn('r_songs', created.length));
    lines.push(tn('r_files', r.files_added));
    if (r.skipped.length) lines.push(tn('r_skipped', r.skipped.length));
    const goTo = created.length === 1 ? created[0] : existingSong;
    const primary = st.target === 'loose'
      ? `<a class="btn primary" href="#/files" data-action="close-modal">${esc(t('see_loose'))}</a>`
      : goTo ? `<a class="btn primary" href="#/song/${goTo}" data-action="close-modal">${esc(t('open_song'))}</a>`
        : `<a class="btn primary" href="#/songs?sort=created" data-action="close-modal">${esc(t('see_library'))}</a>`;
    $('#imp', m).innerHTML = `
      <div class="modal-body">
        <h3 style="margin:0;font-size:20px">${esc(t('done'))}</h3>
        <ul class="result-list">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
        ${r.warnings.length ? `<div><strong style="font-size:14px">${esc(t('warnings'))}</strong><ul class="result-list">${r.warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>` : ''}
        ${r.errors.length ? `<div><strong style="font-size:14px;color:var(--danger)">${esc(t('errors'))}</strong><ul class="result-list">${r.errors.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>` : ''}
      </div>
      <div class="modal-foot"><div class="actions"><button class="btn" data-action="close-modal">${esc(t('close'))}</button>${primary}</div></div>`;
    render();
  }

  draw();
}

// ================================================================ compact player with vinyl
const player = { queue: [], index: 0 };
const audio = $('#audio');

function playQueue(queue, index = 0) {
  if (!queue.length) return;
  player.queue = queue;
  player.index = Math.max(0, Math.min(index, queue.length - 1));
  loadTrack();
}
function loadTrack() {
  const tr = player.queue[player.index];
  $('#player').hidden = false;
  document.body.classList.add('has-player');
  $('#player-title').textContent = tr.title;
  $('#player-file').textContent = tr.file;
  $('#player-cover').style.backgroundImage = tr.cover ? `url('${tr.cover}')` : '';
  $('#player-sala').hidden = !tr.songId;
  glass.playing = tr.cover || null;
  refreshGlass();
  audio.src = tr.url;
  audio.play().catch(() => toast(t('cant_play'), { error: true }));
}
// Glass background: cover of the open page > cover of the playing song > chosen image > gradient
const glass = { page: null, playing: null };
function refreshGlass() {
  const bg = $('#glass-bg');
  const cover = glass.page || glass.playing;
  const url = cover || state.meta?.background_url || null;
  bg.classList.toggle('has-cover', !!cover);
  bg.classList.toggle('custom', !cover && !!url);
  bg.style.backgroundImage = url ? `url('${url}')` : '';
}
function setPageCover(url) { glass.page = url || null; refreshGlass(); }
const trackFromSong = (s) => ({ title: s.title, file: s.main_file.name, url: s.main_file.url, cover: s.cover_url, songId: s.id, fileId: s.main_file.id });
function updatePlayButton() {
  const playing = !audio.paused;
  const btn = $('#player-toggle');
  btn.innerHTML = playing ? ICON.pause : ICON.play;
  btn.setAttribute('aria-label', playing ? t('pause') : t('play'));
  $('#player-vinyl').classList.toggle('spinning', playing);
  if (loose.active) markCurrentLoose();
}
let seeking = false;
audio.addEventListener('play', updatePlayButton);
audio.addEventListener('pause', updatePlayButton);
audio.addEventListener('loadedmetadata', () => { $('#player-duration').textContent = fmtTime(audio.duration); });
audio.addEventListener('timeupdate', () => {
  $('#player-time').textContent = fmtTime(audio.currentTime);
  if (audio.duration && !seeking) $('#player-seek').value = Math.round((audio.currentTime / audio.duration) * 1000);
});
audio.addEventListener('ended', () => { if (player.index < player.queue.length - 1) { player.index++; loadTrack(); } });
$('#player-seek').addEventListener('input', () => { seeking = true; });
$('#player-seek').addEventListener('change', (e) => {
  if (audio.duration) audio.currentTime = (e.target.value / 1000) * audio.duration;
  seeking = false;
});

// ================================================================ actions (clicks)
const actions = {
  'close-modal': () => closeModal(),
  'import': (el) => importModal({ songId: el.dataset.song ? Number(el.dataset.song) : null, versionId: el.dataset.version ? Number(el.dataset.version) : null, target: el.dataset.target || null }),
  'new-song': async () => {
    const title = await promptModal({ title: t('new_song_t'), label: t('song_name'), confirm: t('create'), placeholder: t('song_ph') });
    if (title === null) return;
    const s = await run(() => api('POST', '/api/songs', { title }));
    if (s) go(`#/song/${s.id}`);
  },
  'new-album': async () => {
    const title = await promptModal({ title: t('new_album'), label: t('album_name'), confirm: t('create'), placeholder: t('album_ph') });
    if (title === null) return;
    const a = await run(() => api('POST', '/api/albums', { title }));
    if (a) go(`#/album/${a.id}`);
  },
  'new-band': async () => {
    const title = await promptModal({ title: t('new_band'), label: t('band_name'), confirm: t('create'), placeholder: t('band_ph') });
    if (title === null) return;
    const b = await run(() => api('POST', '/api/bands', { title }));
    if (b) go(`#/band/${b.id}`);
  },
  'filter': (el) => setParam(el.dataset.key, el.dataset.value),
  'fav': async (el) => {
    const on = el.dataset.on !== '1';
    if (!await run(() => api('PATCH', `/api/songs/${el.dataset.id}`, { favorite: on }))) return;
    const p0 = route().parts[0];
    // in lists only the heart changes, without reloading the page (the scroll position stays)
    if (p0 === 'favorites' || p0 === 'song') { render(); return; }
    librarySongs.filter((x) => x.id === Number(el.dataset.id)).forEach((x) => { x.favorite = on; });
    const s = librarySongs.find((x) => x.id === Number(el.dataset.id));
    if (s) el.outerHTML = favBtn(s);
    await run(refreshNav);
  },
  'song-cover': async (el) => { if (await uploadCover('songs', el.dataset.id)) render(); },
  'song-cover-remove': async (el) => { if (await run(() => api('DELETE', `/api/songs/${el.dataset.id}/cover`))) render(); },
  'album-cover': async (el) => { if (await uploadCover('albums', el.dataset.id)) render(); },
  'album-cover-remove': async (el) => { if (await run(() => api('DELETE', `/api/albums/${el.dataset.id}/cover`))) render(); },
  'band-cover': async (el) => { if (await uploadCover('bands', el.dataset.id)) render(); },
  'band-cover-remove': async (el) => { if (await run(() => api('DELETE', `/api/bands/${el.dataset.id}/cover`))) render(); },
  'cover-from-file': async (el) => {
    if (await run(() => api('POST', `/api/songs/${songCache.id}/cover-from-file`, { file_id: Number(el.dataset.id) }))) { toast(t('cover_updated')); render(); }
  },
  'play-song': (el) => {
    const s = librarySongs.find((x) => x.id === Number(el.dataset.id));
    if (s?.main_file) playQueue([trackFromSong(s)]);
  },
  'sala-play': () => sala.ws?.playPause(),
  'sala-seek': (el) => { if (sala.ws) sala.ws.setTime(Math.max(0, sala.ws.getCurrentTime() + Number(el.dataset.d))); },
  'sala-rate': (el) => setSalaRate(Number(el.dataset.rate)),
  'sala-zoom': (el) => setSalaZoom(sala.zoom + Number(el.dataset.d) * 60),
  'sala-a': () => markA(),
  'sala-b': () => markB(),
  'sala-loop': () => setLoopOn(!sala.loopOn),
  'sala-loop-clear': () => clearLoop(),
  'sala-loop-save': async () => {
    if (!sala.loop) return;
    const n = sala.markers.filter((x) => x.end_time != null).length + 1;
    const m = await run(() => api('POST', `/api/files/${sala.file.id}/markers`, { time: sala.loop.start, end_time: sala.loop.end, label: t('loop_n', { n }) }));
    if (!m) return;
    sala.markers = [...sala.markers, m].sort((a, b) => a.time - b.time);
    renderSalaMarkers(); drawMarkerRegions(); toast(t('loop_saved'));
  },
  'sala-marker': () => addSalaMarker(),
  'sala-goto': (el) => { const m = sala.markers.find((x) => x.id === Number(el.dataset.id)); if (m) jumpToMarker(m); },
  'sala-marker-del': async (el) => {
    if (!await run(() => api('DELETE', `/api/markers/${el.dataset.id}`))) return;
    sala.markers = sala.markers.filter((x) => x.id !== Number(el.dataset.id));
    renderSalaMarkers(); drawMarkerRegions();
  },
  'midi-play': () => midiState.player?.playPause(),
  'midi-stop': () => { midiState.player?.stop(); midiState.tick = 0; drawRoll(); },
  'midi-loop': (el) => {
    const on = el.getAttribute('aria-pressed') !== 'true';
    el.setAttribute('aria-pressed', String(on));
    if (midiState.player) midiState.player.isLooping = on;
  },
  'midi-zoom': (el) => {
    midiState.pxPerBeat = Math.max(8, Math.min(400, midiState.pxPerBeat * (Number(el.dataset.d) > 0 ? 1.4 : 1 / 1.4)));
    const scroll = $('#roll-scroll');
    drawRoll();
    if (scroll) scroll.scrollLeft = Math.max(0, midiState.tick * pxPerTick() - scroll.clientWidth * 0.3);
    drawRoll();
  },
  'midi-track': (el) => {
    const tr = midiState.tracks.find((x) => x.index === Number(el.dataset.index));
    if (!tr) return;
    tr[el.dataset.what] = !tr[el.dataset.what];
    renderMidiTracks(); applyMidiChannels(); drawRoll();
  },
  'tab-play': () => tabState.api?.playPause(),
  'tab-full': () => toggleTabFullscreen(),
  'tab-stop': () => tabState.api?.stop(),
  'tab-toggle': (el) => {
    const at = tabState.api;
    if (!at) return;
    const on = el.getAttribute('aria-pressed') !== 'true';
    el.setAttribute('aria-pressed', String(on));
    if (el.dataset.key === 'metronome') at.metronomeVolume = on ? 1 : 0;
    else if (el.dataset.key === 'countin') at.countInVolume = on ? 1 : 0;
    else if (el.dataset.key === 'loop') at.isLooping = on;
  },
  'sfx-play': (el) => sfxPlay(Number(el.dataset.index)),
  'sfx-more': () => sfxLoad(false),
  'sfx-fav': async (el) => {
    const x = sfxState.items[Number(el.dataset.index)];
    const r = await run(() => api('PATCH', `/api/sfx/${x.id}`, { favorite: !x.favorite }));
    if (r) { const i = Number(el.dataset.index); sfxState.items[i] = r; const row = $(`.sfx-row[data-sfx-index="${i}"]`); if (row) row.outerHTML = sfxRow(r, i); }
  },
  'sfx-tags': async (el) => {
    const i = Number(el.dataset.index), x = sfxState.items[i];
    const v = await promptModal({ title: t('sfx_tags_t', { n: x.name }), label: t('sfx_tags_label'), value: x.tags.join(', '), confirm: t('save'), placeholder: t('sfx_tags_ph') });
    if (v === null) return;
    const r = await run(() => api('PATCH', `/api/sfx/${x.id}`, { tags: v.split(',') }));
    if (r) { sfxState.items[i] = r; const row = $(`.sfx-row[data-sfx-index="${i}"]`); if (row) row.outerHTML = sfxRow(r, i); }
  },
  'sfx-hide': async (el) => {
    const i = Number(el.dataset.index), x = sfxState.items[i];
    if (!await run(() => api('PATCH', `/api/sfx/${x.id}`, { hidden: true }))) return;
    $(`.sfx-row[data-sfx-index="${i}"]`)?.classList.add('gone');
    toast(t('sfx_hidden_toast'));
    state.meta.sfx.hidden += 1;
  },
  'sfx-tag-filter': (el) => { sfxState.f.tag = el.dataset.tag; if (route().parts[0] === 'sfx') render(); else go('#/sfx'); },
  'sfx-fav-filter': () => { sfxState.f.favorite = !sfxState.f.favorite; render(); },
  'sfx-rescan': async () => { if (await run(() => api('POST', '/api/sfx/scan'))) { sfxScanTimer = 0; watchSfxScan(); } },
  'sfx-add-folder': () => (IS_DESKTOP ? desktopAddSfxFolder() : sfxFolderPicker()),
  'desktop-open': (el) => desktopOpen(Number(el.dataset.id)),
  'desktop-show-library': () => run(() => api('POST', '/api/desktop/show-library')),
  'desktop-library': async () => {
    const path = await pickFolder(t('library_other'));
    if (!path || !await confirmModal({ title: t('library_switch_t'), text: t('library_switch_p', { p: path }), confirm: t('use_folder') })) return;
    const d = await run(() => api('POST', '/api/desktop/library', { path }));
    if (d) { toast(t('library_switch_ok')); showNextLibrary(d); }
  },
  'desktop-add-import': async () => {
    const path = await pickFolder(t('import_add'));
    if (!path) return;
    if (await run(() => api('POST', '/api/desktop/import-roots', { path }))) { await refreshNav(); render(); }
  },
  'desktop-remove-import': async (el) => {
    if (await run(() => api('POST', '/api/desktop/import-roots/remove', { path: el.dataset.path }))) { await refreshNav(); render(); }
  },
  'edit-save': (el) => saveEdit(el.dataset.token),
  'edit-dismiss': async (el) => {
    if (await run(() => api('POST', `/api/desktop/edits/${el.dataset.token}/dismiss`))) { edits.list = edits.list.filter((x) => x.token !== el.dataset.token); drawEdits(); }
  },
  'sfx-remove-folder': async (el) => {
    if (!await confirmModal({ title: t('sfx_unlink_t', { n: el.dataset.name }), text: t('sfx_unlink_p'), confirm: t('sfx_unlink'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/sfx/folders/${el.dataset.id}`))) { await refreshNav(); render(); }
  },
  'sfx-unhide': async () => { if (await run(() => api('POST', '/api/sfx/unhide'))) { await refreshNav(); render(); } },
  'open-sfx-search': (el) => { Object.assign(sfxState.f, { q: el.dataset.q, category: '', sub: '', tag: '', dur: '', fmt: '', favorite: false }); go('#/sfx'); },
  'backup-create': async () => {
    const r = await run(() => api('POST', '/api/backup', { include_trash: $('#bk-trash')?.checked ?? true }));
    if (r) { $('#bk-job').textContent = jobText(r); backupTimer = setTimeout(watchBackup, 800); }
  },
  'backup-restore': async (el) => {
    if (!await confirmModal({ title: t('restore_t'), text: t('restore_p', { n: el.dataset.name }), confirm: t('backup_restore'), danger: true })) return;
    if (await run(() => api('POST', '/api/backup/restore', { name: el.dataset.name }))) showRestoring();
  },
  'backup-delete': async (el) => {
    if (!await confirmModal({ title: t('backup_delete_t', { n: el.dataset.name }), text: t('backup_delete_p'), confirm: t('delete'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/backup/files/${encodeURIComponent(el.dataset.name)}`))) bindBackup();
  },
  'view-mode': (el) => {
    viewMode = el.dataset.value;
    $$('[data-action="view-mode"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === viewMode)));
    try { localStorage.setItem(`mdop-view-${viewPage}`, viewMode); } catch { /* same */ }
    pageRerender?.();
  },
  'home-shuffle': async () => {
    const [s] = await run(() => api('GET', '/api/songs?sort=random&limit=1')) || [];
    if (!s) return;
    librarySongs = librarySongs.filter((x) => x.id !== s.id).concat(s);
    $('#dash-pick').innerHTML = dashPick(s);
  },
  'open-loose-search': (el) => { loose.f.q = el.dataset.q; go('#/files'); },
  'bg-choose': async () => {
    const file = await pickImage();
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    if (await run(() => api('POST', '/api/background', fd))) { toast(t('bg_saved')); render(); }
  },
  'bg-remove': async () => { if (await run(() => api('DELETE', '/api/background'))) { toast(t('bg_removed')); render(); } },
  'play-song-detail': () => { if (songCache?.main_file) playQueue([trackFromSong(songCache)]); },
  'play-file': (el) => {
    const { f } = findFile(Number(el.dataset.id));
    if (f) playQueue([{ title: songCache.title, file: f.name, url: f.url, cover: songCache.cover_url, songId: songCache.id, fileId: f.id }]);
  },
  'play-album': (el) => playQueue(albumCache.songs.filter((s) => s.main_file && canPlay(s.main_file.ext)).map(trackFromSong), Number(el.dataset.index || 0)),
  'song-tab': (el) => { songTab.tab = el.dataset.tab; render(); },
  'song-page': (el) => { songTab.page = el.dataset.page; render(); },
  'set-main': async (el) => {
    if (await run(() => api('POST', `/api/songs/${songCache.id}/main`, { file_id: Number(el.dataset.id) }))) { toast(t('main_set')); render(); }
  },
  'file-menu': (el) => fileMenu(Number(el.dataset.id)),
  'new-version': async (el) => {
    const n = songCache.versions.length + 1;
    const label = await promptModal({ title: t('new_version'), label: t('version_name'), value: `${LANG === 'en' ? 'Version' : 'Versão'} ${n}`, confirm: t('create_version') });
    if (label === null) return;
    if (await run(() => api('POST', `/api/songs/${el.dataset.id}/versions`, { label }))) { toast(t('version_created', { n })); render(); }
  },
  'rename-version': async (el) => {
    const label = await promptModal({ title: t('rename_version_t'), label: t('version_name'), value: el.dataset.label });
    if (label === null) return;
    if (await run(() => api('PATCH', `/api/versions/${el.dataset.id}`, { label }))) render();
  },
  'delete-version': async (el) => {
    if (!await confirmModal({ title: t('delete_version_t'), text: t('delete_version_p'), confirm: t('delete'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/versions/${el.dataset.id}`))) render();
  },
  'delete-song': async (el) => {
    if (!await confirmModal({ title: t('delete_song_t'), text: t('delete_song_p', { t: songCache.title }), confirm: t('delete_song'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/songs/${el.dataset.id}`))) { toast(t('song_trashed')); go('#/songs'); }
  },
  'new-text': async () => {
    const title = await promptModal({ title: t('new_text'), label: t('text_title'), confirm: t('create'), suggestions: STR.text_suggestions[LANG === 'en' ? 1 : 0] });
    if (title === null) return;
    if (await run(() => api('POST', `/api/songs/${songCache.id}/texts`, { title }))) {
      songTab.page = 'texts';
      await render();
      $$('.text-card textarea').pop()?.focus();
    }
  },
  'delete-text': async (el) => {
    if (!await confirmModal({ title: t('delete_text_t'), text: t('delete_text_p', { t: el.dataset.title }), confirm: t('delete'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/texts/${el.dataset.id}`))) render();
  },
  'song-albums': (el) => songAlbumsModal(Number(el.dataset.id)),
  'album-add': (el) => run(() => albumAddModal(Number(el.dataset.id))),
  'album-remove': async (el) => { if (await run(() => api('DELETE', `/api/albums/${albumCache.id}/songs/${el.dataset.id}`))) render(); },
  'album-move': async (el) => {
    const ids = albumCache.songs.map((s) => s.id);
    const i = ids.indexOf(Number(el.dataset.id)), j = i + Number(el.dataset.dir);
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    if (await run(() => api('PUT', `/api/albums/${albumCache.id}/order`, { song_ids: ids }))) render();
  },
  'delete-album': async (el) => {
    if (!await confirmModal({ title: t('delete_album_t'), text: t('delete_album_p', { t: albumCache.title }), confirm: t('delete_album'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/albums/${el.dataset.id}`))) go('#/albums');
  },
  'delete-band': async (el) => {
    if (!await confirmModal({ title: t('delete_band_t'), text: t('delete_band_p', { t: bandCache.title }), confirm: t('delete_band'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/bands/${el.dataset.id}`))) go('#/bands');
  },
  'loose-play': (el) => {
    const i = Number(el.dataset.index);
    if (i === loose.current && !audio.paused) audio.pause();
    else if (i === loose.current && audio.src) audio.play();
    else playLoose(i);
  },
  'loose-new': (el) => { const g = looseTargets(el); if (g.length) looseNewModal(g); },
  'loose-idea': (el) => { const g = looseTargets(el); if (g.length) looseIdeaModal(g); },
  'new-idea': async () => {
    const title = await promptModal({ title: t('new_idea_t'), label: t('idea_name'), confirm: t('create'), placeholder: t('idea_ph') });
    if (title === null) return;
    const s = await run(() => api('POST', '/api/ideas', { title, kind: ideasFilter.kind && ideasFilter.kind !== '__none' ? ideasFilter.kind : '' }));
    if (s) go(`#/idea/${s.id}`);
  },
  'idea-promote': () => ideaPromoteModal(),
  'idea-merge': () => ideaMergeModal(),
  'idea-delete': async () => {
    if (!await confirmModal({ title: t('delete_idea_t'), text: t('delete_idea_p'), confirm: t('delete_idea'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/songs/${songCache.id}`))) { toast(t('idea_trashed')); go('#/ideas'); }
  },
  'loose-join': (el) => { const g = looseTargets(el); if (g.length) looseJoinModal(g); },
  'loose-discard': (el) => { const g = looseTargets(el); if (g.length) looseDiscard(g); },
  'loose-sep': (el) => { const g = looseTargets(el); if (g.length) looseSeparate(g); },
  'loose-sep-filter': () => { loose.f.sep = !loose.f.sep; loose.current = -1; render(); },
  'loose-dedupe': () => looseDedupe(),
  'set-accent': (el) => saveSetting('accent', el.dataset.value),
  'add-credit': (el) => creditModal(el.dataset.key, el.dataset.id, el.dataset.title),
  'edit-credit': async (el) => {
    const role = await promptModal({ title: t('edit_role', { x: el.dataset.name }), label: t('credit_role'), value: el.dataset.role, suggestions: STR.roles[LANG === 'en' ? 1 : 0].slice(0, 8) });
    if (role === null) return;
    if (await run(() => api('PATCH', `/api/credits/${el.dataset.id}`, { role }))) render();
  },
  'remove-credit': async (el) => { if (await run(() => api('DELETE', `/api/credits/${el.dataset.id}`))) render(); },
  'new-artist': async () => {
    const name = await promptModal({ title: t('new_artist'), label: t('artist_name'), confirm: t('create'), placeholder: t('artist_ph') });
    if (name === null) return;
    const a = await run(() => api('POST', '/api/artists', { name }));
    if (a) go(`#/artist/${a.id}`);
  },
  'delete-artist': async (el) => {
    if (!await confirmModal({ title: t('delete_artist_t'), text: t('delete_artist_p', { t: artistCache.name }), confirm: t('delete_artist'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/artists/${el.dataset.id}`))) go('#/artists');
  },
  'artist-photo': async (el) => { if (await uploadCover('artists', el.dataset.id)) render(); },
  'artist-photo-remove': async (el) => { if (await run(() => api('DELETE', `/api/artists/${el.dataset.id}/photo`))) render(); },
  'trash-restore': async (el) => {
    const r = await run(() => api('POST', `/api/trash/${el.dataset.id}/restore`));
    if (!r) return;
    toast(r.to === 'loose' ? t('restored_loose') : t('restored_song'), r.song_id ? { link: { href: `#/song/${r.song_id}`, label: t('open') } } : {});
    render();
  },
  'trash-delete': async (el) => {
    if (!await confirmModal({ title: t('delete_forever_t'), text: t('delete_forever_p', { t: el.dataset.name }), confirm: t('delete_forever'), danger: true })) return;
    if (await run(() => api('DELETE', `/api/trash/${el.dataset.id}`))) render();
  },
  'trash-empty': async (el) => {
    if (!await confirmModal({ title: t('empty_confirm_t'), text: t('empty_confirm_p', { size: el.dataset.size }), confirm: t('empty_trash'), danger: true })) return;
    if (await run(() => api('POST', '/api/trash/empty'))) { toast(t('trash_emptied')); render(); }
  },
  'sec-change': async () => {
    const v = await passwordModal({ title: t('change_password'), confirm: t('save'), fields: [
      { name: 'current', label: t('current_password') }, { name: 'new', label: t('new_password'), ac: 'new-password' }, { name: 'new2', label: t('confirm_password'), ac: 'new-password' }] });
    if (!v) return;
    if (v.new !== v.new2) { toast(t('pw_mismatch'), { error: true }); return; }
    if (await run(() => api('POST', '/api/auth/password', { current: v.current, new: v.new }))) toast(t('password_changed'));
  },
  'sec-logout': async () => { await run(() => api('POST', '/api/auth/logout')); location.reload(); },
  'sec-remove': async () => {
    const v = await passwordModal({ title: t('remove_protection'), confirm: t('remove_protection'), danger: true, fields: [{ name: 'password', label: t('password') }] });
    if (!v) return;
    if (await run(() => api('POST', '/api/auth/disable', { password: v.password }))) { toast(t('protection_off')); render(); }
  },
  'player-toggle': () => { if (audio.paused) audio.play(); else audio.pause(); },
  'player-prev': () => {
    const tr = player.queue[player.index];
    if (tr?.looseIndex !== undefined && loose.active) { playLoose(Math.max(0, loose.current - 1)); return; }
    if (audio.currentTime > 3 || player.index === 0) audio.currentTime = 0;
    else { player.index--; loadTrack(); }
  },
  'player-next': () => {
    const tr = player.queue[player.index];
    if (tr?.looseIndex !== undefined && loose.active) { playLoose(Math.min(loose.visible.length - 1, loose.current + 1)); return; }
    if (player.index < player.queue.length - 1) { player.index++; loadTrack(); }
  },
  'player-sala': () => {
    const tr = player.queue[player.index];
    if (!tr?.songId) return;
    const at = audio.currentTime || 0;
    actions['player-close']();  // the Listening room has its own player: the bottom bar goes away
    go(`#/listen/${tr.songId}?f=${tr.fileId}${at > 1 ? `&t=${at.toFixed(1)}` : ''}`);
  },
  'player-close': () => { audio.pause(); $('#player').hidden = true; document.body.classList.remove('has-player'); glass.playing = null; refreshGlass(); },
};

// ================================================================ desktop app only
// Folder dialogs come from the window (window.pywebview.api); in a plain browser the path is typed.
async function pickFolder(title) {
  if (window.pywebview?.api?.pick_folder) return (await window.pywebview.api.pick_folder('')) || '';
  return (await promptModal({ title, label: t('folder_path'), confirm: t('choose_folder') })) || '';
}
async function desktopAddSfxFolder() {
  const path = await pickFolder(t('sfx_add_root'));
  if (!path) return;
  if (!await run(() => api('POST', '/api/desktop/sfx-roots', { path }))) return;
  toast(t('sfx_linked'));
  await refreshNav();
  render();
  sfxScanTimer = 0;
  watchSfxScan();
}
async function desktopOpen(fileId) {
  const r = await run(() => api('POST', `/api/desktop/open/${fileId}`));
  if (r) { toast(t('opened_x', { x: r.name })); startEditWatch(); }
}
// files opened in another program: when one is saved there, offer to keep it as a new version
const edits = { timer: null, list: [], busy: new Set() };
function startEditWatch() {
  if (edits.timer) return;
  const tick = async () => {
    try { edits.list = await api('GET', '/api/desktop/edits'); } catch { return; }
    drawEdits();
  };
  edits.timer = setInterval(tick, 2500);
  tick();
}
function drawEdits() {
  let box = $('#desktop-edits');
  if (!box) {
    box = document.createElement('div');
    box.id = 'desktop-edits'; box.className = 'edit-notes'; box.setAttribute('aria-live', 'polite');
    document.body.append(box);
  }
  box.innerHTML = edits.list.filter((x) => !edits.busy.has(x.token)).map((x) => `
    <div class="edit-note" role="alert">${ICON.layers}
      <div class="edit-text"><strong>${esc(t('edit_found', { x: x.name }))}</strong><span>${esc(t('edit_in', { t: x.song_title }))}</span></div>
      <div class="actions"><button class="btn small primary" data-action="edit-save" data-token="${esc(x.token)}">${esc(t('edit_save'))}</button>
        <button class="btn small" data-action="edit-dismiss" data-token="${esc(x.token)}">${esc(t('edit_ignore'))}</button></div>
    </div>`).join('');
}
async function saveEdit(token) {
  const x = edits.list.find((e) => e.token === token);
  if (!x) return;
  const label = await promptModal({ title: t('edit_save'), label: t('version_name'), value: t('edit_label', { x: x.name }), confirm: t('edit_save') });
  if (label === null) return;
  edits.busy.add(token); drawEdits();
  const r = await run(() => api('POST', `/api/desktop/edits/${token}/save`, { label }));
  edits.busy.delete(token);
  if (!r) { drawEdits(); return; }
  edits.list = edits.list.filter((e) => e.token !== token); drawEdits();
  const href = `#/${x.is_idea ? 'idea' : 'song'}/${r.song_id}`;
  toast(t('edit_saved', { n: r.number }), { link: { href, label: t('open_song') } });
  if (songCache?.id === r.song_id) render();
}
// double-click a file row (outside its buttons) to open it in its program
document.addEventListener('dblclick', (e) => {
  if (!IS_DESKTOP || e.target.closest('a, button, input, select, textarea')) return;
  const row = e.target.closest('.file-row[data-file]');
  if (row) { window.getSelection()?.removeAllRanges(); desktopOpen(Number(row.dataset.file)); }
});

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (el) {
    if (el.disabled) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    if (el.tagName !== 'A') e.preventDefault();
    fn(el, e);
    return;
  }
  // the whole card is clickable (without getting in the way of links, buttons and fields inside it)
  if (e.target.closest('a, button, input, label, select, textarea')) return;
  const card = e.target.closest('.card[data-href]');
  if (card) go(card.dataset.href);
});

window.addEventListener('hashchange', () => { closeModal(); render(); window.scrollTo(0, 0); });
render();
