import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/lib/settings";
import { formatWithSpaces } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Bar, BarChart, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Users, Banknote, ShoppingBag, ArrowUpRight, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const fmt = (n: number) => `${formatWithSpaces(n, 0)} UZS`;

type ClientItem = {
  id: number;
  name: string;
  status: string;
  status_name: string;
  location?: string;
  Orientr?: string;
  PoslednayaProdaja?: string;
  debt: { UZS: number; USD: number };
  agent: { agent_name: string };
};

type ClientGroup = { group_id: number; clients: ClientItem[] };
type ClientsResponse = { data: ClientGroup[] };

type WarehouseProduct = { category: string; qty: number };
type WarehouseGroup = { group_id: number; products: WarehouseProduct[] };
type WarehouseResponse = { data: WarehouseGroup[] };

type Employee = { id: number; name: string; type: string };
type EmployeesResponse = { data: Employee[] };

type AgentSale = {
  agent_id: string;
  agent_name: string;
  qty_order: number;
  total_summa: number;
  rusult: number;
};

type SaleCategory = { category_id: number; category_name: string; summa: number };
type SalesByCategoryResponse = {
  total_summa: number;
  qty_order: number;
  qty_clients: number;
  rusult: number;
  agents: AgentSale[];
  sales: SaleCategory[];
};

type ReportAgent = { agent_id: number; agent_name: string; summa: number; result: number };
type ReportByClientResponse = { qty_order: number; agents: ReportAgent[] };

type DashboardPayload = {
  clients: ClientGroup[];
  warehouse: WarehouseGroup[];
  staff: Employee[];
  sales: SalesByCategoryResponse | null;
  reports: ReportByClientResponse | null;
};

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

