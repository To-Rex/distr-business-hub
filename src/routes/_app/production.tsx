import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { batches } from "@/lib/mock-data";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/_app/production")({ component: ProductionPage });

function ProductionPage() {
  const { t } = useSettings();
  return (
    <div>
      <PageHeader title={t("production")} description={t("productionDesc")} />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("batch")}</TableHead>
              <TableHead>{t("product")}</TableHead>
              <TableHead className="text-right">{t("quantity")}</TableHead>
              <TableHead>{t("start")}</TableHead>
              <TableHead>{t("due")}</TableHead>
              <TableHead>{t("status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.id}</TableCell>
                <TableCell className="font-medium">{b.product}</TableCell>
                <TableCell className="text-right">{b.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{b.start}</TableCell>
                <TableCell className="text-muted-foreground">{b.due}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
