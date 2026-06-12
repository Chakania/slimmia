import { ClaudeCodeAdapter } from "../adapters/claude-code/index.js";
import type { AssistantAdapter } from "../adapters/types.js";
import type { CapabilityItem } from "../core/inventory/model.js";
import { writeInventory } from "../core/inventory/write.js";
import { annotateTokenEstimates } from "../core/tokenize/estimate.js";
import { renderScanReport } from "../reporters/terminal.js";

export interface ScanOptions {
  /** Override $HOME (fixtures / testing other machines' snapshots). */
  homeDir?: string;
  /** Where `.slimmia/inventory.json` is written. Defaults to process.cwd(). */
  cwd?: string;
}

export interface ScanResult {
  items: CapabilityItem[];
  report: string;
  outPath: string | null;
}

export async function runScan(options: ScanOptions = {}): Promise<ScanResult> {
  const cwd = options.cwd ?? process.cwd();
  const adapters: AssistantAdapter[] = [
    new ClaudeCodeAdapter(
      options.homeDir !== undefined ? { homeDir: options.homeDir } : {},
    ),
    // v0.3: opencode, gemini-cli, copilot-cli
  ];

  const inventories = await Promise.all(
    adapters.map(async (adapter) =>
      (await adapter.detect()) ? adapter.inventory() : [],
    ),
  );
  const items = annotateTokenEstimates(inventories.flat());

  const outPath = items.length > 0 ? await writeInventory(items, cwd) : null;
  const report = renderScanReport(items, outPath ?? undefined);
  return { items, report, outPath };
}
