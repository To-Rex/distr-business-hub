import { jsx, jsxs } from "react/jsx-runtime";
import { n as cn, a as useSettings, P as PageHeader, C as Card, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell } from "./router-CTVAwSR8.js";
import "@tanstack/react-router";
import "react";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "lucide-react";
import "@tanstack/react-query";
import "@radix-ui/react-select";
const map = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  delivered: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  in_progress: "bg-accent text-accent-foreground border-accent",
  completed: "bg-success/10 text-success border-success/20",
  delayed: "bg-destructive/10 text-destructive border-destructive/20"
};
function StatusBadge({ status }) {
  const cls = map[status] ?? "bg-muted text-muted-foreground border-border";
  const label = status.replace("_", " ");
  return /* @__PURE__ */ jsx("span", { className: cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", cls), children: label });
}
const salesTrend = [
  { month: "Jan", sales: 32e3, revenue: 41e3 },
  { month: "Feb", sales: 28e3, revenue: 38e3 },
  { month: "Mar", sales: 41e3, revenue: 52e3 },
  { month: "Apr", sales: 38e3, revenue: 47e3 },
  { month: "May", sales: 52e3, revenue: 64e3 },
  { month: "Jun", sales: 49e3, revenue: 61e3 },
  { month: "Jul", sales: 61e3, revenue: 73e3 },
  { month: "Aug", sales: 58e3, revenue: 7e4 },
  { month: "Sep", sales: 67e3, revenue: 81e3 },
  { month: "Oct", sales: 72e3, revenue: 88e3 },
  { month: "Nov", sales: 78e3, revenue: 95e3 },
  { month: "Dec", sales: 84e3, revenue: 102e3 }
];
({
  monthly: salesTrend.map((m) => ({
    month: m.month,
    income: m.revenue,
    expense: Math.round(m.revenue * 0.58)
  }))
});
const batches = [
  { id: "PRD-554", product: "Mineral Water 1.5L", quantity: 5e3, status: "completed", start: "2026-04-20", due: "2026-04-28" },
  { id: "PRD-555", product: "Cola 0.5L", quantity: 8e3, status: "in_progress", start: "2026-04-25", due: "2026-05-08" },
  { id: "PRD-556", product: "Juice 1L", quantity: 3200, status: "delayed", start: "2026-04-22", due: "2026-05-02" },
  { id: "PRD-557", product: "Snack Pack", quantity: 12e3, status: "in_progress", start: "2026-04-28", due: "2026-05-10" },
  { id: "PRD-558", product: "Detergent 3kg", quantity: 2400, status: "completed", start: "2026-04-15", due: "2026-04-26" },
  { id: "PRD-559", product: "Coffee 250g", quantity: 1800, status: "delayed", start: "2026-04-18", due: "2026-04-30" }
];
function ProductionPage() {
  const {
    t
  } = useSettings();
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("production"), description: t("productionDesc") }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: t("batch") }),
        /* @__PURE__ */ jsx(TableHead, { children: t("product") }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("quantity") }),
        /* @__PURE__ */ jsx(TableHead, { children: t("start") }),
        /* @__PURE__ */ jsx(TableHead, { children: t("due") }),
        /* @__PURE__ */ jsx(TableHead, { children: t("status") })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: batches.map((b) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-xs", children: b.id }),
        /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: b.product }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: b.quantity.toLocaleString() }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: b.start }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: b.due }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusBadge, { status: b.status }) })
      ] }, b.id)) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-[2px]", children: /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-white/30 bg-white/15 px-8 py-5 shadow-lg", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-semibold tracking-wide text-foreground", children: t("comingSoon") }) }) })
  ] });
}
export {
  ProductionPage as component
};
