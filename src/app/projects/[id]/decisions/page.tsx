import { prisma } from "@/lib/prisma";
import { getRepoFile } from "@/lib/github";
import { notFound } from "next/navigation";
import { GitPullRequest } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export default async function DecisionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { githubRepoOwner: true, githubRepoName: true },
  });

  if (!project) notFound();

  const content = await getRepoFile(
    project.githubRepoOwner,
    project.githubRepoName,
    "vibecode/DECISIONS.md"
  );

  if (!content) {
    return (
      <div className="p-6">
        <div className="glass-card rounded-xl py-16 text-center">
          <GitPullRequest className="mx-auto h-8 w-8 text-muted-foreground/20" />
          <h2 className="mt-4 text-sm font-medium text-muted-foreground/50">Decisions</h2>
          <p className="mt-1 text-xs text-muted-foreground/30">
            No vibecode/DECISIONS.md found in this repository.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="glass-card rounded-xl p-6">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}
