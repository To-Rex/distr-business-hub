import { createFileRoute } from "@tanstack/react-router";
import { useSettings } from "@/lib/settings";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Package, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_app/markirovka")({
  component: MarkirovkaPage,
});

const mockData = [
  { id: "MRK-001", product: "Coffee 250g", gtin: "4780123456789", batch: "B-2026-05-01", quantity: 2400, date: "2026-05-12", status: "approved" as const },
  { id: "MRK-002", product: "Tea 500g", gtin: "4780123456790", batch: "B-2026-05-01", quantity: 1800, date: "2026-05-13", status: "approved" as const },
  { id: "MRK-003", product: "Detergent 3kg", gtin: "4780123456791", batch: "B-2026-05-02", quantity: 960, date: "2026-05-13", status: "pending" as const },
  { id: "MRK-004", product: "Soap 200g", gtin: "4780123456792", batch: "B-2026-05-02", quantity: 5000, date: "2026-05-14", status: "pending" as const },
  { id: "MRK-005", product: "Sugar 1kg", gtin: "4780123456793", batch: "B-2026-05-03", quantity: 3200, date: "2026-05-14", status: "error" as const },
  { id: "MRK-006", product: "Flour 5kg", gtin: "4780123456794", batch: "B-2026-05-03", quantity: 1500, date: "2026-05-15", status: "approved" as const },
];

const statusConfig = {
  approved: { icon: CheckCircle2, label: "markingApproved" as const, variant: "default" as const },
  pending: { icon: Clock, label: "markingPending" as const, variant: "secondary" as const },
  error: { icon: AlertCircle, label: "markingError" as const, variant: "destructive" as const },
};

function MarkirovkaPage() {
  const { t } = useSettings();
  const total = mockData.length;
  const approved = mockData.filter((m) => m.status === "approved").length;
  const pending = mockData.filter((m) => m.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("markirovka")}
        description={t("markirovkaDesc")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight">{total}</p>
              <p className="text-xs text-muted-foreground">{t("markingBatch")}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight">{approved}</p>
              <p className="text-xs text-muted-foreground">{t("markingApproved")}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary-foreground">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight">{pending}</p>
              <p className="text-xs text-muted-foreground">{t("markingPending")}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>{t("products")}</span>
            <span>{t("markingGtin")}</span>
            <span>{t("markingBatch")}</span>
            <span>{t("markingQuantity")}</span>
          </div>
          {mockData.map((item) => {
            const StatusIcon = statusConfig[item.status].icon;
            return (
              <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/5 text-primary shrink-0">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.product}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={statusConfig[item.status].variant} className="h-5 text-[10px] px-1.5 gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {t(statusConfig[item.status].label)}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground tabular-nums">{item.gtin}</span>
                <span className="text-sm text-muted-foreground">{item.batch}</span>
                <span className="text-sm font-medium tabular-nums text-right">{item.quantity.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
