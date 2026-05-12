import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/features/admin/auth";

export const Route = createFileRoute("/admin/")({
  component: AdminEntryPage,
});

function AdminEntryPage() {
  const { isAuthenticated } = useAdminAuth();
  return <Navigate to={isAuthenticated ? "/admin/dashboard" : "/admin/login"} />;
}
