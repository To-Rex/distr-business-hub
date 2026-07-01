import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo, useCallback, useEffect } from "react";
import { w as useSettings, u as useAuth, A as API, P as PageHeader, a as Button, C as Card, j as Skeleton, b as CardContent, s as getProxiedImageUrl, B as Badge } from "./router-cZ9I3NNJ.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-8cGmox-V.js";
import { D as Dialog, a as DialogContent } from "./dialog-BjrgJ72d.js";
import { RefreshCw, Search, X, ArrowDown, ArrowUp, Camera, AlertCircle, ImageOff, User, Calendar, MapPin, Package, Banknote, Truck, ChevronUp, ChevronDown, Ban, CreditCard, Smartphone } from "lucide-react";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-tabs";
import "@radix-ui/react-dialog";
function formatApiDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
function apiDateToInput(fmt) {
  if (fmt.length !== 8) return "";
  return `${fmt.slice(0, 4)}-${fmt.slice(4, 6)}-${fmt.slice(6, 8)}`;
}
function inputToApiDate(v) {
  return v.replace(/-/g, "");
}
function FotoreportPage() {
  const {
    t
  } = useSettings();
  const {
    user
  } = useAuth();
  const baseUrl = user?.company_rel?.base_url ?? "";
  const login = user?.user_1c_login ?? "";
  const password = user?.user_1c_password ?? "";
  const [tab, setTab] = useState("photos");
  const [photos, setPhotos] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [ordersError, setOrdersError] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsLoaded, setPaymentsLoaded] = useState(false);
  const [paymentsError, setPaymentsError] = useState(false);
  const [rejects, setRejects] = useState([]);
  const [rejectsLoading, setRejectsLoading] = useState(false);
  const [rejectsLoaded, setRejectsLoaded] = useState(false);
  const [rejectsError, setRejectsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [photoInfoFilter, setPhotoInfoFilter] = useState("all");
  const [photoAgentFilter, setPhotoAgentFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [sortDir, setSortDir] = useState("desc");
  const now = useMemo(() => /* @__PURE__ */ new Date(), []);
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
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    }).then((json) => {
      if (cancelled) return;
      setPhotos(json.photo_reports || []);
      setLoading(false);
    }).catch(() => {
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
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    }).then((json) => {
      if (cancelled) return;
      setOrders(json.data || []);
      setOrdersLoaded(true);
      setOrdersLoading(false);
    }).catch(() => {
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
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    }).then((json) => {
      if (cancelled) return;
      setPayments(json.data || []);
      setPaymentsLoaded(true);
      setPaymentsLoading(false);
    }).catch(() => {
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
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    }).then((json) => {
      if (cancelled) return;
      setRejects(json.rejects || []);
      setRejectsLoaded(true);
      setRejectsLoading(false);
    }).catch(() => {
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
  const handleTabChange = (v) => {
    setTab(v);
    setExpandedOrder(null);
  };
  const statusStyle = (s) => {
    switch (s) {
      case "new":
        return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "shipped":
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300";
      case "delivered":
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
      default:
        return "";
    }
  };
  const statusLabel = (s) => {
    switch (s) {
      case "new":
        return t("new");
      case "shipped":
        return t("shipped");
      case "delivered":
        return t("delivered");
      default:
        return s || "—";
    }
  };
  const hasLocation = (p) => p.lat !== 0 || p.long !== 0;
  const formatPrice = (n) => n.toLocaleString("ru-RU");
  const filteredPhotos = useMemo(() => {
    let list = photos;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.client.toLowerCase().includes(q) || p.user.toLowerCase().includes(q) || p.info.toLowerCase().includes(q));
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
      list = list.filter((o) => o.client_name.toLowerCase().includes(q) || o.agent.agent_name.toLowerCase().includes(q));
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
      list = list.filter((p) => p.client.client_name.toLowerCase().includes(q) || p.user.user_name.toLowerCase().includes(q));
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
      list = list.filter((r) => r.client.toLowerCase().includes(q) || r.user.toLowerCase().includes(q) || r.info.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [rejects, searchQuery, sortDir]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("fotoreport"), description: t("fotoreportDesc"), actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleRefresh, disabled: loading, className: "gap-1.5", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }),
      t("refresh")
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-3 mb-4 mt-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground", children: t("dateBegin") }),
        /* @__PURE__ */ jsx("input", { type: "date", value: apiDateToInput(dateBegin), onChange: (e) => setDateBegin(inputToApiDate(e.target.value)), onKeyDown: (e) => e.preventDefault(), className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "pb-2 text-muted-foreground text-xs", children: "—" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground", children: t("dateEnd") }),
        /* @__PURE__ */ jsx("input", { type: "date", value: apiDateToInput(dateEnd), onChange: (e) => setDateEnd(inputToApiDate(e.target.value)), onKeyDown: (e) => e.preventDefault(), className: "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" })
      ] }),
      /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: handleSearch, className: "mb-0.5", children: t("search") })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[200px] max-w-sm", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx("input", { type: "text", placeholder: t("search"), value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }),
        searchQuery && /* @__PURE__ */ jsx("button", { onClick: () => setSearchQuery(""), className: "absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
      ] }),
      tab === "photos" && photoInfoOptions.length > 0 && /* @__PURE__ */ jsxs("select", { value: photoInfoFilter, onChange: (e) => setPhotoInfoFilter(e.target.value), className: "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", children: [
        /* @__PURE__ */ jsx("option", { value: "all", children: t("all") }),
        photoInfoOptions.map((opt) => /* @__PURE__ */ jsx("option", { value: opt, children: opt }, opt))
      ] }),
      tab === "photos" && photoAgentOptions.length > 0 && /* @__PURE__ */ jsxs("select", { value: photoAgentFilter, onChange: (e) => setPhotoAgentFilter(e.target.value), className: "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", children: [
        /* @__PURE__ */ jsx("option", { value: "all", children: t("agent") }),
        photoAgentOptions.map((opt) => /* @__PURE__ */ jsx("option", { value: opt, children: opt }, opt))
      ] }),
      tab === "orders" && /* @__PURE__ */ jsxs("select", { value: orderStatusFilter, onChange: (e) => setOrderStatusFilter(e.target.value), className: "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", children: [
        /* @__PURE__ */ jsx("option", { value: "all", children: t("all") }),
        "            ",
        /* @__PURE__ */ jsx("option", { value: "new", children: statusLabel("new") }),
        /* @__PURE__ */ jsx("option", { value: "shipped", children: statusLabel("shipped") }),
        /* @__PURE__ */ jsx("option", { value: "delivered", children: statusLabel("delivered") })
      ] }),
      /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => setSortDir((d) => d === "desc" ? "asc" : "desc"), className: "gap-1.5 shrink-0", children: sortDir === "desc" ? /* @__PURE__ */ jsx(ArrowDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ArrowUp, { className: "h-3.5 w-3.5" }) })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { value: tab, onValueChange: handleTabChange, children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "mb-4", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "photos", children: [
          /* @__PURE__ */ jsx(Camera, { className: "h-3.5 w-3.5 mr-1.5" }),
          t("photos")
        ] }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "orders", children: t("orders") }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "rejected", children: t("rejected") }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "payments", children: t("payments") })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "photos", children: loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: Array.from({
        length: 8
      }).map((_, i) => /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "aspect-square w-full rounded-none" }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-3 space-y-2", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-3/4" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-1/2" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-16 rounded-full" })
        ] })
      ] }, i)) }) : error ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("errorTitle") }),
        /* @__PURE__ */ jsx(Button, { variant: "link", size: "sm", onClick: handleRefresh, className: "mt-2", children: t("refresh") })
      ] }) : filteredPhotos.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(ImageOff, { className: "h-12 w-12 mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: t("noPhotos") })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: filteredPhotos.map((p, i) => /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden group cursor-pointer hover:shadow-md transition-shadow", onClick: () => setPreviewUrl(p.url), children: [
        /* @__PURE__ */ jsxs("div", { className: "aspect-square w-full overflow-hidden bg-muted", children: [
          /* @__PURE__ */ jsx("img", { src: getProxiedImageUrl(p.url), alt: p.client, loading: "lazy", className: "h-full w-full object-cover transition-transform group-hover:scale-105", onError: (e) => {
            e.target.style.display = "none";
            e.target.nextElementSibling?.classList.remove("hidden");
          } }),
          /* @__PURE__ */ jsxs("div", { className: "hidden h-full w-full flex-col items-center justify-center gap-1 bg-muted text-muted-foreground", children: [
            /* @__PURE__ */ jsx(ImageOff, { className: "h-6 w-6" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: t("noData") })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium leading-tight line-clamp-2", children: p.client }),
            /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "shrink-0 text-[10px] px-1.5 h-5", children: p.info })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx(User, { className: "h-3 w-3 shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "truncate", children: p.user })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground/70 flex-wrap", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
              p.date
            ] }),
            hasLocation(p) && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
              p.lat.toFixed(4),
              ", ",
              p.long.toFixed(4)
            ] })
          ] })
        ] })
      ] }, i)) }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "orders", forceMount: true, className: "data-[state=inactive]:hidden", children: ordersLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({
        length: 5
      }).map((_, i) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex-1", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-48" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-32" })
        ] }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-20 rounded-full" })
      ] }) }) }, i)) }) : ordersError ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("errorTitle") }),
        /* @__PURE__ */ jsx(Button, { variant: "link", size: "sm", onClick: handleRefresh, className: "mt-2", children: t("refresh") })
      ] }) : filteredOrders.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Package, { className: "h-12 w-12 mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: t("noOrders") })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: filteredOrders.map((o) => {
        const isOpen = expandedOrder === o.id_doc;
        return /* @__PURE__ */ jsx(Card, { className: "overflow-hidden transition-shadow hover:shadow-sm", children: /* @__PURE__ */ jsx("button", { className: "w-full text-left", onClick: () => setExpandedOrder(isOpen ? null : o.id_doc), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm truncate", children: o.client_name }),
                o.status && /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusStyle(o.status)}`, children: statusLabel(o.status) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }),
                  o.agent.agent_name
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
                  o.date_doc
                ] }),
                o.type_payment && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Banknote, { className: "h-3 w-3" }),
                  o.type_payment
                ] }),
                o.transport && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Truck, { className: "h-3 w-3" }),
                  o.transport
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold tabular-nums", children: [
                formatPrice(o.summa),
                " ",
                o.cry
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1 mt-1", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  o.qty,
                  " kg"
                ] }),
                isOpen ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
              ] })
            ] })
          ] }),
          isOpen && /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t space-y-2", children: [
            o.comment && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground italic", children: [
              t("comment"),
              ": ",
              o.comment
            ] }),
            o.date_delivery && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              t("dateEnd"),
              ": ",
              o.date_delivery
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-muted/30 overflow-hidden", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider", children: [
                /* @__PURE__ */ jsx("span", { className: "col-span-5", children: t("product") }),
                /* @__PURE__ */ jsx("span", { className: "col-span-2 text-right", children: t("price") }),
                /* @__PURE__ */ jsx("span", { className: "col-span-2 text-right", children: t("qty") }),
                /* @__PURE__ */ jsx("span", { className: "col-span-3 text-right", children: t("total") })
              ] }),
              o.products.map((p, pi) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-2 px-3 py-2 text-xs border-t bg-background", children: [
                /* @__PURE__ */ jsx("span", { className: "col-span-5 truncate", children: p.product_name }),
                /* @__PURE__ */ jsx("span", { className: "col-span-2 text-right tabular-nums text-muted-foreground", children: formatPrice(p.price) }),
                /* @__PURE__ */ jsx("span", { className: "col-span-2 text-right tabular-nums text-muted-foreground", children: p.qty }),
                /* @__PURE__ */ jsx("span", { className: "col-span-3 text-right tabular-nums font-medium", children: formatPrice(p.sum) })
              ] }, pi)),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold border-t bg-muted/20", children: [
                /* @__PURE__ */ jsx("span", { className: "col-span-5", children: t("total") }),
                /* @__PURE__ */ jsx("span", { className: "col-span-2" }),
                /* @__PURE__ */ jsx("span", { className: "col-span-2 text-right", children: o.qty }),
                /* @__PURE__ */ jsx("span", { className: "col-span-3 text-right", children: formatPrice(o.summa) })
              ] })
            ] })
          ] })
        ] }) }) }, o.id_doc);
      }) }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "rejected", forceMount: true, className: "data-[state=inactive]:hidden", children: rejectsLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({
        length: 4
      }).map((_, i) => /* @__PURE__ */ jsx(Card, { className: "overflow-hidden shadow-sm border-0", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-40" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-24" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-24" })
        ] }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-20 rounded-full" })
      ] }) }, i)) }) : rejectsError ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("errorTitle") }),
        /* @__PURE__ */ jsx(Button, { variant: "link", size: "sm", onClick: handleRefresh, className: "mt-2", children: t("refresh") })
      ] }) : filteredRejects.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Ban, { className: "h-12 w-12 mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: t("noRejects") })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: filteredRejects.map((r, i) => /* @__PURE__ */ jsx(Card, { className: "shadow-sm border-0", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm block truncate", children: r.client }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(User, { className: "h-3 w-3 shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "truncate max-w-[160px]", children: r.user })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 shrink-0", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
              r.date
            ] }),
            (r.lat !== 0 || r.long !== 0) && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 shrink-0", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
              r.lat.toFixed(4),
              ", ",
              r.long.toFixed(4)
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 flex items-center gap-3 flex-wrap", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300", children: [
          /* @__PURE__ */ jsx(Ban, { className: "h-3 w-3" }),
          t("reason"),
          ": ",
          r.info
        ] }) }),
        r.comment && /* @__PURE__ */ jsx("p", { className: "mt-2.5 text-xs text-muted-foreground/70 italic border-t pt-2", children: r.comment })
      ] }) }, i)) }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "payments", forceMount: true, className: "data-[state=inactive]:hidden", children: paymentsLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({
        length: 4
      }).map((_, i) => /* @__PURE__ */ jsx(Card, { className: "overflow-hidden shadow-sm border-0", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-0", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "w-28 shrink-0 h-[100px] rounded-none" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 p-4 space-y-3", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-40" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-16 rounded-full" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-16 rounded-full" })
          ] })
        ] })
      ] }) }) }, i)) }) : paymentsError ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("errorTitle") }),
        /* @__PURE__ */ jsx(Button, { variant: "link", size: "sm", onClick: handleRefresh, className: "mt-2", children: t("refresh") })
      ] }) : filteredPayments.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Banknote, { className: "h-12 w-12 mb-3 opacity-30" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: t("noPayments") })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: filteredPayments.map((p) => /* @__PURE__ */ jsx(Card, { className: "overflow-hidden group shadow-sm border-0", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-0", children: [
        p.click_proto_url && /* @__PURE__ */ jsxs("button", { className: "relative w-28 shrink-0 cursor-pointer overflow-hidden bg-muted border-r", onClick: () => setPreviewUrl(p.click_proto_url), children: [
          /* @__PURE__ */ jsx("img", { src: getProxiedImageUrl(p.click_proto_url), alt: "", loading: "lazy", className: "h-full w-full object-cover absolute inset-0 transition-transform group-hover:scale-105", onError: (e) => {
            e.target.style.display = "none";
            e.target.nextElementSibling?.classList.remove("hidden");
            e.target.nextElementSibling?.nextElementSibling?.classList.add("hidden");
          } }),
          /* @__PURE__ */ jsxs("div", { className: "hidden absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(ImageOff, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsx("span", { className: "text-[9px]", children: t("noData") })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-1.5 right-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm", children: t("photo") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm block truncate", children: p.client.client_name }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(User, { className: "h-3 w-3 shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate max-w-[140px]", children: p.user.user_name })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 shrink-0", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
                  p.date
                ] }),
                (p.latitude !== 0 || p.longitude !== 0) && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 shrink-0", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                  p.latitude.toFixed(4),
                  ", ",
                  p.longitude.toFixed(4)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-base font-bold tabular-nums shrink-0", children: formatPrice(p.cash + p.card + p.click) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-3 flex-wrap", children: [
            p.cash > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300", children: [
              /* @__PURE__ */ jsx(Banknote, { className: "h-3 w-3" }),
              t("cash"),
              ": ",
              formatPrice(p.cash)
            ] }),
            p.card > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300", children: [
              /* @__PURE__ */ jsx(CreditCard, { className: "h-3 w-3" }),
              t("card"),
              ": ",
              formatPrice(p.card)
            ] }),
            p.click > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300", children: [
              /* @__PURE__ */ jsx(Smartphone, { className: "h-3 w-3" }),
              t("click"),
              ": ",
              formatPrice(p.click)
            ] })
          ] }),
          p.comment ? /* @__PURE__ */ jsx("p", { className: "mt-2.5 text-xs text-muted-foreground/70 italic border-t pt-2", children: p.comment }) : null
        ] })
      ] }) }) }, p.id_doc)) }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: !!previewUrl, onOpenChange: (o) => !o && setPreviewUrl(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-4xl border-0 bg-transparent p-0 shadow-none", children: [
      /* @__PURE__ */ jsx("button", { className: "absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors", onClick: () => setPreviewUrl(null), children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
        /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
      ] }) }),
      previewUrl && /* @__PURE__ */ jsx("img", { src: getProxiedImageUrl(previewUrl), alt: "", className: "max-h-[85vh] w-full rounded-lg object-contain" })
    ] }) })
  ] });
}
export {
  FotoreportPage as component
};
