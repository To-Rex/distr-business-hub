import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
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

function formatNumber(n: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
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

function ClientsPage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

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

  const filteredGroups = useMemo(() => {
    if (!q.trim()) return groups;
    const lower = q.toLowerCase();
    return groups
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
  }, [groups, q]);

  const totalClients = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.clients.length, 0),
    [filteredGroups],
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

      {!loading && !error && filteredGroups.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">{t("notFound")}</Card>
      )}

      {!loading &&
        !error &&
        filteredGroups.map((group) => {
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
              </CollapsibleContent>
            </Collapsible>
          );
        })}
    </div>
  );
}
