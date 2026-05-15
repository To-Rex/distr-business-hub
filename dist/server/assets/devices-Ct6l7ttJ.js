import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { u as useAuth, a as useSettings, A as API, P as PageHeader, B as Button, C as Card, g as CardContent, s as Skeleton, h as Badge } from "./router-CTVAwSR8.js";
import { RefreshCw, Smartphone, Clock, Check, Monitor, Tablet } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
function inferDeviceType(system) {
  const s = system.toLowerCase();
  if (s.includes("ipad")) return "tablet";
  if (s.includes("ios") || s.includes("iphone")) return "smartphone";
  if (s.includes("android")) return "smartphone";
  if (s.includes("windows") || s.includes("mac")) return "desktop";
  return "smartphone";
}
const TYPE_ICONS = {
  smartphone: Smartphone,
  tablet: Tablet,
  desktop: Monitor
};
const STATUS_STYLES = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20"
};
function DevicesPage() {
  const {
    user
  } = useAuth();
  const {
    t
  } = useSettings();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("all");
  const fetchDevices = useCallback(() => {
    const baseUrl = user?.company_rel?.base_url;
    const login = user?.user_1c_login;
    const password = user?.user_1c_password;
    if (!baseUrl || !login || !password) {
      setLoading(false);
      setError(true);
      return;
    }
    let cancelled = false;
    const basic = btoa(`${login}:${password}`);
    setLoading(true);
    setError(false);
    fetch(API.activationRequests(baseUrl), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }).then((json) => {
      if (cancelled) return;
      const mapped = (json.data || []).map((item) => {
        const systemName = item.system || "Noma'lum qurilma";
        return {
          id: item.id,
          name: systemName,
          model: item.DeviceID ? item.DeviceID.substring(0, 8).toUpperCase() : "—",
          type: inferDeviceType(item.system),
          agentName: item.user_name,
          agentCompany: item.branch_name,
          imei: item.DeviceID || "—",
          registeredAt: item.date,
          status: item.registered ? "approved" : "pending"
        };
      });
      setDevices(mapped);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setError(true);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.company_rel?.base_url, user?.user_1c_login, user?.user_1c_password]);
  useEffect(() => {
    const cancel = fetchDevices();
    return cancel;
  }, [fetchDevices]);
  const sorted = filter === "all" ? devices : [...devices].sort((a, b) => {
    if (filter === "pending") return a.status === "pending" ? -1 : 1;
    if (filter === "approved") return a.status === "approved" ? -1 : 1;
    return 0;
  });
  const pendingCount = devices.filter((d) => d.status === "pending").length;
  const handleApprove = (id) => {
    const baseUrl = user?.company_rel?.base_url;
    const login = user?.user_1c_login;
    const password = user?.user_1c_password;
    if (!baseUrl || !login || !password) {
      toast.error(t("errorTitle"));
      return;
    }
    const basic = btoa(`${login}:${password}`);
    fetch(API.activationDevice(baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basic}`
      },
      body: JSON.stringify({
        id
      })
    }).then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    }).then(() => {
      setDevices((prev) => prev.map((d) => d.id === id ? {
        ...d,
        status: "approved"
      } : d));
      toast.success(t("deviceApproved"));
    }).catch(() => {
      toast.error(t("errorTitle"));
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("devices"), description: t("devicesDesc"), actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: fetchDevices, disabled: loading, className: "gap-1.5", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }),
      t("refresh")
    ] }) }),
    loading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-10 rounded-lg" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-48" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-72" })
      ] }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-20 rounded-md" })
    ] }) }) }, i)) }) : error ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Smartphone, { className: "h-12 w-12 mx-auto mb-4 opacity-30" }),
      /* @__PURE__ */ jsx("p", { children: t("errorTitle") })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: filter === "all" ? "default" : "outline", size: "sm", onClick: () => setFilter("all"), children: [
          t("adminDevicesAll"),
          " ",
          /* @__PURE__ */ jsxs("span", { className: "ml-1.5 text-xs opacity-70", children: [
            "(",
            devices.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: filter === "pending" ? "default" : "outline", size: "sm", onClick: () => setFilter("pending"), children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 mr-1.5" }),
          t("adminDevicesPending"),
          " ",
          /* @__PURE__ */ jsxs("span", { className: "ml-1.5 text-xs opacity-70", children: [
            "(",
            pendingCount,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: filter === "approved" ? "default" : "outline", size: "sm", onClick: () => setFilter("approved"), children: [
          /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 mr-1.5" }),
          t("adminDevicesApproved")
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
        sorted.map((device) => {
          const Icon = TYPE_ICONS[device.type] || Smartphone;
          return /* @__PURE__ */ jsx(Card, { className: "hover:shadow-sm transition-shadow", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-primary" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: device.name }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] font-mono", children: device.model })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap", children: [
                /* @__PURE__ */ jsx("span", { children: device.agentName }),
                device.agentCompany && /* @__PURE__ */ jsxs("span", { children: [
                  "· ",
                  device.agentCompany
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "· IMEI: ",
                  device.imei
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "· ",
                  device.registeredAt
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
              /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-md text-[11px] font-medium border ${STATUS_STYLES[device.status] || ""}`, children: device.status === "pending" ? t("adminDevicesPending") : t("adminDevicesApproved") }),
              device.status === "pending" && /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-success hover:text-success hover:bg-success/10", onClick: () => handleApprove(device.id), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) })
            ] })
          ] }) }) }, device.id);
        }),
        sorted.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Smartphone, { className: "h-12 w-12 mx-auto mb-4 opacity-30" }),
          /* @__PURE__ */ jsx("p", { children: t("adminDevicesNotFound") })
        ] })
      ] })
    ] })
  ] });
}
export {
  DevicesPage as component
};
