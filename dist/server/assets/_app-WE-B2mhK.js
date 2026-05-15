import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, useRouterState, Link, Outlet, Navigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, ShoppingCart, ClipboardList, UserCog, Warehouse, Wallet, Factory, Smartphone, Tag, MapPin, BarChart3, Calendar, Bell, User, Settings, ChevronsRight, ChevronsLeft, X, Menu, Search, Globe, Check, Moon, Sun, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { u as useAuth, a as useSettings, B as Button, I as Input, L as LANGS } from "./router-CTVAwSR8.js";
import { T as TooltipProvider, D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem, f as Tooltip, g as TooltipTrigger, h as TooltipContent } from "./tooltip-DVV6DgP8.js";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
const COLLAPSED_KEY = "sidebar_collapsed";
function AppShell() {
  const { user, logout } = useAuth();
  const { t, lang, setLang, theme, setTheme } = useSettings();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [liveMapSearchTarget, setLiveMapSearchTarget] = useState("user");
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
    } catch {
    }
  }, [collapsed]);
  const isLiveMapPage = path === "/live-map";
  useEffect(() => {
    if (!isLiveMapPage) return;
    window.dispatchEvent(
      new CustomEvent("live-map-search-change", {
        detail: { query: headerSearch, target: liveMapSearchTarget }
      })
    );
  }, [isLiveMapPage, headerSearch, liveMapSearchTarget]);
  useEffect(() => {
    if (!isLiveMapPage) return;
    const onLiveMapSearchChange = (event) => {
      const customEvent = event;
      const nextQuery = customEvent.detail?.query ?? "";
      const nextTarget = customEvent.detail?.target ?? "user";
      setHeaderSearch((prev) => prev === nextQuery ? prev : nextQuery);
      setLiveMapSearchTarget((prev) => prev === nextTarget ? prev : nextTarget);
    };
    window.addEventListener("live-map-search-change", onLiveMapSearchChange);
    return () => window.removeEventListener("live-map-search-change", onLiveMapSearchChange);
  }, [isLiveMapPage]);
  useEffect(() => {
    if (!isLiveMapPage) {
      setLiveMapSuggestion("");
      return;
    }
    const onSuggestion = (event) => {
      const customEvent = event;
      setLiveMapSuggestion(customEvent.detail?.suggestion ?? "");
    };
    window.addEventListener("live-map-search-suggestion", onSuggestion);
    return () => window.removeEventListener("live-map-search-suggestion", onSuggestion);
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
        { to: "/staff", label: t("staff"), icon: UserCog }
      ]
    },
    {
      label: t("navOperations"),
      items: [
        { to: "/warehouse", label: t("warehouse"), icon: Warehouse },
        { to: "/finance", label: t("finance"), icon: Wallet },
        { to: "/production", label: t("production"), icon: Factory },
        { to: "/devices", label: t("devices"), icon: Smartphone },
        { to: "/markirovka", label: t("markirovka"), icon: Tag },
        { to: "/live-map", label: t("liveMap"), icon: MapPin }
      ]
    },
    {
      label: t("navInsights"),
      items: [
        { to: "/reports", label: t("reports"), icon: BarChart3 },
        { to: "/calendar", label: t("calendar"), icon: Calendar },
        { to: "/notifications", label: t("notifications"), icon: Bell }
      ]
    },
    {
      label: t("navAccount"),
      items: [
        { to: "/profile", label: t("profile"), icon: User },
        { to: "/settings", label: t("settings"), icon: Settings }
      ]
    }
  ];
  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };
  const SidebarContent = ({ isCompact = false }) => /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex items-center border-b ${isCompact ? "h-16 justify-center px-2" : "h-16 gap-2.5 px-6"}`,
        children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "/logo.png",
              alt: "Distr",
              className: "h-9 w-9 rounded-xl object-contain flex-shrink-0"
            }
          ),
          !isCompact && /* @__PURE__ */ jsxs("div", { className: "flex flex-col overflow-hidden", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base font-semibold tracking-tight leading-none", children: "Distr" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground mt-0.5 truncate", children: user?.company_rel?.name ?? "Business OS" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden", children: navGroups.map((g) => /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      !isCompact && /* @__PURE__ */ jsx("div", { className: "px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: g.label }),
      /* @__PURE__ */ jsx("div", { className: isCompact ? "space-y-1" : "space-y-0.5", children: g.items.map((item) => {
        const active = path === item.to;
        const Icon = item.icon;
        const link = /* @__PURE__ */ jsxs(
          Link,
          {
            to: item.to,
            onClick: () => setMobileOpen(false),
            className: `flex items-center rounded-lg text-sm font-medium transition-all ${isCompact ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2"} ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 flex-shrink-0" }),
              !isCompact && /* @__PURE__ */ jsx("span", { className: "truncate", children: item.label })
            ]
          },
          item.to
        );
        if (isCompact) {
          return /* @__PURE__ */ jsxs(Tooltip, { delayDuration: 0, children: [
            /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: link }),
            /* @__PURE__ */ jsx(TooltipContent, { side: "right", sideOffset: 8, children: item.label })
          ] }, item.to);
        }
        return link;
      }) })
    ] }, g.label)) }),
    /* @__PURE__ */ jsx("div", { className: `border-t ${isCompact ? "p-2" : "p-3"}`, children: isCompact ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
      /* @__PURE__ */ jsxs(Tooltip, { delayDuration: 0, children: [
        /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold cursor-default", children: (user?.name?.[0] || "U").toUpperCase() }) }),
        /* @__PURE__ */ jsxs(TooltipContent, { side: "right", sideOffset: 8, children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium capitalize", children: user?.name }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: user?.user_type ?? user?.email })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          onClick: handleLogout,
          "aria-label": t("logout"),
          className: "h-8 w-8",
          children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" })
        }
      )
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-2 py-2", children: [
      /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold", children: (user?.name?.[0] || "U").toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium truncate capitalize", children: user?.name }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground truncate", children: user?.user_type ?? user?.email })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          onClick: handleLogout,
          "aria-label": t("logout"),
          className: "h-8 w-8",
          children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" })
        }
      )
    ] }) })
  ] });
  return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs("div", { className: "h-screen flex overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: `hidden lg:flex ${sidebarWidth} flex-col border-r bg-sidebar fixed inset-y-0 left-0 transition-all duration-300`,
        children: [
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
        ]
      }
    ),
    mobileOpen && /* @__PURE__ */ jsxs("div", { className: "lg:hidden fixed inset-0 z-50", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-black/40 animate-fade-in",
          onClick: () => setMobileOpen(false)
        }
      ),
      /* @__PURE__ */ jsx(
        "aside",
        {
          className: "absolute inset-y-0 left-0 w-64 flex flex-col bg-sidebar shadow-xl animate-slide-in-right",
          style: { animationName: "slide-in-right", transform: "none" },
          children: /* @__PURE__ */ jsx(SidebarContent, {})
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex-1 ${contentMargin} flex flex-col min-w-0 transition-all duration-300`,
        children: [
          /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-40 h-16 border-b bg-background/85 backdrop-blur flex items-center gap-2 px-4 lg:px-8", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "lg:hidden",
                onClick: () => setMobileOpen((v) => !v),
                children: mobileOpen ? /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-md", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: t("search"),
                  className: `pl-9 bg-secondary border-transparent focus-visible:bg-card ${isLiveMapPage ? "pr-24" : ""}`,
                  value: headerSearch,
                  onChange: (e) => setHeaderSearch(e.target.value)
                }
              ),
              isLiveMapPage && /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setLiveMapSearchTarget((prev) => prev === "user" ? "client" : "user"),
                  className: "absolute right-1.5 top-1/2 -translate-y-1/2 h-7 rounded-md border bg-card px-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
                  children: liveMapSearchTarget === "user" ? t("user") : t("client")
                }
              ),
              isLiveMapPage && headerSearch.trim().length > 0 && liveMapSuggestion && /* @__PURE__ */ jsx("div", { className: "absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md z-50 overflow-hidden", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors",
                  onClick: () => {
                    setHeaderSearch(liveMapSuggestion);
                    if (liveMapSearchTarget === "user") {
                      window.dispatchEvent(
                        new CustomEvent("live-map-search-select-user", {
                          detail: { fullName: liveMapSuggestion }
                        })
                      );
                    } else {
                      window.dispatchEvent(
                        new CustomEvent("live-map-search-select-client", {
                          detail: { name: liveMapSuggestion }
                        })
                      );
                    }
                  },
                  children: liveMapSuggestion
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", "aria-label": t("language"), children: /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5" }) }) }),
                /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-44", children: [
                  /* @__PURE__ */ jsx(DropdownMenuLabel, { children: t("language") }),
                  /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                  LANGS.map((l) => /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setLang(l.code), children: [
                    /* @__PURE__ */ jsx("span", { className: "mr-2", children: l.flag }),
                    /* @__PURE__ */ jsx("span", { className: "flex-1", children: l.label }),
                    lang === l.code && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
                  ] }, l.code))
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  onClick: () => setTheme(theme === "light" ? "dark" : "light"),
                  "aria-label": t("theme"),
                  children: theme === "light" ? /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" })
                }
              ),
              /* @__PURE__ */ jsxs(Link, { to: "/notifications", className: "relative", children: [
                /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", children: /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsx("span", { className: "absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("main", { className: "flex-1 p-4 lg:p-8 overflow-y-auto min-h-0 animate-fade-in", children: /* @__PURE__ */ jsx(Outlet, {}) }, path)
        ]
      }
    )
  ] }) });
}
function AppLayout() {
  const {
    user
  } = useAuth();
  if (!user) return /* @__PURE__ */ jsx(Navigate, { to: "/login" });
  return /* @__PURE__ */ jsx(AppShell, {});
}
export {
  AppLayout as component
};
