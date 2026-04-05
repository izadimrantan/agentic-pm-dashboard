import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shareLinks = await prisma.shareLink.findMany({
    include: {
      project: {
        select: {
          id: true,
          displayName: true,
          githubRepoOwner: true,
          githubRepoName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(shareLinks);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, expiresAt } = body;

  const shareLink = await prisma.shareLink.create({
    data: {
      projectId: projectId ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
    include: {
      project: {
        select: {
          id: true,
          displayName: true,
          githubRepoOwner: true,
          githubRepoName: true,
        },
      },
    },
  });

  return NextResponse.json(shareLink, { status: 201 });
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

  await prisma.shareLink.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
