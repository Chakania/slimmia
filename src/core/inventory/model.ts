import { createHash } from "node:crypto";
import { z } from "zod";

export const ASSISTANT_IDS = [
  "claude-code",
  "opencode",
  "gemini-cli",
  "copilot-cli",
] as const;
export type AssistantId = (typeof ASSISTANT_IDS)[number];

export const CAPABILITY_KINDS = [
  "skill",
  "plugin",
  "mcp-server",
  "mcp-tool",
  "hook",
  "rules-file",
] as const;
export type CapabilityKind = (typeof CAPABILITY_KINDS)[number];

/** Normalized inventory entry — one per installed capability (docs/02 §2.1). */
export interface CapabilityItem {
  id: string;
  assistant: AssistantId;
  kind: CapabilityKind;
  name: string;
  source?: string;
  /** The text this capability injects into context (used for token estimation). */
  description?: string;
  schema?: Record<string, unknown>;
  events?: string[];
  path: string;
  enabled: boolean;
  /** Filled by the tokenize pass; absent until then. */
  tokenEstimate?: number;
}

export const capabilityItemSchema = z.object({
  id: z.string().length(12),
  assistant: z.enum(ASSISTANT_IDS),
  kind: z.enum(CAPABILITY_KINDS),
  name: z.string().min(1),
  source: z.string().optional(),
  description: z.string().optional(),
  schema: z.record(z.string(), z.unknown()).optional(),
  events: z.array(z.string()).optional(),
  path: z.string(),
  enabled: z.boolean(),
  tokenEstimate: z.number().int().nonnegative().optional(),
});

export function stableId(
  assistant: AssistantId,
  kind: CapabilityKind,
  name: string,
  source = "",
): string {
  return createHash("sha256")
    .update([assistant, kind, name, source].join("\0"))
    .digest("hex")
    .slice(0, 12);
}

export function makeItem(input: Omit<CapabilityItem, "id">): CapabilityItem {
  return {
    id: stableId(input.assistant, input.kind, input.name, input.source ?? ""),
    ...input,
  };
}
