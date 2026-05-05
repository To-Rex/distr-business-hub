import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings";
import { Bell, CheckCircle2, AlertTriangle, ShoppingCart, Users } from "lucide-react";

export const Route = createFileRoute("/_app/notifications")({ component: NotificationsPage });

const initialList = [
  { id: 1, icon: ShoppingCart, title: "New order #ORD-3411", desc: "Mega Retail LLC placed an order — $14,200", time: "5m", read: false, color: "primary" },
  { id: 2, icon: AlertTriangle, title: "Low stock alert", desc: "Coffee 250g below threshold (38 left)", time: "1h", read: false, color: "destructive" },
  { id: 3, icon: CheckCircle2, title: "Batch completed", desc: "PRD-558 — Detergent 3kg (2,400 units)", time: "3h", read: false, color: "success" },
  { id: 4, icon: Users, title: "New client added", desc: "Tashkent Foods joined your client list", time: "5h", read: true, color: "primary" },
  { id: 5, icon: Bell, title: "Reminder", desc: "Monthly report deadline tomorrow", time: "1d", read: true, color: "warning" },
  { id: 6, icon: ShoppingCart, title: "Order delivered", desc: "#ORD-3407 — Khiva Wholesale", time: "2d", read: true, color: "success" },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground",
};

function NotificationsPage() {
  const { t } = useSettings();
  const [list, setList] = useState(initialList);
  const unread = list.filter((n) => !n.read).length;
  return (
    <div>
      <PageHeader title={t("notifications")} description={t("notificationsDesc")}
        actions={<Button variant="outline" onClick={() => setList((p) => p.map((n) => ({ ...n, read: true })))}>{t("markRead")}</Button>}
      />
      <Card className="divide-y">
        {list.map((n) => {
          const Icon = n.icon;
          return (
            <div key={n.id} className={`flex items-start gap-4 p-4 ${!n.read ? "bg-accent/30" : ""}`}>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[n.color]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{n.title}</span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
            </div>
          );
        })}
      </Card>
      <p className="text-xs text-muted-foreground mt-3">{unread} {t("new")}</p>
    </div>
  );
}
