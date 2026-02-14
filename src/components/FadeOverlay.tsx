// =============================================================================
// FadeOverlay — Full-screen black overlay for fade transitions
//
// Always rendered in the DOM (never unmounted) so CSS transitions work
// reliably. The parent drives the phase; this component is pure render.
//
// Phases:
//   hidden     → opacity 0, no transition, pointer-events none
//   fading-out → opacity 1, CSS transition (fade to black)
//   black      → opacity 1, NO transition (snap — holds on black)
//   fading-in  → opacity 0, CSS transition (fade from black)
// =============================================================================

import React from 'react';

export type FadePhase = 'hidden' | 'fading-out' | 'black' | 'fading-in';

interface FadeOverlayProps {
  phase: FadePhase;
  /** Duration of each half (fade-out and fade-in) in ms */
  duration?: number;
}

export const FadeOverlay: React.FC<FadeOverlayProps> = ({
  phase,
  duration = 600,
}) => {
  // Target opacity for each phase
  const opacity =
    phase === 'fading-out' || phase === 'black' ? 1 : 0;

  // Transition behaviour:
  //   hidden     → none (stay invisible, no animation)
  //   fading-out → animate opacity 0 → 1
  //   black      → none (snap to full black instantly after fade-out)
  //   fading-in  → animate opacity 1 → 0
  const transition =
    phase === 'hidden' || phase === 'black'
      ? 'none'
      : `opacity ${duration}ms ease`;

  return (
    <div
      className="fade-overlay"
      style={{
        opacity,
        transition,
        pointerEvents: phase === 'hidden' ? 'none' : undefined,
      }}
    />
  );
};
