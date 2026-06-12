/** Minimal box-drawing table. Cells must be plain strings (no ANSI). */
export function renderTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length)),
  );
  const line = (l: string, m: string, r: string) =>
    l + widths.map((w) => "─".repeat(w + 2)).join(m) + r;
  const row = (cells: string[]) =>
    `│ ${cells.map((c, i) => (c ?? "").padEnd(widths[i] ?? 0)).join(" │ ")} │`;
  return [
    line("┌", "┬", "┐"),
    row(headers),
    line("├", "┼", "┤"),
    ...rows.map(row),
    line("└", "┴", "┘"),
  ].join("\n");
}
