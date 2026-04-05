import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { AnalyticsQuery } from "@/components/analytics/analytics-query";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      widgets: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          widgetType: true,
          config: true,
          position: true,
        },
      },
    },
  });

  if (!project) notFound();

  const widgets = JSON.parse(JSON.stringify(project.widgets));

  return (
    <div className="flex flex-col gap-6 p-6">
      <AnalyticsDashboard widgets={widgets} />
      <AnalyticsQuery projectId={project.id} projectName={project.displayName} />
    </div>
  );
}
