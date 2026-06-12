# slimmia

> **Put your AI agents on a diet.**
> Scan, audit, slim, and sync your AI agent environments — across every assistant you use.

[![status](https://img.shields.io/badge/status-v0.1%20shipped-green)](docs/03-roadmap.md)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## The problem: agent bloat

The agent ecosystem made *installing* capabilities trivial — skills, plugins, MCP servers, hooks — and *auditing* them impossible. So developers trying to optimize their workflow install everything... and end up with environments that are **slower, more expensive, and less accurate** than a vanilla setup:

- Multi-server MCP setups have been measured consuming **up to 72% of the context window before the first user message**.
- Tool-selection accuracy **collapses from 43% to under 14%** with bloated tool sets.
- Duplicated systems (two memories, three methodologies) conflict non-deterministically.
- Multi-agent workflows **re-pay the full overhead on every subagent spawn**.
- Nobody can answer: *what is installed, where, what does it cost, and what overlaps?*

Every install adds **context debt** — a recurring tax in tokens, latency, and accuracy, paid at the start of every session. We call the counter-practice **Slimming Agents**, and slimmia is its tooling.

📄 Full technical analysis with sources: [docs/01-problem-analysis.md](docs/01-problem-analysis.md)

## The solution

```bash
npx slimmia scan    # unified inventory across Claude Code, OpenCode, Gemini CLI, Copilot CLI…
npx slimmia audit   # context-debt estimate + overlap/conflict findings + slim plan
npx slimmia slim    # guided cleanup — reversible, with mega-pack extraction
npx slimmia apply   # converge every assistant to a declarative slimfile.toml
```

One tool per function. Measured recommendations. Declarative, reproducible, team-shareable environments. Local-first, zero required network calls.

📄 Architecture and command design: [docs/02-solution-design.md](docs/02-solution-design.md)

## Why nothing else does this

Existing tools attack pieces: MCP gateways optimize the wire, token trackers measure the symptom, skill compressors shrink single files. **Nothing scans the whole environment across assistants, detects functional overlap, tells you what to remove and why, and keeps the result reproducible.** And no vendor will ever audit its competitors' environments — that's why this is a community project.

## Origin

slimmia was born from a real manual audit of a four-assistant development machine: two conflicting memory systems, 12 algorithmic-trading skills on a web-dev box, the same methodology installed three times without the owner knowing, and zero shared conventions. The full before/after is documented in [docs/04-case-study.md](docs/04-case-study.md) — it now serves as the project's reference test fixture.

## Status

**v0.1 shipped.** `slimmia scan` for Claude Code works — read-only inventory, token estimation, and terminal report, verified against a real machine. Try it from a checkout: `pnpm install && pnpm build && node dist/cli.js scan`. Next up: v0.1.1 scan-depth fixes from the first real-world run. See [docs/03-roadmap.md](docs/03-roadmap.md).

| Doc | Contents |
|---|---|
| [01-problem-analysis.md](docs/01-problem-analysis.md) | Agent bloat & context debt: mechanics, data, root causes |
| [02-solution-design.md](docs/02-solution-design.md) | Commands, architecture, adapter contract, slimfile spec |
| [03-roadmap.md](docs/03-roadmap.md) | v0.1 → v1.0, success metrics, risks |
| [04-case-study.md](docs/04-case-study.md) | The real-world audit that started the project |
| [06-first-real-scan-findings.md](docs/06-first-real-scan-findings.md) | What the first real `scan` got right and what it missed |

## Run it locally

Until slimmia is published to npm, run it from a checkout.

**Prerequisites:** Node.js ≥ 20 and pnpm (`corepack enable` activates the version pinned in `package.json`).

```bash
git clone https://github.com/Chakania/slimmia.git
cd slimmia
pnpm install
pnpm build
```

**Scan your real environment** (read-only — the only thing it writes is `.slimmia/inventory.json` in the current directory):

```bash
node dist/cli.js scan          # terminal report: inventory table, context debt, top offenders
node dist/cli.js scan --json   # raw inventory as JSON (pipe it to jq)
```

**Scan the bundled fixture** — a fake home directory with a known inventory (4 skills, 2 plugins, 1 MCP server, 3 hooks, 2 rules files), useful for trying slimmia without touching your own setup:

```bash
node dist/cli.js scan --home tests/fixtures/claude-code/basic-home
```

### Development

```bash
pnpm dev scan        # run from source without building (tsx)
pnpm test            # vitest suite (runs entirely against fixtures — never your real config)
pnpm lint            # biome check
pnpm format          # biome format --write
pnpm typecheck       # tsc --noEmit
```

The full local gate CI runs on every PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, plus a fixture scan, on Linux and Windows.

## Contributing

The two highest-leverage contributions don't even require writing TypeScript:

1. **Capability fingerprints** — help map known skills/plugins/MCP servers to functions (YAML).
2. **Assistant adapters** — add support for your assistant via a small, documented contract.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
