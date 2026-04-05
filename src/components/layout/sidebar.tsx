"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2, Settings, ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (id: string) => pathname.startsWith(`/projects/${id}`);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.06] bg-zinc-950 text-muted-foreground hover:text-foreground md:hidden"
        aria-label="Open sidebar"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06] bg-zinc-950 transition-all duration-200",
          // Mobile: full-width overlay, controlled by mobileOpen
          "md:relative md:flex",
          mobileOpen ? "flex w-64" : "hidden md:flex",
          // Desktop: collapsible
          collapsed ? "md:w-16" : "md:w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-3 border-b border-white/[0.06]">
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground truncate">Projects</span>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
          {/* Desktop collapse */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground ml-auto"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Project list */}
        <nav className="flex-1 overflow-y-auto py-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? project.displayName : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 mx-1 rounded-md text-sm transition-colors",
                isActive(project.id)
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              <FolderGit2 className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="truncate">{project.displayName}</span>
              )}
            </Link>
          ))}
          {projects.length === 0 && !collapsed && (
            <p className="px-4 py-3 text-xs text-muted-foreground">No projects yet.</p>
          )}
        </nav>

        {/* Settings link */}
        <div className="border-t border-white/[0.06] py-2">
          <Link
            href="/settings"
            title={collapsed ? "Settings" : undefined}
            className="flex items-center gap-3 px-3 py-2 mx-1 rounded-md text-sm text-muted-foreground hover:bg-white/[0.04] hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
