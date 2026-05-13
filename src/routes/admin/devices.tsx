import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import { useSettings } from "@/lib/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Smartphone, Monitor, Tablet, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/devices")({
  component: AdminDevicesPage,
});

type DeviceStatus = "pending" | "approved" | "rejected";
type DeviceType = "smartphone" | "tablet" | "desktop";

type Device = {
  id: number;
  name: string;
  model: string;
  type: DeviceType;
  agentName: string;
  agentCompany: string;
  imei: string;
  registeredAt: string;
  status: DeviceStatus;
};

const MOCK_DEVICES: Device[] = [
  { id: 1, name: "Samsung Galaxy S24", model: "SM-S921B", type: "smartphone", agentName: "Azizbek Karimov", agentCompany: "Smart Retail Group", imei: "352147896541238", registeredAt: "2026-05-10", status: "pending" },
  { id: 2, name: "iPhone 15 Pro", model: "A3101", type: "smartphone", agentName: "Jamshid Toshmatov", agentCompany: "Hub Logistics", imei: "358214796325147", registeredAt: "2026-05-09", status: "pending" },
  { id: 3, name: "iPad Air M2", model: "A2904", type: "tablet", agentName: "Dilshod Rahimov", agentCompany: "Distr Savdo", imei: "359871423658214", registeredAt: "2026-05-08", status: "approved" },
  { id: 4, name: "Xiaomi Redmi Note 13", model: "23021RAAEG", type: "smartphone", agentName: "Bobur Abdullayev", agentCompany: "Tech Distribution", imei: "356987412365874", registeredAt: "2026-05-07", status: "rejected" },
  { id: 5, name: "HP EliteBook 840", model: "G11", type: "desktop", agentName: "Shahzod Ergashev", agentCompany: "Smart Retail Group", imei: "N/A", registeredAt: "2026-05-06", status: "pending" },
  { id: 6, name: "Samsung Galaxy Tab S9", model: "SM-X710", type: "tablet", agentName: "Rustam Aliyev", agentCompany: "Hub Logistics", imei: "354712369854712", registeredAt: "2026-05-05", status: "pending" },
];

const TYPE_ICONS: Record<DeviceType, typeof Smartphone> = {
  smartphone: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

const STATUS_STYLES: Record<DeviceStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function AdminDevicesPage() {
  const { t } = useSettings();
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [filter, setFilter] = useState<DeviceStatus | "all">("all");

  const filtered = filter === "all" ? devices : devices.filter((d) => d.status === filter);

  const handleApprove = (id: number) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, status: "approved" as const } : d)));
    toast.success(t("deviceApproved"));
  };

  const handleReject = (id: number) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, status: "rejected" as const } : d)));
    toast.success(t("deviceRejected"));
  };

  const pendingCount = devices.filter((d) => d.status === "pending").length;

  return (
    <AdminGuard>
      <AdminLayout title={t("adminDevices")} subtitle={t("adminDevicesSubtitle")}>
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
            <Button variant={filter === "rejected" ? "default" : "outline"} size="sm" onClick={() => setFilter("rejected")}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              {t("adminDevicesRejected")}
            </Button>
          </div>

          <div className="grid gap-3">
            {filtered.map((device) => {
              const Icon = TYPE_ICONS[device.type];
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
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${STATUS_STYLES[device.status]}`}>
                          {device.status === "pending" ? t("adminDevicesPending") : device.status === "approved" ? t("adminDevicesApproved") : t("adminDevicesRejected")}
                        </span>
                        {device.status === "pending" && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success hover:bg-success/10" onClick={() => handleApprove(device.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleReject(device.id)}>
                              <X className="h-4 w-4" />
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
      </AdminLayout>
    </AdminGuard>
  );
}
