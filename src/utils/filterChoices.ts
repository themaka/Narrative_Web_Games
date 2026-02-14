// =============================================================================
// filterChoices — Filter choices by require_flag on their target nodes
//
// Per the schema (docs/sheet-schema.md):
//   "Choices with a require_flag on their target node are only shown
//    if the player has that flag."
//   "If all choices are filtered out by flags, fall back to next_node
//    if present, otherwise treat as ending."
// =============================================================================

import type { Choice, StoryNode } from '../types';

/**
 * Returns only the choices whose target nodes the player is allowed to reach.
 *
 * A choice is kept if:
 *   1. Its target node exists AND
 *   2. The target node has no `requireFlag`, OR the player has ALL required flags.
 *
 * If every choice is filtered out, returns an empty array (caller treats as ending).
 */
export function filterChoicesByFlags(
  choices: Choice[],
  playerFlags: Set<string>,
  nodes: Map<string, StoryNode>
): Choice[] {
  return choices.filter((choice) => {
    const target = nodes.get(choice.target);

    // Target node doesn't exist — keep choice (will fail gracefully on navigate)
    if (!target) return true;

    // No require_flag on target — always show
    if (!target.requireFlag || target.requireFlag.length === 0) return true;

    // Player must have ALL required flags
    const hasAll = target.requireFlag.every((flag) => playerFlags.has(flag));

    if (!hasAll) {
      console.log(
        `[NWG] Choice hidden: "${choice.text || '(auto-advance)'}" → ${choice.target} ` +
        `(requires: [${target.requireFlag.join(', ')}], ` +
        `has: [${[...playerFlags].join(', ')}])`
      );
    }

    return hasAll;
  });
}
