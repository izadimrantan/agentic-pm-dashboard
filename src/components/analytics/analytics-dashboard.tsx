import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
      <Card className="col-span-full w-full">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-center text-sm text-muted-foreground">
            No analytics widgets configured. Add MCP server connections in
            Settings to enable analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {widgets.map((widget) => (
        <Card key={widget.id}>
          <CardHeader>
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {widget.widgetType}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">--</p>
            <CardDescription className="mt-1 text-xs">
              Connected via MCP
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
