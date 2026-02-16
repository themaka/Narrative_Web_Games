# Future Flag Enhancements

## Problem

The current flag system only supports **hiding choices** when the player lacks a required flag on the target node. This doesn't cover several common narrative patterns:

### Example: Village2 — "How did you arrive?"

The player is asked how they arrived at the village. Currently the choices are:
- "I came through the forest" → Village_Forest_Chat (requires `crossed_bridge`)
- "I followed the smoke here" → Village_Road_Chat

**Problem scenarios:**

1. **Player took the forest path** — both options show, but "I followed the smoke" is a lie. The game has no way to flag this or change the text.
2. **Player took the smoke path** — "I came through the forest" is hidden (no `crossed_bridge` flag), which is correct. But ideally the player could still *lie* about it.

### What's missing

| Feature | Description | Status |
|---------|-------------|--------|
| **Inverse flag check** | Show a choice only if the player does *not* have a flag (e.g., `!crossed_bridge`) | Not implemented |
| **Conditional choice text** | Change choice label based on flags (e.g., "Lie and say you followed the smoke" vs "I followed the smoke") | Not implemented |
| **Per-choice require_flag** | Put `require_flag` on the choice itself instead of only on the target node | Not in schema |

## Possible Approaches

### 1. Inverse flag syntax
Allow `!flag_name` in `require_flag`:
- `require_flag: crossed_bridge` — show only if player HAS the flag
- `require_flag: !crossed_bridge` — show only if player does NOT have the flag

### 2. Per-choice columns
Add `choice_X_require_flag` columns to the schema. This would allow flag checks per choice independent of the target node. Could support both positive and `!negative` syntax.

### 3. Conditional text via flag interpolation
Allow flag-based text in choice labels:
- `{if crossed_bridge}Lie and say you followed the smoke{else}I followed the smoke{/if}`

This is more complex and might be overkill for v1.

### 4. Choice-level flag + text override
Add `choice_X_require_flag` and `choice_X_alt_text` columns:
- If the player has certain flags, show `alt_text` instead of the normal `text`

## Recommendation

For v2, implement **inverse flag syntax** (`!flag`) and **per-choice require_flag** columns. These cover the Village2 scenario cleanly without overcomplicating the schema. Conditional text can wait for v3.

## Related
- Current filtering logic: `src/utils/filterChoices.ts`
- Schema: `docs/sheet-schema.md`
- Sample game Village2 node: `sample/generate-csv.ts`
