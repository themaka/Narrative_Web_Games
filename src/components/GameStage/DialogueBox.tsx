// =============================================================================
// DialogueBox — Bottom panel for narrative content and choices
// =============================================================================

import React from 'react';
import { SpeakerName } from './SpeakerName';
import { DialogueText } from './DialogueText';
import { ChoiceList } from './ChoiceList';
import type { Choice } from '../../types';

interface DialogueBoxProps {
  speaker?: string;
  text: string;
  choices: Choice[];
  onChoiceSelected: (choice: Choice) => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  speaker,
  text,
  choices,
  onChoiceSelected,
}) => {
  return (
    <div className="dialogue-box">
      {speaker && <SpeakerName name={speaker} />}
      <DialogueText text={text} />
      <ChoiceList choices={choices} onChoiceSelected={onChoiceSelected} />
    </div>
  );
};
