import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UpdateList } from "@/components/updates/update-list";

export default async function UpdatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!project) notFound();

  const updates = await prisma.update.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  const serialized = JSON.parse(JSON.stringify(updates));

  return <UpdateList projectId={id} initialUpdates={serialized} />;
}
