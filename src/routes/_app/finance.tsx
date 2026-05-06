import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { finance } from "@/lib/mock-data";
import { useSettings } from "@/lib/settings";
import { formatWithSpaces } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_app/finance")({ component: FinancePage });

const fmt = (n: number) => "$" + formatWithSpaces(n, 0);

function FinancePage() {
  const { t } = useSettings();
  return (
    <div>
      <PageHeader title={t("finance")} description={t("financeDesc")} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><ArrowUpRight className="h-4 w-4 text-success" /> {t("income")}</div>
          <div className="text-2xl font-semibold mt-2">{fmt(finance.income)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><ArrowDownRight className="h-4 w-4 text-destructive" /> {t("expense")}</div>
          <div className="text-2xl font-semibold mt-2">{fmt(finance.expense)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Wallet className="h-4 w-4 text-primary" /> {t("netProfit")}</div>
          <div className="text-2xl font-semibold mt-2">{fmt(finance.profit)}</div>
        </CardContent></Card>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">{t("monthlySummary")}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finance.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
                <Legend />
                <Bar dataKey="income" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("transactions")}</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t("party")}</TableHead>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("type")}</TableHead>
              <TableHead className="text-right">{t("amount")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {finance.transactions.map((tr) => (
              <TableRow key={tr.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{tr.id}</TableCell>
                <TableCell className="font-medium">{tr.party}</TableCell>
                <TableCell className="text-muted-foreground">{tr.date}</TableCell>
                <TableCell className="capitalize">{tr.type === "income" ? t("income") : t("expense")}</TableCell>
                <TableCell className={`text-right font-medium ${tr.type === "income" ? "text-success" : "text-destructive"}`}>
                  {tr.type === "income" ? "+" : "-"}{fmt(tr.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
