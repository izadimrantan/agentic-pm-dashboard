"use client";

import { useState } from "react";
import { FolderGit2, Trash2, Plus, X } from "lucide-react";
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
        <h2 className="text-lg font-semibold text-foreground">Connected Repositories</h2>
        <Button size="sm" onClick={openPicker} variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Repository
        </Button>
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No repositories connected yet. Add one to get started.
        </p>
      )}

      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className="glass rounded-lg px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FolderGit2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {project.displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {project.githubRepoOwner}/{project.githubRepoName}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              disabled={deletingId === project.id}
              onClick={() => handleDelete(project.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ))}
      </div>

      {showPicker && (
        <div className="glass rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Select a Repository</p>
            <button
              onClick={closePicker}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loadingRepos ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Loading repositories...
            </p>
          ) : filteredRepos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {repos.length === 0 ? "No repositories found." : "No unconnected repositories match your search."}
            </p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{repo.full_name}</p>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground truncate">{repo.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={addingRepo === repo.full_name}
                    onClick={() => handleAdd(repo)}
                    className="shrink-0"
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
