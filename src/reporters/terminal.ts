import pc from "picocolors";
import type { AssistantId, CapabilityItem } from "../core/inventory/model.js";
import { TOKENIZER_LABEL } from "../core/tokenize/estimate.js";
import { renderTable } from "./table.js";

const KIND_COLUMNS = [
  ["skill", "skills"],
  ["plugin", "plugins"],
  ["mcp-server", "mcp servers"],
  ["hook", "hooks"],
  ["rules-file", "rules"],
] as const;

export function renderScanReport(
  items: CapabilityItem[],
  outPath?: string,
): string {
  if (items.length === 0) {
    return `${pc.yellow("No assistants detected.")}\n`;
  }

  const assistants = [...new Set(items.map((i) => i.assistant))];
  const rows = assistants.map((assistant) => [
    assistant,
    ...KIND_COLUMNS.map(([kind]) =>
      String(
        items.filter((i) => i.assistant === assistant && i.kind === kind)
          .length,
      ),
    ),
  ]);

  const lines: string[] = [
    "",
    `  Assistants detected: ${assistants.join(", ")}`,
    "",
    `  ${pc.bold("ENVIRONMENT INVENTORY")}`,
    indent(
      renderTable(
        ["assistant", ...KIND_COLUMNS.map(([, label]) => label)],
        rows,
      ),
    ),
    "",
    ...assistants.map((a) => contextDebtLine(items, a)),
    "",
    `  ${pc.bold("TOP OFFENDERS")}`,
    ...topOffenders(items),
  ];
  if (outPath !== undefined) {
    lines.push("", `  → full inventory written to ${outPath}`);
  }
  lines.push("");
  return lines.join("\n");
}

function contextDebtLine(
  items: CapabilityItem[],
  assistant: AssistantId,
): string {
  const total = items
    .filter((i) => i.assistant === assistant)
    .reduce((sum, i) => sum + (i.tokenEstimate ?? 0), 0);
  return `  ${pc.bold("CONTEXT DEBT")}: ~${total.toLocaleString("en-US")} tokens/session (${assistant})   [${TOKENIZER_LABEL}]`;
}

function topOffenders(items: CapabilityItem[]): string[] {
  const ranked = [...items]
    .filter((i) => (i.tokenEstimate ?? 0) > 0)
    .sort((a, b) => (b.tokenEstimate ?? 0) - (a.tokenEstimate ?? 0))
    .slice(0, 5);
  if (ranked.length === 0)
    return ["   (nothing enabled injects measurable context)"];
  return ranked.map((item, idx) => {
    const tokens = `~${(item.tokenEstimate ?? 0).toLocaleString("en-US")} tok`;
    return `   ${idx + 1}. ${item.name.padEnd(28)} ${tokens.padStart(12)}   ${item.kind}`;
  });
}

function indent(block: string): string {
  return block
    .split("\n")
    .map((l) => `  ${l}`)
    .join("\n");
}
