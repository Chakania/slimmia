import { parse } from "yaml";

/** Extract the YAML frontmatter block from a markdown document, or null. */
export function parseFrontmatter(
  content: string,
): Record<string, unknown> | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/.exec(content);
  if (!match) return null;
  try {
    const data: unknown = parse(match[1] ?? "");
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}
