import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { a as useSettings, u as useAuth, b as useIsMobile, A as API, P as PageHeader, C as Card, I as Input, B as Button, s as Skeleton, g as CardContent, h as Badge, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell, t as formatWithSpaces } from "./router-CTVAwSR8.js";
import { C as Collapsible, a as CollapsibleTrigger, b as CollapsibleContent } from "./collapsible-DUtqt5i7.js";
import { Search, Users, LayoutGrid, Rows3, AlertCircle, Store, ChevronDown, Tag, Phone, MapPin, User, Calendar, Wallet } from "lucide-react";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-collapsible";
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
    color: isNegative ? "text-red-500" : "text-green-600"
  };
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
  const filteredGroups = useMemo(() => {
    if (!q.trim()) return groups;
    const lower = q.toLowerCase();
    return groups.map((g) => ({
      ...g,
      clients: g.clients.filter((c) => c.name.toLowerCase().includes(lower) || c.Phone.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower) || c.agent.agent_name.toLowerCase().includes(lower) || c.contactName.toLowerCase().includes(lower) || c.INN.toLowerCase().includes(lower))
    })).filter((g) => g.clients.length > 0);
  }, [groups, q]);
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
    /* @__PURE__ */ jsx(Card, { className: "p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-center", children: [
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
    ] }) }),
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
              client.status_name && /* @__PURE__ */ jsx(Badge, { variant: client.status_name === "faol" ? "default" : "secondary", className: "shrink-0 text-[10px] px-1.5 py-0", children: client.status_name })
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
                client.status_name && /* @__PURE__ */ jsx(Badge, { variant: client.status_name === "faol" ? "default" : "secondary", className: "text-[10px] px-1.5 py-0", children: client.status_name })
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
  ] });
}
export {
  ClientsPage as component
};
