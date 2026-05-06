import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import { useSettings } from "@/lib/settings";
import { formatWithSpaces } from "@/lib/utils";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  LayoutGrid,
  Package,
  Rows3,
  Search,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_app/finance")({ component: FinancePage });

type FinanceProduct = {
  product_id: number;
  product_name: string;
  price: number;
  qty: number;
  sum: number;
};

type FinanceOrder = {
  id_doc: number;
  date_doc: string;
  status: string;
  client_name: string;
  qty: number;
  summa: number;
  products: FinanceProduct[];
};

type FinanceApiResponse = {
  data: FinanceOrder[];
};

type SortMode = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "qty-desc" | "qty-asc" | "client-asc" | "client-desc";

function toApiDate(value: string): string {
  return value.replaceAll("-", "");
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthStartIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

const fmt = (n: number) => formatWithSpaces(n, 0);
const fmtQty = (n: number) => formatWithSpaces(n, 2);
const incomeStatuses = new Set(["delivered", "completed", "paid", "success"]);

function dateScoreFromDoc(value: string): number {
  const chunks = value.split(".");
  if (chunks.length !== 3) return 0;
  const [day, month, year] = chunks;
  return Date.parse(`${year}-${month}-${day}T00:00:00Z`) || 0;
}

function FinancePage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const [dateBegin, setDateBegin] = useState(monthStartIsoDate());
  const [dateEnd, setDateEnd] = useState(todayIsoDate());
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [sortMode, setSortMode] = useState<SortMode>("date-desc");
  const [orders, setOrders] = useState<FinanceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: FinanceApiResponse) => {
        setOrders(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [dateBegin, dateEnd, t, user]);

  const metrics = useMemo(() => {
    const income = orders
      .filter((o) => incomeStatuses.has((o.status || "").toLowerCase()))
      .reduce((sum, o) => sum + (Number(o.summa) || 0), 0);
    const expense = orders
      .filter((o) => !incomeStatuses.has((o.status || "").toLowerCase()))
      .reduce((sum, o) => sum + (Number(o.summa) || 0), 0);
    const totalQty = orders.reduce((sum, o) => sum + (Number(o.qty) || 0), 0);
    const totalProducts = orders.reduce((sum, o) => sum + (o.products?.length ?? 0), 0);
    return {
      income,
      expense,
      profit: income - expense,
      totalQty,
      totalProducts,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!q.trim()) return orders;
    const lower = q.toLowerCase();
    return orders.filter(
      (order) =>
        String(order.id_doc).includes(lower) ||
        (order.client_name || "").toLowerCase().includes(lower) ||
        (order.status || "").toLowerCase().includes(lower) ||
        (order.date_doc || "").toLowerCase().includes(lower) ||
        (order.products || []).some((p) => (p.product_name || "").toLowerCase().includes(lower)),
    );
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
    const byDate = new Map<string, { date: string; income: number; expense: number }>();
    for (const order of sortedOrders) {
      const key = order.date_doc || "-";
      const current = byDate.get(key) ?? { date: key, income: 0, expense: 0 };
      const amount = Number(order.summa) || 0;
      if (incomeStatuses.has((order.status || "").toLowerCase())) current.income += amount;
      else current.expense += amount;
      byDate.set(key, current);
    }
    return Array.from(byDate.values()).sort((a, b) => dateScoreFromDoc(a.date) - dateScoreFromDoc(b.date));
  }, [sortedOrders]);

  const statusChartData = useMemo(() => {
    const statusMap = new Map<string, number>();
    for (const order of sortedOrders) {
      const status = order.status || "unknown";
      statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
    }
    return Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
  }, [sortedOrders]);

  const pieColors = ["#2563eb", "#16a34a", "#f59e0b", "#db2777", "#06b6d4", "#7c3aed", "#ef4444"];

  return (
    <div>
      <PageHeader title={t("finance")} description={t("financeDesc")} />
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="date"
            value={dateBegin}
            onChange={(e) => setDateBegin(e.target.value)}
            aria-label={t("dateBegin")}
          />
          <Input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            aria-label={t("dateEnd")}
          />
        </div>
      </Card>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-6 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <Card className="p-10 mb-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium">{t("errorTitle")}</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <>
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            {sortedOrders.length} {t("ordersLower")}
          </Badge>
          <div className="shrink-0">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="date-desc">{t("sortDateNewOld")}</option>
              <option value="date-asc">{t("sortDateOldNew")}</option>
              <option value="amount-desc">{t("sortAmountHighLow")}</option>
              <option value="amount-asc">{t("sortAmountLowHigh")}</option>
              <option value="qty-desc">{t("sortQtyHighLow")}</option>
              <option value="qty-asc">{t("sortQtyLowHigh")}</option>
              <option value="client-asc">{t("sortClientAZ")}</option>
              <option value="client-desc">{t("sortClientZA")}</option>
            </select>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
              {t("cardsView")}
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <Rows3 className="h-4 w-4" />
              {t("tableView")}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><ArrowUpRight className="h-4 w-4 text-success" /> {t("income")}</div>
          <div className="text-2xl font-semibold mt-2">{fmt(metrics.income)} UZS</div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><ArrowDownRight className="h-4 w-4 text-destructive" /> {t("expense")}</div>
          <div className="text-2xl font-semibold mt-2">{fmt(metrics.expense)} UZS</div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Wallet className="h-4 w-4 text-primary" /> {t("netProfit")}</div>
          <div className="text-2xl font-semibold mt-2">{fmt(metrics.profit)} UZS</div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Package className="h-4 w-4 text-primary" />
              {t("totalProductsCount")}
            </div>
            <div className="text-2xl font-semibold mt-2">{metrics.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Wallet className="h-4 w-4 text-primary" />
              {t("totalVolumeQty")}
            </div>
            <div className="text-2xl font-semibold mt-2">{fmtQty(metrics.totalQty)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("dailyIncomeExpenseTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyChartData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">{t("notFound")}</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip
                      formatter={(value: number) => `${fmt(value)} UZS`}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="income" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("statusShare")}</CardTitle>
          </CardHeader>
          <CardContent>
            {statusChartData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">{t("notFound")}</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusChartData} dataKey="value" nameKey="name" outerRadius={95} innerRadius={48}>
                      {statusChartData.map((entry, idx) => (
                        <Cell key={entry.name} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {viewMode === "table" ? (
        <Card>
          <CardHeader><CardTitle className="text-base">{t("transactions")}</CardTitle></CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("id")}</TableHead>
                <TableHead>{t("party")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead className="text-right">{t("qty")}</TableHead>
                <TableHead className="text-right">{t("amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {t("notFound")}
                  </TableCell>
                </TableRow>
              ) : (
                sortedOrders.map((order) => {
                  const isIncome = incomeStatuses.has((order.status || "").toLowerCase());
                  return (
                    <TableRow key={order.id_doc}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{order.id_doc}</TableCell>
                      <TableCell className="font-medium">{order.client_name}</TableCell>
                      <TableCell className="text-muted-foreground">{order.date_doc}</TableCell>
                      <TableCell className="capitalize">{isIncome ? t("income") : t("expense")}</TableCell>
                      <TableCell className="text-right">{fmtQty(order.qty)}</TableCell>
                      <TableCell className={`text-right font-medium ${isIncome ? "text-success" : "text-destructive"}`}>
                        {isIncome ? "+" : "-"}
                        {fmt(order.summa)} UZS
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sortedOrders.length === 0 ? (
            <Card className="md:col-span-2 xl:col-span-3 p-12 text-center text-muted-foreground">
              {t("notFound")}
            </Card>
          ) : (
            sortedOrders.map((order) => {
              const isIncome = incomeStatuses.has((order.status || "").toLowerCase());
              return (
                <Card key={order.id_doc} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{order.client_name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {order.id_doc} • {order.date_doc}
                        </p>
                      </div>
                      <Badge variant={isIncome ? "default" : "secondary"}>
                        {isIncome ? t("income") : t("expense")}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p>{t("status")}: {order.status || "-"}</p>
                      <p>{t("products")}: {order.products?.length ?? 0}</p>
                      <p>{t("qty")}: {fmtQty(order.qty)}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t("amount")}</span>
                      <span className={`text-sm font-semibold ${isIncome ? "text-success" : "text-destructive"}`}>
                        {isIncome ? "+" : "-"}{fmt(order.summa)} UZS
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
