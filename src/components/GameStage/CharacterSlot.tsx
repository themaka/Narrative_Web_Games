// =============================================================================
// CharacterSlot — Individual character portrait with persistence
// =============================================================================

import React, { useState, useEffect } from 'react';

interface CharacterSlotProps {
  position: 'left' | 'center' | 'right';
  image?: string;
}

export const CharacterSlot: React.FC<CharacterSlotProps> = ({ position, image }) => {
  const [currentImage, setCurrentImage] = useState<string | undefined>(image);

  useEffect(() => {
    if (image && image !== 'clear' && image !== 'none') {
      setCurrentImage(image);
    } else if (image === 'clear' || image === 'none') {
      setCurrentImage(undefined);
    }
    // If image is undefined, keep the current image (persistence)
  }, [image]);

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
