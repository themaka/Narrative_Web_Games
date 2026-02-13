// =============================================================================
// SettingsPanel — Overlay panel for game settings
// =============================================================================

import React, { useRef } from 'react';

interface SettingsPanelProps {
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  onMusicVolumeChange: (vol: number) => void;
  onSfxVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onExportSave: () => void;
  onImportSave: (file: File) => void;
  onLoadOtherGame: (url: string) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  musicVolume,
  sfxVolume,
  isMuted,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onToggleMute,
  onExportSave,
  onImportSave,
  onLoadOtherGame,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportSave(file);
  };

  const handleLoadGame = () => {
    const url = urlInputRef.current?.value;
    if (url) onLoadOtherGame(url);
  };

  return (
    <div className="settings-panel-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        {/* Audio */}
        <div className="settings-panel__section">
          <label>
            Music Volume
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVolume}
              onChange={(e) => onMusicVolumeChange(Number(e.target.value))}
            />
          </label>
          <label>
            SFX Volume
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={(e) => onSfxVolumeChange(Number(e.target.value))}
            />
          </label>
          <label className="settings-panel__mute">
            <input
              type="checkbox"
              checked={isMuted}
              onChange={onToggleMute}
            />
            Mute All
          </label>
        </div>

        {/* Save/Load */}
        <div className="settings-panel__section">
          <h3>Save Data</h3>
          <button onClick={onExportSave}>Export Save</button>
          <button onClick={handleImport}>Import Save</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Load Other Game */}
        <div className="settings-panel__section">
          <h3>Load Other Game</h3>
          <input
            ref={urlInputRef}
            type="text"
            placeholder="Published Google Sheet URL"
            className="settings-panel__url-input"
          />
          <button onClick={handleLoadGame}>Load</button>
        </div>

        <button className="settings-panel__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
