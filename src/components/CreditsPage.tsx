// =============================================================================
// CreditsPage — Full-screen overlay with credits (Markdown rendered)
// =============================================================================

import React from 'react';
import Markdown from 'react-markdown';
import { prepareMarkdown } from '../utils/markdownRenderer';

interface CreditsPageProps {
  content?: string;
  onClose: () => void;
}

export const CreditsPage: React.FC<CreditsPageProps> = ({ content, onClose }) => {
  return (
    <div className="overlay-page" onClick={onClose}>
      <div className="overlay-page__content" onClick={(e) => e.stopPropagation()}>
        <h1>Credits</h1>
        {content ? (
          <Markdown>{prepareMarkdown(content)}</Markdown>
        ) : (
          <p>No credits information available.</p>
        )}
        <button className="overlay-page__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
