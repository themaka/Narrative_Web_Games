// =============================================================================
// LoadingScreen — Shown while fetching/parsing sheet data
// =============================================================================

import React from 'react';

interface LoadingScreenProps {
  status: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ status }) => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p className="loading-status">{status}</p>
    </div>
  );
};
