import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatPanel } from "@/components/layout/chat-panel";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    select: {
      id: true,
      displayName: true,
      githubRepoOwner: true,
      githubRepoName: true,
    },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar projects={projects} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <ChatPanel />
    </div>
  );
}
