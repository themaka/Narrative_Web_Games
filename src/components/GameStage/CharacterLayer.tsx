// =============================================================================
// CharacterLayer — Contains the 3 character slots (left, center, right)
// =============================================================================

import React from 'react';
import { CharacterSlot } from './CharacterSlot';

interface CharacterLayerProps {
  speakerPosition?: 'left' | 'center' | 'right';
  speakerImage?: string;
  leftImage?: string;
  centerImage?: string;
  rightImage?: string;
  /** Monotonic counter — increments on scene change to signal slots to clear */
  sceneChangeId: number;
}

export const CharacterLayer: React.FC<CharacterLayerProps> = ({
  speakerPosition,
  speakerImage,
  leftImage,
  centerImage,
  rightImage,
  sceneChangeId,
}) => {
  // Speaker image takes priority in its designated slot
  const resolvedLeft = speakerPosition === 'left' && speakerImage ? speakerImage : leftImage;
  const resolvedCenter = speakerPosition === 'center' && speakerImage ? speakerImage : centerImage;
  const resolvedRight = speakerPosition === 'right' && speakerImage ? speakerImage : rightImage;

  return (
    <div className="character-layer">
      <CharacterSlot position="left" image={resolvedLeft} sceneChangeId={sceneChangeId} />
      <CharacterSlot position="center" image={resolvedCenter} sceneChangeId={sceneChangeId} />
      <CharacterSlot position="right" image={resolvedRight} sceneChangeId={sceneChangeId} />
    </div>
  );
};
