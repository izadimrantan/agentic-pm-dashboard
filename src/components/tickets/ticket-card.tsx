import { CircleDot, CircleCheck, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="glass">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {isOpen ? (
              <CircleDot className="size-5 text-green-500" />
            ) : (
              <CircleCheck className="size-5 text-purple-500" />
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sm leading-snug hover:text-primary hover:underline break-words"
            >
              {issue.title}
            </a>

            <p className="text-xs text-muted-foreground">
              #{issue.number} opened {formatDate(issue.created_at)}
              {issue.user ? ` by ${issue.user.login}` : ""}
            </p>

            {issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {issue.labels.map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                    style={{
                      borderColor: `#${label.color}`,
                      color: `#${label.color}`,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {issue.comments > 0 && (
            <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
              <MessageSquare className="size-3.5" />
              <span>{issue.comments}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
