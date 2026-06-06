import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import { formatWithSpaces } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import {
  Search,
  ChevronDown,
  Users,
  Phone,
  MapPin,
  Tag,
  User,
  Store,
  Wallet,
  Calendar,
  AlertCircle,
  LayoutGrid,
  Rows3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
} from "lucide-react";

export const Route = createFileRoute("/_app/clients")({
  component: ClientsPage,
});

type ClientItem = {
  id: number;
  name: string;
  filial_id: number;
  filial_name: string;
  Yur_Name: string;
  INN: string;
  HR: number;
  Bank: string;
  MFO: string;
  OKED: string;
  contactName: string;
  RegNomerNDS: number;
  PasSeria: string;
  PasNumber: string;
  DataVidachi: string;
  PoslednayaProdaja: string;
  PervayaProdaja: string;
  visitQty: number;
  visit: { id_day: number; uz: string; ru: string; eng: string }[];
  KemVidan: string;
  Phone: string;
  Orientr: string;
  Lang: number;
  Lat: number;
  debt: { UZS: number; USD: number };
  commentary: string;
  category: string;
  img: string[];
  activities: string[];
  status: string;
  status_name: string;
  agent: { agent_id: number; agent_name: string };
};

type ClientGroup = {
  group_id: number;
  group_name: string;
  clients: ClientItem[];
};

type ApiResponse = {
  data: ClientGroup[];
  meta: { total: number };
};

type SortMode =
  | "name-asc"
  | "name-desc"
  | "debt-desc"
  | "debt-asc"
  | "last-sale-desc"
  | "last-sale-asc";

type AktSverkaDetail = {
  osnova: string;
  ed_izm: string;
  sena: string;
  qty: string;
  debt: number;
  credit: number;
};

type AktSverkaDoc = {
  id_doc: string;
  date_doc: string;
  type_doc: string;
  debt: number;
  credit: number;
  balance: number;
  detals: AktSverkaDetail[];
};

function formatNumber(n: number): string {
  return formatWithSpaces(n, 2);
}

function debtScore(debt: { UZS: number; USD: number }): number {
  return debt.UZS + debt.USD;
}

function saleDateScore(value: string): number {
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return parsed;
  return Date.parse(`1970-01-01T00:00:00Z`);
}

function formatDebt(debt: { UZS: number; USD: number }): {
  text: string;
  color: string;
} {
  const parts: string[] = [];
  if (debt.UZS !== 0) parts.push(`${formatNumber(debt.UZS)} UZS`);
  if (debt.USD !== 0) parts.push(`${formatNumber(debt.USD)} USD`);
  if (parts.length === 0) return { text: "0", color: "text-muted-foreground" };
  const total = Math.abs(debt.UZS) + Math.abs(debt.USD);
  const isNegative = debt.UZS < 0 || debt.USD < 0;
  return {
    text: parts.join(" / "),
    color: isNegative ? "text-red-500" : "text-green-600",
  };
}

