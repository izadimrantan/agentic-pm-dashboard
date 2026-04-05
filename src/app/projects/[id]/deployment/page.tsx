import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRepoDeployments } from "@/lib/github";
import { DeploymentStatus } from "@/components/deployment/deployment-status";

export default async function DeploymentPage({
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
      deploymentPlatform: true,
      deploymentConfig: true,
    },
  });

  if (!project) notFound();

  let deployments: unknown[] = [];
  try {
    deployments = await getRepoDeployments(
      project.githubRepoOwner,
      project.githubRepoName
    );
  } catch {
    // GitHub API unavailable or repo has no deployments — fall back to empty
    deployments = [];
  }

  return (
    <DeploymentStatus
      deployments={deployments as Parameters<typeof DeploymentStatus>[0]["deployments"]}
      repoOwner={project.githubRepoOwner}
      repoName={project.githubRepoName}
      deploymentPlatform={project.deploymentPlatform}
      deploymentConfig={
        project.deploymentConfig as { url?: string } | null | undefined
      }
    />
  );
}
