import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const firstProject = await prisma.project.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (firstProject) {
    redirect(`/projects/${firstProject.id}`);
  }

  redirect("/settings");
}
