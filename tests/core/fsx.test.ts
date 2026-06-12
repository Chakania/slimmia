// tests/core/fsx.test.ts
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isDir, listDirs, readJsonFile, readTextFile } from "../../src/core/fsx.js";

describe("fsx", () => {
  it("readJsonFile returns parsed JSON or null", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slimmia-"));
    await writeFile(join(dir, "ok.json"), '{"a":1}');
    await writeFile(join(dir, "bad.json"), "{nope");
    expect(await readJsonFile(join(dir, "ok.json"))).toEqual({ a: 1 });
    expect(await readJsonFile(join(dir, "bad.json"))).toBeNull();
    expect(await readJsonFile(join(dir, "missing.json"))).toBeNull();
  });

  it("readTextFile returns content or null", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slimmia-"));
    await writeFile(join(dir, "f.txt"), "hello");
    expect(await readTextFile(join(dir, "f.txt"))).toBe("hello");
    expect(await readTextFile(join(dir, "missing.txt"))).toBeNull();
  });

  it("listDirs returns sorted directory names only, [] when missing", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slimmia-"));
    await mkdir(join(dir, "b"));
    await mkdir(join(dir, "a"));
    await writeFile(join(dir, "file.txt"), "x");
    expect(await listDirs(dir)).toEqual(["a", "b"]);
    expect(await listDirs(join(dir, "nope"))).toEqual([]);
  });

  it("isDir distinguishes dirs from files and missing paths", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slimmia-"));
    await writeFile(join(dir, "f.txt"), "x");
    expect(await isDir(dir)).toBe(true);
    expect(await isDir(join(dir, "f.txt"))).toBe(false);
    expect(await isDir(join(dir, "missing"))).toBe(false);
  });
});
