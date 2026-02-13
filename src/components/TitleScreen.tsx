// =============================================================================
// TitleScreen — Game title, author, description, Start + Continue buttons
// =============================================================================

import React from 'react';
import type { Metadata } from '../types';

interface TitleScreenProps {
  metadata: Metadata;
  hasSave: boolean;
  onStart: () => void;
  onContinue: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  metadata,
  hasSave,
  onStart,
  onContinue,
}) => {
  return (
    <div className="title-screen">
      <h1 className="title-screen__title">{metadata.title}</h1>
      {metadata.author && (
        <p className="title-screen__author">by {metadata.author}</p>
      )}
      {metadata.description && (
        <p className="title-screen__description">{metadata.description}</p>
      )}
      <div className="title-screen__actions">
        <button className="title-screen__btn title-screen__btn--start" onClick={onStart}>
          Start
        </button>
        {hasSave && (
          <button className="title-screen__btn title-screen__btn--continue" onClick={onContinue}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
};
