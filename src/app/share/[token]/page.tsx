import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectHeader } from "@/components/layout/project-header";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          updates: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  if (!shareLink) {
    notFound();
  }

  if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
    notFound();
  }

  // Project-scoped share link
  if (shareLink.projectId && shareLink.project) {
    const project = shareLink.project;

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <Badge variant="secondary">Read-only view</Badge>
          </div>

          <ProjectHeader
            displayName={project.displayName}
            githubRepoOwner={project.githubRepoOwner}
            githubRepoName={project.githubRepoName}
          />

          <div className="mt-8 flex flex-col gap-6">
            <h2 className="text-xl font-semibold">Latest Updates</h2>

            {project.updates.length === 0 && (
              <p className="text-sm text-muted-foreground">No updates yet.</p>
            )}

            {project.updates.map((update) => (
              <Card key={update.id} className="glass">
                <CardHeader>
                  <CardTitle>{update.title}</CardTitle>
                  <CardAction>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{update.author}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(update.createdAt)}
                      </span>
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <MarkdownRenderer content={update.content} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Global share link — show all projects with their latest update
  const projects = await prisma.project.findMany({
    orderBy: { displayName: "asc" },
    include: {
      updates: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-2xl font-bold">All Projects</h1>
          <Badge variant="secondary">Read-only view</Badge>
        </div>

        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        )}

        <div className="flex flex-col gap-6">
          {projects.map((project) => {
            const latestUpdate = project.updates[0];

            return (
              <Card key={project.id} className="glass">
                <CardHeader>
                  <CardTitle>{project.displayName}</CardTitle>
                  <CardAction>
                    <span className="text-xs text-muted-foreground">
                      {project.githubRepoOwner}/{project.githubRepoName}
                    </span>
                  </CardAction>
                </CardHeader>

                {latestUpdate ? (
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium">
                        {latestUpdate.title}
                      </span>
                      <Badge variant="secondary">{latestUpdate.author}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(latestUpdate.createdAt)}
                      </span>
                    </div>
                    <MarkdownRenderer content={latestUpdate.content} />
                  </CardContent>
                ) : (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      No updates yet.
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
