import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo } from "react";
import { w as useSettings, u as useAuth, A as API, P as PageHeader, a as Button, C as Card, I as Input } from "./router-Bi5ReRu6.js";
import { T as Textarea } from "./textarea-U4OZxVxP.js";
import { L as Label } from "./label-BXhXzN1d.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle, b as DialogDescription, c as DialogFooter } from "./dialog-kLGqu9zM.js";
import { Loader2, CheckCheck, Send, Bell, MailOpen } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-label";
import "@radix-ui/react-dialog";
function NotificationsPage() {
  const {
    t
  } = useSettings();
  const {
    accessToken
  } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [sending, setSending] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const fetchNotificationsList = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(API.notifications, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);
  useEffect(() => {
    fetchNotificationsList();
  }, [fetchNotificationsList]);
  const fetchEmployees = useCallback(async () => {
    if (!accessToken) return;
    setEmployeesLoading(true);
    try {
      const res = await fetch(API.userManager, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      setEmployeesLoading(false);
    }
  }, [accessToken]);
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  const handleSend = async () => {
    if (!formTitle.trim()) {
      toast.error("Sarlavha majburiy");
      return;
    }
    if (selectedEmployeeIds.length === 0) {
      toast.error("Kamida bitta xodim tanlang");
      return;
    }
    if (!accessToken) return;
    setSending(true);
    try {
      const payload = {
        title: formTitle.trim(),
        users_1c_id: selectedEmployeeIds
      };
      if (formMessage.trim()) payload.message = formMessage.trim();
      if (formAuthor.trim()) payload.author = formAuthor.trim();
      const res = await fetch(API.notificationsCreate, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to send notification");
      }
      toast.success(t("notificationSent"));
      setIsDialogOpen(false);
      setFormTitle("");
      setFormMessage("");
      setFormAuthor("");
      setSelectedEmployeeIds([]);
      fetchNotificationsList();
    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };
  const handleMarkRead = async (id) => {
    if (!accessToken) return;
    try {
      await fetch(API.notificationRead(id), {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });
      setNotifications((prev) => prev.map((n) => n.id === id ? {
        ...n,
        status: n.status ? {
          ...n.status,
          is_read: true,
          read_at: (/* @__PURE__ */ new Date()).toISOString()
        } : null
      } : n));
    } catch {
    }
  };
  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => n.status && !n.status.is_read).map((n) => n.id);
    if (unreadIds.length === 0 || !accessToken) return;
    setMarkingRead(true);
    try {
      await fetch(API.notificationsReadMultiple, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(unreadIds)
      });
      setNotifications((prev) => prev.map((n) => n.status && !n.status.is_read ? {
        ...n,
        status: {
          ...n.status,
          is_read: true,
          read_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      } : n));
    } catch {
    } finally {
      setMarkingRead(false);
    }
  };
  const toggleEmployee = (user1cId) => {
    setSelectedEmployeeIds((prev) => prev.includes(user1cId) ? prev.filter((id) => id !== user1cId) : [...prev, user1cId]);
  };
  const validEmployees = useMemo(() => employees.filter((e) => e.user_1c_id != null), [employees]);
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };
  const unreadCount = notifications.filter((n) => n.status && !n.status.is_read).length;
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("notifications"), description: t("notificationsDesc"), actions: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      unreadCount > 0 && /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: handleMarkAllRead, disabled: markingRead, children: [
        markingRead ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(CheckCheck, { className: "h-4 w-4 mr-2" }),
        t("markRead")
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => {
        setIsDialogOpen(true);
        fetchEmployees();
      }, children: [
        /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-2" }),
        t("sendNotification")
      ] })
    ] }) }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-16", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }),
      /* @__PURE__ */ jsx("span", { className: "ml-2 text-muted-foreground", children: t("loading") })
    ] }) : fetchError ? /* @__PURE__ */ jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-destructive", children: fetchError }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", className: "mt-4", onClick: fetchNotificationsList, children: "Qayta yuklash" })
    ] }) : notifications.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx(Bell, { className: "h-10 w-10 mx-auto text-muted-foreground/40" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground", children: t("noNotifications") })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Card, { className: "divide-y", children: notifications.map((n) => {
        const isUnread = n.status && !n.status.is_read;
        return /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-4 p-4 group ${isUnread ? "bg-accent/30" : ""}`, children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: n.title }),
              isUnread && /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary flex-shrink-0" })
            ] }),
            n.message && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: n.message }),
            n.author && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: n.author })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: formatDate(n.created_at) }),
            isUnread && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity", onClick: () => handleMarkRead(n.id), children: /* @__PURE__ */ jsx(MailOpen, { className: "h-4 w-4" }) })
          ] })
        ] }, n.id);
      }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-3", children: [
        notifications.length,
        " jami, ",
        unreadCount,
        " ",
        t("new")
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: t("newNotification") }),
        /* @__PURE__ */ jsx(DialogDescription, { children: t("notificationsDesc") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: t("selectEmployees") }),
          employeesLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
            t("loading")
          ] }) : validEmployees.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Xodimlar topilmadi" }) : /* @__PURE__ */ jsx("div", { className: "border rounded-md max-h-48 overflow-y-auto", children: validEmployees.map((emp) => {
            const checked = emp.user_1c_id != null && selectedEmployeeIds.includes(emp.user_1c_id);
            return /* @__PURE__ */ jsxs("label", { className: `flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent ${checked ? "bg-accent" : ""}`, children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked, onChange: () => emp.user_1c_id != null && toggleEmployee(emp.user_1c_id), className: "h-4 w-4" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: [emp.first_name, emp.last_name].filter(Boolean).join(" ") || emp.username }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  emp.user_type,
                  " · 1C ID: ",
                  emp.user_1c_id
                ] })
              ] })
            ] }, emp.id);
          }) }),
          selectedEmployeeIds.length > 0 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            selectedEmployeeIds.length,
            " xodim tanlandi"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(Label, { htmlFor: "notif-title", children: [
            t("title"),
            " *"
          ] }),
          /* @__PURE__ */ jsx(Input, { id: "notif-title", value: formTitle, onChange: (e) => setFormTitle(e.target.value), placeholder: "Sarlavhani kiriting", maxLength: 250 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "notif-message", children: t("message") }),
          /* @__PURE__ */ jsx(Textarea, { id: "notif-message", value: formMessage, onChange: (e) => setFormMessage(e.target.value), placeholder: "Xabar matnini kiriting", rows: 3, maxLength: 2e3 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "notif-author", children: t("author") }),
          /* @__PURE__ */ jsx(Input, { id: "notif-author", value: formAuthor, onChange: (e) => setFormAuthor(e.target.value), placeholder: "Muallif ismi", maxLength: 100 })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsDialogOpen(false), children: t("cancel") }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleSend, disabled: sending, children: [
          sending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
          t("save")
        ] })
      ] })
    ] }) })
  ] });
}
export {
  NotificationsPage as component
};
