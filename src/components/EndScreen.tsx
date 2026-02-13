// =============================================================================
// EndScreen — "The End" screen with restart option + credits link
// =============================================================================

import React from 'react';

interface EndScreenProps {
  onRestart: () => void;
  onCredits: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ onRestart, onCredits }) => {
  return (
    <div className="end-screen">
      <h1 className="end-screen__title">The End</h1>
      <div className="end-screen__actions">
        <button className="end-screen__btn" onClick={onRestart}>
          Restart
        </button>
        <button className="end-screen__btn end-screen__btn--credits" onClick={onCredits}>
          Credits
        </button>
      </div>
    </div>
  );
};
