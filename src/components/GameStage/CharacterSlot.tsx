// =============================================================================
// CharacterSlot — Individual character portrait with persistence
//
// Persistence rules:
//   - New image URL → show it (and remember it)
//   - "clear" or "none" → remove the image
//   - Blank/undefined → keep whatever is currently shown (persistence)
//   - Scene change (sceneChangeId increments) → clear the slot
// =============================================================================

import React, { useState, useRef } from 'react';

interface CharacterSlotProps {
  position: 'left' | 'center' | 'right';
  image?: string;
  /** Monotonic counter — when it changes from last-seen value, clear the slot */
  sceneChangeId: number;
}

export const CharacterSlot: React.FC<CharacterSlotProps> = ({ position, image, sceneChangeId }) => {
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const lastSceneChangeIdRef = useRef(sceneChangeId);

  // Determine the displayed image synchronously during render
  // (no useEffect needed — avoids timing issues with StrictMode).
  let nextImage = currentImage;

  // Scene change? Clear the slot.
  if (sceneChangeId !== lastSceneChangeIdRef.current) {
    nextImage = undefined;
    lastSceneChangeIdRef.current = sceneChangeId;
  }

  // Then apply the image prop on top
  if (image && image !== 'clear' && image !== 'none') {
    nextImage = image;
  } else if (image === 'clear' || image === 'none') {
    nextImage = undefined;
  }
  // else: image is undefined → keep nextImage (persistence)

  // Sync to state if changed (triggers re-render with correct value)
  if (nextImage !== currentImage) {
    setCurrentImage(nextImage);
  }

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
