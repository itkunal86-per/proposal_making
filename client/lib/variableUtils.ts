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
 * Handles both literal {{ }} and encoded &lcub; &rcub; and mixed encodings
 */
export function replaceVariables(
  content: string,
  variables: Array<{ id: string | number; name: string; value: string }>
): string {
  if (!content || variables.length === 0) return content;

  let result = content;

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
        console.log(`🎯 Variable replacement: "${placeholder}" -> "${variable.value || ""}"`, {
          before: result.substring(0, 100),
          after: replaced.substring(0, 100),
          matched: true
        });
      }

      result = replaced;
    }
  }

  console.log("✅ replaceVariables final result:", {
    hasVariables: variables.length > 0,
    variableNames: variables.map(v => v.name),
    resultSample: result.substring(0, 100),
  });

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
