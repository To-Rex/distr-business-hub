import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import { getProxiedImageUrl } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  RefreshCw,
  Camera,
  User,
  Building2,
  Calendar,
  MapPin,
  AlertCircle,
  ImageOff,
  Package,
  ChevronDown,
  ChevronUp,
  Truck,
  Banknote,
  CreditCard,
  Smartphone,
  Ban,
  Search,
  X,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

export const Route = createFileRoute("/_app/fotoreport")({
  component: FotoreportPage,
});

type PhotoReport = {
  info: string;
  url: string;
  lat: number;
  long: number;
  date: string;
  user: string;
  client: string;
};

type OrderProduct = {
  product_id: number;
  product_name: string;
  price: number;
  qty: number;
  sum: number;
};

type OrderData = {
  id_doc: number;
  date_doc: string;
  transport: string;
  cry: string;
  branch_id: number;
  status?: string;
  agent: { agent_id: number; agent_name: string };
  type_payment: string;
  local_id: string;
  sklad: string;
  tip_sena: string;
  date_delivery: string;
  comment: string;
  cry_id: string;
  client_id: number;
  client_name: string;
  qty: number;
  summa: number;
  products: OrderProduct[];
};

type PaymentData = {
  id_doc: number;
  date: string;
  branch_id: number;
  cash: number;
  card: number;
  click: number;
  click_proto_url: string;
  client: { client_id: number; client_name: string };
  user: { user_id: number; user_name: string };
  comment: string;
  latitude: number;
  longitude: number;
};

type RejectData = {
  info: string;
  comment: string;
  lat: number;
  long: number;
  date: string;
  user: string;
  client: string;
};

function formatApiDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function apiDateToInput(fmt: string) {
  if (fmt.length !== 8) return "";
  return `${fmt.slice(0, 4)}-${fmt.slice(4, 6)}-${fmt.slice(6, 8)}`;
}

function inputToApiDate(v: string) {
  return v.replace(/-/g, "");
}

