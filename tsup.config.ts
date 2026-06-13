import { defineConfig } from "tsup";

export default defineConfig({
  // Demo comment
  entry: { cli: "src/cli/index.ts" },
  format: "esm",
  target: "node20",
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
});
