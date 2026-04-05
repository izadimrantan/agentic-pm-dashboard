import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createRepoIssue, updateRepoIssue } from "@/lib/github";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { owner, repo, title, body: issueBody, labels } = body;

  if (!owner || !repo || !title) {
    return NextResponse.json(
      { error: "owner, repo, and title are required" },
      { status: 400 }
    );
  }

  try {
    const issue = await createRepoIssue(
      owner,
      repo,
      title,
      issueBody ?? "",
      labels
    );
    return NextResponse.json(issue, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create issue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { owner, repo, issueNumber, ...data } = body;

  if (!owner || !repo || !issueNumber) {
    return NextResponse.json(
      { error: "owner, repo, and issueNumber are required" },
      { status: 400 }
    );
  }

  try {
    const issue = await updateRepoIssue(owner, repo, issueNumber, data);
    return NextResponse.json(issue);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update issue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
