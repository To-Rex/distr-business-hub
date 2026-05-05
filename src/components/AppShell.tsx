import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, ShoppingCart, UserCog, Warehouse,
  Wallet, Factory, MapPin, LogOut, Bell, Search, Menu, X,
  BarChart3, Calendar, Settings as SettingsIcon, User as UserIcon,
  Sun, Moon, Globe, Check,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useSettings, LANGS } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AppShell() {
  const { user, logout } = useAuth();
  const { t, lang, setLang, theme, setTheme } = useSettings();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const navGroups = [
    {
      label: "Main",
      items: [
        { to: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
        { to: "/clients", label: t("clients"), icon: Users },
        { to: "/sales", label: t("sales"), icon: ShoppingCart },
        { to: "/staff", label: t("staff"), icon: UserCog },
      ],
    },
    {
      label: "Operations",
      items: [
        { to: "/warehouse", label: t("warehouse"), icon: Warehouse },
        { to: "/finance", label: t("finance"), icon: Wallet },
        { to: "/production", label: t("production"), icon: Factory },
        { to: "/live-map", label: t("liveMap"), icon: MapPin },
      ],
    },
    {
      label: "Insights",
      items: [
        { to: "/reports", label: t("reports"), icon: BarChart3 },
        { to: "/calendar", label: t("calendar"), icon: Calendar },
        { to: "/notifications", label: t("notifications"), icon: Bell },
      ],
    },
    {
      label: "Account",
      items: [
        { to: "/profile", label: t("profile"), icon: UserIcon },
        { to: "/settings", label: t("settings"), icon: SettingsIcon },
      ],
    },
  ] as const;

  const handleLogout = () => { logout(); navigate({ to: "/login" }); };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2.5 px-6 border-b">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">D</div>
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight leading-none">Distr</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Business OS</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map((g) => (
          <div key={g.label} className="mb-4">
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</div>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = path === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
            {(user?.name?.[0] || "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate capitalize">{user?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout" className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar fixed inset-y-0 left-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-sidebar shadow-xl animate-slide-in-right" style={{ animationName: "slide-in-right", transform: "none" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-16 border-b bg-background/85 backdrop-blur flex items-center gap-2 px-4 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("search")} className="pl-9 bg-secondary border-transparent focus-visible:bg-card" />
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Language">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {LANGS.map((l) => (
                  <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
                    <span className="mr-2">{l.flag}</span>
                    <span className="flex-1">{l.label}</span>
                    {lang === l.code && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Theme">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Link to="/notifications" className="relative">
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 animate-fade-in" key={path}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
