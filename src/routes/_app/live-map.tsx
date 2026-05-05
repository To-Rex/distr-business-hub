import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agents as initialAgents } from "@/lib/mock-data";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/_app/live-map")({
  component: LiveMapPage,
});

function LiveMapPage() {
  const [agents, setAgents] = useState(initialAgents);

  useEffect(() => {
    const id = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          x: Math.max(4, Math.min(96, a.x + (Math.random() - 0.5) * 4)),
          y: Math.max(4, Math.min(96, a.y + (Math.random() - 0.5) * 4)),
        }))
      );
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <PageHeader title="Live Map" description="Real-time tracking of field agents and deliveries." />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 overflow-hidden">
          <div
            className="relative w-full aspect-[16/10] bg-[oklch(0.96_0.02_220)]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          >
            {/* fake "roads" */}
            <div className="absolute inset-x-0 top-1/2 h-1 bg-[oklch(0.85_0.03_220)]" />
            <div className="absolute inset-y-0 left-1/2 w-1 bg-[oklch(0.85_0.03_220)]" />
            <div className="absolute inset-x-0 top-1/4 h-0.5 bg-[oklch(0.88_0.03_220)]" />
            <div className="absolute inset-y-0 left-1/4 w-0.5 bg-[oklch(0.88_0.03_220)]" />

            {agents.map((a) => (
              <div
                key={a.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
                style={{ left: `${a.x}%`, top: `${a.y}%` }}
              >
                <div className="relative">
                  <span className="absolute inset-0 -m-2 rounded-full animate-ping" style={{ backgroundColor: a.color, opacity: 0.3 }} />
                  <div className="relative h-4 w-4 rounded-full ring-2 ring-white shadow-md" style={{ backgroundColor: a.color }} />
                </div>
                <div className="mt-1 text-xs font-medium bg-card border rounded px-1.5 py-0.5 shadow-sm whitespace-nowrap">
                  {a.name}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Active agents</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {agents.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: a.color }}>
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ({a.x.toFixed(1)}, {a.y.toFixed(1)})
                  </div>
                </div>
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
