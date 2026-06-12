# Solution Design: slimmia

> *Put your AI agents on a diet.* slimmia is the tooling layer of the **Slimming Agents** practice: scan, audit, slim, and sync your agent environments — across every assistant you use.

## 1. Design principles

1. **One tool per function.** An environment should have exactly one memory system, one methodology, one docs source, one design system, one orchestration layer. slimmia's audit engine is built around this rule.
2. **Measure, don't moralize.** Every recommendation comes with a number: tokens saved per session, hooks removed from the critical path, entries removed from the skill index.
3. **À la carte over mega-packs.** Prefer extracting the 15 skills you need over installing 262.
4. **Declarative and reproducible.** The desired state lives in a `slimfile.toml`; the environment converges to it on any machine.
5. **Cross-assistant by design.** Adapters normalize every assistant's config dialect into one inventory model. No vendor will ever do this for its competitors — a community project can.
6. **Read-only by default.** `scan` and `audit` never modify anything. Mutation requires `slim` or `apply`, and both show a plan before touching files.

## 2. The four commands

### 2.1 `slimmia scan` — unified inventory

Parses every detected assistant's configuration and emits a normalized inventory.

```
$ npx slimmia scan

  Assistants detected: claude-code, opencode, gemini-cli, copilot-cli

  ENVIRONMENT INVENTORY
  ┌─────────────┬────────┬─────────┬──────────────┬───────┬───────┐
  │ assistant   │ skills │ plugins │ mcp servers  │ hooks │ rules │
  ├─────────────┼────────┼─────────┼──────────────┼───────┼───────┤
  │ claude-code │ 20     │ 3       │ 2            │ 12    │ 2     │
  │ opencode    │ 1      │ 2       │ 1            │ 4     │ 1     │
  │ gemini-cli  │ 3      │ 1 ext   │ 1            │ 8     │ 1     │
  │ copilot-cli │ 2      │ 1       │ 1            │ 0     │ 1     │
  └─────────────┴────────┴─────────┴──────────────┴───────┴───────┘
  → full inventory written to .slimmia/inventory.json
```

**Inventory model** (normalized across assistants):

```ts
interface CapabilityItem {
  id: string;                  // stable hash of (assistant, kind, name, source)
  assistant: AssistantId;
  kind: "skill" | "plugin" | "mcp-server" | "mcp-tool" | "hook" | "rules-file";
  name: string;
  source?: string;             // marketplace / repo / local path
  description?: string;        // the text injected into context
  schema?: object;             // for MCP tools
  events?: string[];           // for hooks
  path: string;                // where it lives on disk
  enabled: boolean;
}
```

### 2.2 `slimmia audit` — the diagnosis (flagship)

Three analysis passes over the inventory:

**Pass 1 — Context debt estimate.** Tokenize every description, schema, and rules file that gets injected at session start. Report per-item, per-assistant, and total cost, with top offenders ranked. Token counting uses local tokenizers (approximate per model family; precision labeled).

**Pass 2 — Functional overlap detection.** Classify every item into a function taxonomy:

```
memory | methodology | code-graph | docs-lookup | design | orchestration |
testing | security | git-workflow | language-patterns | domain-specific | other
```

Classification is hybrid: curated fingerprint database for known capabilities (claude-mem, superpowers, graphify, popular MCP servers — community-maintained YAML), keyword heuristics for unknown ones, and optional local-embedding similarity for description-vs-description conflict scoring. **No network calls, no LLM required** for the core path.

**Pass 3 — Conflict and waste rules.** A rule engine flags:

| Rule | Example finding |
|---|---|
| `duplicate-function` | 2 memory systems both hooking SessionStart |
| `activation-collision` | 2 skills with >0.85 description similarity |
| `dead-weight` | plugin installed but disabled for >30 days |
| `domain-mismatch` | trading skills on a machine with no trading projects |
| `hook-stacking` | 3+ processes on the same lifecycle event |
| `mega-pack` | plugin injecting >50 skills with <10% plausible relevance |
| `rules-drift` | assistants with materially different rules files |
| `scope-misplacement` | project-specific skill installed globally |

```
$ npx slimmia audit

  CONTEXT DEBT: ~18,400 tokens/session (claude-code)   [estimate, cl100k]

  TOP OFFENDERS
   1. ruflo-neural-trader     ~3,100 tok   12 skills    domain-mismatch
   2. ruflo-rag-memory        ~1,900 tok   4 skills     duplicate-function(memory ↔ claude-mem)
   3. ecc (disabled)          0 tok        dead-weight  uninstall to drop maintenance noise

  CONFLICTS
   ✖ memory: claude-mem AND ruflo-rag-memory both inject at SessionStart
   ✖ hooks: PostToolUse runs 3 processes per tool call (claude-mem, ruflo, ecc)
   ⚠ methodology: superpowers installed on 3/4 assistants, missing on opencode

  RECOMMENDED SLIM PLAN: 4 removals, 1 enable, 1 sync  →  est. −9,200 tok/session
  run `slimmia slim` to review and apply
```

### 2.3 `slimmia slim` — guided cleanup

