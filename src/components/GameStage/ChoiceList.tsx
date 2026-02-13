// =============================================================================
// ChoiceList — Container for choice buttons
// =============================================================================

import React from 'react';
import { ChoiceButton } from './ChoiceButton';
import type { Choice } from '../../types';

interface ChoiceListProps {
  choices: Choice[];
  onChoiceSelected: (choice: Choice) => void;
}

export const ChoiceList: React.FC<ChoiceListProps> = ({ choices, onChoiceSelected }) => {
  // No choices = ending node (handled by parent)
  if (choices.length === 0) return null;

  // Auto-advance: single choice with no text
  const isAutoAdvance = choices.length === 1 && !choices[0].text;

  return (
    <div className="choice-list">
      {isAutoAdvance ? (
        <ChoiceButton
          choice={{ ...choices[0], text: 'Continue' }}
          onClick={() => onChoiceSelected(choices[0])}
        />
      ) : (
        choices.map((choice, index) => (
          <ChoiceButton
            key={`${choice.target}-${index}`}
            choice={choice}
            onClick={() => onChoiceSelected(choice)}
          />
        ))
      )}
    </div>
  );
};
