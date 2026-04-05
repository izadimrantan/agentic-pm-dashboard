import { prisma } from "@/lib/prisma";
import { getRepoFile } from "@/lib/github";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export default async function ContextPage({
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
    "vibecode/PROJECT_CONTEXT.md"
  );

  if (!content) {
    return (
      <div>
        <h2 className="text-lg font-semibold">Project Context</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No vibecode/PROJECT_CONTEXT.md found in this repository.
        </p>
      </div>
    );
  }

  return <MarkdownRenderer content={content} />;
}
