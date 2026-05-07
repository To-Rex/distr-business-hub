import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/features/admin/auth";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { isAuthenticated, login } = useAdminAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/admin/users" />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = login(username, password);
    if (!ok) {
      setError(t("adminLoginRequired"));
      return;
    }
    navigate({ to: "/admin/users" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("adminLoginTitle")}</CardTitle>
          <CardDescription>{t("adminLoginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">{t("username")}</Label>
              <Input
                id="admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("username")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">{t("password")}</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full">{t("signIn")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
