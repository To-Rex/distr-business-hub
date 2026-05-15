import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Search, Users, LayoutGrid, Rows3, AlertCircle, UserRound, Mail, Phone, Building2, CalendarDays, Loader2, CheckCircle2, Ban } from "lucide-react";
import { a as useSettings, u as useAuth, b as useIsMobile, A as API, P as PageHeader, C as Card, I as Input, B as Button, h as Badge, g as CardContent, s as Skeleton, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell } from "./router-CTVAwSR8.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-CMF2hblO.js";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-dialog";
function getDisplayName(e) {
  return `${e.first_name} ${e.last_name}`.trim() || e.username;
}
function StaffPage() {
  const {
    t
  } = useSettings();
  const {
    user,
    accessToken
  } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const isMobile = useIsMobile();
  useEffect(() => {
    setViewMode(isMobile ? "cards" : "table");
  }, [isMobile]);
  const [sortMode, setSortMode] = useState("name-asc");
  const toggleStatus = (employee, e) => {
    e.stopPropagation();
    if (!accessToken || togglingId !== null) return;
    const newStatus = employee.user_status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    setTogglingId(employee.id);
    fetch(API.userManagerStatus(employee.id), {
      method: "PATCH",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: employee.username,
        user_status: newStatus
      })
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((updated) => {
      setEmployees((prev) => prev.map((e2) => e2.id === updated.id ? updated : e2));
      setSelectedEmployee((prev) => prev?.id === updated.id ? updated : prev);
    }).catch(() => {
    }).finally(() => setTogglingId(null));
  };
  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }
    fetch(API.userManager, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((data) => {
      setEmployees(data ?? []);
    }).catch((err) => {
      setError(err.message || t("errorTitle"));
    }).finally(() => setLoading(false));
  }, [accessToken, t]);
  const filteredEmployees = useMemo(() => {
    if (!query.trim()) return employees;
    const lower = query.toLowerCase();
    return employees.filter((e) => `${e.first_name} ${e.last_name}`.toLowerCase().includes(lower) || e.username.toLowerCase().includes(lower) || e.user_type.toLowerCase().includes(lower) || e.phone_number.toLowerCase().includes(lower) || String(e.id).includes(lower));
  }, [employees, query]);
  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      switch (sortMode) {
        case "name-desc":
          return getDisplayName(b).localeCompare(getDisplayName(a));
        case "type-asc":
          return a.user_type.localeCompare(b.user_type);
        case "type-desc":
          return b.user_type.localeCompare(a.user_type);
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "name-asc":
        default:
          return getDisplayName(a).localeCompare(getDisplayName(b));
      }
    });
  }, [filteredEmployees, sortMode]);
  const typeCounts = useMemo(() => employees.reduce((acc, e) => {
    acc[e.user_type] = (acc[e.user_type] ?? 0) + 1;
    return acc;
  }, {}), [employees]);
  const renderBlockButton = (employee) => {
    if (employee.id === user?.id) return null;
    return /* @__PURE__ */ jsxs("button", { onClick: (e) => toggleStatus(employee, e), disabled: togglingId === employee.id, className: `inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${employee.user_status === "BLOCKED" ? "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950" : "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950"}`, children: [
      togglingId === employee.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : employee.user_status === "BLOCKED" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Ban, { className: "h-3 w-3" }),
      employee.user_status === "BLOCKED" ? t("unblock") : t("block")
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("staff"), description: t("staffDesc") }),
    /* @__PURE__ */ jsx(Card, { className: "p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 w-full", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { value: query, onChange: (e) => setQuery(e.target.value), placeholder: `${t("search")}...`, className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground shrink-0", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxs("span", { children: [
          filteredEmployees.length,
          "/",
          employees.length
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxs("select", { value: sortMode, onChange: (e) => setSortMode(e.target.value), className: "h-9 rounded-md border border-input bg-background px-3 text-sm", children: [
        /* @__PURE__ */ jsx("option", { value: "name-asc", children: t("sortAZ") }),
        /* @__PURE__ */ jsx("option", { value: "name-desc", children: t("sortZA") }),
        /* @__PURE__ */ jsx("option", { value: "type-asc", children: t("sortTypeAsc") }),
        /* @__PURE__ */ jsx("option", { value: "type-desc", children: t("sortTypeDesc") }),
        /* @__PURE__ */ jsx("option", { value: "date-desc", children: t("sortDateNewOld") }),
        /* @__PURE__ */ jsx("option", { value: "date-asc", children: t("sortDateOldNew") })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: viewMode === "cards" ? "default" : "outline", size: "sm", onClick: () => setViewMode("cards"), children: [
          /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4" }),
          t("cardsView")
        ] }),
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: viewMode === "table" ? "default" : "outline", size: "sm", onClick: () => setViewMode("table"), children: [
          /* @__PURE__ */ jsx(Rows3, { className: "h-4 w-4" }),
          t("tableView")
        ] })
      ] })
    ] }) }),
    !loading && !error && Object.keys(typeCounts).length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-4", children: Object.entries(typeCounts).map(([type, count]) => /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "rounded-md px-3 py-1", children: [
      type,
      ": ",
      count
    ] }, type)) }),
    loading && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3", children: Array.from({
      length: 6
    }).map((_, i) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-10 rounded-full" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 flex-1", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-3/4" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-1/2" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-1/3" })
    ] }) }, i)) }),
    error && !loading && /* @__PURE__ */ jsx(Card, { className: "p-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-7 w-7 text-destructive" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("errorTitle") }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: error })
    ] }) }),
    !loading && !error && sortedEmployees.length === 0 && /* @__PURE__ */ jsx(Card, { className: "p-12 text-center text-muted-foreground", children: t("notFound") }),
    !loading && !error && sortedEmployees.length > 0 && viewMode === "cards" && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3", children: sortedEmployees.map((employee) => {
      const displayName = getDisplayName(employee);
      return /* @__PURE__ */ jsx(Card, { className: "border-border/70 hover:shadow-sm transition-shadow cursor-pointer", onClick: () => setSelectedEmployee(employee), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(UserRound, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold truncate", children: displayName }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: employee.phone_number })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            /* @__PURE__ */ jsx(Badge, { variant: "outline", children: employee.user_type }),
            employee.user_status === "BLOCKED" && /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-red-500" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            employee.company_rel?.name,
            " · ",
            employee.username
          ] }),
          renderBlockButton(employee)
        ] })
      ] }) }, employee.id);
    }) }),
    !loading && !error && sortedEmployees.length > 0 && viewMode === "table" && /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: t("staff") }),
        /* @__PURE__ */ jsx(TableHead, { children: t("phone") }),
        /* @__PURE__ */ jsx(TableHead, { children: t("email") }),
        /* @__PURE__ */ jsx(TableHead, { children: t("role") }),
        /* @__PURE__ */ jsx(TableHead, { children: t("company") }),
        /* @__PURE__ */ jsx(TableHead, { children: t("status") }),
        /* @__PURE__ */ jsx(TableHead, { children: t("registered") }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("actions") })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: sortedEmployees.map((employee) => {
        const displayName = getDisplayName(employee);
        return /* @__PURE__ */ jsxs(TableRow, { className: "cursor-pointer", onClick: () => setSelectedEmployee(employee), children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: displayName }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "@",
                employee.username
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: employee.phone_number || "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "max-w-[200px] truncate", children: employee.email || "—" }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", children: employee.user_type }) }),
          /* @__PURE__ */ jsx(TableCell, { children: employee.company_rel?.name || "—" }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: employee.user_status === "ACTIVE" ? "default" : employee.user_status === "BLOCKED" ? "destructive" : "secondary", children: employee.user_status ?? "—" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: new Date(employee.created_at).toLocaleDateString() }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: renderBlockButton(employee) })
        ] }, employee.id);
      }) })
    ] }) }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!selectedEmployee, onOpenChange: (open) => !open && setSelectedEmployee(null), children: /* @__PURE__ */ jsx(DialogContent, { className: "sm:max-w-md", children: selectedEmployee && (() => {
      const name = getDisplayName(selectedEmployee);
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0", children: selectedEmployee.photo ? /* @__PURE__ */ jsx("img", { src: selectedEmployee.photo, alt: name, className: "h-14 w-14 rounded-2xl object-cover" }) : /* @__PURE__ */ jsx(UserRound, { className: "h-7 w-7" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx(DialogTitle, { className: "text-lg", children: name }),
            /* @__PURE__ */ jsxs(DialogDescription, { children: [
              "@",
              selectedEmployee.username
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4 pt-2", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" }),
            t("email")
          ] }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: selectedEmployee.email }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
            t("phone")
          ] }),
          /* @__PURE__ */ jsx("span", { children: selectedEmployee.phone_number }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }),
            t("role")
          ] }),
          /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", children: selectedEmployee.user_type }) }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
            t("status")
          ] }),
          /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(Badge, { variant: selectedEmployee.user_status === "ACTIVE" ? "default" : selectedEmployee.user_status === "BLOCKED" ? "destructive" : "secondary", children: selectedEmployee.user_status ?? "—" }) }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
            t("company")
          ] }),
          /* @__PURE__ */ jsx("span", { children: selectedEmployee.company_rel?.name }),
          selectedEmployee.manager && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
              t("manager")
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              selectedEmployee.manager.first_name,
              " ",
              selectedEmployee.manager.last_name
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CalendarDays, { className: "h-4 w-4" }),
            t("registered")
          ] }),
          /* @__PURE__ */ jsx("span", { children: new Date(selectedEmployee.created_at).toLocaleDateString() })
        ] }) })
      ] });
    })() }) })
  ] });
}
export {
  StaffPage as component
};
