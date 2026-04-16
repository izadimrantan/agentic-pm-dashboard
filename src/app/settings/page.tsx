import { prisma } from "@/lib/prisma";
import { RepoManager } from "@/components/settings/repo-manager";
import { McpConfig } from "@/components/settings/mcp-config";
import { ShareManager } from "@/components/settings/share-manager";
import { Separator } from "@/components/ui/separator";

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
    <div className="max-w-2xl mx-auto p-8 space-y-10">
      <div>
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
          Configuration
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground/60 leading-relaxed">
          Manage connected repositories, share links, and agent configuration.
        </p>
      </div>

      <RepoManager initialProjects={serializedProjects} />

      <Separator className="bg-white/[0.04]" />

      <McpConfig />

      <Separator className="bg-white/[0.04]" />

      <ShareManager initialLinks={serializedLinks} projects={serializedProjects} />
    </div>
  );
}