function toApiDate(iso: string): string {
  return iso.replaceAll("-", "");
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthStartIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function ClientsPage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const isMobile = useIsMobile();

  useEffect(() => {
    setViewMode(isMobile ? "cards" : "table");
  }, [isMobile]);

  const [sortMode, setSortMode] = useState<SortMode>("name-asc");
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState("mijozlar");

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDebt, setFilterDebt] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAgent, setFilterAgent] = useState("all");

  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }

    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);

    fetch(API.clientsByGroup(baseUrl), {
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
        setGroups(data.data ?? []);
        const allIds = (data.data ?? []).map((g) => g.group_id);
        setExpandedGroups(new Set(allIds));
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [user, t]);

  const filterOptions = useMemo(() => {
    const categories = new Set<string>();
    const agents = new Set<string>();
    for (const g of groups) {
      for (const c of g.clients) {
        if (c.category) categories.add(c.category);
        if (c.agent.agent_name) agents.add(c.agent.agent_name);
      }
    }
    return {
      categories: [...categories].sort(),
      agents: [...agents].sort(),
    };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    let base = groups;

    if (q.trim()) {
      const lower = q.toLowerCase();
      base = base
        .map((g) => ({
          ...g,
          clients: g.clients.filter(
            (c) =>
              c.name.toLowerCase().includes(lower) ||
              c.Phone.toLowerCase().includes(lower) ||
              c.category.toLowerCase().includes(lower) ||
              c.agent.agent_name.toLowerCase().includes(lower) ||
              c.contactName.toLowerCase().includes(lower) ||
              c.INN.toLowerCase().includes(lower),
          ),
        }))
        .filter((g) => g.clients.length > 0);
    }

    if (filterStatus !== "all") {
      base = base
        .map((g) => ({
          ...g,
          clients: g.clients.filter((c) => c.status_name === filterStatus),
        }))
        .filter((g) => g.clients.length > 0);
    }

    if (filterDebt === "with") {
      base = base
        .map((g) => ({
          ...g,
          clients: g.clients.filter((c) => c.debt.UZS > 0 || c.debt.USD > 0 || c.debt.UZS < 0 || c.debt.USD < 0),
        }))
        .filter((g) => g.clients.length > 0);
    } else if (filterDebt === "no") {
      base = base
        .map((g) => ({
          ...g,
          clients: g.clients.filter((c) => c.debt.UZS === 0 && c.debt.USD === 0),
        }))
        .filter((g) => g.clients.length > 0);
    }

    if (filterCategory !== "all") {
      base = base
        .map((g) => ({
          ...g,
          clients: g.clients.filter((c) => c.category === filterCategory),
        }))
        .filter((g) => g.clients.length > 0);
    }

    if (filterAgent !== "all") {
      base = base
        .map((g) => ({
          ...g,
          clients: g.clients.filter((c) => c.agent.agent_name === filterAgent),
        }))
        .filter((g) => g.clients.length > 0);
    }

    return base;
  }, [groups, q, filterStatus, filterDebt, filterCategory, filterAgent]);

  const sortedGroups = useMemo(() => {
    return filteredGroups.map((group) => {
      const clients = [...group.clients].sort((a, b) => {
        switch (sortMode) {
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "debt-desc":
            return debtScore(b.debt) - debtScore(a.debt);
          case "debt-asc":
            return debtScore(a.debt) - debtScore(b.debt);
          case "last-sale-desc":
            return saleDateScore(b.PoslednayaProdaja) - saleDateScore(a.PoslednayaProdaja);
          case "last-sale-asc":
            return saleDateScore(a.PoslednayaProdaja) - saleDateScore(b.PoslednayaProdaja);
          case "name-asc":
          default:
            return a.name.localeCompare(b.name);
        }
      });
      return { ...group, clients };
    });
  }, [filteredGroups, sortMode]);

  const totalClients = useMemo(
    () => sortedGroups.reduce((sum, g) => sum + g.clients.length, 0),
    [sortedGroups],
  );

  const toggleGroup = (id: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <PageHeader title={t("clients")} description={t("clientsDesc")} />

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="mijozlar">{t("clients")}</TabsTrigger>
          <TabsTrigger value="aktSverka">{t("aktSverka")}</TabsTrigger>
        </TabsList>

        <TabsContent value="mijozlar">
          <Card className="p-4 mb-4">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Users className="h-4 w-4" />
            <span>
              {totalClients} {t("clients").toLowerCase()}
            </span>
          </div>
          <div className="shrink-0">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="name-asc">{t("sortAZ")}</option>
              <option value="name-desc">{t("sortZA")}</option>
              <option value="debt-desc">{t("sortDebtHighLow")}</option>
              <option value="debt-asc">{t("sortDebtLowHigh")}</option>
              <option value="last-sale-desc">{t("sortLastSaleNewOld")}</option>
              <option value="last-sale-asc">{t("sortLastSaleOldNew")}</option>
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

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="all">{t("status")}: {t("all")}</option>
            <option value="faol">{t("active")}</option>
            <option value="passiv">{t("inactive")}</option>
          </select>
          <select
            value={filterDebt}
            onChange={(e) => setFilterDebt(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="all">{t("debt")}: {t("all")}</option>
            <option value="with">{t("withDebt")}</option>
            <option value="no">{t("noDebt")}</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs max-w-[160px]"
          >
            <option value="all">{t("category")}: {t("all")}</option>
            {filterOptions.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs max-w-[180px]"
          >
            <option value="all">{t("agent")}: {t("all")}</option>
            {filterOptions.agents.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {(filterStatus !== "all" || filterDebt !== "all" || filterCategory !== "all" || filterAgent !== "all") && (
            <button
              type="button"
              onClick={() => {
                setFilterStatus("all");
                setFilterDebt("all");
                setFilterCategory("all");
                setFilterAgent("all");
              }}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("cancel")} &times;
            </button>
          )}
        </div>
      </Card>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, gi) => (
            <div key={gi}>
              <Card className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-2 px-1">
                {Array.from({ length: gi === 0 ? 4 : 2 }).map((_, ci) => (
                  <Card key={ci}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-3/5" />
                      </div>
                      <div className="pt-3 border-t flex items-center justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-16 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <Card className="p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("errorTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("errorClientsLoad")}</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && sortedGroups.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">{t("notFound")}</Card>
      )}

      {!loading &&
        !error &&
        sortedGroups.map((group) => {
          const isOpen = expandedGroups.has(group.group_id);
          return (
            <Collapsible
              key={group.group_id}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.group_id)}
              className="mb-3"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full">
                  <Card className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Store className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-semibold">{group.group_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {group.clients.length} {t("clients").toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {group.clients.length}
                        </Badge>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </Card>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {viewMode === "cards" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-2 px-1">
                    {group.clients.map((client) => {
                      const debt = formatDebt(client.debt);
                      return (
                        <Card
                          key={client.id}
                          className="overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-semibold truncate">{client.name}</h4>
                                {client.contactName && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {client.contactName}
                                  </p>
                                )}
                              </div>
                              {client.status_name && (
                                <Badge
                                  variant={client.status_name === "faol" ? "default" : "secondary"}
                                  className="shrink-0 text-[10px] px-1.5 py-0"
                                >
                                  {client.status_name}
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              {client.category && (
                                <div className="flex items-center gap-2">
                                  <Tag className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{client.category}</span>
                                </div>
                              )}
                              {client.Phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{client.Phone}</span>
                                </div>
                              )}
                              {client.Orientr && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{client.Orientr}</span>
                                </div>
                              )}
                              {client.agent.agent_name && (
                                <div className="flex items-center gap-2">
                                  <User className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{client.agent.agent_name}</span>
                                </div>
                              )}
                              {client.PoslednayaProdaja && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {t("lastSale")}: {client.PoslednayaProdaja}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 pt-3 border-t flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className={`text-xs font-medium ${debt.color}`}>
                                  {debt.text}
                                </span>
                              </div>
                              {client.filial_name && (
                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {client.filial_name}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="mt-2 overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("clients")}</TableHead>
                            <TableHead>{t("contact")}</TableHead>
                            <TableHead>{t("phone")}</TableHead>
                            <TableHead>{t("category")}</TableHead>
                            <TableHead>{t("agent")}</TableHead>
                            <TableHead>{t("filial")}</TableHead>
                            <TableHead>{t("lastSale")}</TableHead>
                            <TableHead className="text-right">{t("debt")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.clients.map((client) => {
                            const debt = formatDebt(client.debt);
                            return (
                              <TableRow key={client.id}>
                                <TableCell className="font-medium min-w-[220px]">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate">{client.name}</span>
                                    {client.status_name && (
                                      <Badge
                                        variant={
                                          client.status_name === "faol" ? "default" : "secondary"
                                        }
                                        className="text-[10px] px-1.5 py-0"
                                      >
                                        {client.status_name}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="min-w-[160px]">
                                  {client.contactName || "-"}
                                </TableCell>
                                <TableCell>{client.Phone || "-"}</TableCell>
                                <TableCell>{client.category || "-"}</TableCell>
                                <TableCell>{client.agent.agent_name || "-"}</TableCell>
                                <TableCell>{client.filial_name || "-"}</TableCell>
                                <TableCell>{client.PoslednayaProdaja || "-"}</TableCell>
                                <TableCell className={`text-right font-medium ${debt.color}`}>
                                  {debt.text}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
        </TabsContent>

        <TabsContent value="aktSverka" forceMount className="data-[state=inactive]:hidden">
          <AktSverkaTab groups={groups} user={user} t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type AktSverkaTabProps = {
  groups: ClientGroup[];
  user: ReturnType<typeof import("@/lib/auth").useAuth>["user"];
  t: ReturnType<typeof import("@/lib/settings").useSettings>["t"];
};

function AktSverkaTab({ groups, user, t: tr }: AktSverkaTabProps) {
  const allClients = useMemo(() => {
    const result: { id: number; name: string }[] = [];
    for (const g of groups) {
      for (const c of g.clients) {
        if (!result.some((x) => x.id === c.id)) {
          result.push({ id: c.id, name: c.name });
        }
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [groups]);

  const [clientQuery, setClientQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: number; name: string } | null>(null);
  const [dateBegin, setDateBegin] = useState(monthStartIso());
  const [dateEnd, setDateEnd] = useState(todayIso());
  const [docs, setDocs] = useState<AktSverkaDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  const dateBeginRef = useRef<HTMLInputElement>(null);
  const dateEndRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredClients = useMemo(() => {
    if (!clientQuery.trim()) return allClients.slice(0, 30);
    const q = clientQuery.toLowerCase();
    return allClients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 30);
  }, [allClients, clientQuery]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchAktSverka = useCallback(() => {
    if (!selectedClient) {
      toast.error(tr("noClientSelected"));
      return;
    }
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      toast.error(tr("notAvailable"));
      return;
    }
    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    setLoading(true);
    setError(null);
    fetch(API.aktSverka(baseUrl, selectedClient.id, 1, 1, toApiDate(dateBegin), toApiDate(dateEnd)), {
      headers: { accept: "application/json", Authorization: `Basic ${basic}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { data: AktSverkaDoc[] }) => {
        const result = data.data ?? [];
        setDocs(result);
        toast.success(`${tr("aktSverka")} — ${result.length} ${tr("orders").toLowerCase()}`);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [selectedClient, user, dateBegin, dateEnd, tr]);

  useEffect(() => {
    if (selectedClient) fetchAktSverka();
  }, [selectedClient, dateBegin, dateEnd, fetchAktSverka]);

  const toggleDoc = (id: string) => {
    setExpandedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalDebt = docs.reduce((s, d) => s + d.debt, 0);
  const totalCredit = docs.reduce((s, d) => s + d.credit, 0);
  const totalBalance = docs.reduce((s, d) => s + d.balance, 0);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full relative" ref={dropdownRef}>
            <label className="text-xs text-muted-foreground mb-1.5 block">{tr("selectClient")}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                placeholder={tr("search")}
                value={selectedClient ? selectedClient.name : clientQuery}
                onChange={(e) => {
                  setClientQuery(e.target.value);
                  setSelectedClient(null);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
            </div>
            {showDropdown && filteredClients.length > 0 && !selectedClient && (
              <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setSelectedClient(c);
                      setClientQuery("");
                      setShowDropdown(false);
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1.5">{tr("dan")}</label>
              <input ref={dateBeginRef} type="date" value={dateBegin} onChange={(e) => setDateBegin(e.target.value)} className="sr-only" />
              <button
                type="button"
                onClick={() => dateBeginRef.current?.showPicker()}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg cursor-pointer border border-transparent hover:border-primary/20 transition-colors text-sm"
              >
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                {formatDisplayDate(dateBegin)}
              </button>
            </div>
            <span className="text-muted-foreground text-sm mt-5">—</span>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1.5">{tr("gacha")}</label>
              <input ref={dateEndRef} type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="sr-only" />
              <button
                type="button"
                onClick={() => dateEndRef.current?.showPicker()}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg cursor-pointer border border-transparent hover:border-primary/20 transition-colors text-sm"
              >
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                {formatDisplayDate(dateEnd)}
              </button>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 h-10"
            onClick={fetchAktSverka}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-1">{tr("refresh")}</span>
          </Button>
        </div>
      </Card>

      {!selectedClient && (
        <Card className="p-12 text-center text-muted-foreground">
          {tr("noClientSelected")}
        </Card>
      )}

      {selectedClient && loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-6">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedClient && error && !loading && (
        <Card className="p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </Card>
      )}

      {selectedClient && !loading && !error && docs.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          {tr("noSverkaData")}
        </Card>
      )}

      {selectedClient && !loading && !error && docs.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{tr("debt")}</p>
              <p className="text-lg font-bold text-red-500">{formatNumber(totalDebt)}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{tr("credit")}</p>
              <p className="text-lg font-bold text-green-600">{formatNumber(totalCredit)}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{tr("balance")}</p>
              <p className={`text-lg font-bold ${totalBalance >= 0 ? "text-green-600" : "text-red-500"}`}>
                {formatNumber(totalBalance)}
              </p>
            </Card>
          </div>

          <div className="space-y-2">
            {docs.map((doc) => {
              const isOpen = expandedDocs.has(doc.id_doc);
              return (
                <Collapsible
                  key={doc.id_doc}
                  open={isOpen}
                  onOpenChange={() => toggleDoc(doc.id_doc)}
                >
                  <CollapsibleTrigger asChild>
                    <button className="w-full text-left">
                      <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${doc.credit > 0 ? "bg-green-500/10" : "bg-primary/10"}`}>
                              {doc.credit > 0 ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{doc.type_doc}</p>
                              <p className="text-xs text-muted-foreground">{doc.date_doc}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm shrink-0">
                            <span className="text-red-500 font-medium">{formatNumber(doc.debt)}</span>
                            <span className="text-green-600 font-medium">{formatNumber(doc.credit)}</span>
                            <span className="text-muted-foreground font-medium min-w-[80px] text-right">{formatNumber(doc.balance)}</span>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                      </Card>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1 mb-3 ml-4 border-l-2 border-muted pl-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">{tr("product")}</TableHead>
                            <TableHead className="text-xs text-center">{tr("quantity")}</TableHead>
                            <TableHead className="text-xs text-center">{tr("price")}</TableHead>
                            <TableHead className="text-xs text-right">{tr("debt")}</TableHead>
                            <TableHead className="text-xs text-right">{tr("credit")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {doc.detals.map((d, di) => (
                            <TableRow key={di}>
                              <TableCell className="text-xs">{d.osnova}</TableCell>
                              <TableCell className="text-xs text-center">{d.qty} {d.ed_izm}</TableCell>
                              <TableCell className="text-xs text-center">{d.sena}</TableCell>
                              <TableCell className="text-xs text-right text-red-500">{d.debt ? formatNumber(d.debt) : "—"}</TableCell>
                              <TableCell className="text-xs text-right text-green-600">{d.credit ? formatNumber(d.credit) : "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
