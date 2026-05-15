import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { Navigate, useLocation, useNavigate, Link } from "@tanstack/react-router";
import { u as useAdminAuth } from "./auth-ATVJn5u0.js";
import { ChevronsRight, ChevronsLeft, X, Menu, Search, Globe, Check, Moon, Sun, Bell, LayoutDashboard, Users, Building2, Smartphone, Monitor, Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { a as useSettings, n as cn, B as Button, I as Input, L as LANGS } from "./router-CTVAwSR8.js";
import { T as TooltipProvider, D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem, f as Tooltip, g as TooltipTrigger, h as TooltipContent } from "./tooltip-DVV6DgP8.js";
function AdminGuard({ children }) {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return /* @__PURE__ */ jsx(Navigate, { to: "/admin/login" });
  return /* @__PURE__ */ jsx(Fragment, { children });
}
const COLLAPSED_KEY = "admin_sidebar_collapsed";
const NAV_ITEMS = [
  { to: "/admin/dashboard", labelKey: "adminDashboard", icon: LayoutDashboard },
  { to: "/admin/users", labelKey: "adminUsers", icon: Users },
  { to: "/admin/companies", labelKey: "adminCompanies", icon: Building2 },
  { to: "/admin/mobile-apps", labelKey: "adminMobileApps", icon: Smartphone },
  { to: "/admin/working-sessions", labelKey: "adminWorkingSessions", icon: Monitor },
  { to: "/admin/notifications", labelKey: "adminNotifications", icon: Bell },
  { to: "/admin/settings", labelKey: "adminSettings", icon: Settings }
];
function AdminLayout({ title, subtitle, children }) {
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
    } catch {
    }
  }, [collapsed]);
  const sidebarWidth = collapsed ? "w-16" : "w-64";
  const contentMargin = collapsed ? "lg:ml-16" : "lg:ml-64";
  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login" });
  };
  const SidebarContent = ({ isCompact = false }) => /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: cn("flex items-center border-b", isCompact ? "h-16 justify-center px-2" : "h-16 gap-2.5 px-6"), children: [
      /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "Distr", className: "h-9 w-9 rounded-xl object-contain flex-shrink-0" }),
      !isCompact && /* @__PURE__ */ jsxs("div", { className: "flex flex-col overflow-hidden", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base font-semibold tracking-tight leading-none", children: "Distr" }),
        /* @__PURE__ */ jsx("span", { className: "truncate text-[10px] text-muted-foreground mt-0.5", children: "Admin Panel" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden", children: NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.to;
      const link = /* @__PURE__ */ jsxs(
        Link,
        {
          to: item.to,
          onClick: () => setMobileOpen(false),
          className: cn(
            "flex items-center rounded-lg text-sm font-medium transition-all",
            isCompact ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
            isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          ),
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 flex-shrink-0" }),
            !isCompact && /* @__PURE__ */ jsx("span", { className: "truncate", children: t(item.labelKey) })
          ]
        },
        item.to
      );
      if (isCompact) {
        return /* @__PURE__ */ jsxs(Tooltip, { delayDuration: 0, children: [
          /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: link }),
          /* @__PURE__ */ jsx(TooltipContent, { side: "right", sideOffset: 8, children: t(item.labelKey) })
        ] }, item.to);
      }
      return link;
    }) }),
    /* @__PURE__ */ jsx("div", { className: cn("border-t", isCompact ? "p-2" : "p-3"), children: isCompact ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
      /* @__PURE__ */ jsxs(Tooltip, { delayDuration: 0, children: [
        /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold cursor-default", children: (session?.username?.[0] || "A").toUpperCase() }) }),
        /* @__PURE__ */ jsxs(TooltipContent, { side: "right", sideOffset: 8, children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: session?.username || "admin" }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Administrator" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: handleLogout, "aria-label": "Logout", className: "h-8 w-8", children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }) })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-2 py-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary", children: (session?.username?.[0] || "A").toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium", children: session?.username || "admin" }),
        /* @__PURE__ */ jsx("div", { className: "truncate text-xs text-muted-foreground", children: "Administrator" })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: handleLogout, "aria-label": "Logout", className: "h-8 w-8", children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }) })
    ] }) })
  ] });
  return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background", children: [
    /* @__PURE__ */ jsxs("aside", { className: cn("hidden lg:flex fixed inset-y-0 left-0 flex-col border-r bg-sidebar transition-all duration-300", sidebarWidth), children: [
      /* @__PURE__ */ jsx(SidebarContent, { isCompact: collapsed }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setCollapsed((v) => !v),
          className: "absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border bg-card shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-md transition-colors",
          "aria-label": collapsed ? t("expandSidebar") : t("collapseSidebar"),
          children: collapsed ? /* @__PURE__ */ jsx(ChevronsRight, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronsLeft, { className: "h-3 w-3" })
        }
      )
    ] }),
    mobileOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 lg:hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40 animate-fade-in", onClick: () => setMobileOpen(false) }),
      /* @__PURE__ */ jsx("aside", { className: "absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar shadow-xl animate-slide-in-right", children: /* @__PURE__ */ jsx(SidebarContent, {}) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cn("flex min-w-0 flex-1 flex-col transition-all duration-300", contentMargin), children: [
      /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur lg:px-8", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "lg:hidden", onClick: () => setMobileOpen((v) => !v), children: mobileOpen ? /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-md", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: t("adminSearchPlaceholder"), className: "pl-9 bg-secondary border-transparent focus-visible:bg-card" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", "aria-label": t("language"), children: /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5" }) }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-44", children: [
              /* @__PURE__ */ jsx(DropdownMenuLabel, { children: t("language") }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              LANGS.map((item) => /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setLang(item.code), children: [
                /* @__PURE__ */ jsx("span", { className: "mr-2", children: item.flag }),
                /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.label }),
                lang === item.code && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
              ] }, item.code))
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => setTheme(theme === "light" ? "dark" : "light"), "aria-label": "Theme", children: theme === "light" ? /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs(Link, { to: "/admin/notifications", className: "relative", children: [
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", children: /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx("span", { className: "absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 p-4 lg:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-xl border bg-card p-5 shadow-sm", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: title }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: subtitle })
        ] }),
        children
      ] })
    ] })
  ] }) });
}
export {
  AdminGuard as A,
  AdminLayout as a
};
