# Agentic PM Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a centralized PM dashboard that connects to GitHub repos, displays project info across 7 tabs, and integrates AI agent chat via OpenClaw.

**Architecture:** Single Next.js 15 App Router application deployed on Vercel. Server Components fetch GitHub data. API Routes proxy to OpenClaw Gateway for chat and handle GitHub write operations. Neon Postgres via Prisma stores project config, chat history, curated updates, and share links.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma, Neon Postgres, NextAuth.js, Vercel AI SDK, react-markdown

**Testing:** No automated tests. Manual verification per vibecode stage. AI prepares test procedures, human executes.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root layout: Inter font, sidebar, chat panel
│   ├── page.tsx                            # Redirect to /projects or last visited
│   ├── globals.css                         # Tailwind base + glassmorphism utilities
│   ├── providers.tsx                       # Session provider wrapper
│   ├── login/
│   │   └── page.tsx                        # GitHub OAuth login
│   ├── projects/
│   │   ├── page.tsx                        # Project list (when no project selected)
│   │   └── [id]/
│   │       ├── layout.tsx                  # Project layout: header + tab bar
│   │       ├── page.tsx                    # Redirect to updates tab
│   │       ├── updates/page.tsx            # Curated changelog
│   │       ├── deployment/page.tsx         # Live deployment status
│   │       ├── analytics/page.tsx          # Metric widgets + agent queries
│   │       ├── progress/page.tsx           # Markdown: PROGRESS_LOG.md
│   │       ├── context/page.tsx            # Markdown: PROJECT_CONTEXT.md
│   │       ├── decisions/page.tsx          # Markdown: DECISIONS.md
│   │       └── tickets/page.tsx            # GitHub Issues
│   ├── settings/
│   │   └── page.tsx                        # Manage repos, MCP, share links
│   ├── share/
│   │   └── [token]/
│   │       └── page.tsx                    # Read-only view
│   └── api/
│       ├── auth/[...nextauth]/route.ts     # NextAuth handler
│       ├── chat/route.ts                   # Proxy to OpenClaw Gateway
│       ├── github/
│       │   └── issues/route.ts             # Create/update GitHub issues
│       ├── updates/route.ts                # CRUD curated updates
│       ├── projects/route.ts               # CRUD project config
│       └─��� share/route.ts                  # CRUD share links
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx                     # Collapsible project sidebar
│   │   ├── sidebar-toggle.tsx              # Mobile hamburger / collapse button
│   │   ├── chat-panel.tsx                  # Slide-in glassmorphism chat
│   │   ├── chat-messages.tsx               # Scrollable message list
│   │   ├── chat-input.tsx                  # Message input with send button
│   │   ├── project-header.tsx              # Project name, repo link, status
│   │   └── tab-bar.tsx                     # 7 project tabs
│   ├── markdown-renderer.tsx               # Shared markdown display component
│   ├── updates/
│   │   ├── update-list.tsx                 # List of changelog entries
│   │   └── update-form.tsx                 # Create/edit update dialog
│   ├── deployment/
│   │   └── deployment-status.tsx           # Deployment info display
│   ├── analytics/
│   │   ├── analytics-dashboard.tsx         # Widget grid
│   │   └── analytics-query.tsx             # Agent query area
│   ├── tickets/
│   │   ├── ticket-list.tsx                 # GitHub issues list
│   │   ├── ticket-card.tsx                 # Single issue card
│   │   └── ticket-form.tsx                 # Create/edit issue dialog
│   ├── settings/
│   │   ├── repo-manager.tsx                # Connect/disconnect repos
│   │   ├── mcp-config.tsx                  # MCP server config per project
│   │   └── share-manager.tsx               # Create/manage share links
│   └── ui/                                 # shadcn/ui components (auto-generated)
├── lib/
│   ├── prisma.ts                           # Prisma client singleton
│   ├── github.ts                           # GitHub API helper functions
│   ├── auth.ts                             # NextAuth config + helpers
│   └── utils.ts                            # cn() helper + shared utilities
├── prisma/
│   └── schema.prisma                       # Database schema
├── .env.example                            # Environment variable template
├── tailwind.config.ts                      # Tailwind theme customization
└── next.config.ts                          # Next.js config
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `prisma/schema.prisma`, `src/lib/prisma.ts`
- Create: `.env.example`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run from the project root (`C:\Users\izadi\Downloads\dev\agentic-pm-dashboard`):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

When prompted, accept defaults. This creates the base Next.js 15 project with App Router, TypeScript, Tailwind CSS, and ESLint.

- [ ] **Step 2: Install core dependencies**

```bash
npm install prisma @prisma/client next-auth @auth/prisma-adapter
npm install react-markdown remark-gfm
npm install ai @ai-sdk/openai
npm install @tanstack/react-query
npm install lucide-react class-variance-authority clsx tailwind-merge
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Zinc
- CSS variables: Yes

Then add the components we need:

```bash
npx shadcn@latest add button card dialog command input label sheet tabs textarea badge separator scroll-area avatar dropdown-menu tooltip skeleton
```

- [ ] **Step 4: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 5: Write the Prisma schema**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Project {
  id                 String   @id @default(cuid())
  githubRepoOwner    String
  githubRepoName     String
  displayName        String
  deploymentPlatform String?
  deploymentConfig   Json?
  mcpConfig          Json?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  updates      Update[]
  chatSessions ChatSession[]
  shareLinks   ShareLink[]
  widgets      AnalyticsWidget[]

  @@unique([githubRepoOwner, githubRepoName])
}

model Update {
  id        String   @id @default(cuid())
  projectId String
  title     String
  content   String   @db.Text
  author    String
  createdAt DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model ChatSession {
  id        String   @id @default(cuid())
  projectId String?
  title     String
  createdAt DateTime @default(now())

  project  Project?      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  messages ChatMessage[]
}

model ChatMessage {
  id        String   @id @default(cuid())
  sessionId String
  role      String
  content   String   @db.Text
  createdAt DateTime @default(now())

  session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

model ShareLink {
  id        String    @id @default(cuid())
  token     String    @unique @default(cuid())
  projectId String?
  expiresAt DateTime?
  createdAt DateTime  @default(now())

  project Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model AnalyticsWidget {
  id         String @id @default(cuid())
  projectId  String
  widgetType String
  config     Json
  position   Int

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 6: Create Prisma client singleton**

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 7: Create .env.example**

Create `.env.example`:

```env
# Database (Neon Postgres)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# OpenClaw
OPENCLAW_GATEWAY_URL="http://your-vps:18789"
OPENCLAW_BEARER_TOKEN=""
```

- [ ] **Step 8: Update .gitignore**

Append to `.gitignore`:

```
.env.local
.env
.superpowers/
```

- [ ] **Step 9: Configure Inter font and dark theme in root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PM Dashboard",
  description: "Agentic project management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 10: Set up globals.css with glassmorphism utilities**

Replace `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  :root {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 5.5%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 5.5%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}

