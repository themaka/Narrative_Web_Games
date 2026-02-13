// =============================================================================
// DialogueText — Markdown-rendered narrative text
// =============================================================================

import React from 'react';
import Markdown from 'react-markdown';
import { prepareMarkdown } from '../../utils/markdownRenderer';

interface DialogueTextProps {
  text: string;
}

export const DialogueText: React.FC<DialogueTextProps> = ({ text }) => {
  const prepared = prepareMarkdown(text);

  return (
    <div className="dialogue-text">
      <Markdown>{prepared}</Markdown>
    </div>
  );
};
