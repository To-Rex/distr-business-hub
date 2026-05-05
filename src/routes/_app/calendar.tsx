import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/calendar")({ component: CalendarPage });

const mockEvents: Record<string, { title: string; type: "meeting" | "delivery" | "deadline" }[]> = {
  "5": [{ title: "Team standup", type: "meeting" }, { title: "Order #ORD-3410", type: "delivery" }],
  "8": [{ title: "Production due — PRD-555", type: "deadline" }],
  "12": [{ title: "Client visit — Mega Retail", type: "meeting" }],
  "15": [{ title: "Monthly report", type: "deadline" }],
  "20": [{ title: "Warehouse audit", type: "meeting" }],
  "23": [{ title: "Delivery batch", type: "delivery" }],
  "28": [{ title: "Q-end review", type: "deadline" }],
};

const typeColors: Record<string, string> = {
  meeting: "bg-primary/15 text-primary",
  delivery: "bg-success/15 text-success",
  deadline: "bg-destructive/15 text-destructive",
};

function CalendarPage() {
  const { t } = useSettings();
  const [date, setDate] = useState(new Date(2026, 4, 1));
  const [selected, setSelected] = useState<number>(5);

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = date.toLocaleString(undefined, { month: "long", year: "numeric" });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayEvents = mockEvents[String(selected)] ?? [];

  return (
    <div>
      <PageHeader title={t("calendar")} description={t("calendarDesc")} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base capitalize">{monthName}</CardTitle>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => setDate(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setDate(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                <div key={d} className="text-xs font-medium text-muted-foreground text-center py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (d === null) return <div key={i} />;
                const has = mockEvents[String(d)];
                const isSel = d === selected;
                return (
                  <button key={i} onClick={() => setSelected(d)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-colors relative ${
                      isSel ? "bg-primary text-primary-foreground" : has ? "bg-accent text-accent-foreground hover:bg-primary/10" : "hover:bg-secondary"
                    }`}>
                    {d}
                    {has && !isSel && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t("upcoming")}</CardTitle></CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noEvents")}</p>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-semibold ${typeColors[e.type]}`}>
                      {selected}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">{e.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