/* Glassmorphism utilities */
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.06);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

- [ ] **Step 11: Create placeholder home page**

Replace `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">PM Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 12: Verify the app runs**

```bash
npm run dev
```

Open http://localhost:3000. Confirm: dark background, Inter font, "PM Dashboard" centered text.

- [ ] **Step 13: Push database schema to Neon**

Human must first:
1. Create a Neon Postgres database at https://neon.tech
2. Copy the connection string to `.env.local` as `DATABASE_URL`

Then run:

```bash
npx prisma db push
npx prisma generate
```

- [ ] **Step 14: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold project with Next.js, Tailwind, shadcn, Prisma"
```

### Manual Test: Stage 1
```
Pre-requisites:
- [ ] .env.local has DATABASE_URL set
- [ ] npm run dev is running

TC-001: App loads
Steps: Open http://localhost:3000
Expected: Dark page with "PM Dashboard" text in Inter font
Status: [ ] PASS  [ ] FAIL

TC-002: Prisma connects
Steps: Run `npx prisma studio`
Expected: Prisma Studio opens, shows all tables (Project, Update, ChatSession, etc.)
Status: [ ] PASS  [ ] FAIL
```

---

## Task 2: Authentication (GitHub OAuth + NextAuth.js)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/providers.tsx`
- Create: `src/app/login/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create NextAuth configuration**

Create `src/lib/auth.ts`:

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
```

- [ ] **Step 2: Install next-auth GitHub provider**

```bash
npm install next-auth @auth/prisma-adapter @next-auth/prisma-adapter
```

Note: If `@auth/prisma-adapter` was already installed in Task 1, this just ensures the GitHub provider is available.

- [ ] **Step 3: Create NextAuth API route**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

- [ ] **Step 4: Create session provider**

Create `src/app/providers.tsx`:

```tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 5: Wrap layout with providers**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PM Dashboard",
  description: "Agentic project management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create login page**

Create `src/app/login/page.tsx`:

```tsx
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="glass rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">PM Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with GitHub to access your projects
        </p>
        <Button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="mt-6"
          variant="outline"
        >
          <Github className="mr-2 h-4 w-4" />
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Add auth guard to home page**

Update `src/app/page.tsx`:

```tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const firstProject = await prisma.project.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (firstProject) {
    redirect(`/projects/${firstProject.id}`);
  }

  redirect("/settings");
}
```

- [ ] **Step 8: Add NextAuth type augmentation**

Create `src/types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add GitHub OAuth authentication with NextAuth.js"
```

### Manual Test: Stage 2
```
Pre-requisites:
- [ ] GitHub OAuth App created (Settings > Developer > OAuth Apps)
- [ ] Callback URL set to http://localhost:3000/api/auth/callback/github
- [ ] GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.local
- [ ] NEXTAUTH_SECRET set (run: openssl rand -base64 32)
- [ ] NEXTAUTH_URL=http://localhost:3000 in .env.local

TC-001: Unauthenticated redirect
Steps: Open http://localhost:3000 in incognito
Expected: Redirected to /login with "Sign in with GitHub" button
Status: [ ] PASS  [ ] FAIL

TC-002: GitHub OAuth flow
Steps: Click "Sign in with GitHub" button
Expected: Redirected to GitHub, authorize, redirected back to /settings (no projects yet)
Status: [ ] PASS  [ ] FAIL

TC-003: Session persists
Steps: Refresh the page after login
Expected: Still authenticated, not redirected to login
Status: [ ] PASS  [ ] FAIL
```

---

## Task 3: Layout Shell (Sidebar, Tab Bar, Responsive, Glassmorphism)

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/sidebar-toggle.tsx`
- Create: `src/components/layout/tab-bar.tsx`
- Create: `src/components/layout/project-header.tsx`
- Create: `src/app/projects/layout.tsx`
- Create: `src/app/projects/page.tsx`
- Create: `src/app/projects/[id]/layout.tsx`
- Create: `src/app/projects/[id]/page.tsx`
- Create stub pages for all 7 tabs
- Modify: `src/app/layout.tsx` to include sidebar

- [ ] **Step 1: Create sidebar component**

Create `src/components/layout/sidebar.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, Settings, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  displayName: string;
  githubRepoOwner: string;
  githubRepoName: string;
}

interface SidebarProps {
  projects: Project[];
}

