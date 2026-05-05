import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products } from "@/lib/mock-data";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/warehouse")({
  component: WarehousePage,
});

function WarehousePage() {
  const lowCount = products.filter((p) => p.stock < p.threshold).length;
  return (
    <div>
      <PageHeader title="Warehouse" description={`${products.length} SKUs · ${lowCount} low-stock items`} />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Threshold</TableHead>
              <TableHead>Status</TableHead>
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
                        <AlertTriangle className="h-3.5 w-3.5" /> Low stock
                      </span>
                    ) : (
                      <span className="text-success text-xs font-medium">In stock</span>
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
