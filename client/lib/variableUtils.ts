/**
 * Decode HTML entities while preserving HTML tags
 * Handles encoded entities like &lt; and &amp; but keeps structural tags
 * Examples: "&lt;div&gt;" -> "<div>", "&lcub;&lcub;name&rcub;&rcub;" -> "{{name}}"
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || typeof text !== "string") return text;

  // Create a temporary element to decode entities
  const textarea = document.createElement("textarea");

  // Decode the HTML entities by setting innerHTML and reading textContent
  // But only decode once to avoid stripping actual HTML tags
  textarea.innerHTML = text;

  // Get the decoded content - this handles entity decoding
  const decoded = textarea.value;

  console.log("📝 decodeHtmlEntities:", {
    input: text.substring(0, 100),
    output: decoded.substring(0, 100),
    hasHtmlTags: text.includes("<") || text.includes(">"),
  });

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
  if (!content || variables.length === 0) {
    console.log("⚠️ replaceVariables early return:", {
      contentExists: !!content,
      contentLength: content?.length || 0,
      variablesCount: variables.length,
    });
    return content;
  }

  let result = content;

  console.log("🔍 replaceVariables START:", {
    variablesCount: variables.length,
    variablesList: variables.map(v => ({ name: v.name, value: v.value })),
    contentSample: content.substring(0, 150),
    contentLength: content.length,
  });

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
        console.log(`✅ MATCHED & REPLACED: "${placeholder}" -> "${variable.value || ""}"`, {
          variableName: variable.name,
          before: result.substring(0, 100),
          after: replaced.substring(0, 100),
        });
        result = replaced;
        break; // Found and replaced this variable, move to next variable
      }
    }
  }

  console.log("✅ replaceVariables FINAL RESULT:", {
    variablesCount: variables.length,
    resultSample: result.substring(0, 150),
    contentChanged: result !== content,
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
