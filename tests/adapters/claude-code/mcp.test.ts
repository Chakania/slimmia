// tests/adapters/claude-code/mcp.test.ts
import { describe, expect, it } from "vitest";
import { scanMcpServers } from "../../../src/adapters/claude-code/mcp.js";
import { resolvePaths } from "../../../src/adapters/claude-code/paths.js";
import { FIXTURE_HOME } from "./detect.test.js";

describe("scanMcpServers", () => {
  it("finds global MCP servers from ~/.claude.json", async () => {
    const items = await scanMcpServers(resolvePaths(FIXTURE_HOME));
    expect(items).toHaveLength(1);
    const ctx7 = items[0];
    expect(ctx7?.kind).toBe("mcp-server");
    expect(ctx7?.name).toBe("context7");
    expect(ctx7?.enabled).toBe(true);
    expect(ctx7?.schema).toEqual({
      type: "http",
      url: "https://mcp.context7.com/mcp",
    });
  });

  it("returns [] when .claude.json is missing", async () => {
    expect(await scanMcpServers(resolvePaths("/no/such/home"))).toEqual([]);
  });
});
