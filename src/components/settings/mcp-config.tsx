import { Cpu } from "lucide-react";

export function McpConfig() {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground/70">
        MCP Server Configuration
      </h2>
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] shrink-0">
            <Cpu className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            MCP server configuration is managed on the OpenClaw side. Configure your
            agent&apos;s MCP connections in your OpenClaw Gateway settings.
          </p>
        </div>
      </div>
    </div>
  );
}
