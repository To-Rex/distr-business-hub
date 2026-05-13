import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/lib/settings";
import { formatWithSpaces } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import {
  PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip,
} from "recharts";
import { ShoppingBag, UsersRound, BarChart3, AlertCircle, Pickaxe, Calendar as CalendarIcon, ChevronDown, ChevronUp, ChevronRight, ArrowRight, Camera, RotateCcw, ImageOff, ShoppingCart, Banknote, MapPin, MapPinned, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const fmt = (n: number) => `${formatWithSpaces(n, 0)} UZS`;

const fmtShort = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} mlrd`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} mln`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

function fmtPercent(n: number): string {
  if (Number.isInteger(n) || n === Math.round(n * 10) / 10) {
    const fixed = n.toFixed(1);
    return fixed.endsWith('.0') ? `${Math.round(n)}%` : `${fixed}%`;
  }
  return `${n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}%`;
}

function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

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
  groups: ReportGroup[];
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

type DashboardPayload = {
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

const COLORS = [
  "#342B6A", "#7C71B8", "#10B981", "#F59E0B", "#EF4444",
  "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"
];

function ClientRow({ client }: { client: ReportClient }) {
  const { t } = useSettings();
  const notVisited = !client.qty_visit || client.qty_visit === 0;

  return (
    <div className={`py-2 px-3 rounded-lg text-sm border ${notVisited ? "bg-red-500/5 border-red-500/20" : "bg-card border-border hover:border-primary/20"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${notVisited ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"}`}>
            {notVisited ? <AlertCircle className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
          </div>
          <div className="min-w-0">
            <div className={`font-medium text-xs truncate ${notVisited ? "text-red-600" : ""}`}>{client.client_name}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <div className="text-right">
            <div className={`font-semibold text-xs ${notVisited ? "text-red-500" : ""}`}>{fmt(client.summa || 0)}</div>
            <div className={`text-[10px] ${notVisited ? "text-red-400" : "text-muted-foreground"}`}>{client.qty || 0} {t("piece")}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 ml-8 text-[10px] flex-wrap">
        {notVisited && <span className="bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded-md font-medium border border-red-500/10">{t("noVisit")}</span>}
        <span className={`px-1.5 py-0.5 rounded-md ${notVisited ? "bg-red-500/5 text-red-400" : "bg-muted text-muted-foreground"}`}>{fmtPercent(client.summa_persent || 0)}</span>
        <span className={`px-1.5 py-0.5 rounded-md ${notVisited ? "bg-red-500/5 text-red-400" : "bg-muted text-muted-foreground"}`}>{fmtPercent(client.qty_persent || 0)} {t("qtyLabel")}</span>
        {client.qty_visit > 0 && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">{client.qty_visit} {t("visit")}</span>}
        {client.qty_order > 0 && <span className="bg-success/10 text-success px-1.5 py-0.5 rounded-md font-medium">{client.qty_order} {t("ordersLower")}</span>}
        {client.qty_photo > 0 && <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-md font-medium">{client.qty_photo} {t("photo")}</span>}
        {client.qty_returned > 0 && <span className="bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-md font-medium">{client.qty_returned} {t("returnLabel")}</span>}
        {client.qty_payment > 0 && <span className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-md font-medium">{client.qty_payment} {t("payment")}</span>}
      </div>
    </div>
  );
}

function GroupRow({ group }: { group: ReportGroup }) {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);
  const result = Number(group.result || 0);
  const resultColor = result >= 80 ? "text-success" : result >= 50 ? "text-warning" : "text-destructive";
  const resultBg = result >= 80 ? "bg-success" : result >= 50 ? "bg-warning" : "bg-destructive";

  return (
    <div className={`ml-1 rounded-xl border transition-all ${open ? "border-primary/20 bg-primary/[0.02] shadow-sm" : "border-border"}`}>
      <div
        className="flex items-center justify-between cursor-pointer py-3 px-3 rounded-xl hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPinned className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-xs">{group.group_name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{t("okb")}: <b className="text-foreground">{group.OKB || 0}</b></span>
                <span className="text-[10px] text-muted-foreground/40">·</span>
                <span className="text-[10px] text-muted-foreground">{t("akbNoun")}: <b className="text-foreground">{group.AKB || 0}</b></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-semibold text-xs">{fmt(group.summa || 0)}</div>
              <div className="text-[10px] text-muted-foreground">{group.qty || 0} {t("piece")}</div>
            </div>
          <div className="flex flex-col items-center gap-1 w-12">
            <span className={`text-[10px] font-bold ${resultColor}`}>{fmtPercent(result)}</span>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${resultBg}`} style={{ width: `${Math.min(100, result)}%` }}></div>
            </div>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-primary/10">
          <div className="flex items-center gap-2 mb-2 text-[10px] flex-wrap">
            <span className="bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground">{t("shareOfSumma")}: {fmtPercent(group.summa_persent || 0)}</span>
            <span className="bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground">{t("shareOfQty")}: {fmtPercent(group.qty_persent || 0)}</span>
          </div>
          <div className="space-y-1.5">
            {group.clients?.map((client, i) => (
              <ClientRow key={i} client={client} />
            ))}
            {(!group.clients || group.clients.length === 0) && (
              <div className="text-center py-3 text-muted-foreground text-xs">{t("noClientsInGroup")}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryWithProducts({ cat, colorIndex }: { cat: SaleCategory; colorIndex: number }) {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-10 rounded-full" style={{ backgroundColor: COLORS[colorIndex % COLORS.length] }}></div>
          <div>
            <div className="font-semibold text-sm">{cat.category_name || t("unknown")}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{cat.qty || 0} {t("piece")} · {fmtPercent(cat.qty_persent || 0)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-semibold text-sm">{fmt(cat.summa || 0)}</div>
            <div className="text-[10px] text-muted-foreground">{fmtPercent(cat.summa_persent || 0)}</div>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
      {open && cat.products && cat.products.length > 0 && (
        <div className="border-t bg-muted/20 px-4 pb-3 space-y-1">
          {cat.products.map((product, j) => (
            <ProductRow key={j} product={product} colorIndex={colorIndex} />
          ))}
        </div>
      )}
      {open && (!cat.products || cat.products.length === 0) && (
        <div className="border-t bg-muted/20 px-4 py-3 text-center text-muted-foreground text-xs">{t("noProducts")}</div>
      )}
    </div>
  );
}

function ProductRow({ product, colorIndex }: { product: SaleProduct; colorIndex: number }) {
  const { t } = useSettings();
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/40 text-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 overflow-hidden">
          {product.product_photo_url ? (
            <img src={product.product_photo_url} alt="" className="w-full h-full object-cover rounded-lg" />
          ) : (
            product.product_name?.[0] || "?"
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-xs truncate">{product.product_name}</div>
          <div className="text-[10px] text-muted-foreground">{product.qty || 0} {product.unit || t("piece")} · {fmtPercent(product.qty_persent || 0)}</div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <div className="font-semibold text-xs">{fmt(product.summa || 0)}</div>
        <div className="text-[10px] text-muted-foreground">{fmtPercent(product.summa_persent || 0)}</div>
      </div>
    </div>
  );
}

function ExpandableAgentTile({ agent, type }: { agent: any, type: "sales" | "akb" }) {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-0 py-3">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {agent.agent_name?.[0] || "?"}
          </div>
          <div>
            <div className="font-semibold text-sm">{agent.agent_name}</div>
            <div className="text-xs text-muted-foreground">
              {type === "sales" ? `${agent.qty_order || 0} ${t("ordersPlural")}` : `${t("okb")}: ${agent.OKB || 0} / ${t("akbNoun")}: ${agent.AKB || 0}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-sm">
              {type === "sales" ? fmt(agent.total_summa || 0) : fmtPercent(agent.result || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {type === "sales" ? `${fmtPercent(agent.rusult || 0)} ${t("doneLowercase")}` : fmt(agent.summa || 0)}
            </div>
          </div>
          {open ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </div>
      </div>
      {open && type === "sales" && (
        <div className="mt-3 pl-14 pr-4 py-3 bg-muted/50 rounded-md text-sm space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("summaLabel")}:</span>
              <span className="font-medium">{fmt(agent.total_summa || 0)}</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("qtyLabel")}:</span>
              <span className="font-medium">{agent.total_qty || 0}</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("ordersLabel")}:</span>
              <span className="font-medium">{agent.qty_order || 0} {t("piece")}</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("clientsLabel")}:</span>
              <span className="font-medium">{agent.qty_clients || 0} {t("piece")}</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("averageLabel")}:</span>
              <span className="font-medium">{fmt(agent.average || 0)}</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("planFactCompact")}:</span>
              <span className="font-medium">{agent.plan || 0} / {agent.fact || 0}</span>
            </div>
          </div>
          {(agent.returned_qty > 0 || agent.returned_summa > 0) && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex justify-between px-2 py-1 bg-orange-500/5 border border-orange-500/10 rounded-md">
                <span className="text-orange-600">{t("returnedQtyLabel")}:</span>
                <span className="font-medium text-orange-600">{agent.returned_qty || 0}</span>
              </div>
              <div className="flex justify-between px-2 py-1 bg-orange-500/5 border border-orange-500/10 rounded-md">
                <span className="text-orange-600">{t("returnedSummaLabel")}:</span>
                <span className="font-medium text-orange-600 text-xs">{fmt(agent.returned_summa || 0)}</span>
              </div>
            </div>
          )}
        </div>
      )}
      {open && type === "akb" && (
        <div className="mt-3 pl-14 pr-4 py-3 bg-muted/50 rounded-md text-sm space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("summaLabel")}:</span>
              <span className="font-medium">{fmt(agent.summa || 0)}</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("qtyLabel")}:</span>
              <span className="font-medium">{agent.qty || 0}</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("okb")}:</span>
              <span className="font-medium">{agent.OKB || 0}</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("akbNoun")}:</span>
              <span className="font-medium">{agent.AKB || 0}</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("shareOfSumma")}:</span>
              <span className="font-medium">{fmtPercent(agent.summa_persent || 0)}</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-background rounded-md">
              <span className="text-muted-foreground">{t("shareOfQty")}:</span>
              <span className="font-medium">{fmtPercent(agent.qty_persent || 0)}</span>
            </div>
          </div>
          {agent.groups && agent.groups.length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{t("territoriesLabel")} ({agent.groups.length})</div>
              <div className="space-y-1">
                {(agent.groups as ReportGroup[]).map((group: ReportGroup, i: number) => (
                  <GroupRow key={i} group={group} />
                ))}
              </div>
            </div>
          )}
          {(!agent.groups || agent.groups.length === 0) && (
            <div className="text-center py-2 text-muted-foreground text-xs">{t("noGroups")}</div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-muted/40 rounded-xl p-4 flex flex-col">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{label}</span>
      <span className="text-lg font-bold leading-tight">{value}</span>
      {sub && <span className="text-xs text-muted-foreground mt-0.5">{sub}</span>}
    </div>
  );
}

function Dashboard() {
  const { t } = useSettings();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dateBeginRef = useRef<HTMLInputElement>(null);
  const dateEndRef = useRef<HTMLInputElement>(null);

  const [dateBegin, setDateBegin] = useState(monthStartIsoDate());
  const [dateEnd, setDateEnd] = useState(todayIsoDate());

  const [data, setData] = useState<DashboardPayload>({
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
      fetchJson<SalesByCategoryResponse>(API.salesByCategory(baseUrl, branchId, toApiDate(dateBegin), toApiDate(dateEnd))),
      fetchJson<ReportByClientResponse>(API.reportByClient(baseUrl, branchId, toApiDate(dateBegin), toApiDate(dateEnd))),
    ])
      .then(([salesRes, reportRes]) => {
        setData({
          sales: salesRes,
          reports: reportRes,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, t, dateBegin, dateEnd]);

  const salesCategories = useMemo(() => {
    return (data.sales?.sales || []).map(s => ({
      name: s.category_name || t("unknown"),
      value: Number(s.summa || 0),
      qty: Number(s.qty || 0),
    }));
  }, [data.sales, t]);

  const reportAgents = useMemo(() => {
    return (data.reports?.agents || []).map(a => ({
      name: a.agent_name || t("unknown"),
      value: Number(a.AKB || 0),
    }));
  }, [data.reports, t]);

  return (
    <div className="pb-8 max-w-5xl mx-auto">
      <div className="text-center pb-4 mb-1 border-b">
        <h1 className="text-lg font-bold tracking-tight">{t("totalSummary")}</h1>
      </div>

      <div className="flex items-center justify-center gap-3 px-4 py-3 mb-5">
        <input ref={dateBeginRef} type="date" value={dateBegin} onChange={(e) => setDateBegin(e.target.value)} className="sr-only" />
        <button
          type="button"
          onClick={() => dateBeginRef.current?.showPicker()}
          className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl cursor-pointer flex-1 max-w-[200px] border border-transparent hover:border-primary/20 transition-colors"
        >
          <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-[10px] text-muted-foreground leading-none">{t("dan")}</span>
            <span className="text-sm font-medium leading-tight">{formatDisplayDate(dateBegin)}</span>
          </div>
        </button>

        <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />

        <input ref={dateEndRef} type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="sr-only" />
        <button
          type="button"
          onClick={() => dateEndRef.current?.showPicker()}
          className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl cursor-pointer flex-1 max-w-[200px] border border-transparent hover:border-primary/20 transition-colors"
        >
          <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-[10px] text-muted-foreground leading-none">{t("gacha")}</span>
            <span className="text-sm font-medium leading-tight">{formatDisplayDate(dateEnd)}</span>
          </div>
        </button>
      </div>

      {error && (
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center gap-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="savdo" className="space-y-6">
        <TabsList className="bg-muted p-1.5 rounded-xl w-full grid grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="savdo" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all text-xs sm:text-sm">
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            {t("savdoTab")}
          </TabsTrigger>
          <TabsTrigger value="akb" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all text-xs sm:text-sm">
            <UsersRound className="w-4 h-4 mr-1.5" />
            {t("akbTab")}
          </TabsTrigger>
          <TabsTrigger value="kpi" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4 mr-1.5" />
            {t("kpiTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="savdo" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{t("salesByCategories")}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-72 flex items-center justify-center"><Skeleton className="h-48 w-48 rounded-full" /></div>
                ) : salesCategories.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesCategories}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {salesCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">{t("noDataFound")}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{t("planCompletion")}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : (
                  <div className="space-y-5 flex flex-col justify-center h-full pb-4">
                    <div className="flex justify-between items-end">
                      <div className="text-4xl font-bold text-primary">{fmtPercent(data.sales?.rusult || 0)}</div>
                      <div className="text-sm font-medium text-muted-foreground">{t("done")}</div>
                    </div>
                    <div className="h-4 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${Number(data.sales?.rusult) >= 80 ? 'bg-success' : Number(data.sales?.rusult) >= 40 ? 'bg-warning' : 'bg-destructive'}`}
                        style={{ width: `${Math.min(100, Number(data.sales?.rusult || 0))}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 p-3 rounded-xl">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{t("plan")}</div>
                        <div className="font-bold text-lg">{data.sales?.plan || 0}</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{t("fact")}</div>
                        <div className="font-bold text-lg">{data.sales?.fact || 0}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <div className="bg-muted/30 p-3 rounded-xl">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{t("returnedQty")}</div>
                        <div className="font-bold">{data.sales?.returned_qty || 0}</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{t("returnedSumma")}</div>
                        <div className="font-bold text-sm">{fmt(data.sales?.returned_summa || 0)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t("generalReport")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <SummaryCard label={t("totalAmount")} value={fmtShort(data.sales?.total_summa || 0)} sub={fmt(data.sales?.total_summa || 0)} />
                  <SummaryCard label={t("totalQty")} value={`${data.sales?.total_qty || 0}`} />
                  <SummaryCard label={t("orders")} value={`${data.sales?.qty_order || 0} ${t("piece")}`} />
                  <SummaryCard label={t("clients")} value={`${data.sales?.qty_clients || 0} ${t("piece")}`} />
                  <SummaryCard label={t("average")} value={fmtShort(data.sales?.average || 0)} sub={fmt(data.sales?.average || 0)} />
                  <SummaryCard label={t("returnedQty")} value={`${data.sales?.returned_qty || 0}`} />
                  <SummaryCard label={t("returnedSumma")} value={fmtShort(data.sales?.returned_summa || 0)} sub={fmt(data.sales?.returned_summa || 0)} />
                  <SummaryCard label={t("planFact")} value={`${data.sales?.plan || 0} / ${data.sales?.fact || 0}`} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t("agentStats")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <div className="flex flex-col">
                  {data.sales?.agents?.map((agent, i) => (
                    <ExpandableAgentTile key={i} agent={agent} type="sales" />
                  ))}
                  {(!data.sales?.agents || data.sales.agents.length === 0) && (
                    <div className="text-center py-6 text-muted-foreground text-sm">{t("noAgents")}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t("categorySalesDetail")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
              ) : (
                <div className="space-y-3">
                  {data.sales?.sales?.map((cat, i) => (
                    <CategoryWithProducts key={i} cat={cat} colorIndex={i} />
                  ))}
                  {(!data.sales?.sales || data.sales.sales.length === 0) && (
                    <div className="text-center py-6 text-muted-foreground text-sm">{t("noCategories")}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="akb" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{t("agentVisitsBy")}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-72 flex items-center justify-center"><Skeleton className="h-48 w-48 rounded-full" /></div>
                ) : reportAgents.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportAgents}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {reportAgents.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">{t("noDataFound")}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{t("efficiency")}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4"><Skeleton className="h-24 w-full" /></div>
                ) : (
                  <div className="space-y-4 flex flex-col justify-center h-full">
                    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{t("efficiency")}</div>
                      <div className="text-4xl font-bold text-primary">{fmtPercent(data.reports?.result || 0)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 p-4 rounded-xl text-center">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{t("okb")}</div>
                        <div className="text-xl font-bold">{data.reports?.OKB || 0}</div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl text-center">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{t("akbNoun")}</div>
                        <div className="text-xl font-bold">{data.reports?.AKB || 0}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 p-3 rounded-xl text-center">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><ShoppingCart className="w-3 h-3" />{t("orders")}</div>
                        <div className="text-lg font-bold">{data.reports?.qty_order || 0}</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl text-center">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Camera className="w-3 h-3" />{t("photos")}</div>
                        <div className="text-lg font-bold">{data.reports?.qty_photo || 0}</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl text-center">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><ImageOff className="w-3 h-3" />{t("rejected")}</div>
                        <div className="text-lg font-bold">{data.reports?.qty_rejected || 0}</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl text-center">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><RotateCcw className="w-3 h-3" />{t("returned")}</div>
                        <div className="text-lg font-bold">{data.reports?.qty_returned || 0}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t("agentsVisits")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <div className="flex flex-col">
                  {data.reports?.agents?.map((agent, i) => (
                    <ExpandableAgentTile key={i} agent={agent} type="akb" />
                  ))}
                  {(!data.reports?.agents || data.reports.agents.length === 0) && (
                    <div className="text-center py-6 text-muted-foreground text-sm">{t("noAgents")}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpi" className="animate-in fade-in-50 duration-500">
          <Card className="border-dashed border-2 bg-muted/10">
            <CardContent className="py-32 flex flex-col items-center justify-center text-center">
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-8 shadow-sm">
                <Pickaxe className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t("kpiSection")}</h3>
              <p className="text-muted-foreground max-w-md">{t("kpiComingSoon")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
