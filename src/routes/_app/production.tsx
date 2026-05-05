import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { batches } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/production")({
  component: ProductionPage,
});

function ProductionPage() {
  return (
    <div>
      <PageHeader title="Production" description="Active production batches and their status." />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
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