function KpiCard({ icon: Icon, label, value, change }: { icon: any; label: string; value: string; change: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
            <ArrowUpRight className="h-3 w-3" />{change}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <div className="text-sm text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { t } = useSettings();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardPayload>({
    clients: [],
    warehouse: [],
    staff: [],
    sales: null,
    reports: null,
  });

  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setError(t("notAvailable"));
      setLoading(false);
      return;
    }

    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    const dateBegin = toApiDate(monthStartIsoDate());
    const dateEnd = toApiDate(todayIsoDate());
    const branchId = 1;

    const fetchJson = async <T,>(url: string): Promise<T> => {
      const res = await fetch(url, {
        headers: {
          accept: "application/json",
          Authorization: `Basic ${basic}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<T>;
    };

    setLoading(true);
    setError(null);

    Promise.all([
      fetchJson<ClientsResponse>(API.clientsByGroup(baseUrl)),
      fetchJson<WarehouseResponse>(API.productsByGroup(baseUrl)),
      fetchJson<EmployeesResponse>(API.employees(baseUrl)),
      fetchJson<SalesByCategoryResponse>(API.salesByCategory(baseUrl, branchId, dateBegin, dateEnd)),
      fetchJson<ReportByClientResponse>(API.reportByClient(baseUrl, branchId, dateBegin, dateEnd)),
    ])
      .then(([clientsRes, warehouseRes, staffRes, salesRes, reportRes]) => {
        setData({
          clients: clientsRes.data ?? [],
          warehouse: warehouseRes.data ?? [],
          staff: staffRes.data ?? [],
          sales: salesRes,
          reports: reportRes,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, t]);

  const allClients = useMemo(() => data.clients.flatMap((g) => g.clients ?? []), [data.clients]);
  const allProducts = useMemo(() => data.warehouse.flatMap((g) => g.products ?? []), [data.warehouse]);

  const kpis = useMemo(() => {
    const activeClients = allClients.filter(
      (client) =>
        client.status_name?.toLowerCase() === "faol" ||
        client.status_name?.toLowerCase() === "active" ||
        client.status?.toLowerCase() === "active",
    ).length;
    const totalSales = Number(data.sales?.total_summa ?? 0);
    const revenue = data.reports?.agents?.reduce((sum, agent) => sum + Number(agent.summa || 0), 0) ?? 0;
    const orders = Number(data.sales?.qty_order ?? data.reports?.qty_order ?? 0);
    return { totalSales, activeClients, revenue, orders };
  }, [allClients, data.sales, data.reports]);

  const salesTrend = useMemo(
    () =>
      (data.sales?.agents ?? []).map((agent) => ({
        month: agent.agent_name,
        revenue: Number(agent.total_summa || 0),
        sales: Number(agent.qty_order || 0),
      })),
    [data.sales],
  );

  const categoryData = Object.entries(
    allProducts.reduce<Record<string, number>>((acc, p) => {
      const key = p.category || "Boshqa";
      acc[key] = (acc[key] || 0) + Number(p.qty || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  const topClients = useMemo(
    () =>
      [...allClients]
        .sort(
          (a, b) =>
            Math.abs(Number(b.debt?.UZS || 0)) +
            Math.abs(Number(b.debt?.USD || 0)) -
            (Math.abs(Number(a.debt?.UZS || 0)) + Math.abs(Number(a.debt?.USD || 0))),
        )
        .slice(0, 5),
    [allClients],
  );

  const staffPerformanceByName = useMemo(() => {
    const map = new Map<string, number>();
    for (const agent of data.sales?.agents ?? []) {
      map.set(agent.agent_name.toLowerCase(), Number(agent.rusult || 0));
    }
    for (const agent of data.reports?.agents ?? []) {
      const key = agent.agent_name.toLowerCase();
      if (!map.has(key)) map.set(key, Number(agent.result || 0));
    }
    return map;
  }, [data.sales, data.reports]);

  const topStaff = useMemo(
    () =>
      data.staff
        .map((employee) => ({
          ...employee,
          role: employee.type,
          performance: staffPerformanceByName.get(employee.name.toLowerCase()) ?? 0,
        }))
        .sort((a, b) => b.performance - a.performance)
        .slice(0, 5),
    [data.staff, staffPerformanceByName],
  );

  const recentActivity = useMemo(() => {
    return [...allClients]
      .filter((client) => client.PoslednayaProdaja)
      .sort(
        (a, b) =>
          new Date(b.PoslednayaProdaja || "").getTime() - new Date(a.PoslednayaProdaja || "").getTime(),
      )
      .slice(0, 8)
      .map((client, idx) => ({
        id: `${client.id}-${idx}`,
        who: client.agent?.agent_name || client.name,
        action: "yangilangan savdo",
        target: client.name,
        time: client.PoslednayaProdaja || "-",
      }));
  }, [allClients]);

  return (
    <div>
      <PageHeader title={t("dashboard")} description={t("overview")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-6 space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KpiCard icon={Banknote} label={t("totalSales")} value={fmt(kpis.totalSales)} change="live" />
            <KpiCard icon={Users} label={t("activeClients")} value={kpis.activeClients.toLocaleString()} change="live" />
            <KpiCard icon={TrendingUp} label={t("revenue")} value={fmt(kpis.revenue)} change="live" />
            <KpiCard icon={ShoppingBag} label={t("orders")} value={kpis.orders.toLocaleString()} change="live" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">{t("salesPerformance")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#g1)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("salesByCategory")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {categoryData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("ordersByMonth")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrend.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                  <Bar dataKey="sales" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("topClients")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topClients.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">{c.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.location}</div>
                </div>
                <div className="text-sm font-medium">
                  {fmt(Math.abs(Number(c.debt?.UZS || 0)) + Math.abs(Number(c.debt?.USD || 0)))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("topStaff")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topStaff.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">{s.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{s.role}</div>
                </div>
                <div className="text-sm font-medium text-success">{s.performance}%</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("recentActivity")}</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recentActivity.map((a) => (
              <li key={a.id} className="py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {a.who.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-medium">{a.target}</span>
                </div>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {error && (
        <Card className="mt-4">
          <CardContent className="p-4 flex items-center gap-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
