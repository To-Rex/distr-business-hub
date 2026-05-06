import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import { AlertCircle, Search } from "lucide-react";
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

export const Route = createFileRoute("/_app/sales")({ component: SalesPage });

type SaleProduct = {
  product_photo_url: string;
  product_id: number;
  product_name: string;
  unit: string;
  qty: number;
  summa: number;
  qty_persent: number;
  summa_persent: number;
};

type SaleCategory = {
  category_id: number;
  category_name: string;
  qty: number;
  summa: number;
  total_qty: number;
  total_summa: number;
  qty_persent: number;
  summa_persent: number;
  products: SaleProduct[];
};

type AgentSale = {
  agent_id: string;
  agent_name: string;
  total_qty: number;
  total_summa: number;
  qty_order: number;
  qty_clients: number;
  average: number;
  returned_qty: number;
  returned_summa: number;
  plan: number;
  fact: number;
  rusult: number;
};

type SalesByCategoryResponse = {
  total_qty: number;
  total_summa: number;
  qty_order: number;
  qty_clients: number;
  average: number;
  returned_qty: number;
  returned_summa: number;
  plan: number;
  fact: number;
  rusult: number;
  agents: AgentSale[];
  sales: SaleCategory[];
};

function toApiDate(value: string): string {
  return value.replaceAll("-", "");
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(n);
}

function formatQty(n: number): string {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 }).format(n);
}

function shortName(name: string, max = 14): string {
  return name.length <= max ? name : `${name.slice(0, max)}...`;
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

function SalesPage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [dateBegin, setDateBegin] = useState(monthStartIsoDate());
  const [dateEnd, setDateEnd] = useState(todayIsoDate());
  const [branchId, setBranchId] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<SalesByCategoryResponse | null>(null);

  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }

    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    const parsedBranchId = Number(branchId) || 1;

    setLoading(true);
    setError(null);

    fetch(API.salesByCategory(baseUrl, parsedBranchId, toApiDate(dateBegin), toApiDate(dateEnd)), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: SalesByCategoryResponse) => {
        setSalesData(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [branchId, dateBegin, dateEnd, t, user]);

  const filteredCategories = useMemo(() => {
    const categories = salesData?.sales ?? [];
    if (!q.trim()) return categories;
    const lower = q.toLowerCase();
    return categories
      .map((c) => ({
        ...c,
        products: c.products.filter((p) => p.product_name.toLowerCase().includes(lower)),
      }))
      .filter((c) => c.category_name.toLowerCase().includes(lower) || c.products.length > 0);
  }, [salesData, q]);

  const topProducts = useMemo(() => {
    return filteredCategories
      .flatMap((c) => c.products)
      .sort((a, b) => b.summa - a.summa)
      .slice(0, 8);
  }, [filteredCategories]);

  const categoryChartData = useMemo(
    () =>
      filteredCategories.map((item) => ({
        name: shortName(item.category_name, 16),
        fullName: item.category_name,
        qty: item.qty,
        summa: item.summa,
      })),
    [filteredCategories],
  );

  const agentChartData = useMemo(
    () =>
      (salesData?.agents ?? []).map((agent) => ({
        name: shortName(agent.agent_name, 14),
        fullName: agent.agent_name,
        plan: agent.plan,
        fact: agent.fact,
        result: agent.rusult,
      })),
    [salesData],
  );

  const pieData = useMemo(
    () =>
      filteredCategories.map((category) => ({
        name: category.category_name,
        value: category.summa,
      })),
    [filteredCategories],
  );

  const pieColors = ["#2563eb", "#16a34a", "#f59e0b", "#db2777", "#06b6d4", "#7c3aed", "#ef4444"];

  return (
    <div>
      <PageHeader title={t("sales")} description={t("salesDesc")} />
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <Input
            type="date"
            value={dateBegin}
            onChange={(e) => setDateBegin(e.target.value)}
            aria-label="Date begin"
          />
          <Input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            aria-label="Date end"
          />
          <Input
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            placeholder="Branch ID"
            inputMode="numeric"
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kategoriya yoki mahsulot qidirish"
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <Card className="p-10 mb-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium">{t("errorTitle")}</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </Card>
      )}

      {!loading && !error && salesData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Jami savdo (summa)</p>
                <p className="text-xl font-semibold">{formatMoney(salesData.total_summa)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Jami hajm (kg)</p>
                <p className="text-xl font-semibold">{formatQty(salesData.total_qty)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Buyurtmalar / klientlar</p>
                <p className="text-xl font-semibold">
                  {salesData.qty_order} / {salesData.qty_clients}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Plan bajarilishi</p>
                <p className="text-xl font-semibold">{formatQty(salesData.rusult)}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Kategoriyalar bo‘yicha summa (chart)</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryChartData.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">{t("notFound")}</div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <Tooltip
                          formatter={(value: number) => formatMoney(value)}
                          labelFormatter={(_, payload) =>
                            (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
                          }
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                          }}
                        />
                        <Bar dataKey="summa" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kategoriya ulushi</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">{t("notFound")}</div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={48}>
                          {pieData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={pieColors[Math.abs(entry.name.length) % pieColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatMoney(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Kategoriyalar bo‘yicha savdo</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredCategories.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">{t("notFound")}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategoriya</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Summa</TableHead>
                        <TableHead className="text-right">Qty %</TableHead>
                        <TableHead className="text-right">Summa %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((c) => (
                        <TableRow key={c.category_id}>
                          <TableCell className="font-medium">{c.category_name}</TableCell>
                          <TableCell className="text-right">{formatQty(c.qty)}</TableCell>
                          <TableCell className="text-right">{formatMoney(c.summa)}</TableCell>
                          <TableCell className="text-right">{formatQty(c.qty_persent)}%</TableCell>
                          <TableCell className="text-right">{formatQty(c.summa_persent)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top mahsulotlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("notFound")}</p>
                ) : (
                  topProducts.map((p) => (
                    <div
                      key={p.product_id}
                      className="rounded-lg border bg-muted/20 px-3 py-2 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatQty(p.qty)} {p.unit} - {formatQty(p.summa_persent)}%
                        </p>
                      </div>
                      <p className="text-sm font-semibold whitespace-nowrap">{formatMoney(p.summa)}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Agentlar bo‘yicha ko‘rsatkichlar</CardTitle>
            </CardHeader>
            <CardContent>
              {agentChartData.length > 0 && (
                <div className="h-72 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip
                        formatter={(value: number) => formatQty(value)}
                        labelFormatter={(_, payload) =>
                          (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
                        }
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                        }}
                      />
                      <Bar dataKey="plan" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="fact" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {!salesData.agents?.length ? (
                <div className="p-8 text-center text-muted-foreground">{t("notFound")}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {salesData.agents.map((agent) => {
                    const progress = Math.max(0, Math.min(100, Number(agent.rusult) || 0));
                    return (
                      <div
                        key={agent.agent_id}
                        className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{agent.agent_name}</p>
                            <p className="text-xs text-muted-foreground">ID: {agent.agent_id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-semibold">{formatQty(agent.rusult)}%</p>
                            <p className="text-[11px] text-muted-foreground">Natija</p>
                          </div>
                        </div>

                        <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg bg-muted/30 px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">Plan / Fact</p>
                            <p className="font-medium">
                              {formatQty(agent.plan)} / {formatQty(agent.fact)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/30 px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">Buyurtma / Klient</p>
                            <p className="font-medium">
                              {agent.qty_order} / {agent.qty_clients}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">Jami summa</p>
                          <p className="text-sm font-semibold">{formatMoney(agent.total_summa)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
