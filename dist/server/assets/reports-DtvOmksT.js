import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { a as useSettings, u as useAuth, A as API, P as PageHeader, C as Card, I as Input, g as CardContent, s as Skeleton, o as CardHeader, p as CardTitle, t as formatWithSpaces } from "./router-CTVAwSR8.js";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar } from "recharts";
import { AlertCircle } from "lucide-react";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
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
function formatMoney(n) {
  return formatWithSpaces(n || 0, 0);
}
function formatQty(n) {
  const num = Number(n || 0);
  const truncated = Math.trunc(num * 100) / 100;
  const fixed = truncated === Math.trunc(truncated) ? String(Math.trunc(truncated)) : truncated.toFixed(2).replace(/0+$/, "");
  return formatWithSpaces(Number(fixed), 2);
}
function ReportsPage() {
  const {
    t
  } = useSettings();
  const {
    user
  } = useAuth();
  const [dateBegin, setDateBegin] = useState(monthStartIsoDate());
  const [dateEnd, setDateEnd] = useState(todayIsoDate());
  const [branchId, setBranchId] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    const parsedBranchId = Number(branchId) || 1;
    setLoading(true);
    setError(null);
    fetch(API.reportByClient(user.company_rel.base_url, parsedBranchId, toApiDate(dateBegin), toApiDate(dateEnd)), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((data) => setReportData(data)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [branchId, dateBegin, dateEnd, t, user]);
  const salesTrendData = useMemo(() => (reportData?.agents ?? []).map((agent) => ({
    month: agent.agent_name,
    sales: agent.OKB,
    revenue: agent.AKB
  })), [reportData]);
  const monthlySummaryData = useMemo(() => (reportData?.agents ?? []).map((agent) => ({
    month: agent.agent_name,
    income: agent.summa,
    expense: agent.qty
  })), [reportData]);
  const cat = useMemo(() => {
    const groupSum = /* @__PURE__ */ new Map();
    for (const agent of reportData?.agents ?? []) {
      const groups = agent.gproups ?? agent.groups ?? [];
      for (const group of groups) {
        groupSum.set(group.group_name, (groupSum.get(group.group_name) ?? 0) + Number(group.summa || 0));
      }
    }
    return Array.from(groupSum.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [reportData]);
  const perfData = useMemo(() => (reportData?.agents ?? []).map((agent, idx) => ({
    name: agent.agent_name,
    value: Number(agent.result) || 0,
    fill: colors[idx % colors.length]
  })), [reportData]);
  const totalSumma = useMemo(() => (reportData?.agents ?? []).reduce((sum, agent) => sum + Number(agent.summa || 0), 0), [reportData]);
  const totalQty = useMemo(() => (reportData?.agents ?? []).reduce((sum, agent) => sum + Number(agent.qty || 0), 0), [reportData]);
  const topAgents = useMemo(() => [...reportData?.agents ?? []].sort((a, b) => Number(b.summa || 0) - Number(a.summa || 0)).slice(0, 5), [reportData]);
  const topGroups = useMemo(() => {
    const allGroups = (reportData?.agents ?? []).flatMap((agent) => agent.gproups ?? agent.groups ?? []);
    return [...allGroups].sort((a, b) => Number(b.summa || 0) - Number(a.summa || 0)).slice(0, 6);
  }, [reportData]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("reports"), description: t("reportsDesc") }),
    /* @__PURE__ */ jsx(Card, { className: "p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsx(Input, { type: "date", value: dateBegin, onChange: (e) => setDateBegin(e.target.value), "aria-label": t("dateBegin") }),
      /* @__PURE__ */ jsx(Input, { type: "date", value: dateEnd, onChange: (e) => setDateEnd(e.target.value), "aria-label": t("dateEnd") }),
      /* @__PURE__ */ jsx(Input, { value: branchId, onChange: (e) => setBranchId(e.target.value), placeholder: t("branchId"), inputMode: "numeric" })
    ] }) }),
    loading && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsx(Skeleton, { className: "h-72 w-full" }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsx(Skeleton, { className: "h-72 w-full" }) }) })
    ] }),
    error && !loading && /* @__PURE__ */ jsx(Card, { className: "p-10 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-destructive" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("errorTitle") }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: error })
    ] }) }),
    !loading && !error && reportData && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("salesPerformance") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: salesTrendData, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "month", stroke: "var(--muted-foreground)", fontSize: 12, tickLine: false, axisLine: false }),
            /* @__PURE__ */ jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 12, tickLine: false, axisLine: false }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)"
            } }),
            /* @__PURE__ */ jsx(Legend, {}),
            /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "sales", name: "OKB", stroke: "var(--chart-1)", strokeWidth: 2.5, dot: false }),
            /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "revenue", name: "AKB", stroke: "var(--chart-2)", strokeWidth: 2.5, dot: false })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("monthlySummary") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: monthlySummaryData, children: [
            /* @__PURE__ */ jsxs("defs", { children: [
              /* @__PURE__ */ jsxs("linearGradient", { id: "ri", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--chart-2)", stopOpacity: 0.3 }),
                /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--chart-2)", stopOpacity: 0 })
              ] }),
              /* @__PURE__ */ jsxs("linearGradient", { id: "re", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--chart-5)", stopOpacity: 0.3 }),
                /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--chart-5)", stopOpacity: 0 })
              ] })
            ] }),
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "month", stroke: "var(--muted-foreground)", fontSize: 12, tickLine: false, axisLine: false }),
            /* @__PURE__ */ jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 12, tickLine: false, axisLine: false }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)"
            } }),
            /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "income", name: "Summa", stroke: "var(--chart-2)", fill: "url(#ri)", strokeWidth: 2 }),
            /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "expense", name: "Qty", stroke: "var(--chart-5)", fill: "url(#re)", strokeWidth: 2 })
          ] }) }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("salesByCategory") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
            /* @__PURE__ */ jsx(Pie, { data: perfData, dataKey: "value", nameKey: "name", outerRadius: 100, label: ({
              value
            }) => `${formatQty(value)}%`, children: perfData.map((entry) => /* @__PURE__ */ jsx(Cell, { fill: entry.fill }, entry.name)) }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)"
            } })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("performance") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4 h-72", children: [
            /* @__PURE__ */ jsx("div", { className: "w-full sm:w-1/2 h-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(RadialBarChart, { innerRadius: "20%", outerRadius: "100%", data: cat.map((item, i) => ({
              ...item,
              fill: colors[i % colors.length]
            })), startAngle: 90, endAngle: -270, children: [
              /* @__PURE__ */ jsx(RadialBar, { background: true, dataKey: "value", nameKey: "name", cornerRadius: 6 }),
              /* @__PURE__ */ jsx(Tooltip, { formatter: (value, name, props) => [formatMoney(value), props.payload.name], contentStyle: {
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--foreground)"
              } })
            ] }) }) }),
            /* @__PURE__ */ jsx("div", { className: "w-full sm:w-1/2 h-full overflow-y-auto flex flex-col justify-center gap-2", children: cat.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center", children: t("notFound") }) : cat.map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "inline-block w-3 h-3 rounded-sm shrink-0", style: {
                backgroundColor: colors[i % colors.length]
              } }),
              /* @__PURE__ */ jsx("span", { className: "truncate flex-1 min-w-0", children: item.name }),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground shrink-0", children: formatMoney(item.value) })
            ] }, item.name)) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-4", children: [
        /* @__PURE__ */ jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "OKB" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: formatQty(reportData.OKB) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "AKB" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: formatQty(reportData.AKB) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: t("orders") }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: formatQty(reportData.qty_order) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: t("photo") }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: formatQty(reportData.qty_photo) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: t("returned") }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: formatQty(reportData.qty_returned) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: t("result") }),
          /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold", children: [
            formatQty(reportData.result),
            "%"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("topAgents") }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
            topAgents.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("notFound") }) : topAgents.map((agent) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-muted/20 px-3 py-2 flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: agent.agent_name }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "OKB ",
                  formatQty(agent.OKB),
                  " / AKB ",
                  formatQty(agent.AKB)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: formatMoney(agent.summa) }),
                /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                  formatQty(agent.result),
                  "%"
                ] })
              ] })
            ] }, agent.agent_id)),
            /* @__PURE__ */ jsxs("div", { className: "pt-2 mt-2 border-t flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: t("totalAmount") }),
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: formatMoney(totalSumma) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: t("totalQty") }),
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: formatQty(totalQty) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("topGroups") }) }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-2", children: topGroups.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("notFound") }) : topGroups.map((group) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-muted/20 px-3 py-2 flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: group.group_name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "OKB ",
                formatQty(group.OKB),
                " / AKB ",
                formatQty(group.AKB)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: formatMoney(group.summa) }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                formatQty(group.result),
                "%"
              ] })
            ] })
          ] }, group.group_id)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  ReportsPage as component
};
