import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { githubRepoOwner, githubRepoName, displayName } = body;

  if (!githubRepoOwner || !githubRepoName || !displayName) {
    return NextResponse.json(
      { error: "githubRepoOwner, githubRepoName, and displayName are required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      githubRepoOwner,
      githubRepoName,
      displayName,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "id query parameter is required" },
      { status: 400 }
    );
  }

  await prisma.project.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
