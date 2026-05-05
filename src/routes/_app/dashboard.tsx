import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { kpis, salesTrend, recentActivity, clients, staff, products } from "@/lib/mock-data";
import { useSettings } from "@/lib/settings";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Bar, BarChart, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Users, DollarSign, ShoppingBag, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const fmt = (n: number) => "$" + n.toLocaleString();

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

  const categoryData = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.stock;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  const topClients = clients.filter((c) => c.status === "active").slice(0, 5);
  const topStaff = [...staff].sort((a, b) => b.performance - a.performance).slice(0, 5);

  return (
    <div>
      <PageHeader title={t("dashboard")} description={t("overview")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={DollarSign} label={t("totalSales")} value={fmt(kpis.totalSales)} change="12.4%" />
        <KpiCard icon={Users} label={t("activeClients")} value={kpis.activeClients.toLocaleString()} change="3.1%" />
        <KpiCard icon={TrendingUp} label={t("revenue")} value={fmt(kpis.revenue)} change="8.7%" />
        <KpiCard icon={ShoppingBag} label={t("orders")} value={kpis.orders.toLocaleString()} change="5.2%" />
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
                <BarChart data={salesTrend.slice(-6)}>
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
                <div className="text-sm font-medium">${(Math.random() * 20000 + 5000).toFixed(0)}</div>
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
    </div>
  );
}
