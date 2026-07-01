import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { w as useSettings, u as useAuth, v as useIsMobile, A as API, P as PageHeader, C as Card, I as Input, a as Button, j as Skeleton, b as CardContent, B as Badge, T as Table, n as TableHeader, o as TableRow, m as TableHead, k as TableBody, l as TableCell, r as formatWithSpaces } from "./router-cZ9I3NNJ.js";
import { C as Collapsible, b as CollapsibleTrigger, a as CollapsibleContent } from "./collapsible-tP11aPha.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-8cGmox-V.js";
import { toast } from "sonner";
import { Search, Users, LayoutGrid, Rows3, Filter, AlertCircle, Store, ChevronDown, Tag, Phone, MapPin, User, Calendar, Wallet, RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-collapsible";
import "@radix-ui/react-tabs";
function formatNumber(n) {
  return formatWithSpaces(n, 2);
}
function debtScore(debt) {
  return debt.UZS + debt.USD;
}
function saleDateScore(value) {
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return parsed;
  return Date.parse(`1970-01-01T00:00:00Z`);
}
function formatDebt(debt) {
  const parts = [];
  if (debt.UZS !== 0) parts.push(`${formatNumber(debt.UZS)} UZS`);
  if (debt.USD !== 0) parts.push(`${formatNumber(debt.USD)} USD`);
  if (parts.length === 0) return {
    text: "0",
    color: "text-muted-foreground"
  };
  Math.abs(debt.UZS) + Math.abs(debt.USD);
  const isNegative = debt.UZS < 0 || debt.USD < 0;
  return {
    text: parts.join(" / "),
    color: isNegative ? "text-green-600" : "text-red-500"
  };
}
function toApiDate(iso) {
  return iso.replaceAll("-", "");
}
function todayIso() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function monthStartIso() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function formatDisplayDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function parseSaleDate(value) {
  if (!value) return 0;
  const chunks = value.split(".");
  if (chunks.length !== 3) return 0;
  const [day, month, year] = chunks;
  return Date.parse(`${year}-${month}-${day}T00:00:00Z`) || 0;
}
function saleStatus(client) {
  if (!client.PoslednayaProdaja) return "new";
  const ms = parseSaleDate(client.PoslednayaProdaja);
  if (!ms) return "new";
  const days = (Date.now() - ms) / (1e3 * 60 * 60 * 24);
  return days <= 15 ? "active" : "passive";
}
function ClientsPage() {
  const {
    t
  } = useSettings();
  const {
    user
  } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const isMobile = useIsMobile();
  useEffect(() => {
    setViewMode(isMobile ? "cards" : "table");
  }, [isMobile]);
  const [sortMode, setSortMode] = useState("name-asc");
  const [expandedGroups, setExpandedGroups] = useState(/* @__PURE__ */ new Set());
  const [tab, setTab] = useState("mijozlar");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDebt, setFilterDebt] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAgent, setFilterAgent] = useState("all");
  const [filterSaleStatus, setFilterSaleStatus] = useState("all");
  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }
    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    fetch(API.clientsByGroup(baseUrl), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((data) => {
      setGroups(data.data ?? []);
      const allIds = (data.data ?? []).map((g) => g.group_id);
      setExpandedGroups(new Set(allIds));
    }).catch((err) => {
      setError(err.message);
    }).finally(() => setLoading(false));
  }, [user, t]);
  const filterOptions = useMemo(() => {
    const categories = /* @__PURE__ */ new Set();
    const agents = /* @__PURE__ */ new Set();
    for (const g of groups) {
      for (const c of g.clients) {
        if (c.category) categories.add(c.category);
        if (c.agent.agent_name) agents.add(c.agent.agent_name);
      }
    }
    return {
      categories: [...categories].sort(),
      agents: [...agents].sort()
    };
  }, [groups]);
  const filteredGroups = useMemo(() => {
    let base = groups;
    if (q.trim()) {
      const lower = q.toLowerCase();
      base = base.map((g) => ({
        ...g,
        clients: g.clients.filter((c) => c.name.toLowerCase().includes(lower) || c.Phone.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower) || c.agent.agent_name.toLowerCase().includes(lower) || c.contactName.toLowerCase().includes(lower) || c.INN.toLowerCase().includes(lower))
      })).filter((g) => g.clients.length > 0);
    }
    if (filterStatus !== "all") {
      base = base.map((g) => ({
        ...g,
        clients: g.clients.filter((c) => c.status_name === filterStatus)
      })).filter((g) => g.clients.length > 0);
    }
    if (filterDebt === "with") {
      base = base.map((g) => ({
        ...g,
        clients: g.clients.filter((c) => c.debt.UZS > 0 || c.debt.USD > 0)
      })).filter((g) => g.clients.length > 0);
    } else if (filterDebt === "credit") {
      base = base.map((g) => ({
        ...g,
        clients: g.clients.filter((c) => c.debt.UZS < 0 || c.debt.USD < 0)
      })).filter((g) => g.clients.length > 0);
    } else if (filterDebt === "no") {
      base = base.map((g) => ({
        ...g,
        clients: g.clients.filter((c) => c.debt.UZS === 0 && c.debt.USD === 0)
      })).filter((g) => g.clients.length > 0);
    }
    if (filterCategory !== "all") {
      base = base.map((g) => ({
        ...g,
        clients: g.clients.filter((c) => c.category === filterCategory)
      })).filter((g) => g.clients.length > 0);
    }
    if (filterAgent !== "all") {
      base = base.map((g) => ({
        ...g,
        clients: g.clients.filter((c) => c.agent.agent_name === filterAgent)
      })).filter((g) => g.clients.length > 0);
    }
    if (filterSaleStatus !== "all") {
      base = base.map((g) => ({
        ...g,
        clients: g.clients.filter((c) => saleStatus(c) === filterSaleStatus)
      })).filter((g) => g.clients.length > 0);
    }
    return base;
  }, [groups, q, filterStatus, filterDebt, filterCategory, filterAgent, filterSaleStatus]);
  const sortedGroups = useMemo(() => {
    return filteredGroups.map((group) => {
      const clients = [...group.clients].sort((a, b) => {
        switch (sortMode) {
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "debt-desc":
            return debtScore(b.debt) - debtScore(a.debt);
          case "debt-asc":
            return debtScore(a.debt) - debtScore(b.debt);
          case "last-sale-desc":
            return saleDateScore(b.PoslednayaProdaja) - saleDateScore(a.PoslednayaProdaja);
          case "last-sale-asc":
            return saleDateScore(a.PoslednayaProdaja) - saleDateScore(b.PoslednayaProdaja);
          case "name-asc":
          default:
            return a.name.localeCompare(b.name);
        }
      });
      return {
        ...group,
        clients
      };
    });
  }, [filteredGroups, sortMode]);
  const totalClients = useMemo(() => sortedGroups.reduce((sum, g) => sum + g.clients.length, 0), [sortedGroups]);
  const toggleGroup = (id) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("clients"), description: t("clientsDesc") }),
    /* @__PURE__ */ jsxs(Tabs, { value: tab, onValueChange: setTab, className: "mb-6", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "mb-4", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "mijozlar", children: t("clients") }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "aktSverka", children: t("aktSverka") })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "mijozlar", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-4 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative flex-1 w-full", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { placeholder: t("search"), className: "pl-9", value: q, onChange: (e) => setQ(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground shrink-0", children: [
              /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxs("span", { children: [
                totalClients,
                " ",
                t("clients").toLowerCase()
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxs("select", { value: sortMode, onChange: (e) => setSortMode(e.target.value), className: "h-9 rounded-md border border-input bg-background px-3 text-sm", children: [
              /* @__PURE__ */ jsx("option", { value: "name-asc", children: t("sortAZ") }),
              /* @__PURE__ */ jsx("option", { value: "name-desc", children: t("sortZA") }),
              /* @__PURE__ */ jsx("option", { value: "debt-desc", children: t("sortDebtHighLow") }),
              /* @__PURE__ */ jsx("option", { value: "debt-asc", children: t("sortDebtLowHigh") }),
              /* @__PURE__ */ jsx("option", { value: "last-sale-desc", children: t("sortLastSaleNewOld") }),
              /* @__PURE__ */ jsx("option", { value: "last-sale-asc", children: t("sortLastSaleOldNew") })
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
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-3 pt-3 border-t", children: [
            /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), className: "h-8 rounded-md border border-input bg-background px-2 text-xs", children: [
              /* @__PURE__ */ jsxs("option", { value: "all", children: [
                t("status"),
                ": ",
                t("all")
              ] }),
              /* @__PURE__ */ jsx("option", { value: "faol", children: t("active") }),
              /* @__PURE__ */ jsx("option", { value: "passiv", children: t("inactive") })
            ] }),
            /* @__PURE__ */ jsxs("select", { value: filterDebt, onChange: (e) => setFilterDebt(e.target.value), className: "h-8 rounded-md border border-input bg-background px-2 text-xs", children: [
              /* @__PURE__ */ jsxs("option", { value: "all", children: [
                t("debt"),
                ": ",
                t("all")
              ] }),
              /* @__PURE__ */ jsx("option", { value: "with", children: t("withDebt") }),
              /* @__PURE__ */ jsx("option", { value: "credit", children: t("withCredit") }),
              /* @__PURE__ */ jsx("option", { value: "no", children: t("noDebt") })
            ] }),
            /* @__PURE__ */ jsxs("select", { value: filterCategory, onChange: (e) => setFilterCategory(e.target.value), className: "h-8 rounded-md border border-input bg-background px-2 text-xs max-w-[160px]", children: [
              /* @__PURE__ */ jsxs("option", { value: "all", children: [
                t("category"),
                ": ",
                t("all")
              ] }),
              filterOptions.categories.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
            ] }),
            /* @__PURE__ */ jsxs("select", { value: filterAgent, onChange: (e) => setFilterAgent(e.target.value), className: "h-8 rounded-md border border-input bg-background px-2 text-xs max-w-[180px]", children: [
              /* @__PURE__ */ jsxs("option", { value: "all", children: [
                t("agent"),
                ": ",
                t("all")
              ] }),
              filterOptions.agents.map((a) => /* @__PURE__ */ jsx("option", { value: a, children: a }, a))
            ] }),
            /* @__PURE__ */ jsxs("select", { value: filterSaleStatus, onChange: (e) => setFilterSaleStatus(e.target.value), className: "h-8 rounded-md border border-input bg-background px-2 text-xs", children: [
              /* @__PURE__ */ jsxs("option", { value: "all", children: [
                t("lastSale"),
                ": ",
                t("all")
              ] }),
              /* @__PURE__ */ jsx("option", { value: "active", children: t("saleStatusActive") }),
              /* @__PURE__ */ jsx("option", { value: "passive", children: t("saleStatusPassive") }),
              /* @__PURE__ */ jsx("option", { value: "new", children: t("saleStatusNew") })
            ] }),
            (filterStatus !== "all" || filterDebt !== "all" || filterCategory !== "all" || filterAgent !== "all" || filterSaleStatus !== "all") && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
              setFilterStatus("all");
              setFilterDebt("all");
              setFilterCategory("all");
              setFilterAgent("all");
              setFilterSaleStatus("all");
            }, className: "h-8 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors", children: [
              t("cancel"),
              " ×"
            ] })
          ] })
        ] }),
        loading && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({
          length: 3
        }).map((_, gi) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Card, { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(Skeleton, { className: "h-9 w-9 rounded-lg" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-28" }),
                /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-16" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-8 rounded-full" })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-2 px-1", children: Array.from({
            length: gi === 0 ? 4 : 2
          }).map((_2, ci) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 flex-1", children: [
                /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-3/4" }),
                /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-1/2" })
              ] }),
              /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-12 rounded-full" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-2/3" }),
              /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-1/2" }),
              /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-3/5" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-20" }),
              /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-16 rounded" })
            ] })
          ] }) }, ci)) })
        ] }, gi)) }),
        error && !loading && /* @__PURE__ */ jsx(Card, { className: "p-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-destructive" }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("errorTitle") }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("errorClientsLoad") })
          ] })
        ] }) }),
        !loading && !error && sortedGroups.length === 0 && /* @__PURE__ */ jsx(Card, { className: "p-12 text-center text-muted-foreground", children: t("notFound") }),
        !loading && !error && sortedGroups.map((group) => {
          const isOpen = expandedGroups.has(group.group_id);
          return /* @__PURE__ */ jsxs(Collapsible, { open: isOpen, onOpenChange: () => toggleGroup(group.group_id), className: "mb-3", children: [
            /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsx("button", { className: "w-full", children: /* @__PURE__ */ jsx(Card, { className: "px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Store, { className: "h-4.5 w-4.5 text-primary" }) }),
                /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: group.group_name }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    group.clients.length,
                    " ",
                    t("clients").toLowerCase()
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: group.clients.length }),
                /* @__PURE__ */ jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}` })
              ] })
            ] }) }) }) }),
            /* @__PURE__ */ jsx(CollapsibleContent, { children: viewMode === "cards" ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-2 px-1", children: group.clients.map((client) => {
              const debt = formatDebt(client.debt);
              return /* @__PURE__ */ jsx(Card, { className: "overflow-hidden hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold truncate", children: client.name }),
                    client.contactName && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate", children: client.contactName })
                  ] }),
                  client.status_name && /* @__PURE__ */ jsx(Badge, { variant: client.status_name === "faol" ? "default" : "secondary", className: "shrink-0 text-[10px] px-1.5 py-0", children: client.status_name }),
                  (() => {
                    const ss = saleStatus(client);
                    const label = ss === "new" ? t("saleStatusNew") : ss === "active" ? t("saleStatusActive") : t("saleStatusPassive");
                    const color = ss === "new" ? "border-muted-foreground/30 text-muted-foreground" : ss === "active" ? "border-green-500/30 bg-green-500/10 text-green-600" : "border-red-500/30 bg-red-500/10 text-red-500";
                    return /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `shrink-0 text-[10px] px-1.5 py-0 ${color}`, children: label });
                  })()
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-xs text-muted-foreground", children: [
                  client.category && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Tag, { className: "h-3.5 w-3.5 shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: client.category })
                  ] }),
                  client.Phone && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5 shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: client.Phone })
                  ] }),
                  client.Orientr && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5 shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: client.Orientr })
                  ] }),
                  client.agent.agent_name && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5 shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: client.agent.agent_name })
                  ] }),
                  client.PoslednayaProdaja && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5 shrink-0" }),
                    /* @__PURE__ */ jsxs("span", { className: "truncate", children: [
                      t("lastSale"),
                      ": ",
                      client.PoslednayaProdaja
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Wallet, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                    /* @__PURE__ */ jsx("span", { className: `text-xs font-medium ${debt.color}`, children: debt.text })
                  ] }),
                  client.filial_name && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded", children: client.filial_name })
                ] })
              ] }) }, client.id);
            }) }) : /* @__PURE__ */ jsx(Card, { className: "mt-2 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
              /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableHead, { children: t("clients") }),
                /* @__PURE__ */ jsx(TableHead, { children: t("contact") }),
                /* @__PURE__ */ jsx(TableHead, { children: t("phone") }),
                /* @__PURE__ */ jsx(TableHead, { children: t("category") }),
                /* @__PURE__ */ jsx(TableHead, { children: t("agent") }),
                /* @__PURE__ */ jsx(TableHead, { children: t("filial") }),
                /* @__PURE__ */ jsx(TableHead, { children: t("lastSale") }),
                /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("debt") })
              ] }) }),
              /* @__PURE__ */ jsx(TableBody, { children: group.clients.map((client) => {
                const debt = formatDebt(client.debt);
                return /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-medium min-w-[220px]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: client.name }),
                    client.status_name && /* @__PURE__ */ jsx(Badge, { variant: client.status_name === "faol" ? "default" : "secondary", className: "text-[10px] px-1.5 py-0", children: client.status_name }),
                    (() => {
                      const ss = saleStatus(client);
                      const label = ss === "new" ? t("saleStatusNew") : ss === "active" ? t("saleStatusActive") : t("saleStatusPassive");
                      const color = ss === "new" ? "border-muted-foreground/30 text-muted-foreground" : ss === "active" ? "border-green-500/30 bg-green-500/10 text-green-600" : "border-red-500/30 bg-red-500/10 text-red-500";
                      return /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `text-[10px] px-1.5 py-0 ${color}`, children: label });
                    })()
                  ] }) }),
                  /* @__PURE__ */ jsx(TableCell, { className: "min-w-[160px]", children: client.contactName || "-" }),
                  /* @__PURE__ */ jsx(TableCell, { children: client.Phone || "-" }),
                  /* @__PURE__ */ jsx(TableCell, { children: client.category || "-" }),
                  /* @__PURE__ */ jsx(TableCell, { children: client.agent.agent_name || "-" }),
                  /* @__PURE__ */ jsx(TableCell, { children: client.filial_name || "-" }),
                  /* @__PURE__ */ jsx(TableCell, { children: client.PoslednayaProdaja || "-" }),
                  /* @__PURE__ */ jsx(TableCell, { className: `text-right font-medium ${debt.color}`, children: debt.text })
                ] }, client.id);
              }) })
            ] }) }) }) })
          ] }, group.group_id);
        })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "aktSverka", forceMount: true, className: "data-[state=inactive]:hidden", children: /* @__PURE__ */ jsx(AktSverkaTab, { groups, user, t }) })
    ] })
  ] });
}
function AktSverkaTab({
  groups,
  user,
  t: tr
}) {
  const allClients = useMemo(() => {
    const result = [];
    for (const g of groups) {
      for (const c of g.clients) {
        if (!result.some((x) => x.id === c.id)) {
          result.push({
            id: c.id,
            name: c.name
          });
        }
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [groups]);
  const [clientQuery, setClientQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dateBegin, setDateBegin] = useState(monthStartIso());
  const [dateEnd, setDateEnd] = useState(todayIso());
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDocs, setExpandedDocs] = useState(/* @__PURE__ */ new Set());
  const dateBeginRef = useRef(null);
  const dateEndRef = useRef(null);
  const dropdownRef = useRef(null);
  const filteredClients = useMemo(() => {
    if (!clientQuery.trim()) return allClients.slice(0, 30);
    const q = clientQuery.toLowerCase();
    return allClients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 30);
  }, [allClients, clientQuery]);
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const fetchAktSverka = useCallback(() => {
    if (!selectedClient) {
      toast.error(tr("noClientSelected"));
      return;
    }
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      toast.error(tr("notAvailable"));
      return;
    }
    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    setLoading(true);
    setError(null);
    fetch(API.aktSverka(baseUrl, selectedClient.id, 1, 1, toApiDate(dateBegin), toApiDate(dateEnd)), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((data) => {
      const result = data.data ?? [];
      setDocs(result);
      toast.success(`${tr("aktSverka")} — ${result.length} ${tr("orders").toLowerCase()}`);
    }).catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error(msg);
    }).finally(() => setLoading(false));
  }, [selectedClient, user, dateBegin, dateEnd, tr]);
  useEffect(() => {
    if (selectedClient) fetchAktSverka();
  }, [selectedClient, dateBegin, dateEnd, fetchAktSverka]);
  const toggleDoc = (id) => {
    setExpandedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const totalDebt = docs.reduce((s, d) => s + d.debt, 0);
  const totalCredit = docs.reduce((s, d) => s + d.credit, 0);
  const totalBalance = docs.reduce((s, d) => s + d.balance, 0);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-end", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 w-full relative", ref: dropdownRef, children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5 block", children: tr("selectClient") }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx("input", { type: "text", className: "w-full h-10 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1", placeholder: tr("search"), value: selectedClient ? selectedClient.name : clientQuery, onChange: (e) => {
            setClientQuery(e.target.value);
            setSelectedClient(null);
            setShowDropdown(true);
          }, onFocus: () => setShowDropdown(true) })
        ] }),
        showDropdown && filteredClients.length > 0 && !selectedClient && /* @__PURE__ */ jsx("div", { className: "absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md max-h-60 overflow-auto", children: filteredClients.map((c) => /* @__PURE__ */ jsx("button", { type: "button", className: "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors", onClick: () => {
          setSelectedClient(c);
          setClientQuery("");
          setShowDropdown(false);
        }, children: c.name }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5", children: tr("dan") }),
          /* @__PURE__ */ jsx("input", { ref: dateBeginRef, type: "date", value: dateBegin, onChange: (e) => setDateBegin(e.target.value), className: "sr-only" }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => dateBeginRef.current?.showPicker(), className: "flex items-center gap-2 px-3 py-2 bg-muted rounded-lg cursor-pointer border border-transparent hover:border-primary/20 transition-colors text-sm", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-primary shrink-0" }),
            formatDisplayDate(dateBegin)
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-sm mt-5", children: "—" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5", children: tr("gacha") }),
          /* @__PURE__ */ jsx("input", { ref: dateEndRef, type: "date", value: dateEnd, onChange: (e) => setDateEnd(e.target.value), className: "sr-only" }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => dateEndRef.current?.showPicker(), className: "flex items-center gap-2 px-3 py-2 bg-muted rounded-lg cursor-pointer border border-transparent hover:border-primary/20 transition-colors text-sm", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-primary shrink-0" }),
            formatDisplayDate(dateEnd)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", size: "sm", className: "shrink-0 h-10", onClick: fetchAktSverka, disabled: loading, children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline ml-1", children: tr("refresh") })
      ] })
    ] }) }),
    !selectedClient && /* @__PURE__ */ jsx(Card, { className: "p-12 text-center text-muted-foreground", children: tr("noClientSelected") }),
    selectedClient && loading && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({
      length: 3
    }).map((_, i) => /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-32" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-24" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-6", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-20" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-20" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-20" })
      ] })
    ] }) }, i)) }),
    selectedClient && error && !loading && /* @__PURE__ */ jsx(Card, { className: "p-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-destructive" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: error })
    ] }) }),
    selectedClient && !loading && !error && docs.length === 0 && /* @__PURE__ */ jsx(Card, { className: "p-12 text-center text-muted-foreground", children: tr("noSverkaData") }),
    selectedClient && !loading && !error && docs.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: tr("debt") }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-red-500", children: formatNumber(totalDebt) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: tr("credit") }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-green-600", children: formatNumber(totalCredit) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: tr("balance") }),
          /* @__PURE__ */ jsx("p", { className: `text-lg font-bold ${totalBalance >= 0 ? "text-green-600" : "text-red-500"}`, children: formatNumber(totalBalance) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: docs.map((doc) => {
        const isOpen = expandedDocs.has(doc.id_doc);
        return /* @__PURE__ */ jsxs(Collapsible, { open: isOpen, onOpenChange: () => toggleDoc(doc.id_doc), children: [
          /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsx("button", { className: "w-full text-left", children: /* @__PURE__ */ jsx(Card, { className: "p-4 hover:bg-muted/50 transition-colors cursor-pointer", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: `h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${doc.credit > 0 ? "bg-green-500/10" : "bg-primary/10"}`, children: doc.credit > 0 ? /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4 text-green-500" }) : /* @__PURE__ */ jsx(ArrowDownRight, { className: "h-4 w-4 text-primary" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: doc.type_doc }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: doc.date_doc })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm shrink-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-red-500 font-medium", children: formatNumber(doc.debt) }),
              /* @__PURE__ */ jsx("span", { className: "text-green-600 font-medium", children: formatNumber(doc.credit) }),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-medium min-w-[80px] text-right", children: formatNumber(doc.balance) }),
              /* @__PURE__ */ jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}` })
            ] })
          ] }) }) }) }),
          /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx("div", { className: "mt-1 mb-3 ml-4 border-l-2 border-muted pl-4", children: /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { className: "text-xs", children: tr("product") }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-xs text-center", children: tr("quantity") }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-xs text-center", children: tr("price") }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-xs text-right", children: tr("debt") }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-xs text-right", children: tr("credit") })
            ] }) }),
            /* @__PURE__ */ jsx(TableBody, { children: doc.detals.map((d, di) => /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "text-xs", children: d.osnova }),
              /* @__PURE__ */ jsxs(TableCell, { className: "text-xs text-center", children: [
                d.qty,
                " ",
                d.ed_izm
              ] }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-xs text-center", children: d.sena }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-xs text-right text-red-500", children: d.debt ? formatNumber(d.debt) : "—" }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-xs text-right text-green-600", children: d.credit ? formatNumber(d.credit) : "—" })
            ] }, di)) })
          ] }) }) })
        ] }, doc.id_doc);
      }) })
    ] })
  ] });
}
export {
  ClientsPage as component
};
