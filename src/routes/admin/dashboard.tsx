import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import { useSettings } from "@/lib/settings";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Users, Building, ArrowUpRight, Activity, Package, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers, fetchCompanies, fetchApps } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

// Mock data for admin dashboard statistics
const mockPlatformStats = {
  totalCompanies: 156,
  activeCompanies: 142,
  totalUsers: 1247,
  activeUsers: 892,
  monthlyRevenue: 45800000,
  newCompaniesThisMonth: 12,
  newUsersThisMonth: 47,
};

const mockMonthlyGrowth = [
  { month: "Yan", companies: 120, users: 950, revenue: 38000000 },
  { month: "Fev", companies: 128, users: 1020, revenue: 40000000 },
  { month: "Mar", companies: 132, users: 1080, revenue: 41500000 },
  { month: "Apr", companies: 138, users: 1150, revenue: 43000000 },
  { month: "May", companies: 145, users: 1200, revenue: 44500000 },
  { month: "Iyun", companies: 156, users: 1247, revenue: 45800000 },
];

const mockPlanDistribution = [
  { name: "Starter", value: 45, color: "var(--chart-1)" },
  { name: "Standard", value: 58, color: "var(--chart-2)" },
  { name: "Business", value: 38, color: "var(--chart-3)" },
  { name: "Enterprise", value: 15, color: "var(--chart-4)" },
];

const mockRecentActivity = [
  { id: 1, action: "Yangi kompaniya ro'yxatdan o'tdi", target: "Smart Retail Group", time: "5 daqiqa oldin", type: "company" },
  { id: 2, action: "Foydalanuvchi ro'yxatdan o'tdi", target: "Azizbek Karimov", time: "1 soat oldin", type: "user" },
  { id: 3, action: "Tarif yangilandi", target: "Hub Logistics → Business", time: "2 soat oldin", type: "upgrade" },
  { id: 4, action: "Yangi ilova yuklandi", target: "Distr Warehouse v1.4.0", time: "3 soat oldin", type: "app" },
  { id: 5, action: "Kompaniya faollashdi", target: "Distr Savdo", time: "5 soat oldin", type: "company" },
  { id: 6, action: "Foydalanuvchi parolni tikladi", target: "manager@distr.uz", time: "1 kun oldin", type: "user" },
];

const fmt = (n: number) => `${n.toLocaleString()} UZS`;
const fmtShort = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

function KpiCard({ icon: Icon, label, value, change, changeLabel }: { icon: any; label: string; value: string; change: string; changeLabel: string }) {
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
          <div className="text-xs text-muted-foreground mt-0.5">{changeLabel}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { t } = useSettings();

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies(),
  });
  
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
  });
  
  const { data: apps = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: () => fetchApps(),
  });

  const loading = isLoadingCompanies || isLoadingUsers || isLoadingApps;

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const newUsersCount = users.filter(u => {
      const d = new Date(u.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return {
      companies: companies.length || mockPlatformStats.totalCompanies,
      activeCompanies: companies.length || mockPlatformStats.activeCompanies,
      users: users.length || mockPlatformStats.totalUsers,
      activeUsers: users.filter(u => u.user_status === 'ACTIVE').length || mockPlatformStats.activeUsers,
      revenue: mockPlatformStats.monthlyRevenue,
      newCompanies: 0 || mockPlatformStats.newCompaniesThisMonth,
      newUsers: newUsersCount || mockPlatformStats.newUsersThisMonth,
    };
  }, [companies, users]);

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout title={t("adminDashboard")} subtitle={t("adminDashboardSubtitle")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx}>
                <CardContent className="p-6 space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-muted" />
                  <div className="h-8 w-24 bg-muted" />
                  <div className="h-4 w-32 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout title={t("adminDashboard")} subtitle={t("adminDashboardSubtitle")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={Building}
          label="Jami kompaniyalar"
          value={stats.companies.toLocaleString()}
          change={`+${stats.newCompanies}`}
          changeLabel="Shu oyda"
        />
        <KpiCard
          icon={Users}
          label="Jami foydalanuvchilar"
          value={stats.users.toLocaleString()}
          change={`+${stats.newUsers}`}
          changeLabel="Shu oyda"
        />
        <KpiCard
          icon={Activity}
          label="Faol foydalanuvchilar"
          value={stats.activeUsers.toLocaleString()}
          change={`+${Math.round(stats.activeUsers * 0.05)}`}
          changeLabel="Shu oyda"
        />
        <KpiCard
          icon={DollarSign}
          label="Oylik daromad"
          value={fmt(stats.revenue)}
          change="+12%"
          changeLabel="O'tgan oyga nisbatan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Oylik daromad dinamikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockMonthlyGrowth}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => fmtShort(v)} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} formatter={(value: number) => [fmt(value), "Daromad"]} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#revenueGradient)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tariflar taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mockPlanDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {mockPlanDistribution.map((item, i) => (
                      <Cell key={i} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} formatter={(value: number) => [`${value} ta kompaniya`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kompaniyalar va foydalanuvchilar o'sishi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMonthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                  <Bar dataKey="companies" name="Kompaniyalar" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="users" name="Foydalanuvchilar" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">So'nggi faollik</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {mockRecentActivity.map((a) => (
                <li key={a.id} className="py-3 flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                    a.type === "company" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                    a.type === "user" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                    a.type === "upgrade" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
                    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                  }`}>
                    {a.type === "company" ? <Building className="h-4 w-4" /> :
                     a.type === "user" ? <Users className="h-4 w-4" /> :
                     a.type === "upgrade" ? <TrendingUp className="h-4 w-4" /> :
                     <Package className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="font-medium">{a.action}</span>{" "}
                    <span className="text-muted-foreground truncate">{a.target}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-sm">Platforma statistikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Faol kompaniyalar</span>
              <span className="font-medium">{stats.activeCompanies} ({Math.round(stats.activeCompanies / stats.companies * 100)}%)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Faol foydalanuvchilar</span>
              <span className="font-medium">{stats.activeUsers} ({Math.round(stats.activeUsers / stats.users * 100)}%)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">O'rtacha foydalanuvchi/kompaniya</span>
              <span className="font-medium">{Math.round(stats.users / stats.companies)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-sm">Mobil ilovalar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {apps.map((app) => (
              <div key={app.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{app.name}</span>
                <span className="font-medium">({app.tag})</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-sm">Tizim holati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Server holati</span>
              <span className="font-medium text-success">● Ishlamoqda</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">API javob vaqti</span>
              <span className="font-medium">~45ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Oxirgi zaxira nusxa</span>
              <span className="font-medium">Bugun, 03:00</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
    </AdminGuard>
  );
}