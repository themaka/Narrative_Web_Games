// =============================================================================
// SpeakerName — Character name label above dialogue text
// =============================================================================

import React from 'react';

interface SpeakerNameProps {
  name: string;
}

export const SpeakerName: React.FC<SpeakerNameProps> = ({ name }) => {
  return <div className="speaker-name">{name}</div>;
};
