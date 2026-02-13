// =============================================================================
// GameStage — Main game container (visible during gameplay)
// =============================================================================

import React from 'react';
import { BackgroundLayer } from './BackgroundLayer';
import { CharacterLayer } from './CharacterLayer';
import { DialogueBox } from './DialogueBox';
import type { StoryNode, Choice } from '../../types';

interface GameStageProps {
  node: StoryNode;
  onChoiceSelected: (choice: Choice) => void;
  resolveUrl: (value: string | undefined) => string | undefined;
}

export const GameStage: React.FC<GameStageProps> = ({
  node,
  onChoiceSelected,
  resolveUrl,
}) => {
  return (
    <div className="game-stage">
      <BackgroundLayer bgImage={resolveUrl(node.bgImage)} />
      <CharacterLayer
        speakerPosition={node.speakerPosition}
        speakerImage={resolveUrl(node.speakerImage)}
        leftImage={resolveUrl(node.leftImage)}
        centerImage={resolveUrl(node.centerImage)}
        rightImage={resolveUrl(node.rightImage)}
      />
      <DialogueBox
        speaker={node.speaker}
        text={node.text}
        choices={node.choices}
        onChoiceSelected={onChoiceSelected}
      />
    </div>
  );
};
