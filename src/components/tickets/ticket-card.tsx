import { CircleDot, CircleCheck, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GitHubLabel {
  id: number;
  name: string;
  color: string;
}

interface GitHubUser {
  login: string;
  avatar_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string;
  user: GitHubUser | null;
  labels: GitHubLabel[];
  comments: number;
  pull_request?: unknown;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface TicketCardProps {
  issue: GitHubIssue;
}

export function TicketCard({ issue }: TicketCardProps) {
  const isOpen = issue.state === "open";

  return (
    <div className="glass-card rounded-xl px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {isOpen ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/[0.1]">
              <CircleDot className="size-3.5 text-emerald-400" />
            </div>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/[0.1]">
              <CircleCheck className="size-3.5 text-purple-400" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <Button
            variant="link"
            size="sm"
            render={<a href={issue.html_url} target="_blank" rel="noopener noreferrer" />}
            className="font-medium text-[13px] leading-snug hover:text-primary p-0 h-auto text-foreground justify-start break-words whitespace-normal text-left"
          >
            {issue.title}
          </Button>

          <p className="text-[11px] text-muted-foreground/50">
            #{issue.number} opened {formatDate(issue.created_at)}
            {issue.user ? ` by ${issue.user.login}` : ""}
          </p>

          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {issue.labels.map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-[10px] font-medium"
                  style={{
                    backgroundColor: `#${label.color}15`,
                    color: `#${label.color}`,
                    borderColor: `#${label.color}30`,
                  }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {issue.comments > 0 && (
          <div className="flex items-center gap-1 shrink-0 text-[11px] text-muted-foreground/40">
            <MessageSquare className="size-3" />
            <span>{issue.comments}</span>
          </div>
        )}
      </div>
    </div>
  );
}
