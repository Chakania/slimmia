// tests/core/frontmatter.test.ts
import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "../../src/core/frontmatter.js";

describe("parseFrontmatter", () => {
  it("parses YAML frontmatter delimited by ---", () => {
    const md = "---\nname: graphify\ndescription: knowledge graph tool\n---\n# Body\n";
    expect(parseFrontmatter(md)).toEqual({
      name: "graphify",
      description: "knowledge graph tool",
    });
  });

  it("handles CRLF line endings", () => {
    const md = "---\r\nname: x\r\n---\r\nbody";
    expect(parseFrontmatter(md)).toEqual({ name: "x" });
  });

  it("returns null when there is no frontmatter", () => {
    expect(parseFrontmatter("# just markdown")).toBeNull();
  });

  it("returns null on invalid YAML instead of throwing", () => {
    expect(parseFrontmatter("---\n[unclosed\n---\nbody")).toBeNull();
  });
});
