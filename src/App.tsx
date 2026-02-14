// =============================================================================
// App — Top-level component: loads config, manages screens
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import type { AppScreen, GameConfig, Choice, StoryNode } from './types';
import { useSheetData } from './hooks/useSheetData';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { useAssetUrl } from './hooks/useAssetUrl';
import { useSaveData } from './hooks/useSaveData';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { TitleScreen } from './components/TitleScreen';
import { EndScreen } from './components/EndScreen';
import { GameStage } from './components/GameStage/GameStage';
import { ControlBar } from './components/ControlBar/ControlBar';
import { SettingsPanel } from './components/SettingsPanel';
import { CreditsPage } from './components/CreditsPage';
import { AboutPage } from './components/AboutPage';

export const App: React.FC = () => {
  // -------------------------------------------------------------------------
  // Config & Sheet URL
  // -------------------------------------------------------------------------
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        console.log('[NWG] Loading game.config.json...');
        // Check for query param override first
        const params = new URLSearchParams(window.location.search);
        const sheetOverride = params.get('sheet');
        if (sheetOverride) {
          console.log('[NWG] Sheet URL override from query param:', sheetOverride);
        }

        const res = await fetch('/game.config.json');
        if (!res.ok) throw new Error('Could not load game.config.json');

        const cfg: GameConfig = await res.json();
        console.log('[NWG] Config loaded:', cfg);
        setConfig(cfg);

        const finalUrl = sheetOverride || cfg.sheetUrl;
        console.log('[NWG] Using sheet URL:', finalUrl);
        setSheetUrl(finalUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load configuration';
        console.error('[NWG] Config load failed:', message);
        setConfigError(message);
      }
    }
    loadConfig();
  }, []);

  // -------------------------------------------------------------------------
  // Sheet Data
  // -------------------------------------------------------------------------
  const { nodes, metadata, loading, error: sheetError, status } = useSheetData(sheetUrl);

  // -------------------------------------------------------------------------
  // Game State
  // -------------------------------------------------------------------------
  const startNodeId = metadata?.startNode || '';
  const { state: gameState, navigate, reset, restore } = useGameState(startNodeId);

  // -------------------------------------------------------------------------
  // Audio
  // -------------------------------------------------------------------------
  const audio = useAudio();

  // -------------------------------------------------------------------------
  // Asset URL Resolution
  // -------------------------------------------------------------------------
  const resolveUrl = useAssetUrl(config?.assetBaseUrl);

  // -------------------------------------------------------------------------
  // Save Data
  // -------------------------------------------------------------------------
  const saveData = useSaveData(sheetUrl || '');

  // -------------------------------------------------------------------------
  // Current Screen
  // -------------------------------------------------------------------------
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [overlay, setOverlay] = useState<'settings' | 'credits' | 'about' | null>(null);

  // Transition to title screen when data is ready
  useEffect(() => {
    if (!loading && !sheetError && !configError && metadata) {
      setScreen('title');
    } else if (sheetError || configError) {
      setScreen('error');
    }
  }, [loading, sheetError, configError, metadata]);

  // -------------------------------------------------------------------------
  // Current Node
  // -------------------------------------------------------------------------
  const currentNode: StoryNode | undefined = nodes?.get(gameState.currentNodeId);

  // Handle audio when node changes
  useEffect(() => {
    if (!currentNode) return;

    if (currentNode.music) {
      audio.playMusic(resolveUrl(currentNode.music) || currentNode.music);
    }
    if (currentNode.soundEffect) {
      audio.playSoundEffect(resolveUrl(currentNode.soundEffect) || currentNode.soundEffect);
    }
  }, [currentNode, audio, resolveUrl]);

  // Autosave on fade/checkpoint nodes
  useEffect(() => {
    if (!currentNode) return;
    if (currentNode.transition === 'fade' || currentNode.transition === 'checkpoint') {
      saveData.save(gameState);
    }
  }, [currentNode, gameState, saveData]);

  // Check for ending node
  useEffect(() => {
    if (currentNode && currentNode.choices.length === 0) {
      setScreen('end');
    }
  }, [currentNode]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleStart = useCallback(() => {
    reset();
    setScreen('game');
  }, [reset]);

  const handleContinue = useCallback(() => {
    const saved = saveData.load();
    if (saved) {
      restore(saved);
      setScreen('game');
    }
  }, [saveData, restore]);

  const handleChoiceSelected = useCallback(
    (choice: Choice) => {
      const targetNode = nodes?.get(choice.target);
      if (targetNode) {
        navigate(choice.target, targetNode);
      }
    },
    [nodes, navigate]
  );

  const handleRestart = useCallback(() => {
    reset();
    setScreen('title');
  }, [reset]);

  const handleLoadOtherGame = useCallback((url: string) => {
    setSheetUrl(url);
    setOverlay(null);
    setScreen('loading');
  }, []);

  const handleImportSave = useCallback(
    async (file: File) => {
      try {
        const saved = await saveData.importSave(file);
        restore(saved);
        setOverlay(null);
        setScreen('game');
      } catch (err) {
        console.error('Import failed:', err);
      }
    },
    [saveData, restore]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const errorMessage = configError || sheetError || 'Unknown error';

  return (
    <div className="app">
      {screen === 'loading' && <LoadingScreen status={status} />}

      {screen === 'error' && <ErrorScreen message={errorMessage} />}

      {screen === 'title' && metadata && (
        <TitleScreen
          metadata={metadata}
          hasSave={saveData.hasSave()}
          onStart={handleStart}
          onContinue={handleContinue}
        />
      )}

      {screen === 'game' && currentNode && (
        <>
          <GameStage
            node={currentNode}
            onChoiceSelected={handleChoiceSelected}
            resolveUrl={resolveUrl}
          />
          <ControlBar
            onSettings={() => setOverlay('settings')}
            onCredits={() => setOverlay('credits')}
            onAbout={() => setOverlay('about')}
          />
        </>
      )}

      {screen === 'end' && (
        <EndScreen
          onRestart={handleRestart}
          onCredits={() => setOverlay('credits')}
        />
      )}

      {/* Overlays */}
      {overlay === 'settings' && (
        <SettingsPanel
          musicVolume={audio.musicVolume}
          sfxVolume={audio.sfxVolume}
          isMuted={audio.isMuted}
          onMusicVolumeChange={audio.setMusicVolume}
          onSfxVolumeChange={audio.setSfxVolume}
          onToggleMute={audio.toggleMute}
          onExportSave={saveData.exportSave}
          onImportSave={handleImportSave}
          onLoadOtherGame={handleLoadOtherGame}
          onClose={() => setOverlay(null)}
        />
      )}

      {overlay === 'credits' && (
        <CreditsPage
          content={metadata?.credits}
          onClose={() => setOverlay(null)}
        />
      )}

      {overlay === 'about' && (
        <AboutPage
          content={metadata?.about}
          onClose={() => setOverlay(null)}
        />
      )}
    </div>
  );
};
