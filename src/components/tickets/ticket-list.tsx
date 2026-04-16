"use client";

import { TicketCard, type GitHubIssue } from "./ticket-card";

interface TicketListProps {
  owner: string;
  repo: string;
  issues: GitHubIssue[];
}

export function TicketList({ owner, repo, issues }: TicketListProps) {
  // GitHub API returns PRs as issues — filter them out
  const realIssues = issues.filter((issue) => !issue.pull_request);
  const openCount = realIssues.filter((issue) => issue.state === "open").length;

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Issues</h2>
        <span className="text-xs font-medium text-muted-foreground/50 bg-white/[0.04] px-2 py-0.5 rounded-full">
          {openCount} open
        </span>
      </div>

      {realIssues.length === 0 && (
        <div className="glass-card rounded-xl py-12 text-center">
          <p className="text-sm text-muted-foreground/50">
            No issues found for this repository.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {realIssues.map((issue) => (
          <TicketCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
