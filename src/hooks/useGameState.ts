// =============================================================================
// useGameState — Manages current node, flags, and navigation history
// =============================================================================

import { useReducer, useCallback } from 'react';
import type { GameState, StoryNode } from '../types';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------
type GameAction =
  | { type: 'NAVIGATE'; nodeId: string; node: StoryNode }
  | { type: 'RESET'; startNodeId: string }
  | { type: 'RESTORE'; state: GameState };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NAVIGATE': {
      const newFlags = new Set(state.flags);
      // Set any flags defined on the target node
      if (action.node.setFlag) {
        action.node.setFlag.forEach((flag) => newFlags.add(flag));
      }
      return {
        currentNodeId: action.nodeId,
        flags: newFlags,
        history: [...state.history, state.currentNodeId],
      };
    }
    case 'RESET':
      return {
        currentNodeId: action.startNodeId,
        flags: new Set<string>(),
        history: [],
      };
    case 'RESTORE':
      return action.state;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
function createInitialState(startNodeId: string): GameState {
  return {
    currentNodeId: startNodeId,
    flags: new Set<string>(),
    history: [],
  };
}

export function useGameState(startNodeId: string) {
  const [state, dispatch] = useReducer(
    gameReducer,
    startNodeId,
    createInitialState
  );

  const navigate = useCallback(
    (nodeId: string, node: StoryNode) => {
      dispatch({ type: 'NAVIGATE', nodeId, node });
    },
    []
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', startNodeId });
  }, [startNodeId]);

  const restore = useCallback((savedState: GameState) => {
    dispatch({ type: 'RESTORE', state: savedState });
  }, []);

  return { state, navigate, reset, restore };
}
