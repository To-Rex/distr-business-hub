import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSettings } from "@/lib/settings";
import { formatWithSpaces } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertCircle,
  ChevronDown,
  LayoutGrid,
  Rows3,
  Search,
  Store,
  SlidersHorizontal,
  X,
  Package,
  Boxes,
  TrendingUp,
  CircleAlert,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const Route = createFileRoute("/_app/warehouse")({ component: WarehousePage });

type WarehouseProduct = {
  id: number;
  name: string;
  articul: string;
  unit: string;
  qtyInCase: number;
  info: string;
  category: string;
  brand: string;
  status: string;
  store_name: string;
  store_id: number;
  qty: number;
  bron: number;
  markirovka: number;
  type_price: string;
  price: number;
  cry: string;
};

type WarehouseGroup = {
  group_id: number;
  group_name: string;
  products: WarehouseProduct[];
};

type WarehouseResponse = {
  data: WarehouseGroup[];
  meta?: {
    total_group?: number;
    total_item?: number;
  };
};

type SortMode =
  | "none"
  | "name-asc"
  | "name-desc"
  | "qty-desc"
  | "qty-asc"
  | "price-desc"
  | "price-asc";

function fmt(n: number): string {
  return formatWithSpaces(n, 2);
}

function fmtInt(n: number): string {
  return formatWithSpaces(n, 0);
}

