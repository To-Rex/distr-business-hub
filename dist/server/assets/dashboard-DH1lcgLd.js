import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { a as useSettings, C as Card, o as CardHeader, g as CardContent, B as Button, p as CardTitle } from "./router-CTVAwSR8.js";
import { A as AdminGuard, a as AdminLayout } from "./admin-layout-BFGTm6By.js";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";
import { Activity, RefreshCw, Server, Cpu, MemoryStick, HardDrive, Network, Clock, Building, Users, DollarSign, TrendingUp, Package, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { H as fetchSystemMonitor, b as fetchCompanies, f as fetchUsers, z as fetchApps, I as fetchActivity } from "./auth-ATVJn5u0.js";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
import "./tooltip-DVV6DgP8.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const mins = Math.floor(seconds % 3600 / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(" ");
}
function getUsageColor(percent) {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 70) return "bg-orange-500";
  if (percent >= 50) return "bg-yellow-500";
  return "bg-green-500";
}
function getUsageTextColor(percent) {
  if (percent >= 90) return "text-red-600 dark:text-red-400";
  if (percent >= 70) return "text-orange-600 dark:text-orange-400";
  if (percent >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}
function SystemMonitor() {
  const { t } = useSettings();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["system-monitor"],
    queryFn: fetchSystemMonitor,
    refetchInterval: 3e4
  });
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsx("div", { className: "h-4 w-24 bg-muted rounded animate-pulse" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-8 w-16 bg-muted rounded animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "h-2 bg-muted rounded animate-pulse" })
      ] })
    ] }, i)) });
  }
  if (isError || !data) {
    return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Activity, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
      /* @__PURE__ */ jsx("p", { children: t("systemMonitorError") })
    ] }) });
  }
  const { system, cpu, memory, disks, network, top_processes } = data;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold", children: t("systemMonitor") })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => refetch(),
          disabled: isFetching,
          className: "h-8 gap-1 text-muted-foreground",
          children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}` }),
            /* @__PURE__ */ jsx("span", { className: "text-xs", children: t("refresh") })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Server, { className: "h-4 w-4 text-primary" }),
          t("smSystemInfo")
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t("smHostname") }),
            /* @__PURE__ */ jsx("span", { className: "font-medium truncate ml-2", children: system.hostname })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "OS" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: system.os_name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t("smArch") }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: system.architecture })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t("smUptime") }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatUptime(system.uptime_seconds) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Cpu, { className: "h-4 w-4 text-primary" }),
          t("smCpu")
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: `text-2xl font-bold ${getUsageTextColor(cpu.percent_usage)}`, children: [
              cpu.percent_usage.toFixed(1),
              "%"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              cpu.physical_cores,
              "P / ",
              cpu.total_cores,
              "L"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 w-full rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full rounded-full transition-all ${getUsageColor(cpu.percent_usage)}`,
              style: { width: `${Math.min(cpu.percent_usage, 100)}%` }
            }
          ) }),
          cpu.per_core_percent.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-1", children: cpu.per_core_percent.slice(0, 8).map((val, i) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden mb-0.5", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: `h-full rounded-full ${getUsageColor(val)}`,
                style: { width: `${Math.min(val, 100)}%` }
              }
            ) }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              val.toFixed(0),
              "%"
            ] })
          ] }, i)) }),
          cpu.frequency_current != null && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: t("smFrequency") }),
            /* @__PURE__ */ jsxs("span", { children: [
              cpu.frequency_current.toFixed(0),
              " MHz"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MemoryStick, { className: "h-4 w-4 text-primary" }),
          t("smMemory")
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: `text-2xl font-bold ${getUsageTextColor(memory.percent)}`, children: [
              memory.percent.toFixed(1),
              "%"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              formatBytes(memory.used),
              " / ",
              formatBytes(memory.total)
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 w-full rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full rounded-full transition-all ${getUsageColor(memory.percent)}`,
              style: { width: `${Math.min(memory.percent, 100)}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: t("smAvailable") }),
              /* @__PURE__ */ jsx("span", { children: formatBytes(memory.available) })
            ] }),
            memory.swap_total > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Swap (",
                memory.swap_percent.toFixed(1),
                "%)"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                formatBytes(memory.swap_used),
                " / ",
                formatBytes(memory.swap_total)
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(HardDrive, { className: "h-4 w-4 text-primary" }),
          t("smDisk")
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: disks.map((disk, i) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: `text-2xl font-bold ${getUsageTextColor(disk.percent)}`, children: [
              disk.percent.toFixed(1),
              "%"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              formatBytes(disk.used),
              " / ",
              formatBytes(disk.total)
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 w-full rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full rounded-full transition-all ${getUsageColor(disk.percent)}`,
              style: { width: `${Math.min(disk.percent, 100)}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: t("smFree") }),
            /* @__PURE__ */ jsx("span", { children: formatBytes(disk.free) })
          ] })
        ] }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Network, { className: "h-4 w-4 text-primary" }),
          t("smNetwork")
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: network.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("noData") }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: network.map((iface, i) => /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-3", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-sm mb-2", children: iface.name }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                t("smSent"),
                ":"
              ] }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatBytes(iface.bytes_sent) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                t("smReceived"),
                ":"
              ] }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatBytes(iface.bytes_recv) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                t("smPacketsSent"),
                ":"
              ] }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: iface.packets_sent.toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                t("smPacketsRecv"),
                ":"
              ] }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: iface.packets_recv.toLocaleString() })
            ] })
          ] })
        ] }, i)) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-primary" }),
          t("smTopProcesses")
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: top_processes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("noData") }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b text-muted-foreground", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left py-1.5 pr-2 font-medium", children: "PID" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-1.5 pr-2 font-medium", children: t("smProcessName") }),
            /* @__PURE__ */ jsx("th", { className: "text-right py-1.5 pr-2 font-medium", children: "CPU %" }),
            /* @__PURE__ */ jsx("th", { className: "text-right py-1.5 pr-2 font-medium", children: t("smMemUsage") }),
            /* @__PURE__ */ jsx("th", { className: "text-right py-1.5 font-medium", children: t("status") })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: top_processes.map((proc) => /* @__PURE__ */ jsxs("tr", { className: "border-b last:border-0", children: [
            /* @__PURE__ */ jsx("td", { className: "py-1.5 pr-2 text-muted-foreground", children: proc.pid }),
            /* @__PURE__ */ jsx("td", { className: "py-1.5 pr-2 font-medium truncate max-w-[120px]", children: proc.name }),
            /* @__PURE__ */ jsx("td", { className: `py-1.5 pr-2 text-right ${getUsageTextColor(proc.cpu_percent)}`, children: proc.cpu_percent.toFixed(1) }),
            /* @__PURE__ */ jsx("td", { className: "py-1.5 pr-2 text-right", children: proc.memory_percent.toFixed(1) }),
            /* @__PURE__ */ jsx("td", { className: "py-1.5 text-right", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${proc.status === "running" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`,
                children: proc.status
              }
            ) })
          ] }, proc.pid)) })
        ] }) }) })
      ] })
    ] })
  ] });
}
const MONTHS_UZ = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
const PRICE_PER_USER = 5e4;
const fmt = (n) => `${n.toLocaleString()} UZS`;
const fmtShort = (n) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
};
function KpiCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel
}) {
  return /* @__PURE__ */ jsx(Card, { className: "hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-0.5 text-xs font-medium text-success", children: [
        /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3" }),
        change
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold tracking-tight", children: value }),
      /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mt-1", children: label }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: changeLabel })
    ] })
  ] }) });
}
function AdminDashboard() {
  const {
    t,
    lang
  } = useSettings();
  const {
    data: companies = [],
    isLoading: isLoadingCompanies
  } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies()
  });
  const {
    data: users = [],
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers()
  });
  const {
    data: apps = [],
    isLoading: isLoadingApps
  } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: () => fetchApps()
  });
  const {
    data: activities = []
  } = useQuery({
    queryKey: ["admin-activity", lang],
    queryFn: () => fetchActivity(lang === "uz" ? "uz" : lang === "ru" ? "ru" : "eng"),
    refetchInterval: 6e4
  });
  const [apiResponseTime, setApiResponseTime] = useState(45);
  const {
    data: systemData,
    dataUpdatedAt: systemUpdatedAt
  } = useQuery({
    queryKey: ["system-monitor"],
    queryFn: async () => {
      const start = performance.now();
      const result = await fetchSystemMonitor();
      setApiResponseTime(Math.round(performance.now() - start));
      return result;
    },
    refetchInterval: 3e4
  });
  const loading = isLoadingCompanies || isLoadingUsers || isLoadingApps;
  const stats = useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const newUsersCount = users.filter((u) => {
      const d = new Date(u.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    const newCompaniesCount = companies.filter((c) => {
      if (!c.created_at) return false;
      const d = new Date(c.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    const activeUsersCount = users.filter((u) => u.user_status === "ACTIVE").length;
    return {
      companies: companies.length,
      activeCompanies: companies.length,
      users: users.length,
      activeUsers: activeUsersCount,
      revenue: activeUsersCount * PRICE_PER_USER,
      newCompanies: newCompaniesCount,
      newUsers: newUsersCount
    };
  }, [companies, users]);
  const monthlyGrowth = useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = MONTHS_UZ[d.getMonth()];
      const cutoff = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const usersBeforeCutoff = users.filter((u) => new Date(u.created_at) < cutoff);
      months.push({
        month,
        companies: companies.filter((c) => !c.created_at || new Date(c.created_at) < cutoff).length,
        users: usersBeforeCutoff.length,
        revenue: usersBeforeCutoff.filter((u) => u.user_status === "ACTIVE").length * PRICE_PER_USER
      });
    }
    return months;
  }, [companies, users]);
  const planDistribution = useMemo(() => {
    const counts = /* @__PURE__ */ new Map();
    users.forEach((u) => {
      if (u.company_id) counts.set(u.company_id, (counts.get(u.company_id) || 0) + 1);
    });
    let starter = 0, standard = 0, business = 0, enterprise = 0;
    counts.forEach((c) => {
      if (c <= 5) starter++;
      else if (c <= 20) standard++;
      else if (c <= 50) business++;
      else enterprise++;
    });
    return [{
      name: "Starter",
      value: starter || 1,
      color: "var(--chart-1)"
    }, {
      name: "Standard",
      value: standard || 1,
      color: "var(--chart-2)"
    }, {
      name: "Business",
      value: business || 1,
      color: "var(--chart-3)"
    }, {
      name: "Enterprise",
      value: enterprise || 1,
      color: "var(--chart-4)"
    }];
  }, [users]);
  const revenueChange = useMemo(() => {
    if (monthlyGrowth.length < 2 || monthlyGrowth[monthlyGrowth.length - 2].revenue === 0) return "+0%";
    const current = monthlyGrowth[monthlyGrowth.length - 1].revenue;
    const prev = monthlyGrowth[monthlyGrowth.length - 2].revenue;
    const pct = Math.round((current - prev) / prev * 100);
    return `${pct >= 0 ? "+" : ""}${pct}%`;
  }, [monthlyGrowth]);
  if (loading) {
    return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(AdminLayout, { title: t("adminDashboard"), subtitle: t("adminDashboardSubtitle"), children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: Array.from({
      length: 4
    }).map((_, idx) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-2", children: [
      /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-muted" }),
      /* @__PURE__ */ jsx("div", { className: "h-8 w-24 bg-muted" }),
      /* @__PURE__ */ jsx("div", { className: "h-4 w-32 bg-muted" })
    ] }) }, idx)) }) }) });
  }
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsxs(AdminLayout, { title: t("adminDashboard"), subtitle: t("adminDashboardSubtitle"), children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsx(KpiCard, { icon: Building, label: "Jami kompaniyalar", value: stats.companies.toLocaleString(), change: `+${stats.newCompanies}`, changeLabel: "Shu oyda" }),
      /* @__PURE__ */ jsx(KpiCard, { icon: Users, label: "Jami foydalanuvchilar", value: stats.users.toLocaleString(), change: `+${stats.newUsers}`, changeLabel: "Shu oyda" }),
      /* @__PURE__ */ jsx(KpiCard, { icon: Activity, label: "Faol foydalanuvchilar", value: stats.activeUsers.toLocaleString(), change: `+${Math.round(stats.activeUsers * 0.05)}`, changeLabel: "Shu oyda" }),
      /* @__PURE__ */ jsx(KpiCard, { icon: DollarSign, label: "Oylik daromad", value: fmt(stats.revenue), change: revenueChange, changeLabel: "O'tgan oyga nisbatan" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Oylik daromad dinamikasi" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: monthlyGrowth, children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "revenueGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--primary)", stopOpacity: 0.25 }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--primary)", stopOpacity: 0 })
          ] }) }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month", stroke: "var(--muted-foreground)", fontSize: 12, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 12, tickLine: false, axisLine: false, tickFormatter: (v) => fmtShort(v) }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--foreground)"
          }, formatter: (value) => [fmt(value), "Daromad"] }),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "revenue", stroke: "var(--primary)", fill: "url(#revenueGradient)", strokeWidth: 2.5 })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Tariflar taqsimoti" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: planDistribution, dataKey: "value", nameKey: "name", innerRadius: 50, outerRadius: 85, paddingAngle: 2, children: planDistribution.map((item, i) => /* @__PURE__ */ jsx(Cell, { fill: item.color }, i)) }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--foreground)"
          }, formatter: (value) => [`${value} ta kompaniya`, ""] }),
          /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
            fontSize: 12
          } })
        ] }) }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Kompaniyalar va foydalanuvchilar o'sishi" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: monthlyGrowth, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month", stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--foreground)"
          } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "companies", name: "Kompaniyalar", fill: "var(--primary)", radius: [6, 6, 0, 0] }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "users", name: "Foydalanuvchilar", fill: "var(--secondary)", radius: [6, 6, 0, 0] })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "So'nggi faollik" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: activities.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "divide-y", children: activities.map((a) => {
          const type = a.action.includes("company") ? "company" : a.action.includes("user") || a.action.includes("login") ? "user" : a.action.includes("upgrade") || a.action.includes("plan") ? "upgrade" : "app";
          const timeAgo = (() => {
            const diff = Date.now() - new Date(a.created_at).getTime();
            const mins = Math.floor(diff / 6e4);
            if (mins < 1) return "Hozir";
            if (mins < 60) return `${mins} daqiqa oldin`;
            const hours = Math.floor(mins / 60);
            if (hours < 24) return `${hours} soat oldin`;
            const days = Math.floor(hours / 24);
            return `${days} kun oldin`;
          })();
          return /* @__PURE__ */ jsxs("li", { className: "py-3 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: `h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${type === "company" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : type === "user" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : type === "upgrade" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"}`, children: type === "company" ? /* @__PURE__ */ jsx(Building, { className: "h-4 w-4" }) : type === "user" ? /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }) : type === "upgrade" ? /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Package, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0 text-sm", children: /* @__PURE__ */ jsx("span", { className: "font-medium", children: a.message }) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: timeAgo })
          ] }, a.id);
        }) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-8 w-8 mb-2 opacity-50" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Faollik mavjud emas" })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base text-sm", children: "Platforma statistikasi" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Faol kompaniyalar" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              stats.activeCompanies,
              " (",
              Math.round(stats.activeCompanies / stats.companies * 100),
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Faol foydalanuvchilar" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              stats.activeUsers,
              " (",
              Math.round(stats.activeUsers / stats.users * 100),
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "O'rtacha foydalanuvchi/kompaniya" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: Math.round(stats.users / stats.companies) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base text-sm", children: "Mobil ilovalar" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: apps.map((app) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: app.name }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            "(",
            app.tag,
            ")"
          ] })
        ] }, app.id)) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Server, { className: "h-4 w-4 text-primary" }),
          "Tizim holati"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Server holati" }),
            /* @__PURE__ */ jsx("span", { className: `font-medium ${systemData ? "text-success" : "text-muted-foreground"}`, children: systemData ? `● Ishlamoqda` : "● Tekshirilmoqda" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "API javob vaqti" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: systemData ? `~${apiResponseTime}ms` : "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Oxirgi tekshiruv" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: systemUpdatedAt ? (() => {
              const diff = Date.now() - systemUpdatedAt;
              const mins = Math.floor(diff / 6e4);
              if (mins < 1) return "Hozir";
              if (mins < 60) return `${mins} daqiqa oldin`;
              const hours = Math.floor(mins / 60);
              if (hours < 24) return `${hours} soat oldin`;
              const days = Math.floor(hours / 24);
              return `${days} kun oldin`;
            })() : "—" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(SystemMonitor, {})
  ] }) });
}
export {
  AdminDashboard as component
};
