"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TicketCard, type GitHubIssue } from "./ticket-card";
import { TicketForm } from "./ticket-form";

interface TicketListProps {
  owner: string;
  repo: string;
  issues: GitHubIssue[];
}

export function TicketList({ owner, repo, issues }: TicketListProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  // GitHub API returns PRs as issues — filter them out
  const realIssues = issues.filter((issue) => !issue.pull_request);
  const openCount = realIssues.filter((issue) => issue.state === "open").length;

  function handleCreated() {
    setShowForm(false);
    router.refresh();
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Issues</h2>
          <span className="text-sm text-muted-foreground">
            {openCount} open
          </span>
        </div>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            New Issue
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="glass">
          <CardContent className="pt-4">
            <TicketForm
              owner={owner}
              repo={repo}
              onCreated={handleCreated}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {realIssues.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">
          No issues found. Create the first one.
        </p>
      )}

      {realIssues.map((issue) => (
        <TicketCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
