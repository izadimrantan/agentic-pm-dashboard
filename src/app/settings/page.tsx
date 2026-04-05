import { prisma } from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";
import { RepoManager } from "@/components/settings/repo-manager";
import { McpConfig } from "@/components/settings/mcp-config";
import { ShareManager } from "@/components/settings/share-manager";

export default async function SettingsPage() {
  const [projects, shareLinks] = await Promise.all([
    prisma.project.findMany({ orderBy: { displayName: "asc" } }),
    prisma.shareLink.findMany({
      include: {
        project: {
          select: {
            id: true,
            displayName: true,
            githubRepoOwner: true,
            githubRepoName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Serialize dates for client components
  const serializedProjects = projects.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    githubRepoOwner: p.githubRepoOwner,
    githubRepoName: p.githubRepoName,
  }));

  const serializedLinks = shareLinks.map((l) => ({
    id: l.id,
    token: l.token,
    projectId: l.projectId,
    expiresAt: l.expiresAt ? l.expiresAt.toISOString() : null,
    createdAt: l.createdAt.toISOString(),
    project: l.project ?? null,
  }));

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your connected repositories, share links, and agent configuration.
        </p>
      </div>

      <RepoManager initialProjects={serializedProjects} />

      <Separator />

      <McpConfig />

      <Separator />

      <ShareManager initialLinks={serializedLinks} projects={serializedProjects} />
    </div>
  );
}
