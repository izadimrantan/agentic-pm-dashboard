# Decision Log

> **Purpose:** Record architectural and technical decisions for future reference.
> **When:** Log decisions on architecture, tech stack, major patterns, or significant trade-offs.

---

## Decisions

### 2026-04-05 - Architecture: Next.js App Router Monolith

**Context:** Need to choose between (A) Next.js App Router with API routes, (B) Next.js frontend + separate backend, or (C) Next.js with custom server (BFF).

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| A: Next.js App Router + API Routes | Single deployable, simple, server components keep tokens safe, Vercel AI SDK integrates natively | All logic in one app, cold start on serverless |
| B: Separate frontend + backend | Clean separation, persistent connections, independent scaling | Two services to maintain, CORS, overkill for single user |
| C: Next.js + custom server (BFF) | Single deploy with full WebSocket support | Loses Next.js optimizations, can't deploy on Vercel |

**Decision:** Option A — Next.js App Router + API Routes

**Rationale:** Single-user dashboard doesn't need a separate backend. SSE streaming (Vercel AI SDK) eliminates the need for WebSocket, so the custom server (Option C) provides no benefit. Simplest path to production with Vercel deployment.

**Decided By:** @izadi with AI input

---

### 2026-04-05 - Agent Communication: Vercel AI SDK + OpenClaw Gateway

**Context:** Need a communication layer between the dashboard and OpenClaw AI agent running on a VPS. Researched: Anthropic Claude SDK, OpenAI Agents SDK, MCP as chat layer, Google A2A protocol, custom REST/WS, Vercel AI SDK.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| Vercel AI SDK | Native Next.js, built-in streaming via useChat, SSE | UI-to-model bridge, not a full agent framework |
| Custom REST/WebSocket | Total control | Build everything from scratch |
| Google A2A Protocol | Purpose-built for agent communication | V1.0 only March 2026, too new |
| MCP as chat layer | Great for tools | Not designed for conversational chat |
| Anthropic Claude SDK | Native Claude tool use | Python-only, no transport layer |
| OpenAI Agents SDK | Built-in MCP, streaming | Locked to OpenAI models |

**Decision:** Layered approach — Vercel AI SDK (dashboard ↔ agent), MCP (agent ↔ tools)

**Rationale:** OpenClaw is Vercel AI SDK compatible (exposes OpenAI-compatible `/v1/chat/completions` endpoint with SSE). The dashboard uses Vercel AI SDK's `useChat` hook pointed at a Next.js API route, which proxies to the OpenClaw Gateway. MCP handles the agent's internal tool connections (analytics, databases). Clean separation: chat transport (Vercel AI SDK) vs tool access (MCP).

**Decided By:** @izadi with AI input

---

### 2026-04-05 - Database: Neon Postgres via Prisma

**Context:** Need persistent storage for project config, chat history, curated updates, share links. Dashboard deploys on Vercel (serverless), so SQLite won't work.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| Neon Postgres (free tier) | 0.5GB free, serverless-friendly, connection pooling | External dependency |
| Supabase Postgres | Free tier, built-in auth | More than needed, adds complexity |
| Vercel KV (Redis) | Fast, simple | Not great for relational data |
| JSON files | Zero dependencies | Messy with chat history, no concurrent access |

**Decision:** Neon Postgres via Prisma ORM

**Rationale:** Prisma abstracts the database — switching to another Postgres provider (Supabase, Railway, self-hosted) is a one-line config change. Neon's free tier (0.5GB, 190 compute hours/month) is more than enough for single-user. Serverless connection pooling works well with Vercel.

**Decided By:** @izadi with AI input

---

### 2026-04-05 - Authentication: GitHub OAuth + Secret Share Links

**Context:** Dashboard is single-user (owner) but needs future ability for colleagues to view.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| A: GitHub OAuth (owner) + secret read-only URLs | Simple, no user management | Links can be shared/leaked |
| B: GitHub OAuth for everyone, owner = write, rest = read-only | Secure, identity-based | Need user management UI |
| C: GitHub OAuth + role system (admin/viewer) | Most flexible | Overkill for current needs |

**Decision:** Option A — GitHub OAuth for owner, secret read-only links for colleagues

**Rationale:** Simplest approach for a single-user dashboard. Future migration to Option B or C is straightforward via NextAuth.js (just add role checks). No need to build user management now.

**Decided By:** @izadi with AI input

---

### 2026-04-05 - Visual Design: Dark Zinc + Inter + Glassmorphism

**Context:** Choose visual direction for the dashboard. Three options presented: Deep Space (indigo), Neutral Zinc (no accent), Cyber Cyan (teal).

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| Deep Space (indigo/purple) | Distinctive, mission control feel | Color may clash with status indicators |
| Neutral Zinc (white-on-black) | Ultra-clean, matches shadcn defaults, timeless | Could feel plain |
| Cyber Cyan (teal accents) | Most futuristic | Cyan can feel cold, may tire over daily use |

**Decision:** Neutral Zinc with Inter font and glassmorphism overlays

**Rationale:** Most professional and timeless for daily use. Status colors (green/red/yellow) stand out clearly against neutral background. Inter is optimized for screens. Glassmorphism adds the futuristic/modern feel without relying on accent colors.

**Decided By:** @izadi with AI input

---

### 2026-04-05 - Latest Updates Tab: Curated Changelog

**Context:** Decide what "Latest Updates" means — auto-generated from GitHub activity or manually curated.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| Auto-generated from GitHub activity | Zero effort | Noisy, hard to find signal |
| Curated by user/agent | Meaningful, summarized | Requires writing entries |
| Both (auto + pinned manual notes) | Complete picture | Complex UI |

**Decision:** Curated changelog only (written by user or AI agent)

**Rationale:** As a PM, curated updates are more valuable than raw commit/PR feeds. The AI agent can help draft summaries. GitHub activity is already visible in other tabs (tickets, deployment).

**Decided By:** @izadi with AI input

---

### 2026-04-05 - Tickets: GitHub Issues

**Context:** Choose where tickets/tasks are managed.

**Decision:** GitHub Issues exclusively

**Rationale:** Avoids adding another integration (Linear, Jira). OpenClaw agent gets a fine-grained GitHub token scoped to `issues: read/write` only (no file edit access). Keeps everything in the GitHub ecosystem.

**Decided By:** @izadi with AI input

---

### 2026-04-05 - Analytics Tab: Widgets + Agent Queries

**Context:** How to present analytics data from MCP servers.

**Decision:** Default dashboard widgets (charts, KPIs) + ad-hoc agent queries

**Rationale:** Widgets give at-a-glance metrics for daily use. Agent queries let the PM ask specific questions ("what's traffic this week?") without pre-building every possible view. MCP servers are configured per-project on the OpenClaw side.

**Decided By:** @izadi with AI input

---

*Last updated: 2026-04-05*
