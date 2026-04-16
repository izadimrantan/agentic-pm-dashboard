import { BarChart3 } from "lucide-react";

interface Widget {
  id: string;
  widgetType: string;
  config: Record<string, unknown>;
  position: number;
}

interface AnalyticsDashboardProps {
  widgets: Widget[];
}

export function AnalyticsDashboard({ widgets }: AnalyticsDashboardProps) {
  if (widgets.length === 0) {
    return (
      <div className="glass-card rounded-xl py-16 text-center">
        <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/20" />
        <p className="mt-4 text-sm text-muted-foreground/50">
          No analytics widgets configured
        </p>
        <p className="mt-1 text-xs text-muted-foreground/30">
          Add MCP server connections in Settings to enable analytics
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {widgets.map((widget) => (
        <div key={widget.id} className="glass-card rounded-xl p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/40">
            {widget.widgetType}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">--</p>
          <p className="mt-1 text-[11px] text-muted-foreground/40">
            Connected via MCP
          </p>
        </div>
      ))}
    </div>
  );
}
