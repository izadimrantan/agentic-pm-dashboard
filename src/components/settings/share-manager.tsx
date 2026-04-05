"use client";

import { useState } from "react";
import { Copy, Check, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  displayName: string;
  githubRepoOwner: string;
  githubRepoName: string;
}

interface ShareLink {
  id: string;
  token: string;
  projectId: string | null;
  expiresAt: string | null;
  createdAt: string;
  project?: {
    id: string;
    displayName: string;
    githubRepoOwner: string;
    githubRepoName: string;
  } | null;
}

interface ShareManagerProps {
  initialLinks: ShareLink[];
  projects: Project[];
}

export function ShareManager({ initialLinks }: ShareManagerProps) {
  const [links, setLinks] = useState<ShareLink[]>(initialLinks);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to create share link");
      const newLink: ShareLink = await res.json();
      setLinks((prev) => [newLink, ...prev]);
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/share?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete share link");
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  function handleCopy(link: ShareLink) {
    const url = `${window.location.origin}/share/${link.token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function truncateToken(token: string) {
    return token.slice(0, 8) + "...";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Share Links</h2>
        <Button size="sm" onClick={handleCreate} disabled={creating} variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          {creating ? "Creating..." : "New Link (All Projects)"}
        </Button>
      </div>

      {links.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No share links yet. Create one to share your dashboard.
        </p>
      )}

      <div className="space-y-2">
        {links.map((link) => (
          <div
            key={link.id}
            className="glass rounded-lg px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono text-foreground">
                  {truncateToken(link.token)}
                </span>
                {link.project ? (
                  <Badge variant="secondary" className="text-xs">
                    {link.project.displayName}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    All Projects
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Created {formatDate(link.createdAt)}</span>
                {link.expiresAt && (
                  <span>Expires {formatDate(link.expiresAt)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(link)}
              >
                {copiedId === link.id ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy link</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                disabled={deletingId === link.id}
                onClick={() => handleDelete(link.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete link</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
