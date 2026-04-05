"use client";

import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

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
  // GitHub deployments don't include status inline; we use a synthetic field
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
    return <CheckCircle2 className="size-5 shrink-0 text-green-500" />;
  }
  if (state === "failure" || state === "error") {
    return <XCircle className="size-5 shrink-0 text-red-500" />;
  }
  return (
    <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
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
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Deployment</h2>
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Live URL
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>

      {deploymentPlatform && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{deploymentPlatform}</span>
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline break-all"
                >
                  {liveUrl}
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          GitHub Deployments — {repoOwner}/{repoName}
        </h3>

        {deployments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No deployments found.
          </p>
        ) : (
          deployments.map((deployment) => (
            <Card key={deployment.id} className="glass">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <StatusIcon state={deployment.state} />
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">
                        {deployment.environment}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ref: {deployment.ref}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {deployment.sha.slice(0, 7)}
                      </span>
                    </div>

                    {deployment.description && (
                      <p className="text-xs text-muted-foreground">
                        {deployment.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(deployment.created_at)}
                      </span>
                      {deployment.creator?.login && (
                        <span className="text-xs text-muted-foreground">
                          by {deployment.creator.login}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
