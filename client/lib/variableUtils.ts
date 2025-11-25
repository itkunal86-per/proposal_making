/**
 * Decode HTML entities to proper HTML
 * Handles both encoded entities like &lt; and &amp; and literal tags
 * Recursively decodes multiple levels of encoding
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || typeof text !== "string") return text;

  const textarea = document.createElement("textarea");
  let decoded = text;
  let previousDecoded = "";

  // Recursively decode until no more encoded entities are found
  while (decoded !== previousDecoded) {
    previousDecoded = decoded;
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  }

  return decoded;
}

/**
 * Replace {{variable_name}} placeholders with actual values
 * Works with both plain text and HTML content
 */
export function replaceVariables(
  content: string,
  variables: Array<{ id: string | number; name: string; value: string }>
): string {
  let result = content;

  for (const variable of variables) {
    const placeholder = `{{${variable.name}}}`;
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    result = result.replace(regex, variable.value);
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
