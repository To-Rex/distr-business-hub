import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  delivered: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  in_progress: "bg-accent text-accent-foreground border-accent",
  completed: "bg-success/10 text-success border-success/20",
  delayed: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = map[status] ?? "bg-muted text-muted-foreground border-border";
  const label = status.replace("_", " ");
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", cls)}>
      {label}
    </span>
  );
}
