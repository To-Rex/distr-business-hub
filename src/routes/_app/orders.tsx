import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import { formatWithSpaces } from "@/lib/utils";
import {
  ClipboardList,
  Search,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Calendar as CalendarIcon,
  ArrowRight,
  ChevronDown as ChevronDownIcon,
  Package,
  Wallet,
  Users,
  RefreshCw,
  LayoutGrid,
  Rows3,
  SlidersHorizontal,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_app/orders")({
  component: OrdersPage,
});

// ── API Types ────────────────────────────────────────────────────────────────

type ApiProduct = {
  product_id: number;
  product_name: string;
  price: number;
  qty: number;
  sum: number;
};

type ApiAgent = {
  agent_id: number;
  agent_name: string;
};

type ApiOrder = {
  id_doc: number;
  date_doc: string;
  transport: string;
  cry: string;
  branch_id: number;
  status: string;
  agent: ApiAgent;
  type_payment: string;
  local_id: string;
  sklad: string;
  tip_sena: string;
  date_delivery: string;
  comment: string;
  cry_id: string;
  client_id: number;
  client_name: string;
  qty: number;
  summa: number;
  products: ApiProduct[];
};

type ApiResponse = {
  data: ApiOrder[];
};

// ── Normalized status ────────────────────────────────────────────────────────

type NormalStatus = "new" | "pending" | "inProgress" | "shipped" | "delivered" | "cancelled" | "unknown";

function normalizeStatus(raw: string): NormalStatus {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("ship")) return "shipped";
  if (
    s.includes("deliver") ||
    s.includes("yetkazil") ||
    s.includes("completed") ||
    s.includes("success")
  )
    return "delivered";
  if (s.includes("cancel") || s.includes("cencel") || s.includes("bekor") || s.includes("reject")) return "cancelled";
  if (s.includes("new") || s.includes("yangi")) return "new";
  if (s.includes("progress") || s.includes("process") || s.includes("jarayon")) return "inProgress";
  return "unknown";
}

const STATUS_CONFIG: Record<
  NormalStatus,
  { color: string; icon: React.ElementType; labelKey: string }
