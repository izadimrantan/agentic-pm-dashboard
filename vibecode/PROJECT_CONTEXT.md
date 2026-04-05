# Project Context

> **Purpose:** Essential information for AI onboarding. New AI reads this to understand the project.

---

## Overview

**Project Name:** Agentic PM Dashboard
**Description:** A centralized project management dashboard for a product manager/builder to view all GitHub projects in one place, with 7 information tabs per project, AI agent chat (OpenClaw), and analytics via MCP servers. Desktop-first, responsive for mobile.
**Status:** Planning

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Language | TypeScript | 5.x |
| Framework | Next.js (App Router) | 15.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui | latest |
| Font | Inter | via next/font/google |
| Database | Neon Postgres | Free tier |
| ORM | Prisma | latest |
| Auth | NextAuth.js (GitHub OAuth) | latest |
| AI Chat | Vercel AI SDK | latest |
| AI Agent | OpenClaw (on external VPS) | latest |
| Deployment | Vercel | Free tier |

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js App (App Router)               │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Pages/UI     │  │  API Routes   │  │  Server       │  │
│  │  (React +     │  │  /api/chat    │  │  Components   │  │
│  │   shadcn/ui)  │  │  /api/github  │  │  (data fetch) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
└─────────┼─────────────────┼──────────────────┼──────────┘
          │                 │                  │
          │        ┌────────┼──────────┐       │
          │        │        │          │       │
          ▼        ▼        ▼          ▼       ▼
     Browser    OpenClaw   GitHub    Hosting  GitHub
     Client     Gateway    API       APIs     API
               (VPS)      (issues,  (Vercel, (file reads,
                           PRs,etc)  AWS)     commits,etc)
                  │
                  ▼
              MCP Servers
              (Analytics, Databases)
```

### Layered Communication

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Dashboard ↔ Agent chat | Vercel AI SDK (SSE streaming) | Chat UI with streaming responses |
| Agent runtime | OpenClaw Gateway on VPS | Processes questions, calls tools |
| Agent ↔ Tools | MCP servers | Analytics, databases, project data |

### Structure
```
project-root/
├── src/
│   └── app/
│       ├── layout.tsx            # Root layout with sidebar + chat panel
│       ├── login/                # GitHub OAuth login
│       ├── projects/
│       │   └── [id]/
│       │       ├── page.tsx      # Redirects to updates tab
│       │       ├── updates/      # Curated changelog
│       │       ├── deployment/   # Live deployment status
│       │       ├── analytics/    # Metric widgets + agent queries
│       │       ├── progress/     # Markdown: PROGRESS_LOG.md
│       │       ├── context/      # Markdown: PROJECT_CONTEXT.md
│       │       ├── decisions/    # Markdown: DECISIONS.md
│       │       └── tickets/      # GitHub Issues
│       ├── settings/             # Manage repos, MCP config, share links
│       ├── share/
│       │   └── [token]/          # Read-only view for colleagues
│       └── api/
│           ├── chat/             # Proxy to OpenClaw Gateway
│           └── github/           # GitHub API operations
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx           # Collapsible project sidebar
│   │   ├── chat-panel.tsx        # Slide-in glassmorphism chat
│   │   └── tab-bar.tsx           # 7 project tabs
│   ├── tabs/                     # Tab content components
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── github.ts                 # GitHub API client
│   ├── openclaw.ts               # OpenClaw client
│   └── prisma.ts                 # Prisma client
├── prisma/
│   └── schema.prisma             # Database schema
├── vibecode/                     # Vibecode procedure docs
└── public/
```

### Key Patterns
- **Server Components:** Fetch GitHub data server-side (tokens never reach browser)
- **API Routes:** Proxy chat to OpenClaw, handle GitHub write operations
- **SSE Streaming:** Vercel AI SDK `useChat` for real-time agent chat
- **Glassmorphism:** `backdrop-filter: blur()` + subtle borders for overlays

### Critical Files (Don't Modify Without Approval)
| File | Purpose | Risk |
|------|---------|------|
| `prisma/schema.prisma` | Database schema | High |
| `src/app/api/chat/` | Agent communication | High |
| `.env*` | Secrets (GitHub tokens, DB URL, OpenClaw config) | Critical |
| `src/lib/github.ts` | GitHub API client with token handling | High |

---

## Data Model

### What lives in GitHub (source of truth)
- `vibecode/PROGRESS_LOG.md` — Progress Log tab
- `vibecode/PROJECT_CONTEXT.md` — Project Context tab
- `vibecode/DECISIONS.md` — Decisions tab
- Issues — Tickets tab
- Commits, PRs, releases, actions — various tabs
- Deployments — Deployment tab

### What lives in Neon Postgres
- Project configuration (connected repos, display name, MCP server config per project)
- Curated updates (Latest Updates tab entries written by user or agent)
- Analytics widget layout (which metrics/widgets shown per project)
- Chat history (conversation logs with the agent)
- Read-only share links (secret URLs + access scope)
- Encrypted GitHub OAuth tokens (via NextAuth.js)

---

## Page Structure & Routing

```
/                       → Redirects to /projects (or last visited project)
/login                  → GitHub OAuth login page
/projects/:id           → Project page (default: Latest Updates tab)
/projects/:id/updates   → Latest Updates tab (curated changelog)
/projects/:id/deployment → Deployment tab (live status from hosting platform)
/projects/:id/analytics → Analytics tab (widgets + agent queries via MCP)
/projects/:id/progress  → Progress Log tab (markdown render)
/projects/:id/context   → Project Context tab (markdown render)
/projects/:id/decisions → Decisions tab (markdown render)
/projects/:id/tickets   → Tickets tab (GitHub Issues)
/settings               → Manage connected repos, MCP config, share links
/share/:token           → Read-only view for colleagues (no auth)
```

---

## Component Architecture

```
AppLayout
├── Sidebar (collapsible)
│   ├── ProjectList (connected repos)
│   └── SettingsLink
├── MainContent
│   ├── ProjectHeader (name, repo link, status badge)
│   ├── TabBar (7 tabs)
│   └── TabContent
│       ├── UpdatesTab → curated changelog entries
│       ├── DeploymentTab → hosting platform status
│       ├── AnalyticsTab → metric widgets + agent query area
│       ├── ProgressTab → markdown renderer
│       ├── ContextTab → markdown renderer
│       ├── DecisionsTab → markdown renderer
│       └── TicketsTab → GitHub Issues list + create/edit
└── ChatPanel (slides in from right, glassmorphism overlay)
    ├── ChatMessages (scrollable)
    ├── ChatInput
    └── ScopeIndicator (global vs current project)
