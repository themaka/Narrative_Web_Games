// =============================================================================
// ErrorScreen — Shown when sheet URL is bad or schema is invalid
// =============================================================================

import React from 'react';

interface ErrorScreenProps {
  message: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
  return (
    <div className="error-screen">
      <h1>Error</h1>
      <p className="error-message">{message}</p>
      <p className="error-hint">
        Please check that the Google Sheet URL is correct and the sheet is published.
      </p>
    </div>
  );
};
