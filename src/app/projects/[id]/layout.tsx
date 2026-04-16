import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectHeader } from "@/components/layout/project-header";
import { TabBar } from "@/components/layout/tab-bar";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      githubRepoOwner: true,
      githubRepoName: true,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0">
        <ProjectHeader
          displayName={project.displayName}
          githubRepoOwner={project.githubRepoOwner}
          githubRepoName={project.githubRepoName}
        />
        <TabBar projectId={project.id} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
