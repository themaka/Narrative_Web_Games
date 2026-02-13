// =============================================================================
// ChoiceButton — Individual choice button with optional styling
// =============================================================================

import React from 'react';
import type { Choice } from '../../types';

interface ChoiceButtonProps {
  choice: Choice;
  onClick: () => void;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, onClick }) => {
  const styleClass = choice.style
    ? `choice-button--${choice.style}`
    : '';

  return (
    <button
      className={`choice-button ${styleClass}`}
      onClick={onClick}
    >
      {choice.text}
    </button>
  );
};
