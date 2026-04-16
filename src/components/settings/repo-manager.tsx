"use client";

import { useState } from "react";
import { FolderGit2, Trash2, Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  displayName: string;
  githubRepoOwner: string;
  githubRepoName: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  description: string | null;
  private: boolean;
}

interface RepoManagerProps {
  initialProjects: Project[];
}

export function RepoManager({ initialProjects }: RepoManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showPicker, setShowPicker] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingRepo, setAddingRepo] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const connectedKeys = new Set(
    projects.map((p) => `${p.githubRepoOwner}/${p.githubRepoName}`)
  );

  const filteredRepos = repos.filter((repo) => {
    if (connectedKeys.has(repo.full_name)) return false;
    if (!searchQuery) return true;
    return repo.full_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  async function openPicker() {
    setShowPicker(true);
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/github/repos");
      if (!res.ok) throw new Error("Failed to load repos");
      const data = await res.json();
      setRepos(data);
    } catch {
      // ignore
    } finally {
      setLoadingRepos(false);
    }
  }

  function closePicker() {
    setShowPicker(false);
    setSearchQuery("");
  }

  async function handleAdd(repo: GitHubRepo) {
    setAddingRepo(repo.full_name);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubRepoOwner: repo.owner.login,
          githubRepoName: repo.name,
          displayName: repo.name,
        }),
      });
      if (!res.ok) throw new Error("Failed to add project");
      const newProject: Project = await res.json();
      setProjects((prev) => [...prev, newProject]);
    } catch {
      // ignore
    } finally {
      setAddingRepo(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground/70">
          Connected Repositories
        </h2>
        <Button
          size="sm"
          onClick={openPicker}
          variant="ghost"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Repository
        </Button>
      </div>

      {projects.length === 0 && (
        <div className="glass-card rounded-xl py-8 text-center">
          <FolderGit2 className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground/50">
            No repositories connected yet
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group glass-card rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
                <FolderGit2 className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {project.displayName}
                </p>
                <p className="text-xs text-muted-foreground/50 font-mono truncate">
                  {project.githubRepoOwner}/{project.githubRepoName}
                </p>
              </div>
            </div>
            <Button
              size="icon-sm"
              variant="ghost"
              className="shrink-0 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={deletingId === project.id}
              onClick={() => handleDelete(project.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ))}
      </div>

      {showPicker && (
        <div className="glass-strong rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Select a Repository</p>
            <button
              onClick={closePicker}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.04] transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/[0.03] border-white/[0.06]"
            />
          </div>

          {loadingRepos ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          ) : filteredRepos.length === 0 ? (
            <p className="text-sm text-muted-foreground/50 py-6 text-center">
              {repos.length === 0 ? "No repositories found." : "No unconnected repositories match your search."}
            </p>
          ) : (
            <div className="space-y-0.5 max-h-64 overflow-y-auto">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate font-mono">{repo.full_name}</p>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground/50 truncate mt-0.5">{repo.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={addingRepo === repo.full_name}
                    onClick={() => handleAdd(repo)}
                    className="shrink-0 text-xs text-primary hover:text-primary hover:bg-primary/[0.08]"
                  >
                    {addingRepo === repo.full_name ? "Adding..." : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
