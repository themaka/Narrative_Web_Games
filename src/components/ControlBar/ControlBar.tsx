// =============================================================================
// ControlBar — Persistent overlay with settings, credits, about buttons
// =============================================================================

import React from 'react';

interface ControlBarProps {
  onSettings: () => void;
  onCredits: () => void;
  onAbout: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onSettings,
  onCredits,
  onAbout,
}) => {
  return (
    <div className="control-bar">
      <button className="control-bar__btn" onClick={onSettings} title="Settings">
        &#9881; {/* Gear icon */}
      </button>
      <button className="control-bar__btn" onClick={onCredits} title="Credits">
        Credits
      </button>
      <button className="control-bar__btn" onClick={onAbout} title="About">
        About
      </button>
    </div>
  );
};
