import { FolderGit2 } from "lucide-react";

export default function ProjectsIndexPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.04]">
          <FolderGit2 className="h-6 w-6 text-muted-foreground/30" />
        </div>
        <h2 className="mt-5 text-sm font-medium text-foreground/70">No project selected</h2>
        <p className="mt-1.5 text-xs text-muted-foreground/40">
          Choose a project from the sidebar to get started
        </p>
      </div>
    </div>
  );
}
