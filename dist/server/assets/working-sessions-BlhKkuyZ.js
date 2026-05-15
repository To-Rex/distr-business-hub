import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { A as AdminGuard, a as AdminLayout } from "./admin-layout-BFGTm6By.js";
import { f as fetchUsers, a as fetchWorkingSessions, g as getUserFullName } from "./auth-ATVJn5u0.js";
import { a as useSettings, b as useIsMobile, I as Input, S as Select, c as SelectTrigger, d as SelectValue, e as SelectContent, f as SelectItem, B as Button, C as Card, g as CardContent, h as Badge, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell } from "./router-CTVAwSR8.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-CMF2hblO.js";
import { T as ToggleGroup, a as ToggleGroupItem } from "./toggle-group-BS5KPpqm.js";
import { Search, Calendar, X, Rows3, LayoutGrid, Eye, Clock, Smartphone, TestTube, Monitor, ChevronUp, ChevronDown } from "lucide-react";
import "@tanstack/react-router";
import "./tooltip-DVV6DgP8.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
import "@radix-ui/react-dialog";
import "@radix-ui/react-toggle-group";
import "@radix-ui/react-toggle";
function AdminWorkingSessionsPage() {
  const {
    t
  } = useSettings();
  const {
    data: apiUsers = [],
    isLoading: isUsersLoading
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers()
  });
  const {
    data: apiSessions = [],
    isLoading: isSessionsLoading
  } = useQuery({
    queryKey: ["admin-working-sessions"],
    queryFn: () => fetchWorkingSessions()
  });
  const [viewMode, setViewMode] = useState("table");
  const isMobile = useIsMobile();
  useEffect(() => {
    setViewMode(isMobile ? "cards" : "table");
  }, [isMobile]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [appFilter, setAppFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedSession, setSelectedSession] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const userMap = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    apiUsers.forEach((u) => map.set(u.id, u));
    return map;
  }, [apiUsers]);
  const sessionsWithUsers = useMemo(() => {
    return apiSessions.map((s) => {
      const user = userMap.get(s.user_id);
      return {
        ...s,
        user_id: s.user_id || 0,
        user_name: user ? getUserFullName(user) : `ID: ${s.user_id || "?"}`,
        user_email: user?.email || ""
      };
    });
  }, [apiSessions, userMap]);
  const filteredAndSorted = useMemo(() => {
    let result = [...sessionsWithUsers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.user_name.toLowerCase().includes(q) || s.device_name.toLowerCase().includes(q) || s.app.toLowerCase().includes(q) || s.user_email.toLowerCase().includes(q));
    }
    if (userFilter !== "all") {
      result = result.filter((s) => String(s.user_id) === userFilter);
    }
    if (appFilter !== "all") {
      result = result.filter((s) => s.app === appFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((s) => new Date(s.session).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      result = result.filter((s) => new Date(s.session).getTime() <= to);
    }
    result.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    return result;
  }, [sessionsWithUsers, searchQuery, userFilter, appFilter, dateFrom, dateTo, sortField, sortOrder]);
  const usersWithSessions = useMemo(() => {
    const set = /* @__PURE__ */ new Set();
    sessionsWithUsers.forEach((s) => {
      if (s.user_id) set.add(s.user_id);
    });
    return apiUsers.filter((u) => set.has(u.id));
  }, [apiUsers, sessionsWithUsers]);
  const uniqueApps = useMemo(() => {
    const apps = /* @__PURE__ */ new Set();
    sessionsWithUsers.forEach((s) => {
      if (s.app) apps.add(s.app);
    });
    return Array.from(apps).sort();
  }, [sessionsWithUsers]);
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  const SortIcon = ({
    field
  }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4 ml-1" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 ml-1" });
  };
  const handleView = (session) => {
    setSelectedSession(session);
    setIsViewDialogOpen(true);
  };
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };
  const isLoading = isUsersLoading || isSessionsLoading;
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsxs(AdminLayout, { title: t("adminWorkingSessions"), subtitle: t("adminWorkingSessionsSubtitle"), children: [
    isLoading && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-12", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-md", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: t("adminWorkingSessionsSearch"), value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 items-center", children: [
        /* @__PURE__ */ jsxs(Select, { value: userFilter, onValueChange: setUserFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[220px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: t("user") }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("allUsers") }),
            usersWithSessions.map((u) => /* @__PURE__ */ jsx(SelectItem, { value: u.id.toString(), children: getUserFullName(u) }, u.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: appFilter, onValueChange: setAppFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: t("application") }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("allApps") }),
            uniqueApps.map((app) => /* @__PURE__ */ jsx(SelectItem, { value: app, children: app }, app))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Input, { type: "datetime-local", value: dateFrom, onChange: (e) => setDateFrom(e.target.value), className: "w-[200px] h-9 text-sm", placeholder: t("dateBegin") }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "—" }),
            /* @__PURE__ */ jsx(Input, { type: "datetime-local", value: dateTo, onChange: (e) => setDateTo(e.target.value), className: "w-[200px] h-9 text-sm", placeholder: t("dateEnd") })
          ] }),
          (dateFrom || dateTo) && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => {
            setDateFrom("");
            setDateTo("");
          }, children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground flex items-center gap-2", children: [
          t("total"),
          ": ",
          filteredAndSorted.length,
          " ",
          t("sessions")
        ] }),
        /* @__PURE__ */ jsxs(ToggleGroup, { type: "single", value: viewMode, onValueChange: (v) => {
          if (v) setViewMode(v);
        }, className: "hidden sm:flex", children: [
          /* @__PURE__ */ jsx(ToggleGroupItem, { value: "table", "aria-label": "Table view", children: /* @__PURE__ */ jsx(Rows3, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(ToggleGroupItem, { value: "cards", "aria-label": "Cards view", children: /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
      viewMode === "cards" ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4", children: filteredAndSorted.map((session) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-3 transition-all hover:shadow-md", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs text-muted-foreground", children: [
            "#",
            session.id
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleView(session), children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("sessionTime") }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-sm font-medium", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }),
            formatDate(session.session)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("device") }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-sm", children: [
            /* @__PURE__ */ jsx(Smartphone, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }),
            session.device_name || "—"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: session.app }),
          session.is_testing ? /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
            /* @__PURE__ */ jsx(TestTube, { className: "h-3 w-3 mr-1" }),
            "Test"
          ] }) : /* @__PURE__ */ jsx(Badge, { variant: "default", className: "text-xs", children: t("active") })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          t("created"),
          ": ",
          formatDate(session.created_at)
        ] })
      ] }, session.id)) }) : /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-[60px]", children: "ID" }),
          /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleSort("session"), className: "p-0 h-auto font-medium", children: [
            t("sessionTime"),
            " ",
            /* @__PURE__ */ jsx(SortIcon, { field: "session" })
          ] }) }),
          /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleSort("device_name"), className: "p-0 h-auto font-medium", children: [
            t("device"),
            " ",
            /* @__PURE__ */ jsx(SortIcon, { field: "device_name" })
          ] }) }),
          /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleSort("app"), className: "p-0 h-auto font-medium", children: [
            t("application"),
            " ",
            /* @__PURE__ */ jsx(SortIcon, { field: "app" })
          ] }) }),
          /* @__PURE__ */ jsx(TableHead, { children: t("testing") }),
          /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleSort("created_at"), className: "p-0 h-auto font-medium", children: [
            t("created"),
            " ",
            /* @__PURE__ */ jsx(SortIcon, { field: "created_at" })
          ] }) }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[80px]", children: t("actions") })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filteredAndSorted.map((session) => /* @__PURE__ */ jsxs(TableRow, { className: "group", children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: session.id }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-sm", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            formatDate(session.session)
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-sm", children: [
            /* @__PURE__ */ jsx(Smartphone, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            session.device_name || "—"
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: session.app }) }),
          /* @__PURE__ */ jsx(TableCell, { children: session.is_testing ? /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
            /* @__PURE__ */ jsx(TestTube, { className: "h-3 w-3 mr-1" }),
            "Test"
          ] }) : /* @__PURE__ */ jsx(Badge, { variant: "default", className: "text-xs", children: t("active") }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-sm text-muted-foreground", children: formatDate(session.created_at) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleView(session), className: "opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) }) })
        ] }, session.id)) })
      ] }),
      filteredAndSorted.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Monitor, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }),
        /* @__PURE__ */ jsx("p", { children: t("noSessionsFound") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: t("sessionDetails") }),
        /* @__PURE__ */ jsx(DialogDescription, { children: t("sessionDetailsDesc") })
      ] }),
      selectedSession && /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "ID" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium font-mono", children: selectedSession.id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("user") }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedSession.user_name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("sessionTime") }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: formatDate(selectedSession.session) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("device") }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedSession.device_name || "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("application") }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedSession.app })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("testing") }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedSession.is_testing ? t("yes") : t("no") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("created") }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: formatDate(selectedSession.created_at) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsViewDialogOpen(false), children: t("cancel") }) })
    ] }) })
  ] }) });
}
export {
  AdminWorkingSessionsPage as component
};
