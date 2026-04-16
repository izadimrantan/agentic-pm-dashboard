"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Newspaper,
  Rocket,
  BarChart3,
  FileText,
  BookOpen,
  GitPullRequest,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TabBarProps {
  projectId: string;
}

const TABS = [
  { name: "Updates", slug: "updates", icon: Newspaper },
  { name: "Deployment", slug: "deployment", icon: Rocket },
  { name: "Analytics", slug: "analytics", icon: BarChart3 },
  { name: "Progress", slug: "progress", icon: FileText },
  { name: "Context", slug: "context", icon: BookOpen },
  { name: "Decisions", slug: "decisions", icon: GitPullRequest },
  { name: "Tickets", slug: "tickets", icon: Ticket },
] as const;

export function TabBar({ projectId }: TabBarProps) {
  const pathname = usePathname();

  return (
    <div className="border-b border-white/[0.04] overflow-x-auto bg-white/[0.01]">
      <nav className="flex min-w-max px-4 gap-1 py-1.5">
        {TABS.map(({ name, slug, icon: Icon }) => {
          const href = `/projects/${projectId}/${slug}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={slug}
              href={href}
              className={cn(
                "relative flex items-center gap-2 px-3.5 py-2 text-[13px] rounded-lg transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-white/[0.06] text-foreground font-medium"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.03]"
              )}
            >
              <Icon className={cn(
                "h-3.5 w-3.5",
                isActive ? "text-primary" : ""
              )} />
              <span>{name}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-primary shadow-[0_0_8px_oklch(0.78_0.154_194.769/0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
