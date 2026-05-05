import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products } from "@/lib/mock-data";
import { useSettings } from "@/lib/settings";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/warehouse")({ component: WarehousePage });

function WarehousePage() {
  const { t } = useSettings();
  const lowCount = products.filter((p) => p.stock < p.threshold).length;
  return (
    <div>
      <PageHeader title={t("warehouse")} description={`${products.length} SKU · ${lowCount} ${t("lowStock").toLowerCase()}`} />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("sku")}</TableHead>
              <TableHead>{t("product")}</TableHead>
              <TableHead>{t("category")}</TableHead>
              <TableHead className="text-right">{t("stock")}</TableHead>
              <TableHead className="text-right">{t("threshold")}</TableHead>
              <TableHead>{t("status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const low = p.stock < p.threshold;
              return (
                <TableRow key={p.id} className={low ? "bg-destructive/5" : ""}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-right font-medium">{p.stock.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{p.threshold}</TableCell>
                  <TableCell>
                    {low ? (
                      <span className="inline-flex items-center gap-1 text-destructive text-xs font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" /> {t("lowStock")}
                      </span>
                    ) : (
                      <span className="text-success text-xs font-medium">{t("inStock")}</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
