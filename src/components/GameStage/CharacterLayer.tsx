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
  /** When true, all slots clear their persistent images (new scene) */
  sceneChanged?: boolean;
}

export const CharacterLayer: React.FC<CharacterLayerProps> = ({
  speakerPosition,
  speakerImage,
  leftImage,
  centerImage,
  rightImage,
  sceneChanged,
}) => {
  // Speaker image takes priority in its designated slot
  const resolvedLeft = speakerPosition === 'left' && speakerImage ? speakerImage : leftImage;
  const resolvedCenter = speakerPosition === 'center' && speakerImage ? speakerImage : centerImage;
  const resolvedRight = speakerPosition === 'right' && speakerImage ? speakerImage : rightImage;

  return (
    <div className="character-layer">
      <CharacterSlot position="left" image={resolvedLeft} sceneChanged={sceneChanged} />
      <CharacterSlot position="center" image={resolvedCenter} sceneChanged={sceneChanged} />
      <CharacterSlot position="right" image={resolvedRight} sceneChanged={sceneChanged} />
    </div>
  );
};
