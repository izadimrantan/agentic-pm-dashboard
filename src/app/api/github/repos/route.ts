import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getUserRepos } from "@/lib/github";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repos = await getUserRepos();
    return NextResponse.json(repos);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch repos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
