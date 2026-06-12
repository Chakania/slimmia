# Case Study: The Audit That Started slimmia

> A real, manual environment audit performed on June 11, 2026 on a working full-stack development machine (Windows 11) running four AI coding assistants. Every slimmia feature maps to a step that had to be done by hand here. This case is preserved as the project's reference fixture.

## 1. Starting point

A developer — actively trying to optimize their workflow — had installed, over a few weeks:

- **Claude Code:** 7 plugins (claude-mem, superpowers, a 262-skill mega-pack, and a 4-plugin orchestration suite including swarm coordination, RAG memory, and a neural trading system), 3 standalone skills, 2 MCP servers.
- **OpenCode, Gemini CLI, Copilot CLI:** partially overlapping subsets, installed at different times, with no record of what was where.

Symptoms reported: sessions felt slower, and there was a growing suspicion that "more tooling" was producing worse results. Classic agent bloat (see [01-problem-analysis.md](01-problem-analysis.md)).

## 2. What the manual scan found

The inventory step — assembled by hand from `~/.claude`, `~/.config/opencode`, `~/.gemini`, and `~/.copilot` — surfaced facts the owner did not know:

| Finding | Detail | slimmia rule it maps to |
|---|---|---|
| Two memory systems active | claude-mem and an AgentDB/RAG memory plugin both hooked session start and both injected recalled context | `duplicate-function` |
| 12 trading skills on a web-dev machine | A neural-trading plugin injected backtesting, portfolio-optimization and market-regime skills into every session | `domain-mismatch` |
| 25+ skill-index entries from one suite | A single orchestration suite accounted for ~25 entries in the session skill index | `mega-pack` |
| Same methodology installed 3× without owner's knowledge | superpowers was already present on Gemini CLI and Copilot CLI, and installed-but-**disabled** on Claude Code | cross-assistant view |
| Dead weight | The 262-skill mega-pack was installed but disabled — zero value, nonzero maintenance noise | `dead-weight` |
| Triple hook stacking | Three plugins registered hooks on the same lifecycle events | `hook-stacking` |
| Rules drift | Four assistants had no shared conventions; one had a knowledge-graph integration the others lacked | `rules-drift` |
| Duplicated install nobody remembered | A code-graph tool was registered on OpenCode from a prior experiment | inventory |

## 3. The slim plan applied

Following the **one-tool-per-function** rule:

| Function | Kept | Removed |
|---|---|---|
| Memory | claude-mem (shared DB across Claude/OpenCode/Gemini) | RAG-memory plugin |
| Methodology | superpowers (enabled/installed on all 4 assistants) | 24-skill lifecycle pack (registered marketplace, never used), orchestration suite |
| Code graph | graphify (registered on all 4) | — |
| Design | ui-ux-pro-max (installed on all 4) | mega-pack's design skills |
| Docs | Context7 MCP (configured on all 4) | — |
| Orchestration | native subagents + superpowers | swarm plugin, trading plugin, core suite plugin |
| Language patterns | **17 skills extracted à la carte** from the 262-skill mega-pack (React, Next.js, Vue/Nuxt, Node, Python, Go, Rust, Docker, deployment, a11y, error-handling) | the remaining 245 skills |

Plus: a single marker-delimited **stack-rules block** written once and replicated into `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and `copilot-instructions.md`.

## 4. Results

| Metric | Before | After |
|---|---|---|
| Claude Code plugins | 7 (2 disabled dead weight) | 3, all enabled and used |
| Active memory systems | 2, conflicting | 1, shared by 3 assistants |
| Skill-index entries from irrelevant/duplicated sources | 25+ | 0 |
| Hook processes on tool-call events | 3 stacks | 1 |
| Marketplaces registered | 5 | 2 |
| Methodology consistency | 3 different states across 4 assistants | identical on 4/4 |
| Shared conventions across assistants | none | 1 block, 4 files, single source |
| Capability relevance | trading/swarm/crypto-signing on a web-dev machine | 100% mapped to declared stacks |

Qualitative outcome: every remaining capability is **complementary by construction** — episodic memory (claude-mem) + structural graph (graphify) + one methodology (superpowers) + one design system (ui-ux-pro-max) + one docs source (Context7) + 17 stack-matched pattern skills.

## 5. Cost of doing this manually

This audit took an experienced operator roughly **a full working session**, including:

- Web research on 7 candidate packages and their interactions
- Manual parsing of 4 different config dialects
- Reading plugin caches and marketplace state files
- A sparse git clone to extract 17 skills from a 262-skill repo
- Hand-editing 4 rules files and 3 JSON configs
- Verification of every assistant afterwards

**Every one of these steps is mechanizable.** That conclusion is this project: `slimmia scan` (step 1–3), `slimmia audit` (the findings table in §2), `slimmia slim` (the plan in §3, including mega-pack extraction), `slimmia apply`/`sync` (the convergence and rules replication in §3–4).

## 6. Reproducibility note

The "before" configuration state of this machine is being preserved as an anonymized test fixture (`fixtures/case-study-001/`) so that slimmia's audit engine can be regression-tested against the exact real-world mess that motivated it: the audit MUST reproduce every finding in §2.