Turns audit findings into an interactive plan (remove / keep / extract). Key feature: **mega-pack extraction** — instead of uninstalling a 262-skill pack outright, slimmia offers to extract the N skills matching your declared stacks into standalone local skills, then remove the pack. Every action is reversible: removed items are recorded in `.slimmia/lockfile` with their source, so `slimmia restore <id>` reinstalls.

### 2.4 `slimmia apply` / `slimmia sync` — declarative environments

The desired state lives in a **slimfile**:

```toml
# slimfile.toml
[profile]
name = "fullstack-lean"
stacks = ["node", "react", "nextjs", "vue", "python", "go", "rust", "docker"]
assistants = ["claude-code", "opencode", "gemini-cli", "copilot-cli"]

[functions]               # one tool per function — enforced
memory = "claude-mem"
methodology = "superpowers"
code-graph = "graphify"
docs-lookup = "context7"
design = "ui-ux-pro-max"

[skills]                  # à la carte, source-pinned
"react-patterns"   = { source = "github:affaan-m/ECC", path = "skills/react-patterns" }
"golang-patterns"  = { source = "github:affaan-m/ECC", path = "skills/golang-patterns" }
# ...

[rules]
shared = "./rules/stack-rules.md"   # rendered into CLAUDE.md / AGENTS.md / GEMINI.md / copilot-instructions.md

[budget]
max-session-overhead-tokens = 8000  # `slimmia audit` fails CI if exceeded
```

`apply` computes a diff between the slimfile and reality on each assistant, shows the plan, and converges: installs what's missing (via each assistant's native mechanism), removes what's not declared, and re-renders the shared rules block into every assistant's rules file (marker-delimited so user content is preserved).

This makes environments **portable** (new machine: `slimmia apply`), **team-shareable** (slimfile in the team repo), and **CI-enforceable** (`slimmia audit --ci` as a budget gate).

## 3. Architecture

```
slimmia (TypeScript, Node ≥ 20, distributed via npx)
├── core/
│   ├── inventory/      normalized model + diffing
│   ├── tokenize/       local tokenizers per model family
│   ├── taxonomy/       fingerprint DB (YAML, community-maintained) + heuristics
│   ├── rules/          audit rule engine
│   └── lockfile/       reversibility + state
├── adapters/           one per assistant — THE extension point
│   ├── claude-code/    detect, inventory, install, remove, rules-render
│   ├── opencode/
│   ├── gemini-cli/
│   ├── copilot-cli/
│   └── (community: cursor, windsurf, codex, aider, …)
├── reporters/          terminal, JSON, HTML dashboard, CI (exit codes + GitHub annotations)
└── cli/                scan | audit | slim | apply | sync | restore | profiles
```

**Adapter contract** (deliberately small so the community can add assistants):

```ts
interface AssistantAdapter {
  id: AssistantId;
  detect(): Promise<boolean>;                 // is it installed?
  inventory(): Promise<CapabilityItem[]>;     // read-only parse of its config
  plan(actions: SlimAction[]): Promise<Plan>; // dry-run mutation
  apply(plan: Plan): Promise<Result>;         // execute via native mechanisms
  renderRules(block: string): Promise<void>;  // marker-delimited rules sync
}
```

## 4. Non-goals (and the complementary ecosystem)

- **Not a marketplace.** slimmia never hosts capabilities; it manages what marketplaces installed.
- **Not a runtime proxy/gateway.** MCP gateways (Bifrost) and compressors (Atlassian mcp-compressor) optimize the *wire*; slimmia optimizes the *environment*. They compose: slim first, compress what remains.
- **Not a session token tracker.** Tools like token-optimizer measure usage during sessions; slimmia prevents waste before sessions start. A tracker can even feed slimmia evidence (e.g., "skill X never activated in 60 sessions" → removal candidate).
- **Not an LLM wrapper.** Core analysis is local and deterministic. An optional `--ai` mode may use any model for semantic overlap explanation, but never as a requirement.

## 5. Community layer

- **Fingerprint database** — the taxonomy that maps known capabilities to functions, as version-controlled YAML in this repo. Every PR that adds a fingerprint improves every audit worldwide.
- **Profile registry** — curated slimfiles (`fullstack-lean`, `frontend-minimal`, `python-data`, `multi-agent-orchestrator`) with measured overhead budgets. People stop sharing "my 50 favorite skills" and start sharing "my audited 6k-token profile".
- **CI action** — `slimmia/audit-action`: fail the build when a repo's committed agent config exceeds its token budget. Badge: `context debt: 5.8k`.

## 6. Multi-agent specifics

Slim environments benefit multi-agent systems disproportionately (every spawn re-pays the overhead — see [01 §2.4](01-problem-analysis.md)). Beyond the global slim, slimmia adds:

- **Per-role profiles** *(roadmap v0.5)*: a worker subagent doing implementation doesn't need the design-system skill; an orchestrator doesn't need language patterns. Slimfiles can declare role-scoped capability sets where the assistant supports per-agent configuration.
- **Budget math for orchestrators**: audit reports show overhead × expected agent count, making the multiplier visible before you launch an 8-agent swarm.

---

*Next: [03 — Roadmap](03-roadmap.md)*
