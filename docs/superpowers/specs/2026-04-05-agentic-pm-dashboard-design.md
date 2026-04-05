# Agentic PM Dashboard — Design Spec

**Date:** 2026-04-05
**Status:** Approved
**Author:** @izadi + Claude Opus 4.6

---

## 1. Overview

A centralized project management dashboard for a product manager to view all GitHub projects in one place. Each project has 7 information tabs, an AI agent chat (OpenClaw), and analytics via MCP servers. Desktop-first, responsive for mobile. Deployed on Vercel.

### Goals
- Open the dashboard each workday and immediately see project status
- Drill into any project via 7 tabs covering all aspects (updates, deployment, analytics, docs, tickets)
- Chat with an AI agent that has full project context and can query analytics data
- Share read-only views with colleagues via secret links

### Non-Goals
- Multi-user collaboration (future consideration)
- Automated test suites (internal tool, manual verification per stage)
- Mobile app (responsive web is sufficient)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| Font | Inter (via next/font/google) |
| Database | Neon Postgres (free tier) |
| ORM | Prisma |
| Auth | NextAuth.js (GitHub OAuth) |
| AI Chat | Vercel AI SDK (useChat + SSE streaming) |
| AI Agent | OpenClaw Gateway (on external VPS) |
| Tool Layer | MCP servers (per-project, managed by OpenClaw) |
| Deployment | Vercel |

---

## 3. Architecture

### 3.1 High-Level

Single Next.js application (Approach A: App Router + API Routes). No separate backend.

```
+----------------------------------------------------------+
|                   Next.js App (App Router)                |
|                                                          |
|  +--------------+  +--------------+  +--------------+    |
|  |  Pages/UI    |  |  API Routes  |  |  Server      |    |
|  |  (React +    |  |  /api/chat   |  |  Components  |    |
|  |   shadcn/ui) |  |  /api/github |  |  (data fetch)|    |
|  +------+-------+  +------+-------+  +------+-------+    |
|         |                 |                  |            |
+---------+-----------------+------------------+------------+
          |                 |                  |
          v                 v                  v
     Browser           OpenClaw            GitHub API
     Client            Gateway             + Hosting APIs
                       (VPS)
                         |
                         v
                     MCP Servers
```

### 3.2 Layered Communication

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Dashboard ↔ Agent | Vercel AI SDK (SSE) | Chat UI with streaming responses |
| Agent runtime | OpenClaw Gateway on VPS | Processes questions, calls tools |
| Agent ↔ Tools | MCP servers | Analytics, databases, project data |

**Why this architecture:**
- Single deployable on Vercel — simplest to build and maintain
- Server Components fetch GitHub data without exposing tokens to the browser
- API Routes proxy OpenClaw calls, keeping VPS address private
- SSE streaming (Vercel AI SDK) eliminates WebSocket need — the chat pattern is request-response with streaming, which SSE handles natively

### 3.3 OpenClaw Integration

OpenClaw Gateway exposes OpenAI-compatible endpoints:
- `POST /v1/chat/completions` with `stream: true` for SSE streaming
- Bearer token authentication
- The dashboard's `/api/chat` route proxies requests to the Gateway
- Vercel AI SDK's `openai` provider pointed at the OpenClaw URL

The agent uses MCP servers (configured per-project) to access analytics data, databases, and other tools. The dashboard never talks to MCP directly.

The OpenClaw agent has a fine-grained GitHub token scoped to `issues: read/write` only (no file edit access).

---

## 4. Data Model

### 4.1 Source of Truth: GitHub

| Data | GitHub API |
|------|-----------|
| Progress Log | `GET /repos/:owner/:repo/contents/vibecode/PROGRESS_LOG.md` |
| Project Context | `GET /repos/:owner/:repo/contents/vibecode/PROJECT_CONTEXT.md` |
| Decisions | `GET /repos/:owner/:repo/contents/vibecode/DECISIONS.md` |
| Tickets | Issues API (list, create, update) |
| Activity | Commits, PRs, releases, actions |
| Deployment | Deployments API or hosting platform API |

### 4.2 Neon Postgres (via Prisma)

**Projects table:**
- id, github_repo_owner, github_repo_name, display_name
- deployment_platform (vercel/aws/other), deployment_config (JSON)
- mcp_config (JSON — per-project MCP server configuration)
- created_at, updated_at

**Updates table (curated changelog):**
- id, project_id, title, content (markdown), author (user or agent)
- created_at

**Chat sessions table:**
- id, project_id (nullable — null for global chat), title
- created_at

**Chat messages table:**
- id, session_id, role (user/assistant), content
- created_at

**Share links table:**
- id, token (unique), project_id (nullable — null for all projects)
- expires_at (nullable), created_at

**Analytics widget config table:**
- id, project_id, widget_type, config (JSON — data source, metric, display)
- position (order on page)

---

## 5. Routing

```
/                         → Redirect to last visited project or /projects
/login                    → GitHub OAuth login
/projects/:id             → Project page (default: updates tab)
/projects/:id/updates     → Curated changelog
/projects/:id/deployment  → Live deployment status
/projects/:id/analytics   → Metric widgets + agent queries
/projects/:id/progress    → Markdown render of PROGRESS_LOG.md
/projects/:id/context     → Markdown render of PROJECT_CONTEXT.md
/projects/:id/decisions   → Markdown render of DECISIONS.md
/projects/:id/tickets     → GitHub Issues
/settings                 → Manage repos, MCP config, share links
/share/:token             → Read-only view (no auth required)
```

