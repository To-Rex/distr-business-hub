import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Legend, Line, LineChart, Pie, PieChart, RadialBar, RadialBarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({ component: ReportsPage });

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

type ReportClient = {
  client_id: number;
  client_name: string;
  qty: number;
  summa: number;
  qty_persent: number;
  summa_persent: number;
  qty_visit: number;
  qty_payment: number;
  qty_order: number;
  qty_photo: number;
  qty_returned: number;
};

type ReportGroup = {
  group_id: number;
  group_name: string;
  OKB: number;
  AKB: number;
  result: number;
  qty: number;
  summa: number;
  qty_persent: number;
  summa_persent: number;
  clients: ReportClient[];
};

type ReportAgent = {
  agent_id: number;
  agent_name: string;
  OKB: number;
  AKB: number;
  result: number;
  qty: number;
  summa: number;
  qty_persent: number;
  summa_persent: number;
  gproups?: ReportGroup[];
  groups?: ReportGroup[];
};

type ReportByClientResponse = {
  OKB: number;
  AKB: number;
  qty_order: number;
  qty_photo: number;
  qty_rejected: number;
  qty_returned: number;
  result: number;
  agents: ReportAgent[];
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

function formatMoney(n: number): string {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0, useGrouping: true }).format(n || 0).replaceAll("\u00A0", " ").replaceAll(",", " ");
}

function formatQty(n: number): string {
  const num = Number(n || 0);
  const truncated = Math.trunc(num * 100) / 100;
  const fixed = truncated === Math.trunc(truncated) ? String(Math.trunc(truncated)) : truncated.toFixed(2).replace(/0+$/, "");
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(Number(fixed)).replaceAll("\u00A0", " ").replaceAll(",", " ");
}

