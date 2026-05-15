import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { a as useSettings, u as useAuth, P as PageHeader, C as Card, I as Input, g as CardContent, s as Skeleton, o as CardHeader, p as CardTitle, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell, A as API, t as formatWithSpaces } from "./router-CTVAwSR8.js";
import { Search, AlertCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from "recharts";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
function toApiDate(value) {
  return value.replaceAll("-", "");
}
function formatMoney(n) {
  return formatWithSpaces(n, 0);
}
function formatQty(n) {
  return formatWithSpaces(n, 2);
}
function shortName(name, max = 14) {
  return name.length <= max ? name : `${name.slice(0, max)}...`;
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
function SalesPage() {
  const {
    t
  } = useSettings();
  const {
    user
  } = useAuth();
  const [q, setQ] = useState("");
  const [dateBegin, setDateBegin] = useState(monthStartIsoDate());
  const [dateEnd, setDateEnd] = useState(todayIsoDate());
  const [branchId, setBranchId] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState(null);
  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }
    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    const parsedBranchId = Number(branchId) || 1;
    setLoading(true);
    setError(null);
    const salesByCategory = API.salesByCategory;
    fetch(salesByCategory(baseUrl, parsedBranchId, toApiDate(dateBegin), toApiDate(dateEnd)), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((data) => {
      setSalesData(data);
    }).catch((err) => {
      setError(err.message);
    }).finally(() => setLoading(false));
  }, [branchId, dateBegin, dateEnd, t, user]);
  const filteredCategories = useMemo(() => {
    const categories = salesData?.sales ?? [];
    if (!q.trim()) return categories;
    const lower = q.toLowerCase();
    return categories.map((c) => ({
      ...c,
      products: c.products.filter((p) => p.product_name.toLowerCase().includes(lower))
    })).filter((c) => c.category_name.toLowerCase().includes(lower) || c.products.length > 0);
  }, [salesData, q]);
  const topProducts = useMemo(() => {
    return filteredCategories.flatMap((c) => c.products).sort((a, b) => b.summa - a.summa).slice(0, 8);
  }, [filteredCategories]);
  const categoryChartData = useMemo(() => filteredCategories.map((item) => ({
    name: shortName(item.category_name, 16),
    fullName: item.category_name,
    qty: item.qty,
    summa: item.summa
  })), [filteredCategories]);
  const agentChartData = useMemo(() => (salesData?.agents ?? []).map((agent) => ({
    name: shortName(agent.agent_name, 14),
    fullName: agent.agent_name,
    plan: agent.plan,
    fact: agent.fact,
    result: agent.rusult
  })), [salesData]);
  const pieData = useMemo(() => filteredCategories.map((category) => ({
    name: category.category_name,
    value: category.summa
  })), [filteredCategories]);
  const pieColors = ["#2563eb", "#16a34a", "#f59e0b", "#db2777", "#06b6d4", "#7c3aed", "#ef4444"];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("sales"), description: t("salesDesc") }),
    /* @__PURE__ */ jsx(Card, { className: "p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsx(Input, { type: "date", value: dateBegin, onChange: (e) => setDateBegin(e.target.value), "aria-label": t("dateBegin") }),
      /* @__PURE__ */ jsx(Input, { type: "date", value: dateEnd, onChange: (e) => setDateEnd(e.target.value), "aria-label": t("dateEnd") }),
      /* @__PURE__ */ jsx(Input, { value: branchId, onChange: (e) => setBranchId(e.target.value), placeholder: t("branchId"), inputMode: "numeric" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: t("searchCategoryOrProduct"), className: "pl-9", value: q, onChange: (e) => setQ(e.target.value) })
      ] })
    ] }) }),
    loading && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4", children: Array.from({
      length: 4
    }).map((_, idx) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-24" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-28" })
    ] }) }, idx)) }),
    error && !loading && /* @__PURE__ */ jsx(Card, { className: "p-10 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-destructive" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("errorTitle") }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: error })
    ] }) }),
    !loading && !error && salesData && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("totalSalesAmount") }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: formatMoney(salesData.total_summa) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("totalVolumeKg") }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: formatQty(salesData.total_qty) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("ordersClients") }),
          /* @__PURE__ */ jsxs("p", { className: "text-xl font-semibold", children: [
            salesData.qty_order,
            " / ",
            salesData.qty_clients
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("planCompletion") }),
          /* @__PURE__ */ jsxs("p", { className: "text-xl font-semibold", children: [
            formatQty(salesData.rusult),
            "%"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs(Card, { className: "xl:col-span-2", children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("amountByCategoryChart") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: categoryChartData.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-muted-foreground", children: t("notFound") }) : /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: categoryChartData, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "name", tickLine: false, axisLine: false, fontSize: 12 }),
            /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 12 }),
            /* @__PURE__ */ jsx(Tooltip, { formatter: (value) => formatMoney(value), labelFormatter: (_, payload) => payload?.[0]?.payload?.fullName ?? "", contentStyle: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8
            } }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "summa", fill: "var(--primary)", radius: [6, 6, 0, 0] })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("categoryShare") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: pieData.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-muted-foreground", children: t("notFound") }) : /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
            /* @__PURE__ */ jsx(Pie, { data: pieData, dataKey: "value", nameKey: "name", outerRadius: 90, innerRadius: 48, children: pieData.map((entry) => /* @__PURE__ */ jsx(Cell, { fill: pieColors[Math.abs(entry.name.length) % pieColors.length] }, entry.name)) }),
            /* @__PURE__ */ jsx(Tooltip, { formatter: (value) => formatMoney(value) })
          ] }) }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs(Card, { className: "xl:col-span-2", children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("salesByCategories") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: filteredCategories.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-muted-foreground", children: t("notFound") }) : /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: t("category") }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("qty") }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("amount") }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("qtyPercent") }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("amountPercent") })
            ] }) }),
            /* @__PURE__ */ jsx(TableBody, { children: filteredCategories.map((c) => /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: c.category_name }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: formatQty(c.qty) }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: formatMoney(c.summa) }),
              /* @__PURE__ */ jsxs(TableCell, { className: "text-right", children: [
                formatQty(c.qty_persent),
                "%"
              ] }),
              /* @__PURE__ */ jsxs(TableCell, { className: "text-right", children: [
                formatQty(c.summa_persent),
                "%"
              ] })
            ] }, c.category_id)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("topProducts") }) }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: topProducts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("notFound") }) : topProducts.map((p) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-muted/20 px-3 py-2 flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: p.product_name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                formatQty(p.qty),
                " ",
                p.unit,
                " - ",
                formatQty(p.summa_persent),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold whitespace-nowrap", children: formatMoney(p.summa) })
          ] }, p.product_id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "mt-4", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("agentMetrics") }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          agentChartData.length > 0 && /* @__PURE__ */ jsx("div", { className: "h-72 mb-6", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: agentChartData, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "name", tickLine: false, axisLine: false, fontSize: 12 }),
            /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 12 }),
            /* @__PURE__ */ jsx(Tooltip, { formatter: (value) => formatQty(value), labelFormatter: (_, payload) => payload?.[0]?.payload?.fullName ?? "", contentStyle: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8
            } }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "plan", fill: "#94a3b8", radius: [6, 6, 0, 0] }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "fact", fill: "var(--primary)", radius: [6, 6, 0, 0] })
          ] }) }) }),
          !salesData.agents?.length ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-muted-foreground", children: t("notFound") }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3", children: salesData.agents.map((agent) => {
            const progress = Math.max(0, Math.min(100, Number(agent.rusult) || 0));
            return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold truncate", children: agent.agent_name }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    "ID: ",
                    agent.agent_id
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-base font-semibold", children: [
                    formatQty(agent.rusult),
                    "%"
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: t("result") })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden mb-4", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary", style: {
                width: `${progress}%`
              } }) }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/30 px-3 py-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: t("planFact") }),
                  /* @__PURE__ */ jsxs("p", { className: "font-medium", children: [
                    formatQty(agent.plan),
                    " / ",
                    formatQty(agent.fact)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/30 px-3 py-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: t("orderClient") }),
                  /* @__PURE__ */ jsxs("p", { className: "font-medium", children: [
                    agent.qty_order,
                    " / ",
                    agent.qty_clients
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("totalAmount") }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: formatMoney(agent.total_summa) })
              ] })
            ] }, agent.agent_id);
          }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  SalesPage as component
};