---

## 6. Component Architecture

```
AppLayout
├── Sidebar (collapsible)
│   ├── ProjectList
│   └── SettingsLink
├── MainContent
│   ├── ProjectHeader (name, repo link, status badge)
│   ├── TabBar (7 tabs)
│   └── TabContent
│       ├── UpdatesTab → curated changelog entries from Postgres
│       ├── DeploymentTab → hosting platform API status
│       ├── AnalyticsTab → metric widgets + agent query area
│       ├── ProgressTab → react-markdown renderer
│       ├── ContextTab → react-markdown renderer
│       ├── DecisionsTab → react-markdown renderer
│       └── TicketsTab → GitHub Issues list + create/edit
└── ChatPanel (slides in from right)
    ├── ChatMessages (scrollable)
    ├── ChatInput
    └── ScopeIndicator (global vs current project)
```

### Key shadcn/ui Components
- **Sheet** — chat slide-over panel (glassmorphism)
- **Tabs** — 7 project tabs
- **Card** — metric widgets, update entries, ticket cards
- **Dialog** — settings, creating updates/issues
- **Command** — quick project switching (Cmd+K)

### External Libraries
- **react-markdown** + **remark-gfm** — markdown rendering for 3 tabs
- **Vercel AI SDK** — `useChat` hook for chat streaming

---

## 7. Data Flow

### GitHub Data (repos, commits, PRs, files)
Server Components fetch from GitHub REST API with OAuth token at request time. No client-side fetching. Tokens never reach the browser.

### Markdown Tabs
Server Component calls GitHub Contents API → decodes base64 → passes to react-markdown on the client.

### Chat
`useChat()` → `POST /api/chat` → `POST OpenClaw /v1/chat/completions (stream: true)` → SSE stream back through each layer → renders tokens in real-time.

### GitHub Issues (Tickets)
Client form → `POST /api/github/issues` → API route calls GitHub API → returns result → client refreshes.

### Curated Updates
User/agent writes update → `POST /api/updates` → saves to Postgres → revalidates page.

---

## 8. Visual Design

| Property | Value |
|----------|-------|
| Theme | Dark (zinc/charcoal base) |
| Text | White on black, no decorative accent colors |
| Status Colors | Green (live/success), red (error), yellow (warning) |
| Font | Inter (next/font/google, zero layout shift) |
| Overlays | Glassmorphism: `backdrop-filter: blur()` + rgba white border + low-opacity background |
| Style | Professional, modern, futuristic, minimalistic |
| Layout | Desktop-first, responsive for mobile |
| Mobile | Sidebar → hamburger menu, chat → full-screen overlay |

---

## 9. Authentication

| User | Method | Access |
|------|--------|--------|
| Owner | GitHub OAuth (NextAuth.js) | Full read/write |
| Colleagues | Secret URL (`/share/:token`) | Read-only, no auth |

**Future:** Migrate to role-based access where colleagues log in via GitHub OAuth with viewer permissions.

---

## 10. Error Handling

**API layer:** Structured error responses with status codes. GitHub rate limits and auth failures handled gracefully. OpenClaw unreachable → "Agent offline" message.

**UI layer:** React Error Boundaries at tab level. Failed fetches show inline error states. Chat errors show retry button.

**Auth:** NextAuth.js handles token refresh. Invalid share tokens → 404.

---

## 11. Testing

No automated test suites. Manual verification per vibecode stage:
- AI prepares test procedures (pre-requisites, test cases, expected results)
- Human executes and reports PASS/FAIL
- Failures go through vibecode fix protocol

---

## 12. Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres connection string |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `NEXTAUTH_SECRET` | NextAuth.js encryption key |
| `NEXTAUTH_URL` | App URL for OAuth callbacks |
| `OPENCLAW_GATEWAY_URL` | OpenClaw VPS gateway URL |
| `OPENCLAW_BEARER_TOKEN` | OpenClaw API auth token |

---

## 13. Implementation Stages

| Stage | Description |
|-------|-------------|
| 1 | Project scaffolding (Next.js, Tailwind, shadcn, Prisma, Neon) |
| 2 | Auth (GitHub OAuth + NextAuth.js) |
| 3 | Layout shell (sidebar, tab bar, responsive, glassmorphism theme) |
| 4 | GitHub integration (connect repos, fetch data) |
| 5 | Markdown tabs (Progress Log, Project Context, Decisions) |
| 6 | Latest Updates tab (curated changelog CRUD) |
| 7 | Deployment tab (hosting platform status) |
| 8 | Tickets tab (GitHub Issues read/write) |
| 9 | Chat panel (Vercel AI SDK + OpenClaw integration) |
| 10 | Analytics tab (widgets + MCP agent queries) |
| 11 | Read-only share links |
| 12 | Settings page (repos, MCP config, share links) |

Each stage follows vibecode procedure: AI implements → AI prepares test → Human tests → PASS → next stage.
