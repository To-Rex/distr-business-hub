import { Navigate } from "@tanstack/react-router";
import { useAdminAuth } from "./auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, session, profileLoading } = useAdminAuth();

  if (!isAuthenticated) return <Navigate to="/admin/login" />;

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const userType = session?.user_type;
  if (userType && userType !== "ADMIN" && userType !== "SUPERADMIN") {
    return <Navigate to="/admin/no-access" />;
  }

  return <>{children}</>;
}
