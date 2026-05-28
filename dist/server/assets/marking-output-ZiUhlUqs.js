import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from "react";
import { u as useAuth, w as useSettings, A as API, P as PageHeader, a as Button, C as Card, j as Skeleton, b as CardContent, I as Input, S as Select, h as SelectTrigger, i as SelectValue, f as SelectContent, g as SelectItem, B as Badge } from "./router-CLlTYvOR.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle, b as DialogDescription } from "./dialog-D6yh9YE0.js";
import { Download, RefreshCw, AlertCircle, Package, ArrowUpRight, Building2, Layers, Search, X, ArrowUpDown, Table2, LayoutGrid, ChevronDown, Tag, QrCode } from "lucide-react";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-dialog";
function MarkirovkaChiqimPage() {
  const {
    user
  } = useAuth();
  const {
    t
  } = useSettings();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(/* @__PURE__ */ new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [view, setView] = useState("table");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  useEffect(() => {
    if (groups.length > 0) {
      setExpandedGroups(new Set(groups.map((g) => g.group_id)));
    }
  }, [groups]);
  const fetchData = useCallback(() => {
    const baseUrl = user?.company_rel?.base_url;
    const login = user?.user_1c_login;
    const password = user?.user_1c_password;
    if (!baseUrl || !login || !password) {
      setLoading(false);
      setError(true);
      return;
    }
    let cancelled = false;
    const basic = btoa(`${login}:${password}`);
    setLoading(true);
    setError(false);
    fetch(API.invoiceMarksByGroup(baseUrl), {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }).then((json) => {
      if (cancelled) return;
      setGroups(json.data || []);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setError(true);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.company_rel?.base_url, user?.user_1c_login, user?.user_1c_password]);
  useEffect(() => {
    const cancel = fetchData();
    return cancel;
  }, [fetchData]);
  const totalGroups = groups.length;
  const totalProducts = groups.reduce((s, g) => s + g.products.length, 0);
  const uniqueClients = new Set(groups.flatMap((g) => g.products.map((p) => p.client_name))).size;
  const filteredGroups = useMemo(() => {
    let filtered = groups;
    if (groupFilter !== "all") {
      filtered = filtered.filter((g) => String(g.group_id) === groupFilter);
    }
    if (searchQuery.trim()) {
      const words = searchQuery.trim().toLowerCase().split(/\s+/);
      filtered = filtered.map((g) => ({
        ...g,
        products: g.products.filter((p) => {
          const haystack = `${p.id} ${p.name} ${p.mark} ${p.client_name}`.toLowerCase();
          return words.every((w) => haystack.includes(w));
        })
      })).filter((g) => g.products.length > 0);
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return filtered.map((g) => ({
      ...g,
      products: [...g.products].sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name) * dir;
          case "id":
            return (a.id - b.id) * dir;
          case "client":
            return a.client_name.localeCompare(b.client_name) * dir;
          case "group":
            return g.group_name.localeCompare(g.group_name) * dir;
          default:
            return 0;
        }
      })
    }));
  }, [groups, searchQuery, groupFilter, sortBy, sortDir]);
  const exportToExcel = () => {
    const esc = (v) => (v ?? "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let html = `<table><thead><tr>`;
    const headers = ["Guruh ID", "Guruh", "Mahsulot ID", "Mahsulot", "GTIN", "To'liq mark", "Mijoz ID", "Mijoz", "Yuridik nom"];
    for (const h of headers) html += `<th>${esc(h)}</th>`;
    html += `</tr></thead><tbody>`;
    for (const group of groups) {
      for (const product of group.products) {
        html += `<tr>`;
        html += `<td>${esc(group.group_id)}</td>`;
        html += `<td>${esc(group.group_name)}</td>`;
        html += `<td>${esc(product.id)}</td>`;
        html += `<td>${esc(product.name)}</td>`;
        html += `<td>${esc(product.mark)}</td>`;
        html += `<td>${esc(product.markFull)}</td>`;
        html += `<td>${esc(product.client_id)}</td>`;
        html += `<td>${esc(product.client_name)}</td>`;
        html += `<td>${esc(product.client_yur_name)}</td>`;
        html += `</tr>`;
      }
    }
    html += `</tbody></table>`;
    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markirovka_chiqim_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("markirovkaChiqim"), description: t("markirovkaChiqimDesc"), actions: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: exportToExcel, className: "gap-1.5", children: [
        /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
        t("export")
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: fetchData, disabled: loading, className: "gap-1.5", children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }),
        t("refresh")
      ] })
    ] }) }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-10 rounded-lg" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-16 mt-3" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-20 mt-1" })
      ] }, i)) }),
      [1, 2, 3].map((i) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-48 mb-3" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-full" })
      ] }) }, i))
    ] }) : error ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 mx-auto mb-4 opacity-30" }),
      /* @__PURE__ */ jsx("p", { children: t("errorTitle") })
    ] }) : groups.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Package, { className: "h-12 w-12 mx-auto mb-4 opacity-30" }),
      /* @__PURE__ */ jsx("p", { children: t("noDataFound") })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-4", children: [
        /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0", children: /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xl sm:text-2xl font-semibold tracking-tight", children: totalGroups }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs text-muted-foreground truncate", children: t("markingBatch") })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success shrink-0", children: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xl sm:text-2xl font-semibold tracking-tight", children: totalProducts }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs text-muted-foreground truncate", children: t("products") })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0", children: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xl sm:text-2xl font-semibold tracking-tight", children: uniqueClients }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs text-muted-foreground truncate", children: t("clients") })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0", children: /* @__PURE__ */ jsx(Layers, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xl sm:text-2xl font-semibold tracking-tight", children: totalGroups }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-xs text-muted-foreground truncate", children: t("markirovkaChiqimBatches") })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: `${t("search")}...`, className: "pl-9", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }),
          searchQuery && /* @__PURE__ */ jsx("button", { onClick: () => setSearchQuery(""), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Select, { value: groupFilter, onValueChange: setGroupFilter, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full sm:w-[180px] h-9", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: t("markingBatch") }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("all") }),
              groups.map((g) => /* @__PURE__ */ jsx(SelectItem, { value: String(g.group_id), children: g.group_name }, g.group_id))
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Select, { value: sortBy, onValueChange: setSortBy, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full sm:w-[140px] h-9", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sort" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "name", children: t("name") }),
              /* @__PURE__ */ jsx(SelectItem, { value: "id", children: "ID" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "client", children: t("client") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => setSortDir((d) => d === "asc" ? "desc" : "asc"), className: "shrink-0 gap-1.5 h-9", children: [
            /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-3.5 w-3.5" }),
            sortDir === "asc" ? "ASC" : "DESC"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex border rounded-md overflow-hidden", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setView("table"), className: `p-1.5 transition-colors ${view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`, title: t("tableView"), children: /* @__PURE__ */ jsx(Table2, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("button", { onClick: () => setView("cards"), className: `p-1.5 transition-colors ${view === "cards" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`, title: t("cardsView"), children: /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4" }) })
          ] })
        ] })
      ] }) }) }),
      filteredGroups.length === 0 && !loading && /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Search, { className: "h-8 w-8 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: t("noDataFound") })
      ] }),
      filteredGroups.map((group) => {
        const isOpen = expandedGroups.has(group.group_id);
        return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-2 border-b cursor-pointer select-none", onClick: () => setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(group.group_id)) next.delete(group.group_id);
            else next.add(group.group_id);
            return next;
          }), children: [
            /* @__PURE__ */ jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "" : "-rotate-90"}` }),
            /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm", children: group.group_name }),
            /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "ml-auto text-[10px]", children: group.products.length })
          ] }),
          isOpen && /* @__PURE__ */ jsx("div", { className: "pt-1", children: group.products.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-6 text-sm text-muted-foreground", children: t("noDataFound") }) : view === "table" ? /* @__PURE__ */ jsxs("div", { className: "divide-y", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_100px_140px_100px] gap-3 px-2 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: t("products") }),
              /* @__PURE__ */ jsx("span", { className: "text-center", children: t("markingGtin") }),
              /* @__PURE__ */ jsx("span", { className: "text-center", children: t("client") }),
              /* @__PURE__ */ jsx("span", { className: "text-center", children: "ID" })
            ] }),
            group.products.map((product) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_100px_140px_100px] gap-3 px-2 py-3 items-center cursor-pointer hover:bg-muted/30 transition-colors rounded-sm", onClick: () => setSelectedProduct({
              product,
              groupName: group.group_name
            }), children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-md bg-primary/5 text-primary shrink-0", children: /* @__PURE__ */ jsx(Tag, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: product.name }) })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground tabular-nums font-mono text-[11px] text-center truncate", children: product.mark || "—" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground text-center truncate", title: product.client_name, children: product.client_name || "—" }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground tabular-nums font-mono text-[11px] text-center", children: [
                "#",
                product.id
              ] })
            ] }, product.id))
          ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3", children: group.products.map((product) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-3 cursor-pointer hover:bg-muted/30 hover:shadow-sm transition-all", onClick: () => setSelectedProduct({
            product,
            groupName: group.group_name
          }), children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx(Tag, { className: "h-4 w-4 shrink-0 text-primary" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: product.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  t("markingGtin"),
                  ":"
                ] }),
                /* @__PURE__ */ jsx("span", { className: "font-mono truncate ml-2", children: product.mark || "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  t("client"),
                  ":"
                ] }),
                /* @__PURE__ */ jsx("span", { className: "truncate ml-2", children: product.client_name || "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "ID:" }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono", children: [
                  "#",
                  product.id
                ] })
              ] })
            ] })
          ] }, product.id)) }) })
        ] }) }, group.group_id);
      })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: !!selectedProduct, onOpenChange: (o) => !o && setSelectedProduct(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-lg", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Tag, { className: "h-4 w-4 text-primary" }),
          selectedProduct?.product.name
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: selectedProduct?.groupName })
      ] }),
      selectedProduct && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-muted/30 p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-1", children: t("markingGtin") }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-mono font-medium break-all", children: selectedProduct.product.mark || "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-muted/30 p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "ID" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm font-mono font-medium", children: [
              "#",
              selectedProduct.product.id
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-lg border", children: /* @__PURE__ */ jsxs("div", { className: "text-center p-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsx(Building2, { className: "h-3 w-3" }),
            t("client")
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", children: selectedProduct.product.client_name || "—" }),
          selectedProduct.product.client_yur_name && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: selectedProduct.product.client_yur_name })
        ] }) }),
        selectedProduct.product.markFull && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-muted/30 p-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(QrCode, { className: "h-3 w-3" }),
            "Mark (to'liq)"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-mono break-all text-muted-foreground leading-relaxed select-all", children: selectedProduct.product.markFull })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  MarkirovkaChiqimPage as component
};
