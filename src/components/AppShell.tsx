import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  UserCog,
  Warehouse,
  Wallet,
  Factory,
  MapPin,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  BarChart3,
  Calendar,
  Settings as SettingsIcon,
  User as UserIcon,
  Sun,
  Moon,
  Globe,
  Check,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Smartphone,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useSettings, LANGS } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const COLLAPSED_KEY = "sidebar_collapsed";

export function AppShell() {
  const { user, logout } = useAuth();
  const { t, lang, setLang, theme, setTheme } = useSettings();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [liveMapSearchTarget, setLiveMapSearchTarget] = useState<"user" | "client">("user");
  const [liveMapSuggestion, setLiveMapSuggestion] = useState("");
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

  const isLiveMapPage = path === "/live-map";

  useEffect(() => {
    if (!isLiveMapPage) return;
    window.dispatchEvent(
      new CustomEvent("live-map-search-change", {
        detail: { query: headerSearch, target: liveMapSearchTarget },
      }),
    );
  }, [isLiveMapPage, headerSearch, liveMapSearchTarget]);

  useEffect(() => {
    if (!isLiveMapPage) return;
    const onLiveMapSearchChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ query?: string; target?: "user" | "client" }>;
      const nextQuery = customEvent.detail?.query ?? "";
      const nextTarget = customEvent.detail?.target ?? "user";
      setHeaderSearch((prev) => (prev === nextQuery ? prev : nextQuery));
      setLiveMapSearchTarget((prev) => (prev === nextTarget ? prev : nextTarget));
    };

    window.addEventListener("live-map-search-change", onLiveMapSearchChange as EventListener);
    return () =>
      window.removeEventListener("live-map-search-change", onLiveMapSearchChange as EventListener);
  }, [isLiveMapPage]);

  useEffect(() => {
    if (!isLiveMapPage) {
      setLiveMapSuggestion("");
      return;
    }
    const onSuggestion = (event: Event) => {
      const customEvent = event as CustomEvent<{ suggestion?: string }>;
      setLiveMapSuggestion(customEvent.detail?.suggestion ?? "");
    };
    window.addEventListener("live-map-search-suggestion", onSuggestion as EventListener);
    return () =>
      window.removeEventListener("live-map-search-suggestion", onSuggestion as EventListener);
  }, [isLiveMapPage]);

  const sidebarWidth = collapsed ? "w-16" : "w-64";
  const contentMargin = collapsed ? "lg:ml-16" : "lg:ml-64";

  const navGroups = [
    {
      label: t("navMain"),
      items: [
        { to: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
        { to: "/clients", label: t("clients"), icon: Users },
        { to: "/sales", label: t("sales"), icon: ShoppingCart },
        { to: "/orders", label: t("ordersPage"), icon: ClipboardList },
        { to: "/staff", label: t("staff"), icon: UserCog },
      ],
    },
    {
      label: t("navOperations"),
      items: [
        { to: "/warehouse", label: t("warehouse"), icon: Warehouse },
        { to: "/finance", label: t("finance"), icon: Wallet },
        { to: "/production", label: t("production"), icon: Factory },
        { to: "/devices", label: t("devices"), icon: Smartphone },
        { to: "/markirovka", label: t("markirovka"), icon: Tag },
        { to: "/live-map", label: t("liveMap"), icon: MapPin },
      ],
    },
    {
      label: t("navInsights"),
      items: [
        { to: "/reports", label: t("reports"), icon: BarChart3 },
        { to: "/calendar", label: t("calendar"), icon: Calendar },
        { to: "/notifications", label: t("notifications"), icon: Bell },
      ],
    },
    {
      label: t("navAccount"),
      items: [
        { to: "/profile", label: t("profile"), icon: UserIcon },
        { to: "/settings", label: t("settings"), icon: SettingsIcon },
      ],
    },
  ] as const;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const SidebarContent = ({ isCompact = false }: { isCompact?: boolean }) => (
    <>
      <div
        className={`flex items-center border-b ${isCompact ? "h-16 justify-center px-2" : "h-16 gap-2.5 px-6"}`}
      >
        <img
          src="/logo.png"
          alt="Distr"
          className="h-9 w-9 rounded-xl object-contain flex-shrink-0"
        />
        {!isCompact && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-base font-semibold tracking-tight leading-none">Distr</span>
            <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
              {user?.company_rel?.name ?? "Business OS"}
            </span>
          </div>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        {navGroups.map((g) => (
          <div key={g.label} className="mb-4">
            {!isCompact && (
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {g.label}
              </div>
            )}
            <div className={isCompact ? "space-y-1" : "space-y-0.5"}>
              {g.items.map((item) => {
                const active = path === item.to;
                const Icon = item.icon;
                const link = (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center rounded-lg text-sm font-medium transition-all ${
                      isCompact ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2"
                    } ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!isCompact && <span className="truncate">{item.label}</span>}
                  </Link>
                );
                if (isCompact) {
                  return (
                    <Tooltip key={item.to} delayDuration={0}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return link;
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className={`border-t ${isCompact ? "p-2" : "p-3"}`}>
        {isCompact ? (
          <div className="flex flex-col items-center gap-1">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold cursor-default">
                  {(user?.name?.[0] || "U").toUpperCase()}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <div className="text-sm font-medium capitalize">{user?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.user_type ?? user?.email}
                </div>
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label={t("logout")}
              className="h-8 w-8"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
              {(user?.name?.[0] || "U").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate capitalize">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.user_type ?? user?.email}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label={t("logout")}
              className="h-8 w-8"
            >
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
        <aside
          className={`hidden lg:flex ${sidebarWidth} flex-col border-r bg-sidebar fixed inset-y-0 left-0 transition-all duration-300`}
        >
          <SidebarContent isCompact={collapsed} />
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border bg-card shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-md transition-colors"
            aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
          >
            {collapsed ? (
              <ChevronsRight className="h-3 w-3" />
            ) : (
              <ChevronsLeft className="h-3 w-3" />
            )}
          </button>
        </aside>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40 animate-fade-in"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className="absolute inset-y-0 left-0 w-64 flex flex-col bg-sidebar shadow-xl animate-slide-in-right"
              style={{ animationName: "slide-in-right", transform: "none" }}
            >
              <SidebarContent />
            </aside>
          </div>
        )}

        <div
          className={`flex-1 ${contentMargin} flex flex-col min-w-0 transition-all duration-300`}
        >
          <header className="sticky top-0 z-40 h-16 border-b bg-background/85 backdrop-blur flex items-center gap-2 px-4 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                className={`pl-9 bg-secondary border-transparent focus-visible:bg-card ${isLiveMapPage ? "pr-24" : ""}`}
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
              />
              {isLiveMapPage && (
                <button
                  type="button"
                  onClick={() =>
                    setLiveMapSearchTarget((prev) => (prev === "user" ? "client" : "user"))
                  }
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 rounded-md border bg-card px-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {liveMapSearchTarget === "user" ? t("user") : t("client")}
                </button>
              )}
              {isLiveMapPage && headerSearch.trim().length > 0 && liveMapSuggestion && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md z-50 overflow-hidden">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setHeaderSearch(liveMapSuggestion);
                      if (liveMapSearchTarget === "user") {
                        window.dispatchEvent(
                          new CustomEvent("live-map-search-select-user", {
                            detail: { fullName: liveMapSuggestion },
                          }),
                        );
                      } else {
                        window.dispatchEvent(
                          new CustomEvent("live-map-search-select-client", {
                            detail: { name: liveMapSuggestion },
                          }),
                        );
                      }
                    }}
                  >
                    {liveMapSuggestion}
                  </button>
                </div>
              )}
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
                  {LANGS.map((l) => (
                    <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
                      <span className="mr-2">{l.flag}</span>
                      <span className="flex-1">{l.label}</span>
                      {lang === l.code && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                aria-label={t("theme")}
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Link to="/notifications" className="relative">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
              </Link>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8 animate-fade-in" key={path}>
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
