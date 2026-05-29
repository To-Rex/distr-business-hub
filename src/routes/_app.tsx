import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";

const ALLOWED_USER_TYPES = ["MANAGER", "SUPERVISOR", "CEO"];

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.user_type && !ALLOWED_USER_TYPES.includes(user.user_type)) {
    return <Navigate to="/no-access" />;
  }
  return <AppShell />;
}
