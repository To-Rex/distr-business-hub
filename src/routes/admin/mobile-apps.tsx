import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import { adminMobileApps } from "@/features/admin/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/admin/mobile-apps")({
  component: AdminMobileAppsPage,
});

function AdminMobileAppsPage() {
  const { t } = useSettings();
  const [viewMode, setViewMode] = useState<"table" | "items">("table");

  return (
    <AdminGuard>
      <AdminLayout title={t("adminMobileApps")} subtitle={t("adminMobileAppsSubtitle")}>
        <Card>
          <CardContent className="pt-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{t("adminViewType")}</h3>
                <p className="text-xs text-muted-foreground">{t("adminViewTypeSubtitle")}</p>
              </div>
              <div className="inline-flex rounded-xl border bg-muted/40 p-1">
                <Button
                  type="button"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-lg px-4"
                  onClick={() => setViewMode("table")}
                >
                  {t("tableView")}
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "items" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-lg px-4"
                  onClick={() => setViewMode("items")}
                >
                  {t("cardsView")}
                </Button>
              </div>
            </div>

            {viewMode === "table" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("photo")}</TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("adminPlatform")}</TableHead>
                    <TableHead>{t("adminVersion")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminMobileApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <img src={app.icon} alt={app.name} className="h-9 w-9 rounded-lg border object-contain p-1" />
                      </TableCell>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>{app.platform}</TableCell>
                      <TableCell>{app.version}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === "Aktiv" ? "default" : "secondary"}>{app.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {adminMobileApps.map((app) => (
                  <div key={app.id} className="rounded-lg border bg-background p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img src={app.icon} alt={app.name} className="h-10 w-10 rounded-xl border object-contain p-1" />
                        <h3 className="font-medium">{app.name}</h3>
                      </div>
                      <Badge variant={app.status === "Aktiv" ? "default" : "secondary"}>{app.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("adminPlatform")}: {app.platform}</p>
                    <p className="text-sm text-muted-foreground">{t("adminVersion")}: {app.version}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminGuard>
  );
}
