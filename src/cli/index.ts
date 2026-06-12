import { Command } from "commander";
import { runScan } from "./scan.js";

const program = new Command();

program
  .name("slimmia")
  .description(
    "Put your AI agents on a diet — scan, audit, slim, and sync AI agent environments.",
  )
  .version("0.1.0");

program
  .command("scan")
  .description("Read-only unified inventory of your AI agent environments")
  .option("--home <dir>", "override the home directory to scan")
  .option("--json", "print the raw inventory as JSON instead of the report")
  .action(async (opts: { home?: string; json?: boolean }) => {
    const result = await runScan(
      opts.home !== undefined ? { homeDir: opts.home } : {},
    );
    if (opts.json === true) {
      console.log(JSON.stringify(result.items, null, 2));
    } else {
      console.log(result.report);
    }
  });

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
