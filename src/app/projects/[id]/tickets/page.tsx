import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRepoIssues } from "@/lib/github";
import { TicketList } from "@/components/tickets/ticket-list";
import type { GitHubIssue } from "@/components/tickets/ticket-card";

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      githubRepoOwner: true,
      githubRepoName: true,
    },
  });

  if (!project) notFound();

  let issues: GitHubIssue[] = [];
  try {
    const raw = await getRepoIssues(
      project.githubRepoOwner,
      project.githubRepoName,
      "all"
    );
    issues = raw as GitHubIssue[];
  } catch {
    // GitHub API unavailable or repo not accessible — fall back to empty
    issues = [];
  }

  return (
    <TicketList
      owner={project.githubRepoOwner}
      repo={project.githubRepoName}
      issues={issues}
    />
  );
}
