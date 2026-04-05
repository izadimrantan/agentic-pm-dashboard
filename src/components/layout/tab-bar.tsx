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
    <div className="border-b border-white/[0.06] overflow-x-auto">
      <nav className="flex min-w-max px-6">
        {TABS.map(({ name, slug, icon: Icon }) => {
          const href = `/projects/${projectId}/${slug}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={slug}
              href={href}
              className={cn(
                "flex items-center gap-2 px-3 py-3 text-sm border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-white text-white"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
