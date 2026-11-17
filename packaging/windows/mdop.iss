; Windows installer (Inno Setup 6): MDoP-Setup-<version>.exe
;   iscc /DAppVersion=1.1.0 /DSourceDir=C:\path\to\dist\MDoP /OC:\path\to\output packaging\windows\mdop.iss
; Installs for the current user only (no administrator needed). Uninstalling removes the
; program, never the library: songs, ideas and backups stay where they are.

#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif
#ifndef SourceDir
  #define SourceDir "..\..\dist\MDoP"
#endif

[Setup]
AppId={{F1324A02-6330-4A43-BF64-D7397DA7C1E8}
AppName=MDoP
AppVersion={#AppVersion}
AppVerName=MDoP {#AppVersion}
AppPublisher=MDoP
AppPublisherURL=https://github.com/carvalhopecanha/musical-display-of-power
AppSupportURL=https://github.com/carvalhopecanha/musical-display-of-power/issues
DefaultDirName={autopf}\MDoP
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputBaseFilename=MDoP-Setup-{#AppVersion}
SetupIconFile=..\icons\mdop.ico
UninstallDisplayIcon={app}\MDoP.exe
UninstallDisplayName=MDoP
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes

[Languages]
Name: "en"; MessagesFile: "compiler:Default.isl"
Name: "ptbr"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[InstallDelete]
; files of the previous version (the library is somewhere else and is never touched)
Type: filesandordirs; Name: "{app}\_internal"

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\MDoP"; Filename: "{app}\MDoP.exe"; Comment: "Musical Display of Power"
Name: "{autodesktop}\MDoP"; Filename: "{app}\MDoP.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\MDoP.exe"; Description: "{cm:LaunchProgram,MDoP}"; Flags: nowait postinstall skipifsilent
