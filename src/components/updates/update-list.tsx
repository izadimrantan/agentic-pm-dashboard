"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Update } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { UpdateForm } from "./update-form";

interface UpdateListProps {
  projectId: string;
  initialUpdates: Update[];
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UpdateList({ projectId, initialUpdates }: UpdateListProps) {
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(title: string, content: string) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title, content }),
      });
      if (!res.ok) throw new Error("Failed to create update");
      const created: Update = await res.json();
      setUpdates((prev) => [created, ...prev]);
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/updates?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete update");
      setUpdates((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Latest Updates</h2>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            variant="ghost"
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
          >
            <Plus className="size-3.5" />
            New Update
          </Button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-5">
          <UpdateForm
            onSubmit={submitting ? () => {} : handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {updates.length === 0 && !showForm && (
        <div className="glass-card rounded-xl py-12 text-center">
          <p className="text-sm text-muted-foreground/50">
            No updates yet. Create the first one.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {updates.map((update) => (
          <div key={update.id} className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <h3 className="font-medium text-sm truncate">{update.title}</h3>
                <Badge variant="secondary" className="text-[10px] font-normal bg-white/[0.04] border-white/[0.06] text-muted-foreground shrink-0">
                  {update.author}
                </Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground/40">
                  {formatDate(update.createdAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete update"
                  disabled={deletingId === update.id}
                  onClick={() => handleDelete(update.id)}
                  className="text-muted-foreground/30 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
            <MarkdownRenderer content={update.content} />
          </div>
        ))}
      </div>
    </div>
  );
}