function ReportsPage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const [dateBegin, setDateBegin] = useState(monthStartIsoDate());
  const [dateEnd, setDateEnd] = useState(todayIsoDate());
  const [branchId, setBranchId] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportByClientResponse | null>(null);

  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }

    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    const parsedBranchId = Number(branchId) || 1;
    setLoading(true);
    setError(null);

    fetch(API.reportByClient(user.company_rel.base_url, parsedBranchId, toApiDate(dateBegin), toApiDate(dateEnd)), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ReportByClientResponse) => setReportData(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [branchId, dateBegin, dateEnd, t, user]);

  const salesTrendData = useMemo(
    () =>
      (reportData?.agents ?? []).map((agent) => ({
        month: agent.agent_name,
        sales: agent.OKB,
        revenue: agent.AKB,
      })),
    [reportData],
  );

  const monthlySummaryData = useMemo(
    () =>
      (reportData?.agents ?? []).map((agent) => ({
        month: agent.agent_name,
        income: agent.summa,
        expense: agent.qty,
      })),
    [reportData],
  );

  const cat = useMemo(() => {
    const groupSum = new Map<string, number>();
    for (const agent of reportData?.agents ?? []) {
      const groups = agent.gproups ?? agent.groups ?? [];
      for (const group of groups) {
        groupSum.set(group.group_name, (groupSum.get(group.group_name) ?? 0) + Number(group.summa || 0));
      }
    }
    return Array.from(groupSum.entries()).map(([name, value]) => ({ name, value }));
  }, [reportData]);

  const perfData = useMemo(
    () =>
      (reportData?.agents ?? []).map((agent, idx) => ({
        name: agent.agent_name,
        value: Number(agent.result) || 0,
        fill: colors[idx % colors.length],
      })),
    [reportData],
  );

  const totalSumma = useMemo(
    () => (reportData?.agents ?? []).reduce((sum, agent) => sum + Number(agent.summa || 0), 0),
    [reportData],
  );

  const totalQty = useMemo(
    () => (reportData?.agents ?? []).reduce((sum, agent) => sum + Number(agent.qty || 0), 0),
    [reportData],
  );

  const topAgents = useMemo(
    () => [...(reportData?.agents ?? [])].sort((a, b) => Number(b.summa || 0) - Number(a.summa || 0)).slice(0, 5),
    [reportData],
  );

  const topGroups = useMemo(() => {
    const allGroups = (reportData?.agents ?? []).flatMap((agent) => agent.gproups ?? agent.groups ?? []);
    return [...allGroups].sort((a, b) => Number(b.summa || 0) - Number(a.summa || 0)).slice(0, 6);
  }, [reportData]);

  return (
    <div>
      <PageHeader title={t("reports")} description={t("reportsDesc")} />
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input type="date" value={dateBegin} onChange={(e) => setDateBegin(e.target.value)} aria-label="Date begin" />
          <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} aria-label="Date end" />
          <Input
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            placeholder="Branch ID"
            inputMode="numeric"
          />
        </div>
      </Card>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Card><CardContent className="p-4"><Skeleton className="h-72 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-72 w-full" /></CardContent></Card>
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

      {!loading && !error && reportData && (
        <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("salesPerformance")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="OKB" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="revenue" name="AKB" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t("monthlySummary")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySummaryData}>
                  <defs>
                    <linearGradient id="ri" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="re" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                  <Area type="monotone" dataKey="income" name="Summa" stroke="var(--chart-2)" fill="url(#ri)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Qty" stroke="var(--chart-5)" fill="url(#re)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("salesByCategory")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={perfData} dataKey="value" nameKey="name" outerRadius={100} label={({ value }) => `${formatQty(value)}%`}>
                    {perfData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t("performance")}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4 h-72">
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="20%"
                    outerRadius="100%"
                    data={cat.map((item, i) => ({ ...item, fill: colors[i % colors.length] }))}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar background dataKey="value" nameKey="name" cornerRadius={6} />
                    <Tooltip
                      formatter={(value: number, name: string, props: { payload: { name: string } }) => [formatMoney(value), props.payload.name]}
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 h-full overflow-y-auto flex flex-col justify-center gap-2">
                {cat.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">{t("notFound")}</p>
                ) : (
                  cat.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span
                        className="inline-block w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: colors[i % colors.length] }}
                      />
                      <span className="truncate flex-1 min-w-0">{item.name}</span>
                      <span className="text-muted-foreground shrink-0">{formatMoney(item.value)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-4">
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground">OKB</p>
            <p className="text-lg font-semibold">{formatQty(reportData.OKB)}</p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground">AKB</p>
            <p className="text-lg font-semibold">{formatQty(reportData.AKB)}</p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground">Buyurtmalar</p>
            <p className="text-lg font-semibold">{formatQty(reportData.qty_order)}</p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground">Photo</p>
            <p className="text-lg font-semibold">{formatQty(reportData.qty_photo)}</p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground">Returned</p>
            <p className="text-lg font-semibold">{formatQty(reportData.qty_returned)}</p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground">Result</p>
            <p className="text-lg font-semibold">{formatQty(reportData.result)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top agentlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("notFound")}</p>
            ) : (
              topAgents.map((agent) => (
                <div
                  key={agent.agent_id}
                  className="rounded-lg border bg-muted/20 px-3 py-2 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{agent.agent_name}</p>
                    <p className="text-xs text-muted-foreground">
                      OKB {formatQty(agent.OKB)} / AKB {formatQty(agent.AKB)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatMoney(agent.summa)}</p>
                    <p className="text-[11px] text-muted-foreground">{formatQty(agent.result)}%</p>
                  </div>
                </div>
              ))
            )}

            <div className="pt-2 mt-2 border-t flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Jami summa</p>
              <p className="font-semibold">{formatMoney(totalSumma)}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Jami qty</p>
              <p className="font-semibold">{formatQty(totalQty)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top guruhlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("notFound")}</p>
            ) : (
              topGroups.map((group) => (
                <div
                  key={group.group_id}
                  className="rounded-lg border bg-muted/20 px-3 py-2 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{group.group_name}</p>
                    <p className="text-xs text-muted-foreground">
                      OKB {formatQty(group.OKB)} / AKB {formatQty(group.AKB)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatMoney(group.summa)}</p>
                    <p className="text-[11px] text-muted-foreground">{formatQty(group.result)}%</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
