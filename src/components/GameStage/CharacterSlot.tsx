// =============================================================================
// CharacterSlot — Individual character portrait with persistence
// =============================================================================

import React, { useState, useEffect } from 'react';

interface CharacterSlotProps {
  position: 'left' | 'center' | 'right';
  image?: string;
  /** When true, force-clear the slot (e.g. scene change) */
  sceneChanged?: boolean;
}

export const CharacterSlot: React.FC<CharacterSlotProps> = ({ position, image, sceneChanged }) => {
  const [currentImage, setCurrentImage] = useState<string | undefined>(image);

  useEffect(() => {
    if (image && image !== 'clear' && image !== 'none') {
      setCurrentImage(image);
    } else if (image === 'clear' || image === 'none') {
      setCurrentImage(undefined);
    } else if (sceneChanged) {
      // New background = new scene → clear all persistent images
      setCurrentImage(undefined);
    }
    // If image is undefined and scene hasn't changed, keep current (persistence)
  }, [image, sceneChanged]);

  return (
    <div className={`character-slot character-slot--${position}`}>
      {currentImage && (
        <img
          src={currentImage}
          alt={`Character ${position}`}
          className="character-slot__image"
        />
      )}
    </div>
  );
};
