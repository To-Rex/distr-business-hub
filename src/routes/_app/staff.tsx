import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { staff } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/staff")({
  component: StaffPage,
});

function StaffPage() {
  return (
    <div>
      <PageHeader title="Staff" description="Team members, roles and performance." />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[40%]">Performance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="capitalize">{s.role}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Progress value={s.performance} className="h-2" />
                    <span className="text-sm font-medium w-10 text-right">{s.performance}%</span>
                  </div>
                </TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
