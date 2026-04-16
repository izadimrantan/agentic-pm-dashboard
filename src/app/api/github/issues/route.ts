import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getRepoIssues } from "@/lib/github";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const state = (searchParams.get("state") ?? "open") as
    | "open"
    | "closed"
    | "all";

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "owner and repo are required" },
      { status: 400 }
    );
  }

  try {
    const issues = await getRepoIssues(owner, repo, state);
    return NextResponse.json(issues);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch issues";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
