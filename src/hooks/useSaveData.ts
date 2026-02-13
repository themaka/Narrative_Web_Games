// =============================================================================
// useSaveData — Autosave, load, export, and import save data
// =============================================================================

import { useCallback } from 'react';
import type { GameState, SaveData } from '../types';

const SAVE_KEY_PREFIX = 'narrative-web-games-save:';

/**
 * Manages save data: autosave to localStorage, load, export as JSON, import from JSON.
 * Saves are keyed by sheet URL so multiple games don't collide.
 */
export function useSaveData(sheetUrl: string) {
  const storageKey = `${SAVE_KEY_PREFIX}${sheetUrl}`;

  /** Save current game state to localStorage */
  const save = useCallback(
    (state: GameState) => {
      const saveData: SaveData = {
        sheetUrl,
        currentNodeId: state.currentNodeId,
        flags: Array.from(state.flags),
        history: state.history,
        savedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(saveData));
      } catch (err) {
        console.error('Failed to save game data:', err);
      }
    },
    [sheetUrl, storageKey]
  );

  /** Load save data from localStorage. Returns null if no save exists. */
  const load = useCallback((): GameState | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;

      const saveData: SaveData = JSON.parse(raw);
      return {
        currentNodeId: saveData.currentNodeId,
        flags: new Set(saveData.flags),
        history: saveData.history,
      };
    } catch (err) {
      console.error('Failed to load save data:', err);
      return null;
    }
  }, [storageKey]);

  /** Check if a save exists in localStorage */
  const hasSave = useCallback((): boolean => {
    return localStorage.getItem(storageKey) !== null;
  }, [storageKey]);

  /** Export save data as a downloadable JSON file */
  const exportSave = useCallback(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrative-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [storageKey]);

  /** Import save data from a JSON file */
  const importSave = useCallback(
    (file: File): Promise<GameState> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const saveData: SaveData = JSON.parse(reader.result as string);

            // Validate it's for this game
            if (saveData.sheetUrl !== sheetUrl) {
              reject(new Error('Save file is for a different game'));
              return;
            }

            // Store in localStorage
            localStorage.setItem(storageKey, reader.result as string);

            // Return as GameState
            resolve({
              currentNodeId: saveData.currentNodeId,
              flags: new Set(saveData.flags),
              history: saveData.history,
            });
          } catch (err) {
            reject(new Error('Invalid save file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    },
    [sheetUrl, storageKey]
  );

  /** Delete save data from localStorage */
  const deleteSave = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { save, load, hasSave, exportSave, importSave, deleteSave };
}
