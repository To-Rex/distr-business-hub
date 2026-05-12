import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, Building2, Check, ChevronsLeft, ChevronsRight, Globe, LayoutDashboard, LogOut, Menu, Moon, Monitor, Search, Settings, Smartphone, Sun, Users, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LANGS, useSettings } from "@/lib/settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminAuth } from "./auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COLLAPSED_KEY = "admin_sidebar_collapsed";

const NAV_ITEMS = [
  { to: "/admin/dashboard", labelKey: "adminDashboard", icon: LayoutDashboard },
  { to: "/admin/users", labelKey: "adminUsers", icon: Users },
  { to: "/admin/companies", labelKey: "adminCompanies", icon: Building2 },
  { to: "/admin/mobile-apps", labelKey: "adminMobileApps", icon: Smartphone },
  { to: "/admin/working-sessions", labelKey: "adminWorkingSessions", icon: Monitor },
  { to: "/admin/notifications", labelKey: "adminNotifications", icon: Bell },
  { to: "/admin/settings", labelKey: "adminSettings", icon: Settings },
] as const;

type AdminLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme, lang, setLang, t } = useSettings();
  const { session, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  const sidebarWidth = collapsed ? "w-16" : "w-64";
  const contentMargin = collapsed ? "lg:ml-16" : "lg:ml-64";

  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login" });
  };

  const SidebarContent = ({ isCompact = false }: { isCompact?: boolean }) => (
    <>
      <div className={cn("flex items-center border-b", isCompact ? "h-16 justify-center px-2" : "h-16 gap-2.5 px-6")}>
        <img src="/logo.png" alt="Distr" className="h-9 w-9 rounded-xl object-contain flex-shrink-0" />
        {!isCompact && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-base font-semibold tracking-tight leading-none">Distr</span>
            <span className="truncate text-[10px] text-muted-foreground mt-0.5">Admin Panel</span>
          </div>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          const link = (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-all",
                isCompact
                  ? "justify-center h-10 w-10 mx-auto"
                  : "gap-3 px-3 py-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCompact && <span className="truncate">{t(item.labelKey)}</span>}
            </Link>
          );
          if (isCompact) {
            return (
              <Tooltip key={item.to} delayDuration={0}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {t(item.labelKey)}
                </TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>
      <div className={cn("border-t", isCompact ? "p-2" : "p-3")}>
        {isCompact ? (
          <div className="flex flex-col items-center gap-1">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold cursor-default">
                  {(session?.username?.[0] || "A").toUpperCase()}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <div className="text-sm font-medium">{session?.username || "admin"}</div>
                <div className="text-xs text-muted-foreground">Administrator</div>
              </TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {(session?.username?.[0] || "A").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium">{session?.username || "admin"}</div>
              <div className="truncate text-xs text-muted-foreground">Administrator</div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen flex bg-background">
        <aside className={cn("hidden lg:flex fixed inset-y-0 left-0 flex-col border-r bg-sidebar transition-all duration-300", sidebarWidth)}>
          <SidebarContent isCompact={collapsed} />
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border bg-card shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-md transition-colors"
            aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
          >
            {collapsed ? <ChevronsRight className="h-3 w-3" /> : <ChevronsLeft className="h-3 w-3" />}
          </button>
        </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar shadow-xl animate-slide-in-right">
            <SidebarContent />
          </aside>
        </div>
      )}

        <div className={cn("flex min-w-0 flex-1 flex-col transition-all duration-300", contentMargin)}>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("adminSearchPlaceholder")} className="pl-9 bg-secondary border-transparent focus-visible:bg-card" />
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("language")}>
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {LANGS.map((item) => (
                  <DropdownMenuItem key={item.code} onClick={() => setLang(item.code)}>
                    <span className="mr-2">{item.flag}</span>
                    <span className="flex-1">{item.label}</span>
                    {lang === item.code && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Theme">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Link to="/admin/notifications" className="relative">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
    </TooltipProvider>
   );
  }
