import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface ProjectHeaderProps {
  displayName: string;
  githubRepoOwner: string;
  githubRepoName: string;
}

export function ProjectHeader({
  displayName,
  githubRepoOwner,
  githubRepoName,
}: ProjectHeaderProps) {
  const repoUrl = `https://github.com/${githubRepoOwner}/${githubRepoName}`;

  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
      <h1 className="text-lg font-semibold text-foreground">{displayName}</h1>
      <Link
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>
          {githubRepoOwner}/{githubRepoName}
        </span>
        <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
}
