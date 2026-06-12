import { encode } from "gpt-tokenizer/encoding/cl100k_base";
import type { CapabilityItem } from "../inventory/model.js";

/** Tokenizer label shown in reports — counts are estimates, not exact (docs/02 §2.2). */
export const TOKENIZER_LABEL = "estimate, cl100k";

export function estimateTokens(text: string): number {
  if (text.length === 0) return 0;
  return encode(text).length;
}

/** What each kind actually injects into context at session start (docs/01 §2.1). */
function injectedText(item: CapabilityItem): string {
  switch (item.kind) {
    case "skill":
      return `${item.name}: ${item.description ?? ""}`;
    case "rules-file":
      return item.description ?? "";
    case "mcp-server":
    case "mcp-tool":
      return item.schema
        ? JSON.stringify(item.schema)
        : (item.description ?? "");
    case "hook":
      return ""; // hooks cost latency (process spawns), not context tokens
    case "plugin":
      return item.description ?? ""; // its skills are separate items
  }
}

export function annotateTokenEstimates(
  items: CapabilityItem[],
): CapabilityItem[] {
  return items.map((item) => ({
    ...item,
    tokenEstimate: item.enabled ? estimateTokens(injectedText(item)) : 0,
  }));
}
