// =============================================================================
// BackgroundLayer — Full-bleed background image with persistence and fade
// =============================================================================

import React, { useState, useEffect } from 'react';

interface BackgroundLayerProps {
  bgImage?: string;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ bgImage }) => {
  const [currentBg, setCurrentBg] = useState<string | undefined>(bgImage);

  useEffect(() => {
    // Only update if a new bg is provided (blank = keep current)
    if (bgImage && bgImage !== 'clear' && bgImage !== 'none') {
      setCurrentBg(bgImage);
    } else if (bgImage === 'clear' || bgImage === 'none') {
      setCurrentBg(undefined);
    }
    // If bgImage is undefined/blank, keep the current background
  }, [bgImage]);

  if (!currentBg) return null;

  return (
    <div
      className="background-layer"
      style={{
        backgroundImage: `url(${currentBg})`,
      }}
    />
  );
};
