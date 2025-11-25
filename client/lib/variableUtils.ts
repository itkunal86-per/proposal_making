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
