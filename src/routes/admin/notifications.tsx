import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import { adminNotifications } from "@/features/admin/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
  const { t } = useSettings();

  return (
    <AdminGuard>
      <AdminLayout title={t("adminNotifications")} subtitle={t("adminNotificationsSubtitle")}>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("calendarTitle")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.date}</TableCell>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>{notification.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminGuard>
  );
}
