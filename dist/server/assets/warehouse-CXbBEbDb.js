import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { a as useSettings, u as useAuth, b as useIsMobile, A as API, P as PageHeader, C as Card, g as CardContent, s as Skeleton, I as Input, B as Button, S as Select, c as SelectTrigger, d as SelectValue, e as SelectContent, f as SelectItem, h as Badge, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell, t as formatWithSpaces } from "./router-CTVAwSR8.js";
import { Boxes, Package, TrendingUp, CircleAlert, Search, SlidersHorizontal, LayoutGrid, Rows3, X, AlertCircle, Store, ChevronDown } from "lucide-react";
import { C as Collapsible, a as CollapsibleTrigger, b as CollapsibleContent } from "./collapsible-DUtqt5i7.js";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-collapsible";
function fmt(n) {
  return formatWithSpaces(n, 2);
}
function fmtInt(n) {
  return formatWithSpaces(n, 0);
}
function WarehousePage() {
  const {
    t
  } = useSettings();
  const {
    user
  } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const isMobile = useIsMobile();
  useEffect(() => {
    setViewMode(isMobile ? "cards" : "table");
  }, [isMobile]);
  const [expandedGroups, setExpandedGroups] = useState(/* @__PURE__ */ new Set());
  const [q, setQ] = useState("");
  const [sortMode, setSortMode] = useState("none");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [typePriceFilter, setTypePriceFilter] = useState("all");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }
    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    fetch(API.productsByGroup(baseUrl), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((data) => {
      const list = data.data ?? [];
      setGroups(list);
      setExpandedGroups(new Set(list.map((g) => g.group_id)));
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [user, t]);
  const allProducts = useMemo(() => groups.flatMap((g) => g.products), [groups]);
  const uniqueCategories = useMemo(() => Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean))).sort(), [allProducts]);
  const uniqueStores = useMemo(() => Array.from(new Set(allProducts.map((p) => p.store_name).filter(Boolean))).sort(), [allProducts]);
  const uniqueBrands = useMemo(() => Array.from(new Set(allProducts.map((p) => p.brand).filter(Boolean))).sort(), [allProducts]);
  const uniqueTypePrices = useMemo(() => Array.from(new Set(allProducts.map((p) => p.type_price).filter(Boolean))).sort(), [allProducts]);
  const stats = useMemo(() => {
    const totalGroups = groups.length;
    const totalProducts = allProducts.length;
    const totalQty = allProducts.reduce((s, p) => s + (p.qty ?? 0), 0);
    const totalValue = allProducts.reduce((s, p) => s + (p.price ?? 0) * (p.qty ?? 0), 0);
    const lowStock = allProducts.filter((p) => (p.qty ?? 0) <= 0).length;
    const inStock = allProducts.filter((p) => (p.qty ?? 0) > 0).length;
    return {
      totalGroups,
      totalProducts,
      totalQty,
      totalValue,
      lowStock,
      inStock
    };
  }, [groups, allProducts]);
  const filteredGroups = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return groups.map((group) => {
      let products = [...group.products];
      if (lower) {
        products = products.filter((p) => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower) || p.store_name.toLowerCase().includes(lower) || p.articul.toLowerCase().includes(lower) || (p.brand ?? "").toLowerCase().includes(lower));
      }
      if (categoryFilter !== "all") products = products.filter((p) => p.category === categoryFilter);
      if (storeFilter !== "all") products = products.filter((p) => p.store_name === storeFilter);
      if (brandFilter !== "all") products = products.filter((p) => p.brand === brandFilter);
      if (typePriceFilter !== "all") products = products.filter((p) => p.type_price === typePriceFilter);
      if (minQty !== "") products = products.filter((p) => (p.qty ?? 0) >= Number(minQty));
      if (maxQty !== "") products = products.filter((p) => (p.qty ?? 0) <= Number(maxQty));
      if (minPrice !== "") products = products.filter((p) => (p.price ?? 0) >= Number(minPrice));
      if (maxPrice !== "") products = products.filter((p) => (p.price ?? 0) <= Number(maxPrice));
      if (lowStockOnly) products = products.filter((p) => (p.qty ?? 0) <= 0);
      if (sortMode !== "none") {
        products.sort((a, b) => {
          switch (sortMode) {
            case "name-desc":
              return b.name.localeCompare(a.name);
            case "qty-desc":
              return b.qty - a.qty;
            case "qty-asc":
              return a.qty - b.qty;
            case "price-desc":
              return b.price - a.price;
            case "price-asc":
              return a.price - b.price;
            case "name-asc":
            default:
              return a.name.localeCompare(b.name);
          }
        });
      }
      return {
        ...group,
        products
      };
    }).filter((g) => g.products.length > 0);
  }, [groups, q, sortMode, categoryFilter, storeFilter, brandFilter, typePriceFilter, minQty, maxQty, minPrice, maxPrice, lowStockOnly]);
  const totalFiltered = useMemo(() => filteredGroups.reduce((s, g) => s + g.products.length, 0), [filteredGroups]);
  const activeFiltersCount = [categoryFilter !== "all", storeFilter !== "all", brandFilter !== "all", typePriceFilter !== "all", minQty !== "", maxQty !== "", minPrice !== "", maxPrice !== "", lowStockOnly].filter(Boolean).length;
  const clearFilters = () => {
    setQ("");
    setCategoryFilter("all");
    setStoreFilter("all");
    setBrandFilter("all");
    setTypePriceFilter("all");
    setMinQty("");
    setMaxQty("");
    setMinPrice("");
    setMaxPrice("");
    setLowStockOnly(false);
    setSortMode("none");
  };
  const toggleGroup = (id) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("warehouse"), description: t("warehouseDesc") }),
    loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4", children: Array.from({
      length: 4
    }).map((_, i) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24 mb-2" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-16" })
    ] }) }, i)) }) : !error ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("products") }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: fmtInt(stats.totalProducts) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            stats.totalGroups,
            " ",
            t("category").toLowerCase()
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Boxes, { className: "h-5 w-5 text-primary" }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("totalVolumeQty") }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: fmt(stats.totalQty) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("inStock") }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: fmtInt(stats.inStock) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-emerald-600 dark:text-emerald-400" }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("lowStock") }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: fmtInt(stats.lowStock) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(CircleAlert, { className: "h-5 w-5 text-red-500 dark:text-red-400" }) })
      ] }) }) })
    ] }) : null,
    /* @__PURE__ */ jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 pb-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: `${t("search")}...`, className: "pl-9", value: q, onChange: (e) => setQ(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: sortMode, onChange: (e) => setSortMode(e.target.value), className: "h-9 rounded-md border border-input bg-background px-3 text-sm shrink-0", children: [
          /* @__PURE__ */ jsxs("option", { value: "none", children: [
            t("all"),
            " (default)"
          ] }),
          /* @__PURE__ */ jsx("option", { value: "name-asc", children: t("sortNameAZ") }),
          /* @__PURE__ */ jsx("option", { value: "name-desc", children: t("sortNameZA") }),
          /* @__PURE__ */ jsx("option", { value: "qty-desc", children: t("sortStockHighLow") }),
          /* @__PURE__ */ jsx("option", { value: "qty-asc", children: t("sortStockLowHigh") }),
          /* @__PURE__ */ jsx("option", { value: "price-desc", children: t("sortPriceHighLow") }),
          /* @__PURE__ */ jsx("option", { value: "price-asc", children: t("sortPriceLowHigh") })
        ] }),
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: filtersOpen || activeFiltersCount > 0 ? "default" : "outline", size: "sm", onClick: () => setFiltersOpen((v) => !v), className: "gap-1.5 shrink-0", children: [
          /* @__PURE__ */ jsx(SlidersHorizontal, { className: "h-4 w-4" }),
          t("filter"),
          activeFiltersCount > 0 && /* @__PURE__ */ jsx("span", { className: "ml-0.5 h-4 w-4 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center", children: activeFiltersCount })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: viewMode === "cards" ? "default" : "outline", size: "sm", onClick: () => setViewMode("cards"), className: "gap-1.5", children: [
            /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4" }),
            t("cardsView")
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: viewMode === "table" ? "default" : "outline", size: "sm", onClick: () => setViewMode("table"), className: "gap-1.5", children: [
            /* @__PURE__ */ jsx(Rows3, { className: "h-4 w-4" }),
            t("tableView")
          ] })
        ] })
      ] }),
      filtersOpen && /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: t("category") }),
            /* @__PURE__ */ jsxs(Select, { value: categoryFilter, onValueChange: setCategoryFilter, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("all") }),
                uniqueCategories.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c, children: c }, c))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: t("location") }),
            /* @__PURE__ */ jsxs(Select, { value: storeFilter, onValueChange: setStoreFilter, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("all") }),
                uniqueStores.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s, children: s }, s))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Brand" }),
            /* @__PURE__ */ jsxs(Select, { value: brandFilter, onValueChange: setBrandFilter, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("all") }),
                uniqueBrands.map((b) => /* @__PURE__ */ jsx(SelectItem, { value: b, children: b }, b))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: t("type") }),
            /* @__PURE__ */ jsxs(Select, { value: typePriceFilter, onValueChange: setTypePriceFilter, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("all") }),
                uniqueTypePrices.map((tp) => /* @__PURE__ */ jsx(SelectItem, { value: tp, children: tp }, tp))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
              t("stock"),
              " — min"
            ] }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: 0, step: "0.01", placeholder: "0", value: minQty, onChange: (e) => setMinQty(e.target.value), className: "h-9" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
              t("stock"),
              " — max"
            ] }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: 0, step: "0.01", placeholder: "∞", value: maxQty, onChange: (e) => setMaxQty(e.target.value), className: "h-9" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
              t("amount"),
              " — min"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Input, { type: "number", min: 0, placeholder: "0", value: minPrice, onChange: (e) => setMinPrice(e.target.value), className: "h-9 pr-12" }),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none", children: "so'm" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
              t("amount"),
              " — max"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Input, { type: "number", min: 0, placeholder: "∞", value: maxPrice, onChange: (e) => setMaxPrice(e.target.value), className: "h-9 pr-12" }),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none", children: "so'm" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setLowStockOnly((v) => !v), className: `relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${lowStockOnly ? "bg-destructive" : "bg-input"}`, children: /* @__PURE__ */ jsx("span", { className: `pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${lowStockOnly ? "translate-x-4" : "translate-x-0"}` }) }),
          /* @__PURE__ */ jsxs("label", { className: "text-sm cursor-pointer select-none", onClick: () => setLowStockOnly((v) => !v), children: [
            t("lowStock"),
            " (",
            t("qty"),
            " ≤ 0)"
          ] }),
          lowStockOnly && /* @__PURE__ */ jsx(Badge, { variant: "destructive", className: "text-[10px] px-1.5 py-0", children: stats.lowStock })
        ] }),
        (activeFiltersCount > 0 || q.trim()) && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: clearFilters, className: "gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10", children: [
          /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
          "Filtrlarni tozalash"
        ] }) })
      ] })
    ] }) }),
    !loading && !error && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3 px-0.5", children: [
      /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
        totalFiltered,
        " ",
        t("product").toLowerCase(),
        " · ",
        filteredGroups.length,
        " ",
        t("category").toLowerCase()
      ] })
    ] }),
    loading && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({
      length: 3
    }).map((_, idx) => /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-40" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-12 rounded-full" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-9 w-full" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-9 w-full" })
      ] })
    ] }, idx)) }),
    error && !loading && /* @__PURE__ */ jsx(Card, { className: "p-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-destructive" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("errorTitle") }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: error })
      ] })
    ] }) }),
    !loading && !error && filteredGroups.length === 0 && /* @__PURE__ */ jsx(Card, { className: "p-12 text-center text-muted-foreground", children: t("noData") }),
    !loading && !error && filteredGroups.map((group) => {
      const isOpen = expandedGroups.has(group.group_id);
      return /* @__PURE__ */ jsxs(Collapsible, { open: isOpen, onOpenChange: () => toggleGroup(group.group_id), className: "mb-3", children: [
        /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsx("button", { className: "w-full", children: /* @__PURE__ */ jsx(Card, { className: "px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Store, { className: "h-4 w-4 text-primary" }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: group.group_name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                group.products.length,
                " ",
                t("product").toLowerCase()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: group.products.length }),
            /* @__PURE__ */ jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}` })
          ] })
        ] }) }) }) }),
        /* @__PURE__ */ jsx(CollapsibleContent, { children: viewMode === "table" ? /* @__PURE__ */ jsx(Card, { className: "mt-2 overflow-hidden", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: t("sku") }),
            /* @__PURE__ */ jsx(TableHead, { children: t("product") }),
            /* @__PURE__ */ jsx(TableHead, { children: t("category") }),
            /* @__PURE__ */ jsx(TableHead, { children: t("location") }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("stock") }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("amount") })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: group.products.map((product) => /* @__PURE__ */ jsxs(TableRow, { className: product.qty <= 0 ? "opacity-50" : "", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-xs text-muted-foreground", children: product.id }),
            /* @__PURE__ */ jsxs(TableCell, { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: product.name }),
              product.articul && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: product.articul })
            ] }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: product.category || "—" }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: product.store_name || "—" }),
            /* @__PURE__ */ jsxs(TableCell, { className: "text-right font-medium", children: [
              /* @__PURE__ */ jsx("span", { className: product.qty <= 0 ? "text-destructive" : product.qty <= 10 ? "text-amber-600" : "", children: fmt(product.qty) }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: product.unit })
            ] }),
            /* @__PURE__ */ jsxs(TableCell, { className: "text-right", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: fmt(product.price) }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: product.cry })
            ] })
          ] }, product.id)) })
        ] }) }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-2 px-1", children: group.products.map((product) => /* @__PURE__ */ jsx(Card, { className: `overflow-hidden hover:shadow-md transition-shadow ${product.qty <= 0 ? "opacity-60" : ""}`, children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold truncate", children: product.name }),
              product.articul && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate", children: product.articul })
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-[10px] shrink-0", children: product.id })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-xs text-muted-foreground", children: [
            product.category && /* @__PURE__ */ jsxs("p", { children: [
              t("category"),
              ": ",
              product.category
            ] }),
            product.store_name && /* @__PURE__ */ jsxs("p", { children: [
              t("location"),
              ": ",
              product.store_name
            ] }),
            product.brand && /* @__PURE__ */ jsxs("p", { children: [
              "Brand: ",
              product.brand
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxs("span", { className: `font-semibold ${product.qty <= 0 ? "text-destructive" : product.qty <= 10 ? "text-amber-600" : ""}`, children: [
              fmt(product.qty),
              " ",
              product.unit
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: fmt(product.price) }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: product.cry })
            ] })
          ] })
        ] }) }, product.id)) }) })
      ] }, group.group_id);
    })
  ] });
}
export {
  WarehousePage as component
};
