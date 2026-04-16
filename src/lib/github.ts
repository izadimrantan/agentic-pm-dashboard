import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export function getGitHubToken(): string {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    throw new Error("GITHUB_PAT environment variable is not set");
  }
  return token;
}

export async function requireAuth(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
}

export async function githubFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const token = getGitHubToken();

  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText} for ${path}`
    );
  }

  return response;
}

export async function getRepoFile(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const response = await githubFetch(
      `/repos/${owner}/${repo}/contents/${path}`
    );
    const data = await response.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return content;
  } catch {
    return null;
  }
}

export async function getRepoIssues(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open"
): Promise<unknown[]> {
  const response = await githubFetch(
    `/repos/${owner}/${repo}/issues?state=${state}&per_page=50&sort=updated`
  );
  return response.json();
}

export async function getRepoCommits(
  owner: string,
  repo: string,
  perPage: number = 10
): Promise<unknown[]> {
  const response = await githubFetch(
    `/repos/${owner}/${repo}/commits?per_page=${perPage}`
  );
  return response.json();
}

export async function getRepoPulls(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "all"
): Promise<unknown[]> {
  const response = await githubFetch(
    `/repos/${owner}/${repo}/pulls?state=${state}&per_page=20&sort=updated`
  );
  return response.json();
}

export async function getRepoDeployments(
  owner: string,
  repo: string
): Promise<unknown[]> {
  const response = await githubFetch(
    `/repos/${owner}/${repo}/deployments?per_page=5`
  );
  return response.json();
}

export async function getUserRepos(): Promise<unknown[]> {
  const response = await githubFetch(
    `/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member`
  );
  return response.json();
}
