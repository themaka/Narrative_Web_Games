// =============================================================================
// markdownRenderer — Utility for consistent Markdown rendering
// =============================================================================

// We use react-markdown as a React component (see DialogueText, CreditsPage, AboutPage).
// This file provides any shared configuration or helper utilities.

/**
 * Sanitize markdown text from Google Sheets.
 * Google Sheets may introduce some quirks we need to handle:
 * - Literal \n should become real newlines
 * - Trim excess whitespace
 */
export function prepareMarkdown(text: string): string {
  if (!text) return '';

  return text
    // Google Sheets may store literal \n instead of newlines
    .replace(/\\n/g, '\n')
    // Trim leading/trailing whitespace
    .trim();
}
