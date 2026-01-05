/**
 * Decode HTML entities while preserving HTML tags and structure
 * Handles:
 * 1. Encoded entities: &lt; &gt; &amp; &lcub; &rcub; etc.
 * 2. HTML tags: <div> <p> <span> etc. are preserved
 *
 * Strategy: Use innerHTML to normalize and decode entities, which preserves actual HTML tags
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || typeof text !== "string") return text;

  try {
    // Use a div to parse and normalize the HTML
    // Setting innerHTML and reading it back decodes entities while preserving tags
    const div = document.createElement("div");
    div.innerHTML = text;

    // Get back the normalized HTML - entities are decoded but tags preserved
    return div.innerHTML;
  } catch (err) {
    console.error("Error in decodeHtmlEntities:", err);
    return text; // Return original if error
  }
}

/**
 * Replace {{variable_name}} placeholders with actual values
 * Works with both plain text and HTML content
 * Handles both literal {{ }} and encoded &lcub; &rcub; and mixed encodings
 */
export function replaceVariables(
  content: string,
  variables: Array<{ id: string | number; name: string; value: string }>
): string {
  if (!content || variables.length === 0) return content;

  let result = content;
  let replacementsMade = 0;

  for (const variable of variables) {
    if (!variable.name) continue;

    // Try multiple encoding variations
    const placeholders = [
      `{{${variable.name}}}`,  // literal version: {{name}}
      `&lcub;&lcub;${variable.name}&rcub;&rcub;`,  // fully encoded: &lcub;&lcub;name&rcub;&rcub;
      `&lcub;{${variable.name}}&rcub;`,  // partially encoded: &lcub;{name}&rcub;
      `&lcub;{${variable.name}&rcub;}`,  // other partial: &lcub;{name&rcub;}
    ];

    for (const placeholder of placeholders) {
      // Escape special regex characters in the placeholder
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\&]/g, "\\$&");
      const regex = new RegExp(escapedPlaceholder, "g");
      const replaced = result.replace(regex, variable.value || "");

      if (replaced !== result) {
        replacementsMade++;
        result = replaced;
        break; // Found and replaced this variable, move to next variable
      }
    }
  }

  if (replacementsMade > 0) {
    console.log(`✅ Variable replacements made: ${replacementsMade}`);
  }

  return result;
}

/**
 * Extract all variable names from text (e.g., {{Phone Number}} -> [Phone Number])
 */
export function extractVariableNames(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  return matches.map((match) => match.replace(/\{\{|\}\}/g, ""));
}
