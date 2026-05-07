import { Navigate } from "@tanstack/react-router";
import { useAdminAuth } from "./auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  return <>{children}</>;
}
