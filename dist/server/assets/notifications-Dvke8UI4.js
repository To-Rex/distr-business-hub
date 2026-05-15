import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { a as useSettings, P as PageHeader, B as Button, C as Card } from "./router-CTVAwSR8.js";
import { ShoppingCart, AlertTriangle, CheckCircle2, Users, Bell } from "lucide-react";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
const initialList = [{
  id: 1,
  icon: ShoppingCart,
  title: "New order #ORD-3411",
  desc: "Mega Retail LLC placed an order — $14,200",
  time: "5m",
  read: false,
  color: "primary"
}, {
  id: 2,
  icon: AlertTriangle,
  title: "Low stock alert",
  desc: "Coffee 250g below threshold (38 left)",
  time: "1h",
  read: false,
  color: "destructive"
}, {
  id: 3,
  icon: CheckCircle2,
  title: "Batch completed",
  desc: "PRD-558 — Detergent 3kg (2,400 units)",
  time: "3h",
  read: false,
  color: "success"
}, {
  id: 4,
  icon: Users,
  title: "New client added",
  desc: "Tashkent Foods joined your client list",
  time: "5h",
  read: true,
  color: "primary"
}, {
  id: 5,
  icon: Bell,
  title: "Reminder",
  desc: "Monthly report deadline tomorrow",
  time: "1d",
  read: true,
  color: "warning"
}, {
  id: 6,
  icon: ShoppingCart,
  title: "Order delivered",
  desc: "#ORD-3407 — Khiva Wholesale",
  time: "2d",
  read: true,
  color: "success"
}];
const colorMap = {
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground"
};
function NotificationsPage() {
  const {
    t
  } = useSettings();
  const [list, setList] = useState(initialList);
  const unread = list.filter((n) => !n.read).length;
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("notifications"), description: t("notificationsDesc"), actions: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setList((p) => p.map((n) => ({
      ...n,
      read: true
    }))), children: t("markRead") }) }),
    /* @__PURE__ */ jsx(Card, { className: "divide-y", children: list.map((n) => {
      const Icon = n.icon;
      return /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-4 p-4 ${!n.read ? "bg-accent/30" : ""}`, children: [
        /* @__PURE__ */ jsx("div", { className: `h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[n.color]}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: t(`notificationTitle${n.id}`) }),
            !n.read && /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: t(`notificationDesc${n.id}`) })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: t(`notificationTime${n.id}`) })
      ] }, n.id);
    }) }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-3", children: [
      unread,
      " ",
      t("new")
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-[2px]", children: /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-white/30 bg-white/15 px-8 py-5 shadow-lg", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-semibold tracking-wide text-foreground", children: t("comingSoon") }) }) })
  ] });
}
export {
  NotificationsPage as component
};
