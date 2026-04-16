"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface UpdateFormProps {
  onSubmit: (title: string, content: string) => void;
  onCancel: () => void;
}

export function UpdateForm({ onSubmit, onCancel }: UpdateFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit(title.trim(), content.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="update-title" className="text-xs text-muted-foreground/60">Title</Label>
        <Input
          id="update-title"
          placeholder="Update title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-white/[0.02] border-white/[0.06] focus-visible:border-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="update-content" className="text-xs text-muted-foreground/60">Content (Markdown)</Label>
        <Textarea
          id="update-content"
          placeholder="Write your update in Markdown..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
          className="resize-none bg-white/[0.02] border-white/[0.06] focus-visible:border-primary/20"
        />
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-xs text-muted-foreground">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!title.trim() || !content.trim()}
          className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          variant="ghost"
        >
          Save
        </Button>
      </div>
    </form>
  );
}
