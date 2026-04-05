import { FolderGit2 } from "lucide-react";

export default function ProjectsIndexPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-medium text-foreground">No project selected</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a project from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
