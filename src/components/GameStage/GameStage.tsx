// =============================================================================
// GameStage — Main game container (visible during gameplay)
// =============================================================================

import React, { useRef } from 'react';
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
  const prevBgRef = useRef<string | undefined>(undefined);
  // Counter that increments on each scene change — used as a signal
  // for CharacterSlots to clear their persistent images.
  const sceneChangeIdRef = useRef(0);

  const resolvedBg = resolveUrl(node.bgImage);

  // Detect scene change: background changed to a new, different image.
  // Blank bgImage means "keep current" — that's NOT a scene change.
  // "clear"/"none" IS a scene change (removing the background).
  //
  // We compute this during render but only mutate refs (not state),
  // so it's idempotent even under React StrictMode's double-render.
  const isNewBg =
    resolvedBg !== undefined &&
    resolvedBg !== 'clear' &&
    resolvedBg !== 'none' &&
    resolvedBg !== prevBgRef.current;
  const isBgCleared = resolvedBg === 'clear' || resolvedBg === 'none';

  if (isNewBg) {
    prevBgRef.current = resolvedBg;
    sceneChangeIdRef.current += 1;
  } else if (isBgCleared) {
    prevBgRef.current = undefined;
    sceneChangeIdRef.current += 1;
  }

  return (
    <div className="game-stage">
      <BackgroundLayer bgImage={resolvedBg} />
      <CharacterLayer
        speakerPosition={node.speakerPosition}
        speakerImage={resolveUrl(node.speakerImage)}
        leftImage={resolveUrl(node.leftImage)}
        centerImage={resolveUrl(node.centerImage)}
        rightImage={resolveUrl(node.rightImage)}
        sceneChangeId={sceneChangeIdRef.current}
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
