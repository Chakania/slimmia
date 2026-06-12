# First real-world scan — findings (2026-06-12)

The first run of `slimmia scan` v0.1 against a real machine (Windows 11, the
reference developer environment from [04-case-study.md](04-case-study.md)),
immediately after merging the v0.1 MVP. This document records what the scan
got right, what it missed, and the gaps it exposed — each gap feeds the
roadmap (see [03-roadmap.md](03-roadmap.md)).

## Results

```
┌─────────────┬────────┬─────────┬─────────────┬───────┬───────┐
│ assistant   │ skills │ plugins │ mcp servers │ hooks │ rules │
├─────────────┼────────┼─────────┼─────────────┼───────┼───────┤
│ claude-code │ 66     │ 7       │ 1           │ 0     │ 2     │
└─────────────┴────────┴─────────┴─────────────┴───────┴───────┘

CONTEXT DEBT: ~3,153 tokens/session   [estimate, cl100k]

TOP OFFENDERS
 1. CLAUDE.md            ~505 tok   rules-file
 2. rules/context7.md    ~282 tok   rules-file
 3. ui-ux-pro-max        ~198 tok   plugin
 4. weekly-digests        ~96 tok   skill
 5. oh-my-issues          ~95 tok   skill
```

76 items total, all schema-valid, written to `.slimmia/inventory.json`.
Exit code 0, sub-second runtime (well under the < 3 s v1.0 target).

## What worked

- **End-to-end on a real machine, first try.** Detection, all five scanners,
  token annotation, the report, and the JSON artifact all behaved exactly as
  on the fixture. Windows paths handled correctly.
- **The exit criterion held.** v0.1's bar was "a stranger runs one command
  and learns something true about their machine they didn't know." First
  real lesson: **the two global rules files alone are ~25% of measurable
  context debt** (~787 of ~3,153 tokens) — an immediately actionable insight
  that required no fingerprint database.
- **Read-only guarantee verified.** The only write on disk was
  `.slimmia/inventory.json` in the cwd.

## Gaps found

### 1. Plugin-shipped hooks are invisible (worst miss)

The scan reported **0 hooks** while the very session that ran it demonstrably
fires a `SessionStart` hook. Root cause: those hooks are shipped by a plugin
(claude-mem) via `hooks/hooks.json` inside the plugin cache — the user-level
`~/.claude/settings.json` has no `hooks` key at all. v0.1 only reads global
settings hooks, per plan scope.

This matters beyond completeness: hook latency cost (docs/01 §2.3) and the
v0.2 `hook-stacking` audit rule are blind to the most common real-world hook
source. **Plugins, not users, install most hooks.**

### 2. Plugins ship more than skills

v0.1 enumerates plugin manifests and plugin `skills/`. Real plugins also
ship **commands** (`commands/*.md` → slash commands), **agents**
(`agents/*.md`), **hooks** (`hooks/hooks.json`), and **MCP servers**
(`.mcp.json` in the plugin root). None of these are inventoried, so a
plugin's true footprint is understated.

### 3. MCP token estimate badly underestimates real cost

context7 was estimated at **~17 tokens** — the size of its config JSON. The
real session-start injection for an MCP server is its **tool schemas plus
server instructions**, typically hundreds to thousands of tokens (the
machine's other MCP server exposes 60+ tools). The current estimate is off
by 1–2 orders of magnitude for exactly the capability kind that motivated
the project. Paths forward, in preference order:

1. **Fingerprint database** (already planned for v0.2): known servers carry
   a measured `injectedTokens` value.
2. **Optional live probe** (`scan --live`): start the server, list tools,
   measure — opt-in because the core path must stay offline and read-only.

### 4. Only the user-global scope is scanned

Not covered yet, all real sources of context debt:

- `~/.claude/settings.local.json` (user-local overrides, can add hooks/plugins)
- Project scope: `.claude/settings.json`, `.claude/settings.local.json`,
  project `CLAUDE.md`, project `.claude/skills/`, project `.mcp.json`
- **Per-project MCP servers inside `~/.claude.json`** (the `projects` key
  holds per-project `mcpServers` maps — the file is already being read, the
  key is just ignored)

### 5. Capability kinds the model never contemplated

Two first-class Claude Code capability kinds are missing from
`CAPABILITY_KINDS` and have no scanner, even at user scope:

- **Subagents** — `~/.claude/agents/*.md` (name + description injected)
- **Slash commands** — `~/.claude/commands/*.md`

Lower priority, same family: output styles, status line config, marketplace
registrations (`extraKnownMarketplaces` was present in the real settings and
silently ignored).

### 6. Report granularity

With 66 skills the flat count hides structure. The single biggest
clarity win: **split skills by source** (user vs per-plugin) in the
inventory table, and show enabled vs disabled counts. A `scope` column
(user / project) becomes necessary the moment gap 4 is fixed.

## Improvement candidates not previously contemplated

| Idea | Why | Where it landed |
|---|---|---|
| Scan plugin hooks/commands/agents/MCP | Gap 1 + 2; plugins are the main capability vector | v0.1.1 |
| `settings.local.json` + project scope | Gap 4; real debt lives there too | v0.1.1 |
| Per-project `mcpServers` from `~/.claude.json` | Gap 4; data already in hand | v0.1.1 |
| `agent` + `command` capability kinds | Gap 5; schema change is cheap now, expensive after v0.2 freezes findings | v0.1.1 |
| Skills-by-source breakdown in report | Gap 6 | v0.1.1 |
| Fingerprint `injectedTokens` for MCP servers | Gap 3 | v0.2 (extends the planned fingerprint DB) |
| Opt-in `scan --live` MCP probe | Gap 3, for unknown servers | v0.2 (explicitly opt-in, off the core path) |
| Hook **latency** estimation (spawn cost per event) | Hooks cost time, not tokens; today they show as 0 everywhere | v0.2 (pairs with `hook-stacking` rule) |

## Verdict

v0.1 shipped and the core loop is sound. The single theme across every gap:
**the unit of installation is the plugin, and plugins inject far more than
the v0.1 model sees.** Deepening the Claude Code adapter (v0.1.1) is worth
doing before widening to other assistants (v0.3), because every other
adapter will copy its structure.