function FotoreportPage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const baseUrl = user?.company_rel?.base_url ?? "";
  const login = user?.user_1c_login ?? "";
  const password = user?.user_1c_password ?? "";
  const [tab, setTab] = useState("photos");
  const [photos, setPhotos] = useState<PhotoReport[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [ordersError, setOrdersError] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsLoaded, setPaymentsLoaded] = useState(false);
  const [paymentsError, setPaymentsError] = useState(false);

  const [rejects, setRejects] = useState<RejectData[]>([]);
  const [rejectsLoading, setRejectsLoading] = useState(false);
  const [rejectsLoaded, setRejectsLoaded] = useState(false);
  const [rejectsError, setRejectsError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [photoInfoFilter, setPhotoInfoFilter] = useState("all");
  const [photoAgentFilter, setPhotoAgentFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const now = useMemo(() => new Date(), []);
  const weekAgo = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }, [now]);

  const [dateBegin, setDateBegin] = useState(formatApiDate(weekAgo));
  const [dateEnd, setDateEnd] = useState(formatApiDate(now));

  const fetchPhotos = useCallback(() => {
    if (!baseUrl || !login || !password) return;
    let cancelled = false;
    setLoading(true);
    setError(false);

    const basic = btoa(`${login}:${password}`);

    fetch(API.photoReports(baseUrl, dateBegin, dateEnd), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json: { photo_reports: PhotoReport[] }) => {
        if (cancelled) return;
        setPhotos(json.photo_reports || []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, login, password, dateBegin, dateEnd]);

  const fetchOrders = useCallback(() => {
    if (!baseUrl || !login || !password) return;
    let cancelled = false;
    setOrdersLoading(true);
    setOrdersError(false);

    const basic = btoa(`${login}:${password}`);

    fetch(API.ordersAll(baseUrl, dateBegin, dateEnd), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json: { data: OrderData[] }) => {
        if (cancelled) return;
        setOrders(json.data || []);
        setOrdersLoaded(true);
        setOrdersLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setOrdersError(true);
        setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, login, password, dateBegin, dateEnd]);

  const fetchPayments = useCallback(() => {
    if (!baseUrl || !login || !password) return;
    let cancelled = false;
    setPaymentsLoading(true);
    setPaymentsError(false);

    const basic = btoa(`${login}:${password}`);

    fetch(API.paymentsAll(baseUrl, dateBegin, dateEnd), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json: { data: PaymentData[] }) => {
        if (cancelled) return;
        setPayments(json.data || []);
        setPaymentsLoaded(true);
        setPaymentsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setPaymentsError(true);
        setPaymentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, login, password, dateBegin, dateEnd]);

  const fetchRejects = useCallback(() => {
    if (!baseUrl || !login || !password) return;
    let cancelled = false;
    setRejectsLoading(true);
    setRejectsError(false);

    const basic = btoa(`${login}:${password}`);

    fetch(API.rejectsAll(baseUrl, dateBegin, dateEnd), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json: { rejects: RejectData[] }) => {
        if (cancelled) return;
        setRejects(json.rejects || []);
        setRejectsLoaded(true);
        setRejectsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setRejectsError(true);
        setRejectsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, login, password, dateBegin, dateEnd]);

  useEffect(() => {
    const cancel = fetchPhotos();
    return cancel;
  }, [fetchPhotos]);

  useEffect(() => {
    if (tab === "orders" && !ordersLoaded) {
      const cancel = fetchOrders();
      return cancel;
    }
  }, [tab, ordersLoaded, fetchOrders]);

  useEffect(() => {
    if (tab === "payments" && !paymentsLoaded) {
      const cancel = fetchPayments();
      return cancel;
    }
  }, [tab, paymentsLoaded, fetchPayments]);

  useEffect(() => {
    if (tab === "rejected" && !rejectsLoaded) {
      const cancel = fetchRejects();
      return cancel;
    }
  }, [tab, rejectsLoaded, fetchRejects]);

  const handleRefresh = () => {
    if (tab === "photos") {
      fetchPhotos();
    } else if (tab === "orders") {
      fetchOrders();
    } else if (tab === "payments") {
      fetchPayments();
    } else if (tab === "rejected") {
      fetchRejects();
    }
  };

  const handleSearch = () => {
    if (tab === "photos") {
      fetchPhotos();
    } else if (tab === "orders") {
      setOrdersLoaded(false);
      fetchOrders();
    } else if (tab === "payments") {
      setPaymentsLoaded(false);
      fetchPayments();
    } else if (tab === "rejected") {
      setRejectsLoaded(false);
      fetchRejects();
    }
  };

  const handleTabChange = (v: string) => {
    setTab(v);
    setExpandedOrder(null);
  };

  const statusStyle = (s?: string) => {
    switch (s) {
      case "new": return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "shipped": return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300";
      case "delivered": return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
      default: return "";
    }
  };

  const statusLabel = (s?: string) => {
    switch (s) {
      case "new": return t("new");
      case "shipped": return t("shipped");
      case "delivered": return t("delivered");
      default: return s || "—";
    }
  };

  const hasLocation = (p: PhotoReport) => p.lat !== 0 || p.long !== 0;

  const formatPrice = (n: number) => n.toLocaleString("ru-RU");

  const filteredPhotos = useMemo(() => {
    let list = photos;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.client.toLowerCase().includes(q) ||
          p.user.toLowerCase().includes(q) ||
          p.info.toLowerCase().includes(q),
      );
    }
    if (photoInfoFilter !== "all") {
      list = list.filter((p) => p.info === photoInfoFilter);
    }
    if (photoAgentFilter !== "all") {
      list = list.filter((p) => p.user === photoAgentFilter);
    }
    return [...list].sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [photos, searchQuery, photoInfoFilter, photoAgentFilter, sortDir]);

  const photoInfoOptions = useMemo(() => {
    const set = new Set(photos.map((p) => p.info));
    return Array.from(set).sort();
  }, [photos]);

  const photoAgentOptions = useMemo(() => {
    const set = new Set(photos.map((p) => p.user));
    return Array.from(set).sort();
  }, [photos]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.client_name.toLowerCase().includes(q) ||
          o.agent.agent_name.toLowerCase().includes(q),
      );
    }
    if (orderStatusFilter !== "all") {
      list = list.filter((o) => o.status === orderStatusFilter);
    }
    return [...list].sort((a, b) => {
      const cmp = a.date_doc.localeCompare(b.date_doc);
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [orders, searchQuery, orderStatusFilter, sortDir]);

  const filteredPayments = useMemo(() => {
    let list = payments;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.client.client_name.toLowerCase().includes(q) ||
          p.user.user_name.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [payments, searchQuery, sortDir]);

  const filteredRejects = useMemo(() => {
    let list = rejects;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.client.toLowerCase().includes(q) ||
          r.user.toLowerCase().includes(q) ||
          r.info.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [rejects, searchQuery, sortDir]);

  return (
    <div>
      <PageHeader
        title={t("fotoreport")}
        description={t("fotoreportDesc")}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3 mb-4 mt-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">{t("dateBegin")}</label>
          <input
            type="date"
            value={apiDateToInput(dateBegin)}
            onChange={(e) => setDateBegin(inputToApiDate(e.target.value))}
            onKeyDown={(e) => e.preventDefault()}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <span className="pb-2 text-muted-foreground text-xs">&mdash;</span>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">{t("dateEnd")}</label>
          <input
            type="date"
            value={apiDateToInput(dateEnd)}
            onChange={(e) => setDateEnd(inputToApiDate(e.target.value))}
            onKeyDown={(e) => e.preventDefault()}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Button size="sm" variant="secondary" onClick={handleSearch} className="mb-0.5">
          {t("search")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {tab === "photos" && photoInfoOptions.length > 0 && (
          <select
            value={photoInfoFilter}
            onChange={(e) => setPhotoInfoFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">{t("all")}</option>
            {photoInfoOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {tab === "photos" && photoAgentOptions.length > 0 && (
          <select
            value={photoAgentFilter}
            onChange={(e) => setPhotoAgentFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">{t("agent")}</option>
            {photoAgentOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {tab === "orders" && (
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">{t("all")}</option>            <option value="new">{statusLabel("new")}</option>
            <option value="shipped">{statusLabel("shipped")}</option>
            <option value="delivered">{statusLabel("delivered")}</option>
          </select>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          className="gap-1.5 shrink-0"
        >
          {sortDir === "desc" ? (
            <ArrowDown className="h-3.5 w-3.5" />
          ) : (
            <ArrowUp className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="photos">
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            {t("photos")}
          </TabsTrigger>
          <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
          <TabsTrigger value="rejected">{t("rejected")}</TabsTrigger>
          <TabsTrigger value="payments">{t("payments")}</TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">{t("errorTitle")}</p>
              <Button variant="link" size="sm" onClick={handleRefresh} className="mt-2">
                {t("refresh")}
              </Button>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ImageOff className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">{t("noPhotos")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((p, i) => (
                <Card
                  key={i}
                  className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setPreviewUrl(p.url)}
                >
                  <div className="aspect-square w-full overflow-hidden bg-muted">
                    <img
                      src={getProxiedImageUrl(p.url)}
                      alt={p.client}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <div className="hidden h-full w-full flex-col items-center justify-center gap-1 bg-muted text-muted-foreground">
                      <ImageOff className="h-6 w-6" />
                      <span className="text-[10px]">{t("noData")}</span>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-tight line-clamp-2">
                        {p.client}
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 h-5">
                        {p.info}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{p.user}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground/70 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {p.date}
                      </span>
                      {hasLocation(p) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {p.lat.toFixed(4)}, {p.long.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" forceMount className="data-[state=inactive]:hidden">
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : ordersError ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">{t("errorTitle")}</p>
              <Button variant="link" size="sm" onClick={handleRefresh} className="mt-2">
                {t("refresh")}
              </Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">{t("noOrders")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((o) => {
                const isOpen = expandedOrder === o.id_doc;
                return (
                  <Card
                    key={o.id_doc}
                    className="overflow-hidden transition-shadow hover:shadow-sm"
                  >
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedOrder(isOpen ? null : o.id_doc)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm truncate">
                                {o.client_name}
                              </span>
                              {o.status && (
                                <span
                                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusStyle(o.status)}`}
                                >
                                  {statusLabel(o.status)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {o.agent.agent_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {o.date_doc}
                              </span>
                              {o.type_payment && (
                                <span className="flex items-center gap-1">
                                  <Banknote className="h-3 w-3" />
                                  {o.type_payment}
                                </span>
                              )}
                              {o.transport && (
                                <span className="flex items-center gap-1">
                                  <Truck className="h-3 w-3" />
                                  {o.transport}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-semibold tabular-nums">
                              {formatPrice(o.summa)} {o.cry}
                            </span>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {o.qty} kg
                              </span>
                              {isOpen ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            {o.comment && (
                              <p className="text-xs text-muted-foreground italic">
                                {t("comment")}: {o.comment}
                              </p>
                            )}
                            {o.date_delivery && (
                              <p className="text-xs text-muted-foreground">
                                {t("dateEnd")}: {o.date_delivery}
                              </p>
                            )}
                            <div className="rounded-md border bg-muted/30 overflow-hidden">
                              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                <span className="col-span-5">{t("product")}</span>
                                <span className="col-span-2 text-right">{t("price")}</span>
                                <span className="col-span-2 text-right">{t("qty")}</span>
                                <span className="col-span-3 text-right">{t("total")}</span>
                              </div>
                              {o.products.map((p, pi) => (
                                <div
                                  key={pi}
                                  className="grid grid-cols-12 gap-2 px-3 py-2 text-xs border-t bg-background"
                                >
                                  <span className="col-span-5 truncate">{p.product_name}</span>
                                  <span className="col-span-2 text-right tabular-nums text-muted-foreground">
                                    {formatPrice(p.price)}
                                  </span>
                                  <span className="col-span-2 text-right tabular-nums text-muted-foreground">
                                    {p.qty}
                                  </span>
                                  <span className="col-span-3 text-right tabular-nums font-medium">
                                    {formatPrice(p.sum)}
                                  </span>
                                </div>
                              ))}
                              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold border-t bg-muted/20">
                                <span className="col-span-5">{t("total")}</span>
                                <span className="col-span-2"></span>
                <span className="col-span-2 text-right">{o.qty}</span>
                <span className="col-span-3 text-right">{formatPrice(o.summa)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" forceMount className="data-[state=inactive]:hidden">
          {rejectsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden shadow-sm border-0">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : rejectsError ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">{t("errorTitle")}</p>
              <Button variant="link" size="sm" onClick={handleRefresh} className="mt-2">
                {t("refresh")}
              </Button>
            </div>
          ) : filteredRejects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Ban className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">{t("noRejects")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRejects.map((r, i) => (
                <Card key={i} className="shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-semibold text-sm block truncate">
                          {r.client}
                        </span>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[160px]">{r.user}</span>
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Calendar className="h-3 w-3" />
                            {r.date}
                          </span>
                          {(r.lat !== 0 || r.long !== 0) && (
                            <span className="flex items-center gap-1 shrink-0">
                              <MapPin className="h-3 w-3" />
                              {r.lat.toFixed(4)}, {r.long.toFixed(4)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        <Ban className="h-3 w-3" />
                        {t("reason")}: {r.info}
                      </span>
                    </div>

                    {r.comment && (
                      <p className="mt-2.5 text-xs text-muted-foreground/70 italic border-t pt-2">
                        {r.comment}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" forceMount className="data-[state=inactive]:hidden">
          {paymentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden shadow-sm border-0">
                  <CardContent className="p-0">
                    <div className="flex gap-0">
                      <Skeleton className="w-28 shrink-0 h-[100px] rounded-none" />
                      <div className="flex-1 p-4 space-y-3">
                        <Skeleton className="h-4 w-40" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : paymentsError ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">{t("errorTitle")}</p>
              <Button variant="link" size="sm" onClick={handleRefresh} className="mt-2">
                {t("refresh")}
              </Button>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Banknote className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">{t("noPayments")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((p) => (
                <Card key={p.id_doc} className="overflow-hidden group shadow-sm border-0">
                  <CardContent className="p-0">
                    <div className="flex gap-0">
                      {p.click_proto_url && (
                        <button
                          className="relative w-28 shrink-0 cursor-pointer overflow-hidden bg-muted border-r"
                          onClick={() => setPreviewUrl(p.click_proto_url)}
                        >
                          <img
                            src={getProxiedImageUrl(p.click_proto_url)}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover absolute inset-0 transition-transform group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                              (e.target as HTMLImageElement).nextElementSibling?.nextElementSibling?.classList.add("hidden");
                            }}
                          />
                          <div className="hidden absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                            <ImageOff className="h-5 w-5" />
                            <span className="text-[9px]">{t("noData")}</span>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute bottom-1.5 right-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
                            {t("photo")}
                          </div>
                        </button>
                      )}

                      <div className="flex-1 min-w-0 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-semibold text-sm block truncate">
                              {p.client.client_name}
                            </span>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[140px]">{p.user.user_name}</span>
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <Calendar className="h-3 w-3" />
                                {p.date}
                              </span>
                              {(p.latitude !== 0 || p.longitude !== 0) && (
                                <span className="flex items-center gap-1 shrink-0">
                                  <MapPin className="h-3 w-3" />
                                  {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-base font-bold tabular-nums shrink-0">
                            {formatPrice(p.cash + p.card + p.click)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {p.cash > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <Banknote className="h-3 w-3" />
                              {t("cash")}: {formatPrice(p.cash)}
                            </span>
                          )}
                          {p.card > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              <CreditCard className="h-3 w-3" />
                              {t("card")}: {formatPrice(p.card)}
                            </span>
                          )}
                          {p.click > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
                              <Smartphone className="h-3 w-3" />
                              {t("click")}: {formatPrice(p.click)}
                            </span>
                          )}
                        </div>

                        {p.comment ? (
                          <p className="mt-2.5 text-xs text-muted-foreground/70 italic border-t pt-2">
                            {p.comment}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          <button
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
            onClick={() => setPreviewUrl(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          {previewUrl && (
            <img
              src={getProxiedImageUrl(previewUrl)}
              alt=""
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ComingSoonTab() {
  const { t } = useSettings();
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-12 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">{t("comingSoon")}</p>
        </div>
      </CardContent>
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-[2px]">
        <div className="rounded-2xl border border-white/30 bg-white/15 px-8 py-5 shadow-lg dark:bg-white/5">
          <span className="text-3xl font-semibold tracking-wide text-foreground">
            {t("comingSoon")}
          </span>
        </div>
      </div>
    </Card>
  );
}