> = {
  new: {
    color: "bg-primary/10 text-primary dark:text-primary",
    icon: AlertCircle,
    labelKey: "new",
  },
  pending: {
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock,
    labelKey: "pending",
  },
  inProgress: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Truck,
    labelKey: "inProgress",
  },
  shipped: {
    color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
    icon: Truck,
    labelKey: "shipped",
  },
  delivered: {
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
    labelKey: "delivered",
  },
  cancelled: {
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
    labelKey: "cancelled",
  },
  unknown: {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
    icon: AlertCircle,
    labelKey: "unknown",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function toApiDate(iso: string) {
  return iso.replaceAll("-", "");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** "01.05.2026" → sortable number */
function dateScore(docDate: string): number {
  const [d, mo, y] = docDate.split(".");
  return Date.parse(`${y}-${mo}-${d}T00:00:00Z`) || 0;
}

const fmt = (n: number) => formatWithSpaces(n, 0);

function formatDisplayDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

type SortKey = "date" | "amount" | "client" | "id";
type SortDir = "asc" | "desc";

// ── Component ────────────────────────────────────────────────────────────────

export function OrdersPage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const dateBeginRef = useRef<HTMLInputElement>(null);
  const dateEndRef = useRef<HTMLInputElement>(null);

  // filters
  const [dateBegin, setDateBegin] = useState(monthStartIso());
  const [dateEnd, setDateEnd] = useState(todayIso());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NormalStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [skladFilter, setSkladFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<string>("none");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minSumma, setMinSumma] = useState<string>("");
  const [maxSumma, setMaxSumma] = useState<string>("");
  const [minQty, setMinQty] = useState<string>("");
  const [maxQty, setMaxQty] = useState<string>("");

  // data
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch
  const fetchOrders = () => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }

    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);

    setLoading(true);
    setError(null);

    fetch(API.ordersAll(baseUrl, toApiDate(dateBegin), toApiDate(dateEnd)), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ApiResponse) => {
        setOrders(Array.isArray(data?.data) ? data.data : []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateBegin, dateEnd, user]);

  // stats
  const stats = useMemo(() => {
    const total = orders.length;
    const totalAmount = orders.reduce((s, o) => s + (Number(o.summa) || 0), 0);
    const totalQty = orders.reduce((s, o) => s + (Number(o.qty) || 0), 0);
    const delivered = orders.filter((o) => normalizeStatus(o.status) === "delivered").length;
    const pending = orders.filter(
      (o) => normalizeStatus(o.status) === "pending" || normalizeStatus(o.status) === "inProgress",
    ).length;
    const uniqueClients = new Set(orders.map((o) => o.client_id)).size;
    return { total, totalAmount, totalQty, delivered, pending, uniqueClients };
  }, [orders]);

  const uniqueAgents = useMemo(
    () =>
      Array.from(
        new Set(orders.map((o) => o.agent?.agent_name).filter(Boolean)),
      ).sort() as string[],
    [orders],
  );

  const uniqueSklads = useMemo(
    () => Array.from(new Set(orders.map((o) => o.sklad).filter(Boolean))).sort() as string[],
    [orders],
  );

  const uniquePayments = useMemo(
    () => Array.from(new Set(orders.map((o) => o.type_payment).filter(Boolean))).sort() as string[],
    [orders],
  );

  // filtered + sorted
  const filtered = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== "all") {
      list = list.filter((o) => normalizeStatus(o.status) === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          String(o.id_doc).includes(q) ||
          (o.client_name ?? "").toLowerCase().includes(q) ||
          (o.agent?.agent_name ?? "").toLowerCase().includes(q) ||
          (o.local_id ?? "").toLowerCase().includes(q) ||
          (o.sklad ?? "").toLowerCase().includes(q) ||
          (o.products ?? []).some((p) => (p.product_name ?? "").toLowerCase().includes(q)),
      );
    }

    if (agentFilter !== "all") {
      list = list.filter((o) => o.agent?.agent_name === agentFilter);
    }
    if (skladFilter !== "all") {
      list = list.filter((o) => o.sklad === skladFilter);
    }
    if (paymentFilter !== "all") {
      list = list.filter((o) => o.type_payment === paymentFilter);
    }
    if (minSumma !== "") {
      list = list.filter((o) => (o.summa ?? 0) >= Number(minSumma));
    }
    if (maxSumma !== "") {
      list = list.filter((o) => (o.summa ?? 0) <= Number(maxSumma));
    }
    if (minQty !== "") {
      list = list.filter((o) => (o.qty ?? 0) >= Number(minQty));
    }
    if (maxQty !== "") {
      list = list.filter((o) => (o.qty ?? 0) <= Number(maxQty));
    }

    if (sortMode !== "none") {
      list.sort((a, b) => {
        switch (sortMode) {
          case "date-desc":
            return dateScore(b.date_doc) - dateScore(a.date_doc);
          case "date-asc":
            return dateScore(a.date_doc) - dateScore(b.date_doc);
          case "amount-desc":
            return (b.summa ?? 0) - (a.summa ?? 0);
          case "amount-asc":
            return (a.summa ?? 0) - (b.summa ?? 0);
          case "id-desc":
            return (b.id_doc ?? 0) - (a.id_doc ?? 0);
          case "id-asc":
            return (a.id_doc ?? 0) - (b.id_doc ?? 0);
          case "client-asc":
            return (a.client_name ?? "").localeCompare(b.client_name ?? "");
          case "client-desc":
            return (b.client_name ?? "").localeCompare(a.client_name ?? "");
          default:
            return 0;
        }
      });
    }

    return list;
  }, [
    orders,
    search,
    statusFilter,
    agentFilter,
    skladFilter,
    paymentFilter,
    minSumma,
    maxSumma,
    minQty,
    maxQty,
    sortMode,
    sortKey,
    sortDir,
  ]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3" />
    );
  };

  const activeFiltersCount = [
    statusFilter !== "all",
    agentFilter !== "all",
    skladFilter !== "all",
    paymentFilter !== "all",
    minSumma !== "",
    maxSumma !== "",
    minQty !== "",
    maxQty !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setAgentFilter("all");
    setSkladFilter("all");
    setPaymentFilter("all");
    setMinSumma("");
    setMaxSumma("");
    setMinQty("");
    setMaxQty("");
    setSortMode("none");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title={t("ordersPage")}
        description={t("ordersDesc")}
        actions={
          <div className="flex items-center gap-2">
            {!loading && !error && (
              <Badge variant="outline" className="text-xs">
                {orders.length} {t("ordersLower")}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </Button>
          </div>
        }
      />

      {/* Date filter */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            {/* hidden inputs */}
            <input
              ref={dateBeginRef}
              type="date"
              value={dateBegin}
              onChange={(e) => setDateBegin(e.target.value)}
              className="sr-only"
            />
            <input
              ref={dateEndRef}
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="sr-only"
            />

            {/* Dan */}
            <button
              type="button"
              onClick={() => dateBeginRef.current?.showPicker()}
              className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl cursor-pointer flex-1 max-w-[200px] border border-transparent hover:border-primary/20 transition-colors"
            >
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] text-muted-foreground leading-none">
                  {t("dateBegin")}
                </span>
                <span className="text-sm font-medium leading-tight">
                  {formatDisplayDate(dateBegin)}
                </span>
              </div>
            </button>

            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

            {/* Gacha */}
            <button
              type="button"
              onClick={() => dateEndRef.current?.showPicker()}
              className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl cursor-pointer flex-1 max-w-[200px] border border-transparent hover:border-primary/20 transition-colors"
            >
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] text-muted-foreground leading-none">
                  {t("dateEnd")}
                </span>
                <span className="text-sm font-medium leading-tight">
                  {formatDisplayDate(dateEnd)}
                </span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("orders")}</p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("orderTotal")}</p>
                  <p className="text-2xl font-bold mt-1">{fmt(stats.totalAmount)}</p>
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
                  <p className="text-sm text-muted-foreground">{t("delivered")}</p>
                  <p className="text-2xl font-bold mt-1">{stats.delivered}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("activeClients")}</p>
                  <p className="text-2xl font-bold mt-1">{stats.uniqueClients}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Error */}
      {error && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">{t("errorTitle")}</p>
                <p className="text-sm opacity-80 mt-0.5">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + Filters + View toggle */}
      {!error && (
        <Card className="mb-4">
          <CardContent className="pt-4 pb-4 space-y-3">
            {/* Top row: search + sort + view toggle */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`${t("search")}...`}
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Sort dropdown */}
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shrink-0"
              >
                <option value="none">{t("all")} (default)</option>
                <option value="date-desc">{t("sortDateNewOld")}</option>
                <option value="date-asc">{t("sortDateOldNew")}</option>
                <option value="amount-desc">{t("sortAmountHighLow")}</option>
                <option value="amount-asc">{t("sortAmountLowHigh")}</option>
                <option value="id-desc">ID ↓</option>
                <option value="id-asc">ID ↑</option>
                <option value="client-asc">{t("sortClientAZ")}</option>
                <option value="client-desc">{t("sortClientZA")}</option>
              </select>

              {/* Advanced filter toggle button */}
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

              {/* View toggle */}
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

            {/* Advanced filters panel (collapsible) */}
            {filtersOpen && (
              <div className="pt-2 border-t space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("orderStatus")}
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => setStatusFilter(v as NormalStatus | "all")}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("all")}</SelectItem>
                        <SelectItem value="new">{t("new")}</SelectItem>
                        <SelectItem value="pending">{t("pending")}</SelectItem>
                        <SelectItem value="inProgress">{t("inProgress")}</SelectItem>
                        <SelectItem value="shipped">{t("shipped")}</SelectItem>
                        <SelectItem value="delivered">{t("delivered")}</SelectItem>
                        <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                        <SelectItem value="unknown">{t("unknown")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Agent */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("orderAgent")}
                    </label>
                    <Select value={agentFilter} onValueChange={setAgentFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("all")}</SelectItem>
                        {uniqueAgents.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sklad */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("orderWarehouse")}
                    </label>
                    <Select value={skladFilter} onValueChange={setSkladFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("all")}</SelectItem>
                        {uniqueSklads.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment type */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("payment")}
                    </label>
                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("all")}</SelectItem>
                        {uniquePayments.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Summa range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("orderTotal")} — min
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={minSumma}
                        onChange={(e) => setMinSumma(e.target.value)}
                        className="h-9 pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        so'm
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("orderTotal")} — max
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        placeholder="∞"
                        value={maxSumma}
                        onChange={(e) => setMaxSumma(e.target.value)}
                        className="h-9 pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        so'm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Qty range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("qty")} — min
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
                      {t("qty")} — max
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

                {/* Clear filters button */}
                {(activeFiltersCount > 0 || search.trim()) && (
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
      )}

      {/* Result count label */}
      {!loading && !error && (
        <div className="flex items-center gap-2 mb-3 px-0.5">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filtered.length} {t("ordersLower")}
          </span>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-28" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading && viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-36 flex-1" />
                  <Skeleton className="h-4 w-24 hidden md:block" />
                  <Skeleton className="h-4 w-20 hidden lg:block" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
              <ClipboardList className="h-10 w-10 opacity-30" />
              <p className="text-sm">{t("noOrders")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── CARDS (LIST) VIEW ── */}
      {!loading && filtered.length > 0 && viewMode === "cards" && (
        <div className="flex flex-col gap-2">
          {filtered.map((order) => {
            const norm = normalizeStatus(order.status);
            const cfg = STATUS_CONFIG[norm];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === order.id_doc;
            return (
              <Card key={order.id_doc} className="overflow-hidden">
                {/* ── Clickable header ── */}
                <div
                  className="flex items-start gap-4 px-4 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id_doc)}
                >
                  {/* left: id + date */}
                  <div className="shrink-0 text-center w-12">
                    <div className="font-mono text-xs font-bold text-primary">#{order.id_doc}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{order.date_doc}</div>
                  </div>

                  {/* center: client + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-snug">{order.client_name}</div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      {order.agent?.agent_name && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {order.agent.agent_name}
                        </span>
                      )}
                      {order.sklad && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Package className="h-3 w-3" />
                          {order.sklad}
                        </span>
                      )}
                      {order.type_payment && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Wallet className="h-3 w-3" />
                          {order.type_payment}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* right: amount + status + chevron */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {t(cfg.labelKey as never)}
                    </span>
                    <div className="font-bold text-sm tabular-nums">
                      {fmt(order.summa)}
                      <span className="text-[10px] font-normal text-muted-foreground ml-1">
                        {order.cry}
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* ── Expanded panel ── */}
                {isExpanded && (
                  <div className="border-t bg-muted/20 px-4 py-4 space-y-3">
                    {/* meta chips */}
                    {(order.tip_sena ||
                      (order.date_delivery && order.date_delivery !== order.date_doc) ||
                      order.comment) && (
                      <div className="flex flex-wrap gap-1.5">
                        {order.tip_sena && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-background border rounded-full px-2.5 py-0.5 text-muted-foreground">
                            <TrendingUp className="h-3 w-3 text-blue-500" />
                            {order.tip_sena}
                          </span>
                        )}
                        {order.date_delivery && order.date_delivery !== order.date_doc && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-background border rounded-full px-2.5 py-0.5 text-muted-foreground">
                            <Truck className="h-3 w-3 text-orange-500" />→ {order.date_delivery}
                          </span>
                        )}
                        {order.comment && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full px-2.5 py-0.5 text-amber-700 dark:text-amber-400">
                            💬 {order.comment}
                          </span>
                        )}
                      </div>
                    )}

                    {/* products */}
                    <div className="rounded-lg border overflow-hidden">
                      <div className="grid grid-cols-[2rem_1fr_repeat(3,6rem)] text-[10px] font-medium text-muted-foreground uppercase tracking-wide bg-muted/60 px-3 py-1.5">
                        <span>#</span>
                        <span>{t("product")}</span>
                        <span className="text-right">{t("amount")}</span>
                        <span className="text-right">{t("qty")}</span>
                        <span className="text-right">{t("totalAmount")}</span>
                      </div>
                      {(order.products ?? []).map((p) => (
                        <div
                          key={p.product_id}
                          className="grid grid-cols-[2rem_1fr_repeat(3,6rem)] items-center px-3 py-2 border-t text-xs hover:bg-background/60 transition-colors"
                        >
                          <span className="text-muted-foreground tabular-nums">{p.product_id}</span>
                          <span className="font-medium truncate pr-2">{p.product_name}</span>
                          <span className="text-right tabular-nums text-muted-foreground">
                            {fmt(p.price)}
                          </span>
                          <span className="text-right tabular-nums text-muted-foreground">
                            {formatWithSpaces(p.qty, 2)}
                          </span>
                          <span className="text-right tabular-nums font-semibold">
                            {fmt(p.sum)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* total */}
                    <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                      <span className="text-xs text-muted-foreground">{t("total")}</span>
                      <span className="text-sm font-bold text-primary">
                        {fmt(order.summa)} {order.cry}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {!loading && filtered.length > 0 && viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 font-medium"
                        onClick={() => toggleSort("id")}
                      >
                        {t("id")}
                        <SortIcon k="id" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 font-medium"
                        onClick={() => toggleSort("client")}
                      >
                        {t("client")}
                        <SortIcon k="client" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">{t("orderAgent")}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t("orderWarehouse")}</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 font-medium"
                        onClick={() => toggleSort("date")}
                      >
                        {t("orderDate")}
                        <SortIcon k="date" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 font-medium"
                        onClick={() => toggleSort("amount")}
                      >
                        {t("orderTotal")}
                        <SortIcon k="amount" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("orderStatus")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => {
                    const norm = normalizeStatus(order.status);
                    const cfg = STATUS_CONFIG[norm];
                    const StatusIcon = cfg.icon;
                    const isExpanded = expandedId === order.id_doc;

                    return (
                      <>
                        <TableRow
                          key={order.id_doc}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : order.id_doc)}
                        >
                          {/* expand toggle */}
                          <TableCell className="text-center">
                            <ChevronDownIcon
                              className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </TableCell>

                          <TableCell className="font-mono text-xs font-semibold text-primary">
                            #{order.id_doc}
                            {order.local_id && (
                              <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                {order.local_id}
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="font-medium">{order.client_name}</div>
                            {order.type_payment && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Wallet className="h-3 w-3" />
                                {order.type_payment}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {order.agent?.agent_name ?? "—"}
                          </TableCell>

                          <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                            {order.sklad ?? "—"}
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            <div>{order.date_doc}</div>
                            {order.date_delivery && order.date_delivery !== order.date_doc && (
                              <div className="text-xs opacity-60">→ {order.date_delivery}</div>
                            )}
                          </TableCell>

                          <TableCell className="font-semibold whitespace-nowrap">
                            {fmt(order.summa)} {order.cry}
                          </TableCell>

                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {t(cfg.labelKey as never)}
                            </span>
                          </TableCell>
                        </TableRow>

                        {/* expanded products row */}
                        {isExpanded && (
                          <TableRow
                            key={`${order.id_doc}-products`}
                            className="bg-muted/20 hover:bg-muted/20"
                          >
                            <TableCell colSpan={8} className="py-0">
                              <div className="px-6 py-4 space-y-4">
                                {/* ── Meta chips ── */}
                                <div className="flex flex-wrap gap-2">
                                  {order.sklad && (
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1 text-muted-foreground">
                                      <Package className="h-3 w-3 text-primary" />
                                      {order.sklad}
                                    </span>
                                  )}
                                  {order.type_payment && (
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1 text-muted-foreground">
                                      <Wallet className="h-3 w-3 text-emerald-500" />
                                      {order.type_payment}
                                    </span>
                                  )}
                                  {order.tip_sena && (
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1 text-muted-foreground">
                                      <TrendingUp className="h-3 w-3 text-blue-500" />
                                      {order.tip_sena}
                                    </span>
                                  )}
                                  {order.date_delivery &&
                                    order.date_delivery !== order.date_doc && (
                                      <span className="inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1 text-muted-foreground">
                                        <Truck className="h-3 w-3 text-orange-500" />
                                        {t("orderDate")} → {order.date_delivery}
                                      </span>
                                    )}
                                  {order.agent?.agent_name && (
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1 text-muted-foreground">
                                      <Users className="h-3 w-3 text-violet-500" />
                                      {order.agent.agent_name}
                                    </span>
                                  )}
                                  {order.comment && (
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 text-amber-700 dark:text-amber-400">
                                      💬 {order.comment}
                                    </span>
                                  )}
                                </div>

                                {/* ── Products header ── */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                                      <Package className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                      {t("products")} · {order.products?.length ?? 0} {t("type")}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {t("totalVolumeQty")}:{" "}
                                    <span className="font-semibold text-foreground">
                                      {formatWithSpaces(order.qty, 2)}
                                    </span>
                                  </span>
                                </div>

                                {/* ── Product rows ── */}
                                <div className="rounded-lg border overflow-hidden">
                                  {/* header */}
                                  <div className="grid grid-cols-[2rem_1fr_repeat(3,7rem)] text-[11px] font-medium text-muted-foreground uppercase tracking-wide bg-muted/50 px-3 py-2">
                                    <span>#</span>
                                    <span>{t("product")}</span>
                                    <span className="text-right">{t("amount")}</span>
                                    <span className="text-right">{t("qty")}</span>
                                    <span className="text-right">{t("totalAmount")}</span>
                                  </div>
                                  {/* rows */}
                                  {(order.products ?? []).map((p, idx) => (
                                    <div
                                      key={p.product_id}
                                      className="grid grid-cols-[2rem_1fr_repeat(3,7rem)] items-center px-3 py-2.5 border-t text-sm hover:bg-muted/30 transition-colors"
                                    >
                                      <span className="text-[11px] text-muted-foreground tabular-nums">
                                        {p.product_id}
                                      </span>
                                      <span className="font-medium truncate pr-2">
                                        {p.product_name}
                                      </span>
                                      <span className="text-right tabular-nums text-muted-foreground">
                                        {fmt(p.price)}
                                      </span>
                                      <span className="text-right tabular-nums text-muted-foreground">
                                        {formatWithSpaces(p.qty, 2)}
                                      </span>
                                      <span className="text-right tabular-nums font-semibold">
                                        {fmt(p.sum)}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* ── Total summary ── */}
                                <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 px-4 py-2.5">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ClipboardList className="h-4 w-4 text-primary" />
                                    <span>{t("total")}</span>
                                    <span className="text-foreground font-medium">
                                      {order.products?.length ?? 0} {t("products").toLowerCase()}
                                    </span>
                                    <span className="text-muted-foreground/50">·</span>
                                    <span className="font-medium text-foreground">
                                      {formatWithSpaces(order.qty, 2)} {t("qty").toLowerCase()}
                                    </span>
                                  </div>
                                  <div className="text-sm font-bold text-primary">
                                    {fmt(order.summa)} {order.cry}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
