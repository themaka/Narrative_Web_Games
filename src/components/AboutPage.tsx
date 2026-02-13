// =============================================================================
// AboutPage — Full-screen overlay with about info (Markdown rendered)
// =============================================================================

import React from 'react';
import Markdown from 'react-markdown';
import { prepareMarkdown } from '../utils/markdownRenderer';

interface AboutPageProps {
  content?: string;
  onClose: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ content, onClose }) => {
  return (
    <div className="overlay-page" onClick={onClose}>
      <div className="overlay-page__content" onClick={(e) => e.stopPropagation()}>
        <h1>About</h1>
        {content ? (
          <Markdown>{prepareMarkdown(content)}</Markdown>
        ) : (
          <p>No about information available.</p>
        )}
        <button className="overlay-page__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
