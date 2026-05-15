import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import { a as useSettings, u as useAuth, A as API, C as Card, g as CardContent, o as CardHeader, p as CardTitle, s as Skeleton, t as formatWithSpaces, v as getProxiedImageUrl } from "./router-CTVAwSR8.js";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Calendar, ArrowRight, AlertCircle, ShoppingBag, UsersRound, BarChart3, ShoppingCart, Camera, ImageOff, RotateCcw, Pickaxe, ChevronUp, ChevronDown, MapPinned, UserCheck } from "lucide-react";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bxa6R2gx.js";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-tabs";
const fmt = (n) => `${formatWithSpaces(n, 0)} UZS`;
const fmtShort = (n) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} mlrd`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} mln`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};
function fmtPercent(n) {
  if (Number.isInteger(n) || n === Math.round(n * 10) / 10) {
    const fixed = n.toFixed(1);
    return fixed.endsWith(".0") ? `${Math.round(n)}%` : `${fixed}%`;
  }
  return `${n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}%`;
}
function formatDisplayDate(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}
function toApiDate(value) {
  return value.replaceAll("-", "");
}
function todayIsoDate() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function monthStartIsoDate() {
  const now = /* @__PURE__ */ new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}
const COLORS = ["#342B6A", "#7C71B8", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];
function ClientRow({
  client
}) {
  const {
    t
  } = useSettings();
  const notVisited = !client.qty_visit || client.qty_visit === 0;
  return /* @__PURE__ */ jsxs("div", { className: `py-2 px-3 rounded-lg text-sm border ${notVisited ? "bg-red-500/5 border-red-500/20" : "bg-card border-border hover:border-primary/20"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: `h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${notVisited ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"}`, children: notVisited ? /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(UserCheck, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsx("div", { className: `font-medium text-xs truncate ${notVisited ? "text-red-600" : ""}`, children: client.client_name }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 shrink-0 ml-2", children: /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("div", { className: `font-semibold text-xs ${notVisited ? "text-red-500" : ""}`, children: fmt(client.summa || 0) }),
        /* @__PURE__ */ jsxs("div", { className: `text-[10px] ${notVisited ? "text-red-400" : "text-muted-foreground"}`, children: [
          client.qty || 0,
          " ",
          t("piece")
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-1.5 ml-8 text-[10px] flex-wrap", children: [
      notVisited && /* @__PURE__ */ jsx("span", { className: "bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded-md font-medium border border-red-500/10", children: t("noVisit") }),
      /* @__PURE__ */ jsx("span", { className: `px-1.5 py-0.5 rounded-md ${notVisited ? "bg-red-500/5 text-red-400" : "bg-muted text-muted-foreground"}`, children: fmtPercent(client.summa_persent || 0) }),
      /* @__PURE__ */ jsxs("span", { className: `px-1.5 py-0.5 rounded-md ${notVisited ? "bg-red-500/5 text-red-400" : "bg-muted text-muted-foreground"}`, children: [
        fmtPercent(client.qty_persent || 0),
        " ",
        t("qtyLabel")
      ] }),
      client.qty_visit > 0 && /* @__PURE__ */ jsxs("span", { className: "bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium", children: [
        client.qty_visit,
        " ",
        t("visit")
      ] }),
      client.qty_order > 0 && /* @__PURE__ */ jsxs("span", { className: "bg-success/10 text-success px-1.5 py-0.5 rounded-md font-medium", children: [
        client.qty_order,
        " ",
        t("ordersLower")
      ] }),
      client.qty_photo > 0 && /* @__PURE__ */ jsxs("span", { className: "bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-md font-medium", children: [
        client.qty_photo,
        " ",
        t("photo")
      ] }),
      client.qty_returned > 0 && /* @__PURE__ */ jsxs("span", { className: "bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-md font-medium", children: [
        client.qty_returned,
        " ",
        t("returnLabel")
      ] }),
      client.qty_payment > 0 && /* @__PURE__ */ jsxs("span", { className: "bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-md font-medium", children: [
        client.qty_payment,
        " ",
        t("payment")
      ] })
    ] })
  ] });
}
function GroupRow({
  group
}) {
  const {
    t
  } = useSettings();
  const [open, setOpen] = useState(false);
  const result = Number(group.result || 0);
  const resultColor = result >= 80 ? "text-success" : result >= 50 ? "text-warning" : "text-destructive";
  const resultBg = result >= 80 ? "bg-success" : result >= 50 ? "bg-warning" : "bg-destructive";
  return /* @__PURE__ */ jsxs("div", { className: `ml-1 rounded-xl border transition-all ${open ? "border-primary/20 bg-primary/[0.02] shadow-sm" : "border-border"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between cursor-pointer py-3 px-3 rounded-xl hover:bg-muted/30 transition-colors", onClick: () => setOpen(!open), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(MapPinned, { className: "h-4 w-4 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-xs", children: group.group_name }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              t("okb"),
              ": ",
              /* @__PURE__ */ jsx("b", { className: "text-foreground", children: group.OKB || 0 })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/40", children: "·" }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              t("akbNoun"),
              ": ",
              /* @__PURE__ */ jsx("b", { className: "text-foreground", children: group.AKB || 0 })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-xs", children: fmt(group.summa || 0) }),
          /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
            group.qty || 0,
            " ",
            t("piece")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 w-12", children: [
          /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold ${resultColor}`, children: fmtPercent(result) }),
          /* @__PURE__ */ jsx("div", { className: "h-1 w-full bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full rounded-full ${resultBg}`, style: {
            width: `${Math.min(100, result)}%`
          } }) })
        ] }),
        open ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
      ] })
    ] }),
    open && /* @__PURE__ */ jsxs("div", { className: "px-3 pb-3 pt-1 border-t border-primary/10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2 text-[10px] flex-wrap", children: [
        /* @__PURE__ */ jsxs("span", { className: "bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground", children: [
          t("shareOfSumma"),
          ": ",
          fmtPercent(group.summa_persent || 0)
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground", children: [
          t("shareOfQty"),
          ": ",
          fmtPercent(group.qty_persent || 0)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        group.clients?.map((client, i) => /* @__PURE__ */ jsx(ClientRow, { client }, i)),
        (!group.clients || group.clients.length === 0) && /* @__PURE__ */ jsx("div", { className: "text-center py-3 text-muted-foreground text-xs", children: t("noClientsInGroup") })
      ] })
    ] })
  ] });
}
function CategoryWithProducts({
  cat,
  colorIndex
}) {
  const {
    t
  } = useSettings();
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 cursor-pointer", onClick: () => setOpen(!open), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-2.5 h-10 rounded-full", style: {
          backgroundColor: COLORS[colorIndex % COLORS.length]
        } }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: cat.category_name || t("unknown") }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
            cat.qty || 0,
            " ",
            t("piece"),
            " · ",
            fmtPercent(cat.qty_persent || 0)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: fmt(cat.summa || 0) }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: fmtPercent(cat.summa_persent || 0) })
        ] }),
        open ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
      ] })
    ] }),
    open && cat.products && cat.products.length > 0 && /* @__PURE__ */ jsx("div", { className: "border-t bg-muted/20 px-4 pb-3 space-y-1", children: cat.products.map((product, j) => /* @__PURE__ */ jsx(ProductRow, { product, colorIndex }, j)) }),
    open && (!cat.products || cat.products.length === 0) && /* @__PURE__ */ jsx("div", { className: "border-t bg-muted/20 px-4 py-3 text-center text-muted-foreground text-xs", children: t("noProducts") })
  ] });
}
function ProductRow({
  product,
  colorIndex
}) {
  const {
    t
  } = useSettings();
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/40 text-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 overflow-hidden", children: product.product_photo_url ? /* @__PURE__ */ jsx("img", { src: getProxiedImageUrl(product.product_photo_url), alt: "", className: "w-full h-full object-cover rounded-lg" }) : product.product_name?.[0] || "?" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-xs truncate", children: product.product_name }),
        /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
          product.qty || 0,
          " ",
          product.unit || t("piece"),
          " · ",
          fmtPercent(product.qty_persent || 0)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0 ml-2", children: [
      /* @__PURE__ */ jsx("div", { className: "font-semibold text-xs", children: fmt(product.summa || 0) }),
      /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: fmtPercent(product.summa_persent || 0) })
    ] })
  ] });
}
function ExpandableAgentTile({
  agent,
  type
}) {
  const {
    t
  } = useSettings();
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "border-b last:border-0 py-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between cursor-pointer", onClick: () => setOpen(!open), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm", children: agent.agent_name?.[0] || "?" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: agent.agent_name }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: type === "sales" ? `${agent.qty_order || 0} ${t("ordersPlural")}` : `${t("okb")}: ${agent.OKB || 0} / ${t("akbNoun")}: ${agent.AKB || 0}` })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: type === "sales" ? fmt(agent.total_summa || 0) : fmtPercent(agent.result || 0) }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: type === "sales" ? `${fmtPercent(agent.rusult || 0)} ${t("doneLowercase")}` : fmt(agent.summa || 0) })
        ] }),
        open ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-5 w-5 text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-5 w-5 text-muted-foreground" })
      ] })
    ] }),
    open && type === "sales" && /* @__PURE__ */ jsxs("div", { className: "mt-3 pl-14 pr-4 py-3 bg-muted/50 rounded-md text-sm space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("summaLabel"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: fmt(agent.total_summa || 0) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("qtyLabel"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: agent.total_qty || 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("ordersLabel"),
            ":"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            agent.qty_order || 0,
            " ",
            t("piece")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("clientsLabel"),
            ":"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            agent.qty_clients || 0,
            " ",
            t("piece")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("averageLabel"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: fmt(agent.average || 0) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("planFactCompact"),
            ":"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            agent.plan || 0,
            " / ",
            agent.fact || 0
          ] })
        ] })
      ] }),
      (agent.returned_qty > 0 || agent.returned_summa > 0) && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 pt-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-orange-500/5 border border-orange-500/10 rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-orange-600", children: [
            t("returnedQtyLabel"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-orange-600", children: agent.returned_qty || 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-orange-500/5 border border-orange-500/10 rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-orange-600", children: [
            t("returnedSummaLabel"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-orange-600 text-xs", children: fmt(agent.returned_summa || 0) })
        ] })
      ] })
    ] }),
    open && type === "akb" && /* @__PURE__ */ jsxs("div", { className: "mt-3 pl-14 pr-4 py-3 bg-muted/50 rounded-md text-sm space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("summaLabel"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: fmt(agent.summa || 0) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("qtyLabel"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: agent.qty || 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("okb"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: agent.OKB || 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("akbNoun"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: agent.AKB || 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("shareOfSumma"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: fmtPercent(agent.summa_persent || 0) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-2 py-1 bg-background rounded-md", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            t("shareOfQty"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: fmtPercent(agent.qty_persent || 0) })
        ] })
      ] }),
      agent.groups && agent.groups.length > 0 && /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2", children: [
          t("territoriesLabel"),
          " (",
          agent.groups.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-1", children: agent.groups.map((group, i) => /* @__PURE__ */ jsx(GroupRow, { group }, i)) })
      ] }),
      (!agent.groups || agent.groups.length === 0) && /* @__PURE__ */ jsx("div", { className: "text-center py-2 text-muted-foreground text-xs", children: t("noGroups") })
    ] })
  ] });
}
function SummaryCard({
  label,
  value,
  sub
}) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-muted/40 rounded-xl p-4 flex flex-col", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5", children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-lg font-bold leading-tight", children: value }),
    sub && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground mt-0.5", children: sub })
  ] });
}
function Dashboard() {
  const {
    t
  } = useSettings();
  const {
    user
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dateBeginRef = useRef(null);
  const dateEndRef = useRef(null);
  const [dateBegin, setDateBegin] = useState(monthStartIsoDate());
  const [dateEnd, setDateEnd] = useState(todayIsoDate());
  const [data, setData] = useState({
    sales: null,
    reports: null
  });
  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setError(t("notAvailable"));
      setLoading(false);
      return;
    }
    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    const branchId = 1;
    const fetchJson = async (url) => {
      const res = await fetch(url, {
        headers: {
          accept: "application/json",
          Authorization: `Basic ${basic}`
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    };
    setLoading(true);
    setError(null);
    Promise.all([fetchJson(API.salesByCategory(baseUrl, branchId, toApiDate(dateBegin), toApiDate(dateEnd))), fetchJson(API.reportByClient(baseUrl, branchId, toApiDate(dateBegin), toApiDate(dateEnd)))]).then(([salesRes, reportRes]) => {
      setData({
        sales: salesRes,
        reports: reportRes
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [user, t, dateBegin, dateEnd]);
  const salesCategories = useMemo(() => {
    return (data.sales?.sales || []).map((s) => ({
      name: s.category_name || t("unknown"),
      value: Number(s.summa || 0),
      qty: Number(s.qty || 0)
    }));
  }, [data.sales, t]);
  const reportAgents = useMemo(() => {
    return (data.reports?.agents || []).map((a) => ({
      name: a.agent_name || t("unknown"),
      value: Number(a.AKB || 0)
    }));
  }, [data.reports, t]);
  return /* @__PURE__ */ jsxs("div", { className: "pb-8 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "text-center pb-4 mb-1 border-b", children: /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold tracking-tight", children: t("totalSummary") }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-3 px-4 py-3 mb-5", children: [
      /* @__PURE__ */ jsx("input", { ref: dateBeginRef, type: "date", value: dateBegin, onChange: (e) => setDateBegin(e.target.value), className: "sr-only" }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => dateBeginRef.current?.showPicker(), className: "flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl cursor-pointer flex-1 max-w-[200px] border border-transparent hover:border-primary/20 transition-colors", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-primary shrink-0" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground leading-none", children: t("dan") }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium leading-tight", children: formatDisplayDate(dateBegin) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 text-muted-foreground shrink-0" }),
      /* @__PURE__ */ jsx("input", { ref: dateEndRef, type: "date", value: dateEnd, onChange: (e) => setDateEnd(e.target.value), className: "sr-only" }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => dateEndRef.current?.showPicker(), className: "flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl cursor-pointer flex-1 max-w-[200px] border border-transparent hover:border-primary/20 transition-colors", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-primary shrink-0" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground leading-none", children: t("gacha") }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium leading-tight", children: formatDisplayDate(dateEnd) })
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsx(Card, { className: "mb-6", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 flex items-center gap-3 text-sm text-destructive", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { children: error })
    ] }) }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "savdo", className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "bg-muted p-1.5 rounded-xl w-full grid grid-cols-3 max-w-md mx-auto", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "savdo", className: "rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all text-xs sm:text-sm", children: [
          /* @__PURE__ */ jsx(ShoppingBag, { className: "w-4 h-4 mr-1.5" }),
          t("savdoTab")
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "akb", className: "rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all text-xs sm:text-sm", children: [
          /* @__PURE__ */ jsx(UsersRound, { className: "w-4 h-4 mr-1.5" }),
          t("akbTab")
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "kpi", className: "rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all text-xs sm:text-sm", children: [
          /* @__PURE__ */ jsx(BarChart3, { className: "w-4 h-4 mr-1.5" }),
          t("kpiTab")
        ] })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "savdo", className: "space-y-6 animate-in fade-in-50 duration-500", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: t("salesByCategories") }) }),
            /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsx("div", { className: "h-72 flex items-center justify-center", children: /* @__PURE__ */ jsx(Skeleton, { className: "h-48 w-48 rounded-full" }) }) : salesCategories.length > 0 ? /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
              /* @__PURE__ */ jsx(Pie, { data: salesCategories, dataKey: "value", nameKey: "name", innerRadius: 60, outerRadius: 100, paddingAngle: 2, stroke: "none", children: salesCategories.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: COLORS[i % COLORS.length] }, i)) }),
              /* @__PURE__ */ jsx(Tooltip, { formatter: (value) => fmt(value), contentStyle: {
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)"
              } }),
              /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
                fontSize: "12px"
              } })
            ] }) }) }) : /* @__PURE__ */ jsx("div", { className: "h-72 flex items-center justify-center text-muted-foreground text-sm", children: t("noDataFound") }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: t("planCompletion") }) }),
            /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-full" }),
              /* @__PURE__ */ jsx(Skeleton, { className: "h-24 w-full" })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-5 flex flex-col justify-center h-full pb-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end", children: [
                /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-primary", children: fmtPercent(data.sales?.rusult || 0) }),
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: t("done") })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-4 w-full bg-muted rounded-full overflow-hidden shadow-inner", children: /* @__PURE__ */ jsx("div", { className: `h-full transition-all duration-1000 ease-out ${Number(data.sales?.rusult) >= 80 ? "bg-success" : Number(data.sales?.rusult) >= 40 ? "bg-warning" : "bg-destructive"}`, style: {
                width: `${Math.min(100, Number(data.sales?.rusult || 0))}%`
              } }) }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-3 rounded-xl", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1", children: t("plan") }),
                  /* @__PURE__ */ jsx("div", { className: "font-bold text-lg", children: data.sales?.plan || 0 })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-3 rounded-xl", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1", children: t("fact") }),
                  /* @__PURE__ */ jsx("div", { className: "font-bold text-lg", children: data.sales?.fact || 0 })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 pt-3 border-t", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-3 rounded-xl", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1", children: t("returnedQty") }),
                  /* @__PURE__ */ jsx("div", { className: "font-bold", children: data.sales?.returned_qty || 0 })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-3 rounded-xl", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1", children: t("returnedSumma") }),
                  /* @__PURE__ */ jsx("div", { className: "font-bold text-sm", children: fmt(data.sales?.returned_summa || 0) })
                ] })
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: t("generalReport") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-20 w-full rounded-xl" }, i)) }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsx(SummaryCard, { label: t("totalAmount"), value: fmtShort(data.sales?.total_summa || 0), sub: fmt(data.sales?.total_summa || 0) }),
            /* @__PURE__ */ jsx(SummaryCard, { label: t("totalQty"), value: `${data.sales?.total_qty || 0}` }),
            /* @__PURE__ */ jsx(SummaryCard, { label: t("orders"), value: `${data.sales?.qty_order || 0} ${t("piece")}` }),
            /* @__PURE__ */ jsx(SummaryCard, { label: t("clients"), value: `${data.sales?.qty_clients || 0} ${t("piece")}` }),
            /* @__PURE__ */ jsx(SummaryCard, { label: t("average"), value: fmtShort(data.sales?.average || 0), sub: fmt(data.sales?.average || 0) }),
            /* @__PURE__ */ jsx(SummaryCard, { label: t("returnedQty"), value: `${data.sales?.returned_qty || 0}` }),
            /* @__PURE__ */ jsx(SummaryCard, { label: t("returnedSumma"), value: fmtShort(data.sales?.returned_summa || 0), sub: fmt(data.sales?.returned_summa || 0) }),
            /* @__PURE__ */ jsx(SummaryCard, { label: t("planFact"), value: `${data.sales?.plan || 0} / ${data.sales?.fact || 0}` })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: t("agentStats") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-full" }, i)) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            data.sales?.agents?.map((agent, i) => /* @__PURE__ */ jsx(ExpandableAgentTile, { agent, type: "sales" }, i)),
            (!data.sales?.agents || data.sales.agents.length === 0) && /* @__PURE__ */ jsx("div", { className: "text-center py-6 text-muted-foreground text-sm", children: t("noAgents") })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: t("categorySalesDetail") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            data.sales?.sales?.map((cat, i) => /* @__PURE__ */ jsx(CategoryWithProducts, { cat, colorIndex: i }, i)),
            (!data.sales?.sales || data.sales.sales.length === 0) && /* @__PURE__ */ jsx("div", { className: "text-center py-6 text-muted-foreground text-sm", children: t("noCategories") })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "akb", className: "space-y-6 animate-in fade-in-50 duration-500", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: t("agentVisitsBy") }) }),
            /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsx("div", { className: "h-72 flex items-center justify-center", children: /* @__PURE__ */ jsx(Skeleton, { className: "h-48 w-48 rounded-full" }) }) : reportAgents.length > 0 ? /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
              /* @__PURE__ */ jsx(Pie, { data: reportAgents, dataKey: "value", nameKey: "name", innerRadius: 60, outerRadius: 100, paddingAngle: 2, stroke: "none", children: reportAgents.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: COLORS[i % COLORS.length] }, i)) }),
              /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)"
              } }),
              /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
                fontSize: "12px"
              } })
            ] }) }) }) : /* @__PURE__ */ jsx("div", { className: "h-72 flex items-center justify-center text-muted-foreground text-sm", children: t("noDataFound") }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: t("efficiency") }) }),
            /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsx(Skeleton, { className: "h-24 w-full" }) }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4 flex flex-col justify-center h-full", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-5 bg-primary/5 rounded-2xl border border-primary/10 text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2", children: t("efficiency") }),
                /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-primary", children: fmtPercent(data.reports?.result || 0) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-4 rounded-xl text-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1", children: t("okb") }),
                  /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: data.reports?.OKB || 0 })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-4 rounded-xl text-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1", children: t("akbNoun") }),
                  /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: data.reports?.AKB || 0 })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-3 rounded-xl text-center", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1", children: [
                    /* @__PURE__ */ jsx(ShoppingCart, { className: "w-3 h-3" }),
                    t("orders")
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: data.reports?.qty_order || 0 })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-3 rounded-xl text-center", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1", children: [
                    /* @__PURE__ */ jsx(Camera, { className: "w-3 h-3" }),
                    t("photos")
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: data.reports?.qty_photo || 0 })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-3 rounded-xl text-center", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1", children: [
                    /* @__PURE__ */ jsx(ImageOff, { className: "w-3 h-3" }),
                    t("rejected")
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: data.reports?.qty_rejected || 0 })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-3 rounded-xl text-center", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1", children: [
                    /* @__PURE__ */ jsx(RotateCcw, { className: "w-3 h-3" }),
                    t("returned")
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: data.reports?.qty_returned || 0 })
                ] })
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: t("agentsVisits") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-16 w-full" }, i)) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            data.reports?.agents?.map((agent, i) => /* @__PURE__ */ jsx(ExpandableAgentTile, { agent, type: "akb" }, i)),
            (!data.reports?.agents || data.reports.agents.length === 0) && /* @__PURE__ */ jsx("div", { className: "text-center py-6 text-muted-foreground text-sm", children: t("noAgents") })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "kpi", className: "animate-in fade-in-50 duration-500", children: /* @__PURE__ */ jsx(Card, { className: "border-dashed border-2 bg-muted/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-32 flex flex-col items-center justify-center text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-8 shadow-sm", children: /* @__PURE__ */ jsx(Pickaxe, { className: "h-12 w-12 text-muted-foreground" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold mb-3", children: t("kpiSection") }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-md", children: t("kpiComingSoon") })
      ] }) }) })
    ] })
  ] });
}
export {
  Dashboard as component
};
