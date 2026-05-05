import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSettings, LANGS } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, login } = useAuth();
  const { t, lang, setLang } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const loginEmail = email.includes("@") ? email : `${email}@gmail.com`;
    try {
      await login(loginEmail, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-1 bg-primary text-primary-foreground p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-foreground/5" />
        <div className="relative flex items-center gap-2.5">
          <img src="/logo.png" alt="Distr" className="h-10 w-10 rounded-xl object-contain" />
          <span className="text-lg font-semibold">Distr</span>
        </div>
        <div className="relative space-y-5 max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">Distr — biznesingizni boshqaring.</h2>
          <p className="text-primary-foreground/80 text-lg">{t("appTagline")}</p>
          <div className="flex gap-6 pt-4">
            <div><div className="text-3xl font-semibold">12+</div><div className="text-sm text-primary-foreground/70">modullar</div></div>
            <div><div className="text-3xl font-semibold">3</div><div className="text-sm text-primary-foreground/70">{t("language").toLowerCase()}</div></div>
            <div><div className="text-3xl font-semibold">99%</div><div className="text-sm text-primary-foreground/70">uptime</div></div>
          </div>
        </div>
        <div className="relative text-sm text-primary-foreground/60">© 2026 Distr · distr.mxsoft.uz</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4 flex gap-1">
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === l.code ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
              {l.flag} {l.code.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <img src="/logo.png" alt="Distr" className="h-10 w-10 rounded-xl object-contain" />
            <span className="text-lg font-semibold">Distr</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("welcomeBack")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("signInSubtitle")}</p>
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="email">{t("email")}</Label><Input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} /></div>
            <div className="space-y-2"><Label htmlFor="password">{t("password")}</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? "..." : t("signIn")}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
