"use client";

import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GitHubDeployment {
  id: number;
  environment: string;
  ref: string;
  sha: string;
  description?: string | null;
  created_at: string;
  creator?: {
    login: string;
  } | null;
  statuses_url?: string;
  state?: string;
}

interface DeploymentConfig {
  url?: string;
  [key: string]: unknown;
}

interface DeploymentStatusProps {
  deployments: GitHubDeployment[];
  repoOwner: string;
  repoName: string;
  deploymentPlatform?: string | null;
  deploymentConfig?: DeploymentConfig | null;
}

function StatusIcon({ state }: { state?: string }) {
  if (state === "success") {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/[0.1]">
        <CheckCircle2 className="size-4 text-emerald-400" />
      </div>
    );
  }
  if (state === "failure" || state === "error") {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/[0.1]">
        <XCircle className="size-4 text-red-400" />
      </div>
    );
  }
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04]">
      <Loader2 className="size-4 animate-spin text-muted-foreground/50" />
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DeploymentStatus({
  deployments,
  repoOwner,
  repoName,
  deploymentPlatform,
  deploymentConfig,
}: DeploymentStatusProps) {
  const liveUrl = deploymentConfig?.url;

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Deployment</h2>
        {liveUrl && (
          <Button
            variant="link"
            size="sm"
            render={<a href={liveUrl} target="_blank" rel="noopener noreferrer" />}
            className="text-xs text-primary/80 hover:text-primary gap-1.5 p-0 h-auto"
          >
            Live URL
            <ExternalLink className="size-3" />
          </Button>
        )}
      </div>

      {deploymentPlatform && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">Platform</span>
            <span className="text-sm font-medium">{deploymentPlatform}</span>
            {liveUrl && (
              <Button
                variant="link"
                size="sm"
                render={<a href={liveUrl} target="_blank" rel="noopener noreferrer" />}
                className="text-xs text-muted-foreground/40 hover:text-primary gap-1 p-0 h-auto mt-0.5 font-mono justify-start break-all"
              >
                {liveUrl}
                <ExternalLink className="size-3 shrink-0" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/40">
          GitHub Deployments
        </h3>

        {deployments.length === 0 ? (
          <div className="glass-card rounded-xl py-12 text-center">
            <p className="text-sm text-muted-foreground/50">
              No deployments found.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="glass-card rounded-xl px-4 py-3.5">
                <div className="flex items-start gap-3">
                  <StatusIcon state={deployment.state} />
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">
                        {deployment.environment}
                      </span>
                      <span className="text-[11px] text-muted-foreground/40 font-mono">
                        {deployment.ref} @ {deployment.sha.slice(0, 7)}
                      </span>
                    </div>

                    {deployment.description && (
                      <p className="text-xs text-muted-foreground/50">
                        {deployment.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-muted-foreground/40">
                        {formatDate(deployment.created_at)}
                      </span>
                      {deployment.creator?.login && (
                        <span className="text-[11px] text-muted-foreground/40">
                          by {deployment.creator.login}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
