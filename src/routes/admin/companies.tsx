import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import { adminCompanies } from "@/features/admin/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/admin/companies")({
  component: AdminCompaniesPage,
});

function AdminCompaniesPage() {
  const { t } = useSettings();

  return (
    <AdminGuard>
      <AdminLayout title={t("adminCompanies")} subtitle={t("adminCompaniesSubtitle")}>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("id")}</TableHead>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>INN</TableHead>
                  <TableHead>{t("adminOwner")}</TableHead>
                  <TableHead>{t("adminPlan")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.id}</TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.inn}</TableCell>
                    <TableCell>{company.owner}</TableCell>
                    <TableCell>{company.plan}</TableCell>
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
