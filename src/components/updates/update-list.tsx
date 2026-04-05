"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Update } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
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
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Latest Updates</h2>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            New Update
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="glass">
          <CardContent className="pt-4">
            <UpdateForm
              onSubmit={submitting ? () => {} : handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {updates.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">
          No updates yet. Create the first one.
        </p>
      )}

      {updates.map((update) => (
        <Card key={update.id} className="glass">
          <CardHeader>
            <CardTitle>{update.title}</CardTitle>
            <CardAction>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{update.author}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(update.createdAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete update"
                  disabled={deletingId === update.id}
                  onClick={() => handleDelete(update.id)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={update.content} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
