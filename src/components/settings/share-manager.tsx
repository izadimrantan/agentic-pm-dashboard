"use client";

import { useState } from "react";
import { Copy, Check, Trash2, Plus, Link2 } from "lucide-react";
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
        <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground/70">
          Share Links
        </h2>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={creating}
          variant="ghost"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
        >
          <Plus className="h-3.5 w-3.5" />
          {creating ? "Creating..." : "New Link (All Projects)"}
        </Button>
      </div>

      {links.length === 0 && (
        <div className="glass-card rounded-xl py-8 text-center">
          <Link2 className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground/50">
            No share links yet
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        {links.map((link) => (
          <div
            key={link.id}
            className="group glass-card rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono text-foreground/80">
                  {truncateToken(link.token)}
                </span>
                {link.project ? (
                  <Badge variant="secondary" className="text-[10px] font-normal bg-white/[0.04] border-white/[0.06] text-muted-foreground">
                    {link.project.displayName}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] font-normal bg-primary/[0.06] border-primary/[0.1] text-primary/80">
                    All Projects
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground/40">
                <span>Created {formatDate(link.createdAt)}</span>
                {link.expiresAt && (
                  <span>Expires {formatDate(link.expiresAt)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground/40 hover:text-foreground"
                onClick={() => handleCopy(link)}
              >
                {copiedId === link.id ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">Copy link</span>
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground/40 hover:text-destructive"
                disabled={deletingId === link.id}
                onClick={() => handleDelete(link.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Delete link</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