```

### Key shadcn/ui Components
- `Sheet` — chat slide-over panel (glassmorphism styled)
- `Tabs` — 7 project tabs
- `Card` — metric widgets, update entries, ticket cards
- `Dialog` — settings, creating updates/issues
- `Command` — quick project switching (Cmd+K)
- `react-markdown` + `remark-gfm` — 3 markdown tabs

---

## Visual Design

| Property | Value |
|----------|-------|
| Theme | Dark (zinc/charcoal base, white-on-black) |
| Accent | No decorative color — status colors only (green/red/yellow) |
| Font | Inter (via next/font/google) |
| Overlays | Glassmorphism (backdrop-filter blur + subtle white border + low-opacity bg) |
| Style | Professional, modern, futuristic, minimalistic |
| Responsive | Desktop-first, mobile-friendly (sidebar → hamburger, chat → full-screen overlay) |

---

## Authentication

| User Type | Auth Method | Access Level |
|-----------|------------|--------------|
| Owner (you) | GitHub OAuth via NextAuth.js | Full read/write |
| Colleagues | Secret read-only URL (/share/:token) | Read-only, no auth required |

### Future Consideration
Role-based access where colleagues log in via GitHub OAuth with viewer permissions (read + chat, no write).

---

## Coding Conventions

- **Naming:** camelCase for functions/variables, PascalCase for components
- **Files:** kebab-case.ts / kebab-case.tsx
- **Error handling:** Try/catch at API boundaries, error boundaries for React
- **Components:** Functional components with TypeScript interfaces

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Neon Postgres connection string | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js encryption secret | Yes |
| `NEXTAUTH_URL` | App URL for OAuth callbacks | Yes |
| `OPENCLAW_GATEWAY_URL` | OpenClaw VPS gateway URL | Yes |
| `OPENCLAW_BEARER_TOKEN` | OpenClaw API authentication | Yes |

> Never commit actual values. Use `.env.example` for reference.

---

## Human Preferences

- Professional, modern, futuristic, minimalistic UI
- Glassmorphism overlay effects
- Inter font
- Dark theme (zinc/charcoal, no color accents)
- Desktop-first but responsive for mobile
- Follows vibecode procedure (AI writes code, human pushes)
- SQLite/Postgres swappable via Prisma (currently Neon Postgres)

---

## Known Limitations / Tech Debt

- [ ] MCP server configuration UI not yet designed in detail
- [ ] Analytics widget system needs detailed spec per data source
- [ ] Read-only share link scope/permissions need detailed design
- [ ] OpenClaw Gateway needs remote access configuration (Tailscale/SSH tunnel)

---

*Last updated: 2026-04-05*
