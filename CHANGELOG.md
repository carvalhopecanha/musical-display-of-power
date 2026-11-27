# Changelog

All notable changes to this project are documented here. Versions follow [Semantic Versioning](https://semver.org).

*Português: as mudanças de cada versão, em inglês.*

## [1.1.1] - 2026-11-26

Security and safety fixes for the server (local network) and the desktop app. Nothing changes in how MDoP is used.

### Fixed
- **The database could be read through `/media/`** with a path containing `..` (for example `songs/../.mdop/mdop.db`), which exposed the password hash and the session secret. Hidden library folders (`.mdop`, `.trash`) are now checked after the path is resolved.
- **Other sites can no longer change the library through your browser** (cross-site request forgery). Without a password, any page opened on a computer of the network could, for example, empty the trash with a hidden form. Requests that change something are refused when the browser says they came from another site, including other services on the same server.
- **Restoring a backup never leaves a half library.** The backup is first extracted to a separate folder on the same drive (checking every file), and only then swapped in with renames. A damaged backup, a full drive or a failure while swapping leaves the current library exactly as it was. The restore is refused up front when the drive does not have room, while sound effects are being read, or if the library stays busy.

## [1.1.0] - 2026-11-17

Desktop app. The same code now also runs as a program on your computer, without Docker. The server version works exactly as before.

### Added
- **Desktop app for Windows, macOS and Linux:** MDoP opens in its own window (WebView2 on Windows, WebKit on macOS, Qt WebEngine on Linux), with its server running only on this computer (`127.0.0.1`, on a free port).
- **Installers built by GitHub Actions:** `MDoP-Setup-<version>.exe` for Windows (per-user install with a Start menu shortcut), `MDoP-<version>.dmg` for macOS on Apple Silicon and `MDoP-<version>.AppImage` for Linux, attached to each GitHub Release. The `desktop` workflow can also run by hand to make test installers without publishing anything.
- **First start asks where to keep the library** (default: an `MDoP` folder in your Music folder). An existing library, copied from the server, works as is.
- **Folders picked in Settings** with the system's folder dialog: import folders (*Settings → Library*) and sound-effect folders (*Settings → Sound effects*), plus *Use another folder…* for the library. Paths with accents and spaces work, also on Windows.
- **Open with the default program** (desktop only): a button on each file, or a double-click, opens a copy of the file in the program your system uses for it.
- **Save as new version** (desktop only): when that copy is saved in the other program, MDoP offers to keep it as a new version of the song. The original is never written over. Edits still pending when MDoP closes go to the File list.
- `MDoP disable-password` and `MDoP self-test` commands for the desktop program.

### Changed
- M4A and AAC files only show a play button where the AAC codec is really available; elsewhere they are offered for download (and, on the desktop, to open in another program) instead of failing to play.
- Texts that mention "the server" have desktop wording in the desktop app.

### Notes
- The installers are not signed with a paid certificate: Windows SmartScreen and macOS Gatekeeper show a warning the first time. The README explains how to continue.
- In the Linux AppImage, the built-in player cannot play M4A/AAC (the bundled Qt WebEngine has no AAC codec).

## [1.0.0] - 2026-11-16

First public release.

### Added
- **File list (inbox):** import whole folders as loose files, listen one by one with the keyboard, then create a song, add to a song or discard. Search, filters by type and source folder, "set aside" marks, and removal of byte-identical duplicates.
- **Ideas:** a separate tab for riffs, melodies, harmonies, scales and exercises, with types (built-in and custom), key, tuning, tempo and notes. Send items from the File list (one or many at once), then turn an idea into a song or add it to an existing song as a new version; files, notes and markers always come along.
- **Songs as folders** with versions that are never overwritten, a main file, files sorted by type, a Texts tab, notes, cover images and ZIP download.
- **Albums** with track order, cover mosaic, details (release, recording place, label, status), credits and ZIP download.
- **Bands and artists** with photos, members and credits with roles; every artist has a page with everything they took part in.
- **Listening room:** zoomable waveform with minimap, A–B loop, speed from 25% to 150% without changing pitch, saved markers and loops per file, keyboard shortcuts.
- **Tab viewer** for Guitar Pro 3–8 and MusicXML with playback, speed, metronome, count-in, loop, solo/mute, zoom, layout, volume and full screen.
- **MIDI player** with piano roll, per-track solo/mute, speed, loop, zoom, volume and full screen.
- **Home page** with global search, collection by status, files by type and a random song to rediscover.
- **Three view modes** (cards, thumbnails, list) with search and filters on every list; songs can be grouped by style, status or band.
- **Status** for songs (in progress, ready, recorded) and albums (idea, in progress, ready, recorded).
- **Trash** with restore (songs come back with versions, texts, albums, credits and markers), and optional automatic cleanup after 30 or 90 days.
- **Optional password** with a 5-minute pause after 5 wrong attempts; English and Portuguese interface that follows the browser by default; dark, light and Glass themes; five accent colors.
- **Installer** (`install.sh`, in English or Portuguese) that sets up folders, permissions and Docker, and can move the library to another disk.
- **Ready-made Docker image** for amd64 and arm64 on GitHub Packages.
- All third-party libraries bundled; works without internet access.
- **Sound effects (SFX)** with linked folders: MDoP only reads them (mounted read-only in Docker), with categories from subfolders, background incremental scanning with progress, search, filters by category, duration, format and tag, favorites, tags, hiding, keyboard audition (↑ ↓, Space) and paged loading for large libraries. Disconnected drives show their effects as unavailable.
- **Backup and restore**: save a `.zip` (database and every folder) to a backup folder or download it, upload a backup, and restore with an automatic safety copy of the current library.
- **Configurable menu:** turn Ideas, Sound effects, Albums, Bands, Artists and Favorites on or off; hidden parts also disappear from buttons, home rows, search and cards. Nothing is deleted.
- **Default cover** (two eighth notes) for songs without an image, and **album and band circles** on song cards that show the name on hover and open the album or band.
- **Settings in tabs** (General, Menu, Sound effects, Backup, Library, Security, About), each with its own address.
- Server messages in English and Portuguese, following the interface language.
- Folder names, stored values and code are in English; libraries and backups from early builds, with Portuguese folder names, are renamed automatically on first start, with a database copy, a full backup when there is room, a check of every file and automatic undo if anything does not match.
