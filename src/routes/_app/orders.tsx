import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  CalendarRange,
  ChevronDown as ChevronDownIcon,
  Package,
  Wallet,
  Users,
  RefreshCw,
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

type NormalStatus = "pending" | "inProgress" | "delivered" | "cancelled";

function normalizeStatus(raw: string): NormalStatus {
  const s = (raw ?? "").toLowerCase();
  if (
    s.includes("deliver") ||
    s.includes("yetkazil") ||
    s.includes("completed") ||
    s.includes("success")
  )
    return "delivered";
  if (s.includes("cancel") || s.includes("bekor") || s.includes("reject")) return "cancelled";
  if (s.includes("progress") || s.includes("process") || s.includes("jarayon")) return "inProgress";
  return "pending";
}

const STATUS_CONFIG: Record<
  NormalStatus,
  { color: string; icon: React.ElementType; labelKey: string }
> = {
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

type SortKey = "date" | "amount" | "client" | "id";
type SortDir = "asc" | "desc";

// ── Component ────────────────────────────────────────────────────────────────

export function OrdersPage() {
  const { t } = useSettings();
  const { user } = useAuth();

  // filters
  const [dateBegin, setDateBegin] = useState(monthStartIso());
  const [dateEnd, setDateEnd] = useState(todayIso());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NormalStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = dateScore(a.date_doc) - dateScore(b.date_doc);
      else if (sortKey === "amount") cmp = (a.summa ?? 0) - (b.summa ?? 0);
      else if (sortKey === "client") cmp = (a.client_name ?? "").localeCompare(b.client_name ?? "");
      else if (sortKey === "id") cmp = (a.id_doc ?? 0) - (b.id_doc ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [orders, search, statusFilter, sortKey, sortDir]);

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
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
              <CalendarRange className="h-4 w-4" />
              <span>{t("dateBegin")}</span>
            </div>
            <input
              type="date"
              value={dateBegin}
              onChange={(e) => setDateBegin(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <span className="text-muted-foreground text-sm hidden sm:block">—</span>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
              <span>{t("dateEnd")}</span>
            </div>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
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
                  <p className="text-2xl font-bold mt-1">
                    {(stats.totalAmount / 1_000_000).toFixed(1)}M
                  </p>
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

      {/* Search + Status filter */}
      {!error && (
        <Card className="mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`${t("search")}...`}
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as NormalStatus | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("orderStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                  <SelectItem value="inProgress">{t("inProgress")}</SelectItem>
                  <SelectItem value="delivered">{t("delivered")}</SelectItem>
                  <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            {loading ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <span>
                {filtered.length} {t("ordersLower")}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <ClipboardList className="h-10 w-10 opacity-30" />
              <p className="text-sm">{t("noOrders")}</p>
            </div>
          ) : (
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
                              {order.status}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
