import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId query parameter is required" },
      { status: 400 }
    );
  }

  const updates = await prisma.update.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(updates);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, title, content } = body;

  if (!projectId || !title || !content) {
    return NextResponse.json(
      { error: "projectId, title, and content are required" },
      { status: 400 }
    );
  }

  const update = await prisma.update.create({
    data: {
      projectId,
      title,
      content,
      author: session.user.name ?? "Unknown",
    },
  });

  return NextResponse.json(update, { status: 201 });
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

  await prisma.update.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
