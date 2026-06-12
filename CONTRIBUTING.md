# Contributing to slimmia

Thanks for helping put AI agents on a diet. The project is in **design phase** (see [docs/03-roadmap.md](docs/03-roadmap.md)); right now the most valuable contributions are:

## 1. Capability fingerprints (no code required)

The audit engine classifies skills/plugins/MCP servers into functions (memory, methodology, docs-lookup, …) using a community-maintained YAML database. Once the schema lands (v0.2), adding a fingerprint will look like:

```yaml
- match: { kind: plugin, name: "claude-mem" }
  function: memory
  notes: "Hooks SessionStart/PostToolUse; injects recalled context"
  conflicts-with: [memory]
```

Until then: open an issue titled `fingerprint: <capability>` describing the capability, what it injects, and which function it serves. These issues will seed the initial database.

## 2. Assistant adapters

Each assistant (Claude Code, OpenCode, Gemini CLI, Copilot CLI, Cursor, …) is supported through a small adapter implementing `detect / inventory / plan / apply / renderRules` (contract in [docs/02-solution-design.md](docs/02-solution-design.md) §3). If you know an assistant's config layout well, open an issue titled `adapter: <assistant>` with:

- Where skills/plugins/MCP/hooks/rules live on disk (all platforms you know)
- How capabilities are enabled/disabled
- The native install/uninstall mechanism (CLI command, config edit, …)

## 3. Real-world audit reports

Anonymized before/after audits of real environments (like [docs/04-case-study.md](docs/04-case-study.md)) become test fixtures. The messier, the better.

## Ground rules

- **Read-only by default** is non-negotiable: nothing in `scan`/`audit` may mutate user configs.
- **Local-first**: the core path must work with zero network calls.
- Conventional commits (`feat:`, `fix:`, `docs:`, …).
- Be specific in issues: paths, versions, OS. Agent environment bugs are config-layout bugs.

## Development setup

Coming with v0.1 scaffolding (TypeScript, Node ≥ 20, pnpm). Watch the repo or the roadmap.
