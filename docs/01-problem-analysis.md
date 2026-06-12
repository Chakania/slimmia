# The Problem: Agent Bloat and Context Debt

> Part of the **Slimming Agents** initiative. This document defines the problem slimmia exists to solve, with the technical evidence behind it.

## 1. Summary

The AI-assisted development ecosystem (Claude Code, OpenCode, Gemini CLI, GitHub Copilot CLI, Cursor, Windsurf, and 20+ other agent harnesses) has exploded with installable capabilities: **skills**, **plugins**, **MCP servers**, **hooks**, and **rules files**. The prevailing culture rewards accumulation — "top 100 skills" listicles, mega-packs with 250+ skills, marketplaces that make installing trivial and auditing impossible.

The result is a silent, systemic failure mode we call **agent bloat**: developers install everything that promises to optimize their workflow and end up with environments that are *slower, more expensive, and less accurate* than a vanilla setup.

Every installed capability creates **context debt** — a recurring token cost charged at the start of *every session*, before any work begins. Unlike technical debt, context debt is:

- **Invisible** — no assistant shows you the aggregate cost of your setup.
- **Recurring** — you pay the interest on every session, every subagent spawn, every compaction.
- **Compounding** — overlapping tools don't just add cost, they degrade each other (activation conflicts, duplicated hooks, divergent memory).

## 2. The mechanics: where the damage happens

### 2.1 Upfront context injection

Agent harnesses inject capability metadata into the system prompt at session start:

| Capability type | What gets injected | Typical size |
|---|---|---|
| Skill | Name + trigger description (per skill) | ~30–150 tokens each |
| MCP server | Full JSON schema of every tool it exposes | ~100–800 tokens *per tool* |
| Plugin | All of its skills + commands + agent definitions | Hundreds to thousands |
| Rules files | Entire file content (CLAUDE.md, AGENTS.md, …) | Unbounded |

Industry measurements of the cumulative effect:

- Standard multi-server MCP setups have been measured consuming up to **72% of the agent's context window before the first user message** ([Agentpmt: "The Bloat Tax"](https://www.agentpmt.com/articles/thousands-of-mcp-tools-zero-context-left-the-bloat-tax-breaking-ai-agents)).
- Anthropic's own engineering team documented agents whose tool definitions consumed the majority of the context window, and showed that loading tools on demand can cut token usage by **up to 98.7%** in extreme cases ([Anthropic: Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)).
- Anthropic's Tool Search feature reduced tool-definition overhead by **~85%**, preserving 191,000+ tokens of context in testing — implicit confirmation of how large the overhead had become.
- Atlassian Labs built an MCP proxy (mcp-compressor) specifically because tool-description overhead was so large it could be cut **70–97%** without functional loss ([Atlassian: MCP Compression](https://www.atlassian.com/blog/developer/mcp-compression-preventing-tool-bloat-in-ai-agents)).

### 2.2 Accuracy degradation (the part nobody prices in)

Context debt is not only money. Published measurements show **tool selection accuracy collapsing from 43% to under 14%** when agents face bloated tool sets ([Agentpmt](https://www.agentpmt.com/articles/thousands-of-mcp-tools-zero-context-left-the-bloat-tax-breaking-ai-agents)). The model has to choose among dozens of similar-sounding capabilities; every irrelevant entry is noise that dilutes attention over the entries that matter.

This produces three observable failure modes:

1. **Activation conflicts.** Two skills with near-identical trigger descriptions (e.g., two TDD methodologies, two code-review workflows) compete; which one fires is effectively random, so behavior becomes non-deterministic across sessions.
2. **Functional duplication.** Two memory systems both hook session start, both inject "remembered context", and silently diverge into two conflicting versions of the truth.
3. **Wrong-tool cascades.** A misfired skill pulls in its own sub-workflow, consuming thousands of tokens before the agent recovers — if it recovers.

### 2.3 Hook latency

Hooks (lifecycle scripts that fire on session start, before/after every tool call, on stop) multiply per installation. Each hook is a process spawn. Three plugins hooking `PostToolUse` means **three process spawns per tool call**, serialized into the agent's critical path. On a session with 200 tool calls, that's 600 extra process spawns — pure latency with no token cost, which is why no token tracker surfaces it.

### 2.4 The multi-agent multiplier

Multi-agent workflows make all of the above worse, multiplicatively:

- Every subagent spawn **re-pays the full context debt** of the environment (its system prompt is rebuilt with the same bloated capability index).
- A workflow that spawns 8 subagents pays the overhead 9 times (orchestrator + 8 workers).
- Activation conflicts become *coordination* bugs: two subagents resolving the same trigger to different skills produce inconsistent artifacts that the orchestrator must reconcile.
- Hook latency applies inside every worker, stretching wall-clock time for parallel phases.

This is the cruel irony of the current moment: **the more sophisticated your agent workflow, the more you pay for every gram of bloat.**

### 2.5 Cross-assistant entropy

Developers increasingly run 2–4 assistants side by side (e.g., Claude Code + OpenCode + Gemini CLI + Copilot CLI). Each has its own config dialect:

| Assistant | Skills/plugins location | Rules file | MCP config |
|---|---|---|---|
| Claude Code | `~/.claude/skills`, plugin marketplaces | `CLAUDE.md` | `claude mcp` / settings |
| OpenCode | `~/.config/opencode` + `~/.opencode` | `AGENTS.md` | `opencode.json` |
| Gemini CLI | `~/.gemini/skills`, extensions | `GEMINI.md` | `settings.json` |
| Copilot CLI | `~/.copilot`, `.github/` | `copilot-instructions.md` | `mcp-config.json` |

Nobody can answer basic questions about their own machine: *What is installed where? Which capabilities are duplicated across assistants? Do my four assistants follow the same conventions?* In our reference audit (see [case study](04-case-study.md)), the same methodology plugin turned out to be installed on **three of four assistants without the owner knowing**, while a fourth assistant was missing it entirely.

## 3. Why this happened (root causes)

1. **Install friction ≈ zero, audit friction ≈ infinite.** Marketplaces made `install` a one-liner; no vendor ships an `audit`.
2. **Incentives favor accumulation.** Content creators are rewarded for "more skills"; mega-packs (250+ skills) advertise totals as a feature.
3. **The cost is deferred and diffuse.** You pay per session, in tokens and milliseconds, never as a single visible bill.
4. **No shared vocabulary.** Without a name for the problem, developers misdiagnose it ("the model got dumber") instead of treating the environment.
5. **No portability layer.** Capabilities can't be declared once and applied everywhere, so every assistant accumulates its own divergent pile.

## 4. Naming the problem

We propose **Slimming Agents** as the banner for the counter-practice: systematically reducing an agent environment to the *minimal, non-overlapping set of capabilities it actually needs* — and keeping it that way with tooling, not willpower.

Supporting vocabulary used throughout this project:

- **Agent bloat** — the condition: an environment overloaded with redundant capabilities.
- **Context debt** — the recurring cost: tokens + latency + accuracy paid every session because of the environment's state.
- **Skill hoarding** — the behavior: installing capabilities speculatively ("just in case") without retiring anything.
- **One-tool-per-function** — the core design rule: exactly one memory system, one methodology, one docs source, one design system, one orchestration layer.

## 5. What "good" looks like

A slim environment, measured on a real machine (full details in the [case study](04-case-study.md)):

| Metric | Before | After |
|---|---|---|
| Plugins (Claude Code) | 7 (2 of them disabled dead weight) | 3 |
| Memory systems active | 2 (conflicting) | 1 (shared across 3 assistants) |
| Skill-index entries from irrelevant domains | 25+ (incl. 12 algorithmic-trading skills on a web-dev machine) | 0 |
| Methodology frameworks | 3 installed across assistants, inconsistently | 1, on all assistants |
| Rules consistency across 4 assistants | none | single shared block, replicated |

The slim setup is not minimalism for its own sake. Every removed capability was either **duplicated** (a second memory system), **irrelevant** (neural trading on a web-dev machine), or **unused dead weight** (a 262-skill mega-pack installed but disabled). What remains is complementary by construction: episodic memory + structural code graph + one methodology + one design system + one docs source.

## 6. Existing tools and why they don't solve this

| Tool | What it does | What it doesn't do |
|---|---|---|
| [mcp-compressor](https://www.atlassian.com/blog/developer/mcp-compression-preventing-tool-bloat-in-ai-agents) (Atlassian) | Compresses MCP tool descriptions at a proxy layer | Doesn't see skills/plugins/hooks; doesn't detect redundancy |
| [Bifrost](https://www.getmaxim.ai/articles/top-5-mcp-gateway-tools-for-governing-mcp-server-access/) and MCP gateways | Govern/route MCP access efficiently | Runtime-only; MCP-only; no environment audit |
| [token-optimizer](https://github.com/alexgreensh/token-optimizer), [claude-context-optimizer](https://github.com/egorfedorov/claude-context-optimizer) | Track token usage, find waste in sessions | Measure the symptom; don't diagnose which installs cause it or fix the environment |
| Skill compressors (e.g., Claude Skill Optimizer) | Shrink individual SKILL.md files | Per-file; can't see that two skills duplicate each other |
| Vendor tooling (e.g., `claude plugin details`) | Per-plugin projected token cost | Single assistant, single plugin; no overlap detection, no cross-assistant view |

**The gap:** nothing scans the *whole environment across assistants*, detects *functional overlap*, recommends *what to remove and why*, and makes the result *declarative and reproducible*. That is slimmia's job — see [02-solution-design.md](02-solution-design.md).

## 7. Who suffers this problem

- **Individual developers** — pay the bloat tax per session without knowing; misattribute degraded output to the model.
- **Teams** — every member has a divergent environment; "works on my agent" becomes the new "works on my machine".
- **Multi-agent system builders** — pay the debt multiplied by agent count; suffer non-deterministic skill activation across workers.
- **Plugin/skill authors** — their well-built capability performs worse in bloated environments and gets blamed for it.
- **Model vendors** — burn inference capacity serving redundant schemas; users blame the model for environment-induced accuracy loss.

---

*Next: [02 — Solution design](02-solution-design.md)*
