import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin/users" />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const ok = await login(username, password);
    setIsLoading(false);

    if (!ok) {
      setError(t("adminLoginRequired") || "Xato login yoki parol");
      return;
    }
    navigate({ to: "/admin/users" });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-1 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border border-white/5" />
        <div className="relative flex items-center gap-2.5">
          <img src="/logo.png" alt="Distr" className="h-10 w-10 rounded-xl object-contain" />
          <span className="text-lg font-semibold">Distr</span>
        </div>
        <div className="relative space-y-5 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("adminPanel")}
          </div>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            {t("adminLoginTitle")}
          </h2>
          <p className="text-white/70 text-lg">
            {t("adminLoginSubtitle")}
          </p>
          <div className="flex gap-6 pt-4">
            <div>
              <div className="text-3xl font-semibold">24/7</div>
              <div className="text-sm text-white/50">monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-semibold">99.9%</div>
              <div className="text-sm text-white/50">uptime</div>
            </div>
            <div>
              <div className="text-3xl font-semibold">AES-256</div>
              <div className="text-sm text-white/50">encryption</div>
            </div>
          </div>
        </div>
        <div className="relative text-sm text-white/40">&copy; 2026 Distr &middot; distr.mxsoft.uz</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-3.5 w-3.5" />
              {t("goToMainSite")}
            </Button>
          </Link>
        </div>
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <img src="/logo.png" alt="Distr" className="h-10 w-10 rounded-xl object-contain" />
            <span className="text-lg font-semibold">Distr</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("adminLoginTitle")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("adminLoginSubtitle")}</p>
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 text-destructive text-sm px-4 py-3">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">{t("username")}</Label>
              <Input
                id="admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("username")}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? "..." : t("signIn")}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
          <div className="lg:hidden text-center">
            <Link to="/login">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                {t("goToMainSite")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
