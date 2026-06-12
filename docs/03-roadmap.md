# Roadmap

> Status legend: 🔲 planned · 🔨 in progress · ✅ shipped

## v0.1 — "See it" (MVP)

**Goal:** the first `npx slimmia scan` that shows a developer their real environment.

- 🔲 CLI skeleton (TypeScript, Node ≥ 20, `npx slimmia`)
- 🔲 Inventory model + `.slimmia/inventory.json`
- 🔲 **claude-code adapter** (read-only): skills, plugins, MCP servers, hooks, rules files
- 🔲 Token estimation pass (local tokenizer, labeled as estimate)
- 🔲 Terminal reporter (`scan` summary table + top offenders)
- 🔲 CI: lint, typecheck, unit tests on the adapter against fixture configs

**Exit criterion:** a stranger runs one command and learns something true about their machine they didn't know.

## v0.2 — "Diagnose it"

**Goal:** `slimmia audit` produces findings a developer trusts enough to act on.

- 🔲 Function taxonomy + fingerprint database (YAML) seeded with the top ~50 known capabilities (claude-mem, superpowers, graphify, context7, popular MCP servers, known mega-packs)
- 🔲 Audit rule engine: `duplicate-function`, `activation-collision`, `dead-weight`, `domain-mismatch`, `hook-stacking`, `mega-pack`
- 🔲 Description-similarity scoring (local embeddings, optional download)
- 🔲 JSON reporter (machine-readable findings)
- 🔲 The reference case study reproduced as an integration test fixture

## v0.3 — "Everywhere"

**Goal:** cross-assistant parity — the feature no vendor will build.

- 🔲 Adapters: **opencode**, **gemini-cli**, **copilot-cli** (read-only inventory + rules detection)
- 🔲 Cross-assistant findings: `rules-drift`, capability present on N/M assistants
- 🔲 Shared-rules sync: marker-delimited block rendered into CLAUDE.md / AGENTS.md / GEMINI.md / copilot-instructions.md
- 🔲 Adapter authoring guide + adapter test harness (open the extension point to the community)

## v0.4 — "Fix it"

**Goal:** from findings to converged environment.

- 🔲 `slimmia slim` — interactive plan from audit findings (remove / keep / extract)
- 🔲 Mega-pack extraction (pull N relevant skills out of a pack, source-pinned)
- 🔲 Lockfile + `slimmia restore` (every action reversible)
- 🔲 `slimfile.toml` spec v1 + `slimmia apply` (diff → plan → converge) for the 4 core adapters
- 🔲 `[budget]` enforcement: `slimmia audit --ci` exit codes

## v0.5 — "Share it"

**Goal:** network effects.

- 🔲 Profile registry (curated slimfiles with measured budgets) + `slimmia profiles add fullstack-lean`
- 🔲 GitHub Action (`slimmia/audit-action`) + context-debt badge
- 🔲 Per-role profiles for multi-agent setups (role-scoped capability sets)
- 🔲 HTML dashboard reporter

## v1.0 — "Stable"

- 🔲 Frozen schemas: inventory model, slimfile v1, adapter contract, findings format
- 🔲 ≥ 8 assistant adapters (core 4 + community: cursor, windsurf, codex, aider…)
- 🔲 Fingerprint DB ≥ 300 capabilities
- 🔲 Documented governance for fingerprint/profile contributions

## Success metrics

| Metric | Target by v1.0 |
|---|---|
| Median context-debt reduction reported by `slim` on real environments | ≥ 40% |
| Assistants supported | ≥ 8 |
| Community-contributed fingerprints | ≥ 100 |
| `scan` runtime on a typical machine | < 3 s |
| Network calls required for core path | 0 |

## Explicitly deferred (not before v1.0)

- Runtime MCP proxying/compression (ecosystem already covers it; we integrate, not compete)
- Session token tracking (complementary tools exist; we may consume their data as removal evidence)
- Any hosted service. slimmia is local-first; the only remote artifacts are git repos (profiles, fingerprints).

## Risks

| Risk | Mitigation |
|---|---|
| Vendors ship native audits (e.g., Claude Code's per-plugin token cost) | Our moat is cross-assistant + overlap detection + declarative sync — structurally unavailable to single vendors |
| Assistant config formats churn | Adapters are small and versioned; fixture-based tests catch drift fast |
| Fingerprint DB goes stale | Community PRs + heuristic fallback means unknown items still get classified, just less precisely |
| Mutation bugs destroy user configs | Read-only by default; mutations always show a plan; lockfile makes every action reversible; backups before write |
