import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import { useSettings } from "@/lib/settings";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Smartphone, Monitor, Tablet, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/devices")({
  component: DevicesPage,
});

type DeviceStatus = "pending" | "approved";
type DeviceType = "smartphone" | "tablet" | "desktop";

type ApiActivation = {
  date: string;
  branch_name: string;
  user_name: string;
  id: string;
  DeviceID: string;
  registered: boolean;
  system: string;
};

type Device = {
  id: string;
  name: string;
  model: string;
  type: DeviceType;
  agentName: string;
  agentCompany: string;
  imei: string;
  registeredAt: string;
  status: DeviceStatus;
};

function inferDeviceType(system: string): DeviceType {
  const s = system.toLowerCase();
  if (s.includes("ipad")) return "tablet";
  if (s.includes("ios") || s.includes("iphone")) return "smartphone";
  if (s.includes("android")) return "smartphone";
  if (s.includes("windows") || s.includes("mac")) return "desktop";
  return "smartphone";
}

const TYPE_ICONS: Record<DeviceType, typeof Smartphone> = {
  smartphone: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

const STATUS_STYLES: Record<DeviceStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
};

function DevicesPage() {
  const { user } = useAuth();
  const { t } = useSettings();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | DeviceStatus>("all");

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
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json: { data: ApiActivation[] }) => {
        if (cancelled) return;
        const mapped = (json.data || []).map((item: ApiActivation) => {
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
            status: item.registered ? ("approved" as const) : ("pending" as const),
          };
        });
        setDevices(mapped);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.company_rel?.base_url, user?.user_1c_login, user?.user_1c_password]);

  useEffect(() => {
    const cancel = fetchDevices();
    return cancel;
  }, [fetchDevices]);

  const filtered = filter === "all" ? devices : devices.filter((d) => d.status === filter);
  const pendingCount = devices.filter((d) => d.status === "pending").length;

  const handleApprove = (id: string) => {
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
        Authorization: `Basic ${basic}`,
      },
      body: JSON.stringify({ id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, status: "approved" as const } : d)));
        toast.success(t("deviceApproved"));
      })
      .catch(() => {
        toast.error(t("errorTitle"));
      });
  };

  return (
    <>
      <PageHeader
        title={t("devices")}
        description={t("devicesDesc")}
        actions={
          <Button variant="outline" size="sm" onClick={fetchDevices} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-72" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-muted-foreground">
          <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{t("errorTitle")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              {t("adminDevicesAll")} <span className="ml-1.5 text-xs opacity-70">({devices.length})</span>
            </Button>
            <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {t("adminDevicesPending")} <span className="ml-1.5 text-xs opacity-70">({pendingCount})</span>
            </Button>
            <Button variant={filter === "approved" ? "default" : "outline"} size="sm" onClick={() => setFilter("approved")}>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              {t("adminDevicesApproved")}
            </Button>
          </div>

          <div className="grid gap-3">
            {filtered.map((device) => {
              const Icon = TYPE_ICONS[device.type] || Smartphone;
              return (
                <Card key={device.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{device.name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">{device.model}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                          <span>{device.agentName}</span>
                          {device.agentCompany && <span>· {device.agentCompany}</span>}
                          <span>· IMEI: {device.imei}</span>
                          <span>· {device.registeredAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${STATUS_STYLES[device.status] || ""}`}>
                          {device.status === "pending" ? t("adminDevicesPending") : t("adminDevicesApproved")}
                        </span>
                        {device.status === "pending" && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success hover:bg-success/10" onClick={() => handleApprove(device.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{t("adminDevicesNotFound")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
