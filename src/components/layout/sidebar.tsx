"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2, Settings, ChevronLeft, ChevronRight, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 h-9 w-9 rounded-xl glass-card text-muted-foreground hover:text-foreground md:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.04] transition-all duration-300 ease-out",
          "bg-[oklch(0.06_0.005_260)]",
          "md:relative md:flex",
          mobileOpen ? "flex w-64" : "hidden md:flex",
          collapsed ? "md:w-16" : "md:w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-3 border-b border-white/[0.04]">
          {!collapsed && (
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground/70 pl-1">
              Projects
            </span>
          )}
          {/* Mobile close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="ml-auto h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
          {/* Desktop collapse */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-7 w-7 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.04] ml-auto"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Project list */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="flex flex-col gap-0.5">
            {projects.map((project) => {
              const active = isActive(project.id);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? project.displayName : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                    active
                      ? "bg-white/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.78_0.154_194.769/0.5)]" />
                  )}
                  <FolderGit2 className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-primary" : "text-muted-foreground/60 group-hover:text-muted-foreground"
                  )} />
                  {!collapsed && (
                    <span className="truncate font-medium text-[13px]">{project.displayName}</span>
                  )}
                </Link>
              );
            })}
            {projects.length === 0 && !collapsed && (
              <p className="px-3 py-6 text-xs text-muted-foreground/50 text-center">
                No projects yet
              </p>
            )}
          </div>
        </nav>

        {/* Settings link */}
        <div className="border-t border-white/[0.04] py-3 px-2">
          <Link
            href="/settings"
            title={collapsed ? "Settings" : undefined}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
              pathname === "/settings"
                ? "bg-white/[0.06] text-foreground"
                : "text-muted-foreground/60 hover:bg-white/[0.03] hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="text-[13px]">Settings</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
