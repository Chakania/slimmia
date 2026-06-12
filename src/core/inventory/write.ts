import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { type CapabilityItem, capabilityItemSchema } from "./model.js";

export interface InventoryFile {
  version: 1;
  generatedAt: string;
  items: CapabilityItem[];
}

const itemsSchema = z.array(capabilityItemSchema);

/** Write `.slimmia/inventory.json` under `cwd`. The ONLY write `scan` performs. */
export async function writeInventory(
  items: CapabilityItem[],
  cwd: string,
): Promise<string> {
  itemsSchema.parse(items);
  const file: InventoryFile = {
    version: 1,
    generatedAt: new Date().toISOString(),
    items,
  };
  const dir = join(cwd, ".slimmia");
  await mkdir(dir, { recursive: true });
  const outPath = join(dir, "inventory.json");
  await writeFile(outPath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  return outPath;
}