function WarehousePage() {
  const { t } = useSettings();
  const { user } = useAuth();

  // ── data ──────────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState<WarehouseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── ui state ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const isMobile = useIsMobile();

  useEffect(() => {
    setViewMode(isMobile ? "cards" : "table");
  }, [isMobile]);

  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  // ── filters ───────────────────────────────────────────────────────────────
  const [q, setQ] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("none");
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

  // ── fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }
    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);

    fetch(API.productsByGroup(baseUrl), {
      headers: { accept: "application/json", Authorization: `Basic ${basic}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: WarehouseResponse) => {
        const list = data.data ?? [];
        setGroups(list);
        setExpandedGroups(new Set(list.map((g) => g.group_id)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, t]);

  // ── all products flat list ─────────────────────────────────────────────────
  const allProducts = useMemo(() => groups.flatMap((g) => g.products), [groups]);

  // ── unique filter options ─────────────────────────────────────────────────
  const uniqueCategories = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean))).sort(),
    [allProducts],
  );
  const uniqueStores = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.store_name).filter(Boolean))).sort(),
    [allProducts],
  );
  const uniqueBrands = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.brand).filter(Boolean))).sort(),
    [allProducts],
  );
  const uniqueTypePrices = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.type_price).filter(Boolean))).sort(),
    [allProducts],
  );

  // ── stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalGroups = groups.length;
    const totalProducts = allProducts.length;
    const totalQty = allProducts.reduce((s, p) => s + (p.qty ?? 0), 0);
    const totalValue = allProducts.reduce((s, p) => s + (p.price ?? 0) * (p.qty ?? 0), 0);
    const lowStock = allProducts.filter((p) => (p.qty ?? 0) <= 0).length;
    const inStock = allProducts.filter((p) => (p.qty ?? 0) > 0).length;
    return { totalGroups, totalProducts, totalQty, totalValue, lowStock, inStock };
  }, [groups, allProducts]);

  // ── filters + sort ────────────────────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    const lower = q.trim().toLowerCase();

    return groups
      .map((group) => {
        let products = [...group.products];

        // search
        if (lower) {
          products = products.filter(
            (p) =>
              p.name.toLowerCase().includes(lower) ||
              p.category.toLowerCase().includes(lower) ||
              p.store_name.toLowerCase().includes(lower) ||
              p.articul.toLowerCase().includes(lower) ||
              (p.brand ?? "").toLowerCase().includes(lower),
          );
        }

        // category
        if (categoryFilter !== "all")
          products = products.filter((p) => p.category === categoryFilter);
        // store
        if (storeFilter !== "all") products = products.filter((p) => p.store_name === storeFilter);
        // brand
        if (brandFilter !== "all") products = products.filter((p) => p.brand === brandFilter);
        // type_price
        if (typePriceFilter !== "all")
          products = products.filter((p) => p.type_price === typePriceFilter);
        // qty range
        if (minQty !== "") products = products.filter((p) => (p.qty ?? 0) >= Number(minQty));
        if (maxQty !== "") products = products.filter((p) => (p.qty ?? 0) <= Number(maxQty));
        // price range
        if (minPrice !== "") products = products.filter((p) => (p.price ?? 0) >= Number(minPrice));
        if (maxPrice !== "") products = products.filter((p) => (p.price ?? 0) <= Number(maxPrice));
        // low stock only
        if (lowStockOnly) products = products.filter((p) => (p.qty ?? 0) <= 0);

        // sort
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

        return { ...group, products };
      })
      .filter((g) => g.products.length > 0);
  }, [
    groups,
    q,
    sortMode,
    categoryFilter,
    storeFilter,
    brandFilter,
    typePriceFilter,
    minQty,
    maxQty,
    minPrice,
    maxPrice,
    lowStockOnly,
  ]);

  const totalFiltered = useMemo(
    () => filteredGroups.reduce((s, g) => s + g.products.length, 0),
    [filteredGroups],
  );

  // ── active filters count ──────────────────────────────────────────────────
  const activeFiltersCount = [
    categoryFilter !== "all",
    storeFilter !== "all",
    brandFilter !== "all",
    typePriceFilter !== "all",
    minQty !== "",
    maxQty !== "",
    minPrice !== "",
    maxPrice !== "",
    lowStockOnly,
  ].filter(Boolean).length;

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

  const toggleGroup = (id: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader title={t("warehouse")} description={t("warehouseDesc")} />

      {/* ── Stats ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !error ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("products")}</p>
                  <p className="text-2xl font-bold mt-1">{fmtInt(stats.totalProducts)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stats.totalGroups} {t("category").toLowerCase()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Boxes className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("totalVolumeQty")}</p>
                  <p className="text-2xl font-bold mt-1">{fmt(stats.totalQty)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("inStock")}</p>
                  <p className="text-2xl font-bold mt-1">{fmtInt(stats.inStock)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("lowStock")}</p>
                  <p className="text-2xl font-bold mt-1">{fmtInt(stats.lowStock)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <CircleAlert className="h-5 w-5 text-red-500 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* ── Filter bar ── */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4 space-y-3">
          {/* top row */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {/* search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`${t("search")}...`}
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            {/* sort */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shrink-0"
            >
              <option value="none">{t("all")} (default)</option>
              <option value="name-asc">{t("sortNameAZ")}</option>
              <option value="name-desc">{t("sortNameZA")}</option>
              <option value="qty-desc">{t("sortStockHighLow")}</option>
              <option value="qty-asc">{t("sortStockLowHigh")}</option>
              <option value="price-desc">{t("sortPriceHighLow")}</option>
              <option value="price-asc">{t("sortPriceLowHigh")}</option>
            </select>

            {/* filter toggle */}
            <Button
              type="button"
              variant={filtersOpen || activeFiltersCount > 0 ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltersOpen((v) => !v)}
              className="gap-1.5 shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("filter")}
              {activeFiltersCount > 0 && (
                <span className="ml-0.5 h-4 w-4 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* view toggle */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="gap-1.5"
              >
                <LayoutGrid className="h-4 w-4" />
                {t("cardsView")}
              </Button>
              <Button
                type="button"
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-1.5"
              >
                <Rows3 className="h-4 w-4" />
                {t("tableView")}
              </Button>
            </div>
          </div>

          {/* advanced panel */}
          {filtersOpen && (
            <div className="pt-2 border-t space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* category */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("category")}
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all")}</SelectItem>
                      {uniqueCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* store */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("location")}
                  </label>
                  <Select value={storeFilter} onValueChange={setStoreFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all")}</SelectItem>
                      {uniqueStores.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* brand */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Brand
                  </label>
                  <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all")}</SelectItem>
                      {uniqueBrands.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* type_price */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("type")}
                  </label>
                  <Select value={typePriceFilter} onValueChange={setTypePriceFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all")}</SelectItem>
                      {uniqueTypePrices.map((tp) => (
                        <SelectItem key={tp} value={tp}>
                          {tp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* qty range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("stock")} — min
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("stock")} — max
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="∞"
                    value={maxQty}
                    onChange={(e) => setMaxQty(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* price range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("amount")} — min
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="h-9 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      so'm
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("amount")} — max
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      placeholder="∞"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="h-9 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      so'm
                    </span>
                  </div>
                </div>
              </div>

              {/* low stock toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLowStockOnly((v) => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${
                    lowStockOnly ? "bg-destructive" : "bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      lowStockOnly ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <label
                  className="text-sm cursor-pointer select-none"
                  onClick={() => setLowStockOnly((v) => !v)}
                >
                  {t("lowStock")} ({t("qty")} ≤ 0)
                </label>
                {lowStockOnly && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    {stats.lowStock}
                  </Badge>
                )}
              </div>

              {/* clear */}
              {(activeFiltersCount > 0 || q.trim()) && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3.5 w-3.5" />
                    Filtrlarni tozalash
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* result count */}
      {!loading && !error && (
        <div className="flex items-center gap-2 mb-3 px-0.5">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {totalFiltered} {t("product").toLowerCase()} · {filteredGroups.length}{" "}
            {t("category").toLowerCase()}
          </span>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <Card className="p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("errorTitle")}</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Empty ── */}
      {!loading && !error && filteredGroups.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">{t("noData")}</Card>
      )}

      {/* ── Groups ── */}
      {!loading &&
        !error &&
        filteredGroups.map((group) => {
          const isOpen = expandedGroups.has(group.group_id);
          return (
            <Collapsible
              key={group.group_id}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.group_id)}
              className="mb-3"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full">
                  <Card className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Store className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-semibold">{group.group_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {group.products.length} {t("product").toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {group.products.length}
                        </Badge>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </Card>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                {viewMode === "table" ? (
                  <Card className="mt-2 overflow-hidden">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("sku")}</TableHead>
                            <TableHead>{t("product")}</TableHead>
                            <TableHead>{t("category")}</TableHead>
                            <TableHead>{t("location")}</TableHead>
                            <TableHead className="text-right">{t("stock")}</TableHead>
                            <TableHead className="text-right">{t("amount")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.products.map((product) => (
                            <TableRow
                              key={product.id}
                              className={product.qty <= 0 ? "opacity-50" : ""}
                            >
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {product.id}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{product.name}</div>
                                {product.articul && (
                                  <div className="text-xs text-muted-foreground">
                                    {product.articul}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {product.category || "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {product.store_name || "—"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                <span
                                  className={
                                    product.qty <= 0
                                      ? "text-destructive"
                                      : product.qty <= 10
                                        ? "text-amber-600"
                                        : ""
                                  }
                                >
                                  {fmt(product.qty)}
                                </span>{" "}
                                <span className="text-xs text-muted-foreground">
                                  {product.unit}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-medium">{fmt(product.price)}</span>{" "}
                                <span className="text-xs text-muted-foreground">{product.cry}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-2 px-1">
                    {group.products.map((product) => (
                      <Card
                        key={product.id}
                        className={`overflow-hidden hover:shadow-md transition-shadow ${
                          product.qty <= 0 ? "opacity-60" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                              {product.articul && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {product.articul}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {product.id}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {product.category && (
                              <p>
                                {t("category")}: {product.category}
                              </p>
                            )}
                            {product.store_name && (
                              <p>
                                {t("location")}: {product.store_name}
                              </p>
                            )}
                            {product.brand && <p>Brand: {product.brand}</p>}
                          </div>
                          <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                            <span
                              className={`font-semibold ${
                                product.qty <= 0
                                  ? "text-destructive"
                                  : product.qty <= 10
                                    ? "text-amber-600"
                                    : ""
                              }`}
                            >
                              {fmt(product.qty)} {product.unit}
                            </span>
                            <span>
                              <span className="font-medium">{fmt(product.price)}</span>{" "}
                              <span className="text-muted-foreground">{product.cry}</span>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
    </div>
  );
}