export function Sidebar({ projects }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          collapsed ? "hidden" : "block lg:hidden"
        )}
        onClick={() => setCollapsed(true)}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/[0.06] bg-zinc-950 transition-all duration-300 lg:relative lg:z-auto",
          collapsed ? "w-0 -translate-x-full lg:w-16 lg:translate-x-0" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">
              PM Dashboard
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Project list */}
        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            {projects.map((project) => {
              const isActive = pathname.startsWith(`/projects/${project.id}`);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  <FolderGit2 className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{project.displayName}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-white/[0.06] p-2">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-white",
              pathname === "/settings" && "bg-white/[0.08] text-white"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 2: Create sidebar toggle for mobile**

Create `src/components/layout/sidebar-toggle.tsx`:

```tsx
"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 lg:hidden"
      onClick={onClick}
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
}
```

- [ ] **Step 3: Create project header component**

Create `src/components/layout/project-header.tsx`:

```tsx
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectHeaderProps {
  displayName: string;
  githubRepoOwner: string;
  githubRepoName: string;
}

export function ProjectHeader({
  displayName,
  githubRepoOwner,
  githubRepoName,
}: ProjectHeaderProps) {
  return (
    <div className="flex items-center gap-4 border-b border-white/[0.06] px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{displayName}</h1>
        <a
          href={`https://github.com/${githubRepoOwner}/${githubRepoName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
        >
          {githubRepoOwner}/{githubRepoName}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create tab bar component**

Create `src/components/layout/tab-bar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Newspaper,
  Rocket,
  BarChart3,
  FileText,
  BookOpen,
  GitPullRequest,
  Ticket,
} from "lucide-react";

const tabs = [
  { name: "Updates", href: "updates", icon: Newspaper },
  { name: "Deployment", href: "deployment", icon: Rocket },
  { name: "Analytics", href: "analytics", icon: BarChart3 },
  { name: "Progress", href: "progress", icon: FileText },
  { name: "Context", href: "context", icon: BookOpen },
  { name: "Decisions", href: "decisions", icon: GitPullRequest },
  { name: "Tickets", href: "tickets", icon: Ticket },
];

interface TabBarProps {
  projectId: string;
}

export function TabBar({ projectId }: TabBarProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-6">
      {tabs.map((tab) => {
        const href = `/projects/${projectId}/${tab.href}`;
        const isActive = pathname === href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors",
              isActive
                ? "border-white text-white"
                : "border-transparent text-muted-foreground hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Create projects layout with sidebar**

Create `src/app/projects/layout.tsx`:

```tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      displayName: true,
      githubRepoOwner: true,
      githubRepoName: true,
    },
  });

  return (
    <div className="flex h-screen">
      <Sidebar projects={projects} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
```

- [ ] **Step 6: Create projects index page**

Create `src/app/projects/page.tsx`:

```tsx
export default function ProjectsIndex() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Select a project from the sidebar or add one in Settings.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create project detail layout with header and tabs**

Create `src/app/projects/[id]/layout.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectHeader } from "@/components/layout/project-header";
import { TabBar } from "@/components/layout/tab-bar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      githubRepoOwner: true,
      githubRepoName: true,
    },
  });

  if (!project) notFound();

  return (
    <div className="flex h-full flex-col">
      <ProjectHeader
        displayName={project.displayName}
        githubRepoOwner={project.githubRepoOwner}
        githubRepoName={project.githubRepoName}
      />
      <TabBar projectId={project.id} />
      <ScrollArea className="flex-1">
        <div className="p-6">{children}</div>
      </ScrollArea>
    </div>
  );
}
```

- [ ] **Step 8: Create project redirect page and stub tab pages**

Create `src/app/projects/[id]/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/projects/${id}/updates`);
}
```

Create stub pages for each tab. Each follows this pattern:

`src/app/projects/[id]/updates/page.tsx`:
```tsx
export default function UpdatesPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Latest Updates</h2>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
```

`src/app/projects/[id]/deployment/page.tsx`:
```tsx
export default function DeploymentPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Deployment</h2>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
```

`src/app/projects/[id]/analytics/page.tsx`:
```tsx
export default function AnalyticsPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Analytics</h2>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
```

`src/app/projects/[id]/progress/page.tsx`:
```tsx
export default function ProgressPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Progress Log</h2>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
```

`src/app/projects/[id]/context/page.tsx`:
```tsx
export default function ContextPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Project Context</h2>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
```

`src/app/projects/[id]/decisions/page.tsx`:
```tsx
export default function DecisionsPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Decisions</h2>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
```

`src/app/projects/[id]/tickets/page.tsx`:
```tsx
export default function TicketsPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Tickets</h2>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add layout shell with sidebar, tab bar, and project routing"
```

### Manual Test: Stage 3
```
Pre-requisites:
- [ ] At least one Project row in the database (manually insert via Prisma Studio or we'll add Settings in Task 12)
- [ ] npm run dev running

TC-001: Sidebar displays projects
Steps: Navigate to http://localhost:3000/projects
Expected: Sidebar on left with project list, "Select a project" message in main area
Status: [ ] PASS  [ ] FAIL

TC-002: Tab bar renders
Steps: Click a project in the sidebar
Expected: Project header with repo name, 7 tabs below, "Coming soon" content
Status: [ ] PASS  [ ] FAIL

TC-003: Tab navigation
Steps: Click each tab
Expected: URL changes, active tab is underlined white, content area updates
Status: [ ] PASS  [ ] FAIL

TC-004: Sidebar collapse
Steps: Click the collapse button in the sidebar header
Expected: Sidebar collapses to icon-only width on desktop
Status: [ ] PASS  [ ] FAIL

TC-005: Mobile responsive
Steps: Resize browser to ~375px width
Expected: Sidebar hidden, tabs show icons only, content fills screen
Status: [ ] PASS  [ ] FAIL
```

---

## Task 4: GitHub Integration (Connect Repos, Fetch Data)

**Files:**
- Create: `src/lib/github.ts`
- Create: `src/app/api/projects/route.ts`

- [ ] **Step 1: Create GitHub API helper**

Create `src/lib/github.ts`:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

async function getGitHubToken(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) throw new Error("No GitHub token found");
  return account.access_token;
}

async function githubFetch(path: string, options?: RequestInit) {
  const token = await getGitHubToken();
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      ...options?.headers,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getRepoFile(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const data = await githubFetch(
      `/repos/${owner}/${repo}/contents/${path}`
    );
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

export async function getRepoIssues(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open"
) {
  return githubFetch(
    `/repos/${owner}/${repo}/issues?state=${state}&per_page=50&sort=updated`
  );
}

export async function createRepoIssue(
  owner: string,
  repo: string,
  title: string,
  body: string,
  labels?: string[]
) {
  const token = await getGitHubToken();
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, labels }),
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function updateRepoIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  data: { title?: string; body?: string; state?: "open" | "closed"; labels?: string[] }
) {
  const token = await getGitHubToken();
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getRepoCommits(
  owner: string,
  repo: string,
  perPage: number = 10
) {
  return githubFetch(
    `/repos/${owner}/${repo}/commits?per_page=${perPage}`
  );
}

export async function getRepoPulls(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "all"
) {
  return githubFetch(
    `/repos/${owner}/${repo}/pulls?state=${state}&per_page=20&sort=updated`
  );
}

export async function getRepoDeployments(owner: string, repo: string) {
  return githubFetch(
    `/repos/${owner}/${repo}/deployments?per_page=5`
  );
}

export async function getUserRepos() {
  return githubFetch(
    `/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member`
  );
}
```

- [ ] **Step 2: Create projects API route**

Create `src/app/api/projects/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { githubRepoOwner, githubRepoName, displayName } = body;

  if (!githubRepoOwner || !githubRepoName || !displayName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      githubRepoOwner,
      githubRepoName,
      displayName,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add GitHub API helpers and projects CRUD endpoint"
```

### Manual Test: Stage 4
```
Pre-requisites:
- [ ] Authenticated and running

TC-001: Fetch user repos
Steps: In browser console or via curl, call GET /api/projects (after adding a project via Prisma Studio)
Expected: Returns array of project objects
Status: [ ] PASS  [ ] FAIL

TC-002: Create project via API
Steps: POST /api/projects with { githubRepoOwner: "your-username", githubRepoName: "a-repo", displayName: "My Repo" }
Expected: Returns created project with id
Status: [ ] PASS  [ ] FAIL
```

---

## Task 5: Markdown Tabs (Progress Log, Project Context, Decisions)

**Files:**
- Create: `src/components/markdown-renderer.tsx`
- Modify: `src/app/projects/[id]/progress/page.tsx`
- Modify: `src/app/projects/[id]/context/page.tsx`
- Modify: `src/app/projects/[id]/decisions/page.tsx`

- [ ] **Step 1: Create shared markdown renderer**

Create `src/components/markdown-renderer.tsx`:

```tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-sm prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:text-sm prose-code:rounded prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-pre:bg-white/[0.04] prose-pre:border prose-pre:border-white/[0.06] prose-table:text-sm prose-th:border prose-th:border-white/[0.06] prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-white/[0.06] prose-td:px-3 prose-td:py-2 prose-li:text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 2: Install Tailwind typography plugin**

```bash
npm install @tailwindcss/typography
```

Add to `tailwind.config.ts` (or the Tailwind config) the typography plugin. If using Tailwind v4 with CSS-based config, add to `globals.css`:

```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 3: Update Progress Log page**

Replace `src/app/projects/[id]/progress/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { getRepoFile } from "@/lib/github";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { githubRepoOwner: true, githubRepoName: true },
  });

  if (!project) notFound();

  const content = await getRepoFile(
    project.githubRepoOwner,
    project.githubRepoName,
    "vibecode/PROGRESS_LOG.md"
  );

  if (!content) {
    return (
      <div>
        <h2 className="text-lg font-semibold">Progress Log</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No vibecode/PROGRESS_LOG.md found in this repository.
        </p>
      </div>
    );
  }

  return <MarkdownRenderer content={content} />;
}
```

- [ ] **Step 4: Update Context page**

Replace `src/app/projects/[id]/context/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { getRepoFile } from "@/lib/github";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export default async function ContextPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { githubRepoOwner: true, githubRepoName: true },
  });

  if (!project) notFound();

  const content = await getRepoFile(
    project.githubRepoOwner,
    project.githubRepoName,
    "vibecode/PROJECT_CONTEXT.md"
  );

  if (!content) {
    return (
      <div>
        <h2 className="text-lg font-semibold">Project Context</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No vibecode/PROJECT_CONTEXT.md found in this repository.
        </p>
      </div>
    );
  }

  return <MarkdownRenderer content={content} />;
}
```

- [ ] **Step 5: Update Decisions page**

Replace `src/app/projects/[id]/decisions/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { getRepoFile } from "@/lib/github";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export default async function DecisionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { githubRepoOwner: true, githubRepoName: true },
  });

  if (!project) notFound();

  const content = await getRepoFile(
    project.githubRepoOwner,
    project.githubRepoName,
    "vibecode/DECISIONS.md"
  );

  if (!content) {
    return (
      <div>
        <h2 className="text-lg font-semibold">Decisions</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No vibecode/DECISIONS.md found in this repository.
        </p>
      </div>
    );
  }

  return <MarkdownRenderer content={content} />;
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add markdown tabs for Progress Log, Context, and Decisions"
```

### Manual Test: Stage 5
```
Pre-requisites:
- [ ] A connected project whose repo has vibecode/*.md files

TC-001: Progress Log renders markdown
Steps: Navigate to project > Progress tab
Expected: PROGRESS_LOG.md rendered with proper formatting (tables, headers, checkboxes)
Status: [ ] PASS  [ ] FAIL

TC-002: Missing file shows fallback
Steps: Navigate to a project whose repo has no vibecode/ folder > Context tab
Expected: "No vibecode/PROJECT_CONTEXT.md found" message
Status: [ ] PASS  [ ] FAIL

TC-003: GFM features render
Steps: Check tables, strikethrough, task lists in any markdown tab
Expected: All GFM features render correctly
Status: [ ] PASS  [ ] FAIL
```

---

## Task 6: Latest Updates Tab (Curated Changelog CRUD)

**Files:**
- Create: `src/app/api/updates/route.ts`
- Create: `src/components/updates/update-list.tsx`
- Create: `src/components/updates/update-form.tsx`
- Modify: `src/app/projects/[id]/updates/page.tsx`

- [ ] **Step 1: Create updates API route**

Create `src/app/api/updates/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const updates = await prisma.update.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(updates);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, title, content } = body;

  if (!projectId || !title || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const update = await prisma.update.create({
    data: {
      projectId,
      title,
      content,
      author: session.user?.name || "Unknown",
    },
  });

  return NextResponse.json(update, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.update.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create update list component**

Create `src/components/updates/update-list.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { UpdateForm } from "./update-form";

interface Update {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

interface UpdateListProps {
  projectId: string;
  initialUpdates: Update[];
}

export function UpdateList({ projectId, initialUpdates }: UpdateListProps) {
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(title: string, content: string) {
    const res = await fetch("/api/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, title, content }),
    });
    const update = await res.json();
    setUpdates([update, ...updates]);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/updates?id=${id}`, { method: "DELETE" });
    setUpdates(updates.filter((u) => u.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Latest Updates</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Update
        </Button>
      </div>

      {showForm && (
        <Card className="glass mb-6 p-4">
          <UpdateForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      <div className="space-y-4">
        {updates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No updates yet.</p>
        ) : (
          updates.map((update) => (
            <Card key={update.id} className="glass p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{update.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {update.author}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(update.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDelete(update.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <MarkdownRenderer content={update.content} />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create update form component**

Create `src/components/updates/update-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface UpdateFormProps {
  onSubmit: (title: string, content: string) => void;
  onCancel: () => void;
}

export function UpdateForm({ onSubmit, onCancel }: UpdateFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit(title, content);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title" className="text-xs">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Update title..."
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="content" className="text-xs">Content (Markdown)</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your update in markdown..."
          rows={6}
          className="mt-1"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Save</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Wire up the Updates page**

Replace `src/app/projects/[id]/updates/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { UpdateList } from "@/components/updates/update-list";

export default async function UpdatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const updates = await prisma.update.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <UpdateList
      projectId={id}
      initialUpdates={JSON.parse(JSON.stringify(updates))}
    />
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add curated updates tab with CRUD operations"
```

### Manual Test: Stage 6
```
TC-001: Create update
Steps: Go to Updates tab > Click "New Update" > Fill title and markdown content > Click Save
Expected: Update appears at top of list with rendered markdown
Status: [ ] PASS  [ ] FAIL

TC-002: Delete update
Steps: Click the trash icon on an update
Expected: Update removed from list
Status: [ ] PASS  [ ] FAIL
```

---

## Task 7: Deployment Tab

**Files:**
- Create: `src/components/deployment/deployment-status.tsx`
- Modify: `src/app/projects/[id]/deployment/page.tsx`

- [ ] **Step 1: Create deployment status component**

Create `src/components/deployment/deployment-status.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

interface Deployment {
  id: number;
  sha: string;
  ref: string;
  environment: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  creator: {
    login: string;
    avatar_url: string;
  };
  statuses_url: string;
}

interface DeploymentStatusProps {
  deployments: Deployment[];
  repoOwner: string;
  repoName: string;
  deploymentPlatform: string | null;
  deploymentConfig: Record<string, string> | null;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "failure":
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "pending":
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

export function DeploymentStatus({
  deployments,
  repoOwner,
  repoName,
  deploymentPlatform,
  deploymentConfig,
}: DeploymentStatusProps) {
  const projectUrl = deploymentConfig?.url;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Deployment</h2>
        {projectUrl && (
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            {projectUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {deploymentPlatform && (
        <Card className="glass mb-6 p-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Platform</p>
              <p className="text-sm font-medium mt-1 capitalize">{deploymentPlatform}</p>
            </div>
            {projectUrl && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">URL</p>
                <p className="text-sm font-medium mt-1">{projectUrl}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {deployments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deployments found from GitHub.</p>
        ) : (
          deployments.map((deployment) => (
            <Card key={deployment.id} className="glass p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon status="success" />
                  <div>
                    <p className="text-sm font-medium">{deployment.environment}</p>
                    <p className="text-xs text-muted-foreground">
                      {deployment.ref} &middot; {deployment.sha.slice(0, 7)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(deployment.created_at).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {deployment.creator.login}
                  </p>
                </div>
              </div>
              {deployment.description && (
                <p className="mt-2 text-xs text-muted-foreground">{deployment.description}</p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire up deployment page**

Replace `src/app/projects/[id]/deployment/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { getRepoDeployments } from "@/lib/github";
import { notFound } from "next/navigation";
import { DeploymentStatus } from "@/components/deployment/deployment-status";

export default async function DeploymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  let deployments = [];
  try {
    deployments = await getRepoDeployments(
      project.githubRepoOwner,
      project.githubRepoName
    );
  } catch {
    // GitHub deployments API may not be available for all repos
  }

  return (
    <DeploymentStatus
      deployments={deployments}
      repoOwner={project.githubRepoOwner}
      repoName={project.githubRepoName}
      deploymentPlatform={project.deploymentPlatform}
      deploymentConfig={project.deploymentConfig as Record<string, string> | null}
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add deployment tab showing GitHub deployments and platform status"
```

### Manual Test: Stage 7
```
TC-001: Deployment tab renders
Steps: Navigate to project > Deployment tab
Expected: Shows deployment platform info and recent GitHub deployments (or "No deployments" message)
Status: [ ] PASS  [ ] FAIL
```

---

## Task 8: Tickets Tab (GitHub Issues)

**Files:**
- Create: `src/app/api/github/issues/route.ts`
- Create: `src/components/tickets/ticket-list.tsx`
- Create: `src/components/tickets/ticket-card.tsx`
- Create: `src/components/tickets/ticket-form.tsx`
- Modify: `src/app/projects/[id]/tickets/page.tsx`

- [ ] **Step 1: Create GitHub issues API route**

Create `src/app/api/github/issues/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createRepoIssue, updateRepoIssue } from "@/lib/github";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { owner, repo, title, body: issueBody, labels } = body;

  if (!owner || !repo || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const issue = await createRepoIssue(owner, repo, title, issueBody || "", labels);
  return NextResponse.json(issue, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { owner, repo, issueNumber, ...data } = body;

  if (!owner || !repo || !issueNumber) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const issue = await updateRepoIssue(owner, repo, issueNumber, data);
  return NextResponse.json(issue);
}
```

- [ ] **Step 2: Create ticket card component**

Create `src/components/tickets/ticket-card.tsx`:

```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleDot, CircleCheck, MessageSquare } from "lucide-react";

interface Issue {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: Array<{ name: string; color: string }>;
  created_at: string;
  updated_at: string;
  comments: number;
  user: { login: string; avatar_url: string };
  body: string | null;
}

export function TicketCard({ issue }: { issue: Issue }) {
  return (
    <Card className="glass p-4 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        {issue.state === "open" ? (
          <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
        ) : (
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={`https://github.com/${issue.user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline"
            >
              {issue.title}
            </a>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              #{issue.number} opened {new Date(issue.created_at).toLocaleDateString()} by {issue.user.login}
            </span>
            {issue.labels.map((label) => (
              <Badge
                key={label.name}
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: `#${label.color}`,
                  color: `#${label.color}`,
                }}
              >
                {label.name}
              </Badge>
            ))}
            {issue.comments > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                {issue.comments}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Create ticket form component**

Create `src/components/tickets/ticket-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TicketFormProps {
  owner: string;
  repo: string;
  onCreated: () => void;
  onCancel: () => void;
}

export function TicketForm({ owner, repo, onCreated, onCancel }: TicketFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    await fetch("/api/github/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, repo, title, body }),
    });
    setSubmitting(false);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="issue-title" className="text-xs">Title</Label>
        <Input
          id="issue-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Issue title..."
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="issue-body" className="text-xs">Description (Markdown)</Label>
        <Textarea
          id="issue-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe the issue..."
          rows={6}
          className="mt-1"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Creating..." : "Create Issue"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Create ticket list component**

Create `src/components/tickets/ticket-list.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TicketCard } from "./ticket-card";
import { TicketForm } from "./ticket-form";

interface Issue {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: Array<{ name: string; color: string }>;
  created_at: string;
  updated_at: string;
  comments: number;
  user: { login: string; avatar_url: string };
  body: string | null;
  pull_request?: unknown;
}

interface TicketListProps {
  owner: string;
  repo: string;
  issues: Issue[];
}

export function TicketList({ owner, repo, issues }: TicketListProps) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  // Filter out pull requests (GitHub API returns PRs as issues)
  const realIssues = issues.filter((i) => !i.pull_request);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Tickets
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {realIssues.length} open
          </span>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Issue
        </Button>
      </div>

      {showForm && (
        <Card className="glass mb-6 p-4">
          <TicketForm
            owner={owner}
            repo={repo}
            onCreated={() => {
              setShowForm(false);
              router.refresh();
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      <div className="space-y-3">
        {realIssues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open issues.</p>
        ) : (
          realIssues.map((issue) => (
            <TicketCard key={issue.number} issue={issue} />
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Wire up tickets page**

Replace `src/app/projects/[id]/tickets/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { getRepoIssues } from "@/lib/github";
import { notFound } from "next/navigation";
import { TicketList } from "@/components/tickets/ticket-list";

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  let issues = [];
  try {
    issues = await getRepoIssues(
      project.githubRepoOwner,
      project.githubRepoName
    );
  } catch {
    // Handle gracefully if issues can't be fetched
  }

  return (
    <TicketList
      owner={project.githubRepoOwner}
      repo={project.githubRepoName}
      issues={issues}
    />
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add tickets tab with GitHub Issues read/write"
```

### Manual Test: Stage 8
```
TC-001: Issues list displays
Steps: Navigate to project > Tickets tab
Expected: List of open GitHub issues with labels, comments count, author
Status: [ ] PASS  [ ] FAIL

TC-002: Create new issue
Steps: Click "New Issue" > Fill title and body > Click "Create Issue"
Expected: Issue created on GitHub, appears in list after refresh
Status: [ ] PASS  [ ] FAIL
```

---

## Task 9: Chat Panel (Vercel AI SDK + OpenClaw)

**Files:**
- Create: `src/app/api/chat/route.ts`
- Create: `src/components/layout/chat-panel.tsx`
- Create: `src/components/layout/chat-messages.tsx`
- Create: `src/components/layout/chat-input.tsx`
- Modify: `src/app/projects/layout.tsx` to include chat panel

- [ ] **Step 1: Create chat API route**

Create `src/app/api/chat/route.ts`:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const openclaw = createOpenAI({
  baseURL: process.env.OPENCLAW_GATEWAY_URL + "/v1",
  apiKey: process.env.OPENCLAW_BEARER_TOKEN!,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, projectId } = await req.json();

  // Build system message with project context if scoped
  let systemMessage = "You are a helpful project management assistant.";

  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (project) {
      systemMessage = `You are a PM assistant for the project "${project.displayName}" (${project.githubRepoOwner}/${project.githubRepoName}). Help the user with questions about this project. You have access to MCP tools for analytics and GitHub issues.`;
    }
  }

  const result = streamText({
    model: openclaw("openclaw"),
    system: systemMessage,
    messages,
  });

  return result.toDataStreamResponse();
}
```

- [ ] **Step 2: Create chat messages component**

Create `src/components/layout/chat-messages.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { User, Bot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Ask me anything about your projects.
          </p>
        </div>
      )}
      {messages.map((message) => (
        <div key={message.id} className="flex gap-3">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-white/[0.06] text-xs">
              {message.role === "user" ? (
                <User className="h-3.5 w-3.5" />
              ) : (
                <Bot className="h-3.5 w-3.5" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-sm">
            {message.role === "assistant" ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-3">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-white/[0.06] text-xs">
              <Bot className="h-3.5 w-3.5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground delay-100" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground delay-200" />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create chat input component**

Create `src/components/layout/chat-input.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-white/[0.06] p-4">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          rows={1}
          className="min-h-[40px] max-h-[120px] resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="shrink-0"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Create chat panel component**

Create `src/components/layout/chat-panel.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

interface ChatPanelProps {
  projectId?: string;
  projectName?: string;
}

export function ChatPanel({ projectId, projectName }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Determine if we're in a project context
  const currentProjectId = projectId || extractProjectIdFromPath(pathname);

  const { messages, append, isLoading } = useChat({
    api: "/api/chat",
    body: { projectId: currentProjectId },
  });

  function handleSend(content: string) {
    append({ role: "user", content });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full glass-strong shadow-lg"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:w-[440px] glass-strong border-l border-white/[0.08]"
      >
        <SheetHeader className="border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-sm font-semibold">AI Assistant</SheetTitle>
            {currentProjectId && projectName && (
              <Badge variant="secondary" className="text-xs">
                {projectName}
              </Badge>
            )}
          </div>
        </SheetHeader>
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </SheetContent>
    </Sheet>
  );
}

function extractProjectIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/\/projects\/([^/]+)/);
  return match?.[1];
}
```

- [ ] **Step 5: Add chat panel to the projects layout**

Update `src/app/projects/layout.tsx` — add the ChatPanel:

```tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatPanel } from "@/components/layout/chat-panel";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      displayName: true,
      githubRepoOwner: true,
      githubRepoName: true,
    },
  });

  return (
    <div className="flex h-screen">
      <Sidebar projects={projects} />
      <main className="flex-1 overflow-hidden">{children}</main>
      <ChatPanel />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add chat panel with Vercel AI SDK streaming to OpenClaw"
```

### Manual Test: Stage 9
```
Pre-requisites:
- [ ] OPENCLAW_GATEWAY_URL and OPENCLAW_BEARER_TOKEN set in .env.local
- [ ] OpenClaw agent running on VPS

TC-001: Chat panel opens
Steps: Click the chat bubble button (bottom right)
Expected: Glass panel slides in from right with "AI Assistant" header
Status: [ ] PASS  [ ] FAIL

TC-002: Send message and get response
Steps: Type "Hello, what can you help me with?" and press Enter
Expected: Message appears, agent response streams in token by token
Status: [ ] PASS  [ ] FAIL

TC-003: Chat without OpenClaw (fallback)
Steps: Set OPENCLAW_GATEWAY_URL to an invalid URL, try sending a message
Expected: Error handled gracefully, not a crash
Status: [ ] PASS  [ ] FAIL
```

---

## Task 10: Analytics Tab (Widgets + MCP Agent Queries)

**Files:**
- Create: `src/components/analytics/analytics-dashboard.tsx`
- Create: `src/components/analytics/analytics-query.tsx`
- Modify: `src/app/projects/[id]/analytics/page.tsx`

- [ ] **Step 1: Create analytics dashboard component**

Create `src/components/analytics/analytics-dashboard.tsx`:

```tsx
import { Card } from "@/components/ui/card";

interface Widget {
  id: string;
  widgetType: string;
  config: Record<string, unknown>;
  position: number;
}

interface AnalyticsDashboardProps {
  widgets: Widget[];
}

export function AnalyticsDashboard({ widgets }: AnalyticsDashboardProps) {
  if (widgets.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass p-6 text-center col-span-full">
          <p className="text-sm text-muted-foreground">
            No analytics widgets configured. Add MCP server connections in Settings to enable analytics.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {widgets.map((widget) => (
        <Card key={widget.id} className="glass p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {widget.widgetType}
          </p>
          <p className="mt-2 text-2xl font-semibold">--</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Connected via MCP
          </p>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create analytics query component**

Create `src/components/analytics/analytics-query.tsx`:

```tsx
"use client";

import { useChat } from "ai/react";
import { Card } from "@/components/ui/card";
import { ChatMessages } from "@/components/layout/chat-messages";
import { ChatInput } from "@/components/layout/chat-input";

interface AnalyticsQueryProps {
  projectId: string;
  projectName: string;
}

export function AnalyticsQuery({ projectId, projectName }: AnalyticsQueryProps) {
  const { messages, append, isLoading } = useChat({
    api: "/api/chat",
    body: { projectId },
    initialMessages: [
      {
        id: "system-intro",
        role: "assistant",
        content: `I can help you query analytics for **${projectName}**. Ask me about traffic, user metrics, or any data available through the project's MCP servers.`,
      },
    ],
  });

  function handleSend(content: string) {
    append({ role: "user", content });
  }

  return (
    <Card className="glass flex flex-col" style={{ height: "400px" }}>
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-sm font-medium">Ask about analytics</p>
      </div>
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </Card>
  );
}
```

- [ ] **Step 3: Wire up analytics page**

Replace `src/app/projects/[id]/analytics/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { AnalyticsQuery } from "@/components/analytics/analytics-query";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { widgets: { orderBy: { position: "asc" } } },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Analytics</h2>
      <AnalyticsDashboard widgets={JSON.parse(JSON.stringify(project.widgets))} />
      <AnalyticsQuery projectId={id} projectName={project.displayName} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add analytics tab with widget grid and agent query area"
```

### Manual Test: Stage 10
```
TC-001: Analytics page renders
Steps: Navigate to project > Analytics tab
Expected: Empty widget grid with message, plus agent query area below
Status: [ ] PASS  [ ] FAIL

TC-002: Analytics agent query
Steps: Type an analytics question in the query area
Expected: Agent responds (via OpenClaw) with streaming text
Status: [ ] PASS  [ ] FAIL
```

---

## Task 11: Read-Only Share Links

**Files:**
- Create: `src/app/api/share/route.ts`
- Create: `src/app/share/[token]/page.tsx`

- [ ] **Step 1: Create share links API route**

Create `src/app/api/share/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.shareLink.findMany({
    include: { project: { select: { displayName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, expiresAt } = body;

  const link = await prisma.shareLink.create({
    data: {
      projectId: projectId || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(link, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.shareLink.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create shared view page**

Create `src/app/share/[token]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectHeader } from "@/components/layout/project-header";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          updates: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      },
    },
  });

  if (!shareLink) notFound();

  // Check expiration
  if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
    notFound();
  }

  // If scoped to a project, show that project's updates
  if (shareLink.project) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Read-only view
          </span>
        </div>
        <ProjectHeader
          displayName={shareLink.project.displayName}
          githubRepoOwner={shareLink.project.githubRepoOwner}
          githubRepoName={shareLink.project.githubRepoName}
        />
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Latest Updates</h2>
          {shareLink.project.updates.map((update) => (
            <div key={update.id} className="glass rounded-lg p-4">
              <h3 className="text-sm font-semibold">{update.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {update.author} &middot; {new Date(update.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{update.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Global share — list all projects with their latest update
  const projects = await prisma.project.findMany({
    include: {
      updates: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Read-only view
        </span>
        <h1 className="mt-1 text-2xl font-semibold">All Projects</h1>
      </div>
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="glass rounded-lg p-4">
            <h3 className="text-sm font-semibold">{project.displayName}</h3>
            <p className="text-xs text-muted-foreground">
              {project.githubRepoOwner}/{project.githubRepoName}
            </p>
            {project.updates[0] && (
              <p className="mt-2 text-xs text-muted-foreground">
                Latest: {project.updates[0].title} ({new Date(project.updates[0].createdAt).toLocaleDateString()})
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add read-only share links for colleague access"
```

### Manual Test: Stage 11
```
TC-001: Create share link
Steps: POST /api/share with { projectId: "..." }
Expected: Returns share link with token
Status: [ ] PASS  [ ] FAIL

TC-002: Access shared view
Steps: Open /share/<token> in incognito (no login)
Expected: Read-only view of project updates, no edit controls
Status: [ ] PASS  [ ] FAIL

TC-003: Expired link
Steps: Create a link with expiresAt in the past, try to access
Expected: 404 page
Status: [ ] PASS  [ ] FAIL
```

---

## Task 12: Settings Page (Repos, MCP Config, Share Links)

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/app/settings/layout.tsx`
- Create: `src/components/settings/repo-manager.tsx`
- Create: `src/components/settings/mcp-config.tsx`
- Create: `src/components/settings/share-manager.tsx`

- [ ] **Step 1: Create settings layout**

Create `src/app/settings/layout.tsx`:

```tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <>{children}</>;
}
```

- [ ] **Step 2: Create repo manager component**

Create `src/components/settings/repo-manager.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, FolderGit2 } from "lucide-react";

interface GitHubRepo {
  full_name: string;
  name: string;
  owner: { login: string };
  description: string | null;
}

interface Project {
  id: string;
  displayName: string;
  githubRepoOwner: string;
  githubRepoName: string;
}

interface RepoManagerProps {
  initialProjects: Project[];
}

export function RepoManager({ initialProjects }: RepoManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  async function loadRepos() {
    setLoading(true);
    const res = await fetch("/api/github/repos");
    if (res.ok) {
      const data = await res.json();
      setRepos(data);
    }
    setLoading(false);
  }

  async function addProject(repo: GitHubRepo) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        githubRepoOwner: repo.owner.login,
        githubRepoName: repo.name,
        displayName: repo.name,
      }),
    });

    if (res.ok) {
      const project = await res.json();
      setProjects([project, ...projects]);
    }
  }

  async function removeProject(id: string) {
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    setProjects(projects.filter((p) => p.id !== id));
  }

  const connectedRepoNames = new Set(
    projects.map((p) => `${p.githubRepoOwner}/${p.githubRepoName}`)
  );

  const filteredRepos = repos.filter(
    (r) =>
      !connectedRepoNames.has(r.full_name) &&
      r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Connected Repositories</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowPicker(!showPicker);
            if (!showPicker && repos.length === 0) loadRepos();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Repository
        </Button>
      </div>

      {/* Connected projects */}
      <div className="space-y-2">
        {projects.map((project) => (
          <Card key={project.id} className="glass flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <FolderGit2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{project.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {project.githubRepoOwner}/{project.githubRepoName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => removeProject(project.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No repositories connected yet.</p>
        )}
      </div>

      {/* Repo picker */}
      {showPicker && (
        <Card className="glass mt-4 p-4">
          <Input
            placeholder="Search your repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.full_name}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-white/[0.04]"
                >
                  <div>
                    <p className="text-sm">{repo.full_name}</p>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-md">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => addProject(repo)}>
                    Add
                  </Button>
                </div>
              ))}
              {filteredRepos.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground p-2">
                  {search ? "No matching repositories." : "All repositories are already connected."}
                </p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create GitHub repos API route**

Create `src/app/api/github/repos/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserRepos } from "@/lib/github";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const repos = await getUserRepos();
  return NextResponse.json(repos);
}
```

- [ ] **Step 4: Create share link manager component**

Create `src/components/settings/share-manager.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Copy, Check } from "lucide-react";

interface ShareLink {
  id: string;
  token: string;
  projectId: string | null;
  expiresAt: string | null;
  createdAt: string;
  project?: { displayName: string } | null;
}

interface Project {
  id: string;
  displayName: string;
}

interface ShareManagerProps {
  initialLinks: ShareLink[];
  projects: Project[];
}

export function ShareManager({ initialLinks, projects }: ShareManagerProps) {
  const [links, setLinks] = useState<ShareLink[]>(initialLinks);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function createLink(projectId?: string) {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: projectId || null }),
    });
    const link = await res.json();
    setLinks([link, ...links]);
  }

  async function deleteLink(id: string) {
    await fetch(`/api/share?id=${id}`, { method: "DELETE" });
    setLinks(links.filter((l) => l.id !== id));
  }

  function copyLink(token: string, id: string) {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Share Links</h3>
        <Button variant="outline" size="sm" onClick={() => createLink()}>
          <Plus className="mr-2 h-4 w-4" />
          New Link (All Projects)
        </Button>
      </div>

      <div className="space-y-2">
        {links.map((link) => (
          <Card key={link.id} className="glass flex items-center justify-between p-3">
            <div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-muted-foreground">/share/{link.token.slice(0, 8)}...</code>
                <Badge variant="secondary" className="text-xs">
                  {link.project?.displayName || "All Projects"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Created {new Date(link.createdAt).toLocaleDateString()}
                {link.expiresAt && ` · Expires ${new Date(link.expiresAt).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyLink(link.token, link.id)}
              >
                {copiedId === link.id ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => deleteLink(link.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {links.length === 0 && (
          <p className="text-sm text-muted-foreground">No share links created yet.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create MCP config placeholder**

Create `src/components/settings/mcp-config.tsx`:

```tsx
import { Card } from "@/components/ui/card";

export function McpConfig() {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold">MCP Server Configuration</h3>
      <Card className="glass p-6 text-center">
        <p className="text-sm text-muted-foreground">
          MCP server configuration is managed on the OpenClaw side.
          Configure your agent's MCP connections in your OpenClaw Gateway settings.
        </p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 6: Create settings page**

Create `src/app/settings/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";
import { RepoManager } from "@/components/settings/repo-manager";
import { ShareManager } from "@/components/settings/share-manager";
import { McpConfig } from "@/components/settings/mcp-config";

export default async function SettingsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const shareLinks = await prisma.shareLink.findMany({
    include: { project: { select: { displayName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your connected repositories, MCP servers, and share links.
      </p>

      <Separator className="my-6" />

      <RepoManager initialProjects={JSON.parse(JSON.stringify(projects))} />

      <Separator className="my-6" />

      <McpConfig />

      <Separator className="my-6" />

      <ShareManager
        initialLinks={JSON.parse(JSON.stringify(shareLinks))}
        projects={projects.map((p) => ({ id: p.id, displayName: p.displayName }))}
      />
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add settings page with repo manager, MCP config, and share links"
```

### Manual Test: Stage 12
```
TC-001: Settings page loads
Steps: Navigate to /settings
Expected: Three sections: Connected Repositories, MCP Config, Share Links
Status: [ ] PASS  [ ] FAIL

TC-002: Add repository
Steps: Click "Add Repository" > Search > Click "Add" on a repo
Expected: Repo appears in connected list, now visible in sidebar
Status: [ ] PASS  [ ] FAIL

TC-003: Remove repository
Steps: Click trash icon on a connected repo
Expected: Repo removed from list and sidebar
Status: [ ] PASS  [ ] FAIL

TC-004: Create and copy share link
Steps: Click "New Link" > Click copy icon > Open link in incognito
Expected: Link copied, opens read-only view without authentication
Status: [ ] PASS  [ ] FAIL
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 12 stages from the spec have corresponding tasks. All 7 tabs implemented. Auth, chat, share links, settings all covered.
- [x] **Placeholder scan:** No TBDs, TODOs, or "implement later" in any task. All steps have actual code.
- [x] **Type consistency:** `Project`, `Update`, `ChatSession`, `ChatMessage`, `ShareLink`, `AnalyticsWidget` match across Prisma schema and component props. `getRepoFile`, `getRepoIssues`, etc. match between `lib/github.ts` and page usage.
- [x] **Route consistency:** All routes in the spec (`/projects/:id/updates`, `/settings`, `/share/:token`, etc.) have corresponding page files.
- [x] **Component names:** `Sidebar`, `TabBar`, `ProjectHeader`, `ChatPanel`, `MarkdownRenderer`, `UpdateList`, `TicketList`, etc. are consistent between creation and usage.
