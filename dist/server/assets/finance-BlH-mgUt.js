import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { a as useSettings, u as useAuth, A as API, P as PageHeader, C as Card, I as Input, g as CardContent, s as Skeleton, h as Badge, B as Button, o as CardHeader, p as CardTitle, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell, t as formatWithSpaces } from "./router-CTVAwSR8.js";
import { AlertCircle, Search, LayoutGrid, Rows3, ArrowUpRight, ArrowDownRight, Wallet, Package } from "lucide-react";
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
function todayIsoDate() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function monthStartIsoDate() {
  const now = /* @__PURE__ */ new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}
const fmt = (n) => formatWithSpaces(n, 0);
const fmtQty = (n) => formatWithSpaces(n, 2);
const incomeStatuses = /* @__PURE__ */ new Set(["delivered", "completed", "paid", "success"]);
function dateScoreFromDoc(value) {
  const chunks = value.split(".");
  if (chunks.length !== 3) return 0;
  const [day, month, year] = chunks;
  return Date.parse(`${year}-${month}-${day}T00:00:00Z`) || 0;
}
function FinancePage() {
  const {
    t
  } = useSettings();
  const {
    user
  } = useAuth();
  const [dateBegin, setDateBegin] = useState(monthStartIsoDate());
  const [dateEnd, setDateEnd] = useState(todayIsoDate());
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [sortMode, setSortMode] = useState("date-desc");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }
    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    setLoading(true);
    setError(null);
    fetch(API.financeOrders(baseUrl, toApiDate(dateBegin), toApiDate(dateEnd)), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((data) => {
      setOrders(Array.isArray(data.data) ? data.data : []);
    }).catch((err) => {
      setError(err.message);
    }).finally(() => setLoading(false));
  }, [dateBegin, dateEnd, t, user]);
  const metrics = useMemo(() => {
    const income = orders.filter((o) => incomeStatuses.has((o.status || "").toLowerCase())).reduce((sum, o) => sum + (Number(o.summa) || 0), 0);
    const expense = orders.filter((o) => !incomeStatuses.has((o.status || "").toLowerCase())).reduce((sum, o) => sum + (Number(o.summa) || 0), 0);
    const totalQty = orders.reduce((sum, o) => sum + (Number(o.qty) || 0), 0);
    const totalProducts = orders.reduce((sum, o) => sum + (o.products?.length ?? 0), 0);
    return {
      income,
      expense,
      profit: income - expense,
      totalQty,
      totalProducts
    };
  }, [orders]);
  const filteredOrders = useMemo(() => {
    if (!q.trim()) return orders;
    const lower = q.toLowerCase();
    return orders.filter((order) => String(order.id_doc).includes(lower) || (order.client_name || "").toLowerCase().includes(lower) || (order.status || "").toLowerCase().includes(lower) || (order.date_doc || "").toLowerCase().includes(lower) || (order.products || []).some((p) => (p.product_name || "").toLowerCase().includes(lower)));
  }, [orders, q]);
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      switch (sortMode) {
        case "date-asc":
          return dateScoreFromDoc(a.date_doc) - dateScoreFromDoc(b.date_doc);
        case "amount-desc":
          return b.summa - a.summa;
        case "amount-asc":
          return a.summa - b.summa;
        case "qty-desc":
          return b.qty - a.qty;
        case "qty-asc":
          return a.qty - b.qty;
        case "client-asc":
          return (a.client_name || "").localeCompare(b.client_name || "");
        case "client-desc":
          return (b.client_name || "").localeCompare(a.client_name || "");
        case "date-desc":
        default:
          return dateScoreFromDoc(b.date_doc) - dateScoreFromDoc(a.date_doc);
      }
    });
  }, [filteredOrders, sortMode]);
  const dailyChartData = useMemo(() => {
    const byDate = /* @__PURE__ */ new Map();
    for (const order of sortedOrders) {
      const key = order.date_doc || "-";
      const current = byDate.get(key) ?? {
        date: key,
        income: 0,
        expense: 0
      };
      const amount = Number(order.summa) || 0;
      if (incomeStatuses.has((order.status || "").toLowerCase())) current.income += amount;
      else current.expense += amount;
      byDate.set(key, current);
    }
    return Array.from(byDate.values()).sort((a, b) => dateScoreFromDoc(a.date) - dateScoreFromDoc(b.date));
  }, [sortedOrders]);
  const statusChartData = useMemo(() => {
    const statusMap = /* @__PURE__ */ new Map();
    for (const order of sortedOrders) {
      const status = order.status || "unknown";
      statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
    }
    return Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [sortedOrders]);
  const pieColors = ["#2563eb", "#16a34a", "#f59e0b", "#db2777", "#06b6d4", "#7c3aed", "#ef4444"];
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("finance"), description: t("financeDesc") }),
    /* @__PURE__ */ jsx(Card, { className: "p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsx(Input, { type: "date", value: dateBegin, onChange: (e) => setDateBegin(e.target.value), "aria-label": t("dateBegin") }),
      /* @__PURE__ */ jsx(Input, { type: "date", value: dateEnd, onChange: (e) => setDateEnd(e.target.value), "aria-label": t("dateEnd") })
    ] }) }),
    loading && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: Array.from({
      length: 4
    }).map((_, idx) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-28" })
    ] }) }, idx)) }),
    error && !loading && /* @__PURE__ */ jsx(Card, { className: "p-10 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-destructive" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("errorTitle") }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: error })
    ] }) }),
    !loading && !error && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Card, { className: "p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 w-full", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: t("search"), className: "pl-9", value: q, onChange: (e) => setQ(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
          sortedOrders.length,
          " ",
          t("ordersLower")
        ] }),
        /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxs("select", { value: sortMode, onChange: (e) => setSortMode(e.target.value), className: "h-9 rounded-md border border-input bg-background px-3 text-sm", children: [
          /* @__PURE__ */ jsx("option", { value: "date-desc", children: t("sortDateNewOld") }),
          /* @__PURE__ */ jsx("option", { value: "date-asc", children: t("sortDateOldNew") }),
          /* @__PURE__ */ jsx("option", { value: "amount-desc", children: t("sortAmountHighLow") }),
          /* @__PURE__ */ jsx("option", { value: "amount-asc", children: t("sortAmountLowHigh") }),
          /* @__PURE__ */ jsx("option", { value: "qty-desc", children: t("sortQtyHighLow") }),
          /* @__PURE__ */ jsx("option", { value: "qty-asc", children: t("sortQtyLowHigh") }),
          /* @__PURE__ */ jsx("option", { value: "client-asc", children: t("sortClientAZ") }),
          /* @__PURE__ */ jsx("option", { value: "client-desc", children: t("sortClientZA") })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: viewMode === "cards" ? "default" : "outline", size: "sm", onClick: () => setViewMode("cards"), children: [
            /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4" }),
            t("cardsView")
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: viewMode === "table" ? "default" : "outline", size: "sm", onClick: () => setViewMode("table"), children: [
            /* @__PURE__ */ jsx(Rows3, { className: "h-4 w-4" }),
            t("tableView")
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-sm", children: [
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4 text-success" }),
            " ",
            t("income")
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-semibold mt-2", children: [
            fmt(metrics.income),
            " UZS"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-sm", children: [
            /* @__PURE__ */ jsx(ArrowDownRight, { className: "h-4 w-4 text-destructive" }),
            " ",
            t("expense")
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-semibold mt-2", children: [
            fmt(metrics.expense),
            " UZS"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-sm", children: [
            /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4 text-primary" }),
            " ",
            t("netProfit")
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-semibold mt-2", children: [
            fmt(metrics.profit),
            " UZS"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-sm", children: [
            /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 text-primary" }),
            t("totalProductsCount")
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold mt-2", children: metrics.totalProducts })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-sm", children: [
            /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4 text-primary" }),
            t("totalVolumeQty")
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold mt-2", children: fmtQty(metrics.totalQty) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "xl:col-span-2", children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("dailyIncomeExpenseTrend") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: dailyChartData.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-muted-foreground", children: t("notFound") }) : /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: dailyChartData, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "date", tickLine: false, axisLine: false, fontSize: 12 }),
            /* @__PURE__ */ jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 12 }),
            /* @__PURE__ */ jsx(Tooltip, { formatter: (value) => `${fmt(value)} UZS`, contentStyle: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8
            } }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "income", fill: "var(--chart-2)", radius: [6, 6, 0, 0] }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "expense", fill: "var(--chart-5)", radius: [6, 6, 0, 0] })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("statusShare") }) }),
          /* @__PURE__ */ jsx(CardContent, { children: statusChartData.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-muted-foreground", children: t("notFound") }) : /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
            /* @__PURE__ */ jsx(Pie, { data: statusChartData, dataKey: "value", nameKey: "name", outerRadius: 95, innerRadius: 48, children: statusChartData.map((entry, idx) => /* @__PURE__ */ jsx(Cell, { fill: pieColors[idx % pieColors.length] }, entry.name)) }),
            /* @__PURE__ */ jsx(Tooltip, {})
          ] }) }) }) })
        ] })
      ] }),
      viewMode === "table" ? /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("transactions") }) }),
        /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: t("id") }),
            /* @__PURE__ */ jsx(TableHead, { children: t("party") }),
            /* @__PURE__ */ jsx(TableHead, { children: t("date") }),
            /* @__PURE__ */ jsx(TableHead, { children: t("type") }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("qty") }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("amount") })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: sortedOrders.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: t("notFound") }) }) : sortedOrders.map((order) => {
            const isIncome = incomeStatuses.has((order.status || "").toLowerCase());
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-xs text-muted-foreground", children: order.id_doc }),
              /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: order.client_name }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: order.date_doc }),
              /* @__PURE__ */ jsx(TableCell, { className: "capitalize", children: isIncome ? t("income") : t("expense") }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: fmtQty(order.qty) }),
              /* @__PURE__ */ jsxs(TableCell, { className: `text-right font-medium ${isIncome ? "text-success" : "text-destructive"}`, children: [
                isIncome ? "+" : "-",
                fmt(order.summa),
                " UZS"
              ] })
            ] }, order.id_doc);
          }) })
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3", children: sortedOrders.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "md:col-span-2 xl:col-span-3 p-12 text-center text-muted-foreground", children: t("notFound") }) : sortedOrders.map((order) => {
        const isIncome = incomeStatuses.has((order.status || "").toLowerCase());
        return /* @__PURE__ */ jsx(Card, { className: "overflow-hidden hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold truncate", children: order.client_name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "ID: ",
                order.id_doc,
                " • ",
                order.date_doc
              ] })
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: isIncome ? "default" : "secondary", children: isIncome ? t("income") : t("expense") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              t("status"),
              ": ",
              order.status || "-"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              t("products"),
              ": ",
              order.products?.length ?? 0
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              t("qty"),
              ": ",
              fmtQty(order.qty)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: t("amount") }),
            /* @__PURE__ */ jsxs("span", { className: `text-sm font-semibold ${isIncome ? "text-success" : "text-destructive"}`, children: [
              isIncome ? "+" : "-",
              fmt(order.summa),
              " UZS"
            ] })
          ] })
        ] }) }, order.id_doc);
      }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-20 flex items-start justify-center pt-32 bg-background/20 backdrop-blur-[2px]", children: /* @__PURE__ */ jsx("div", { className: "rounded-2xl px-8 py-5 shadow-lg bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-semibold tracking-wide", children: t("comingSoon") }) }) })
  ] });
}
export {
  FinancePage as component
};
