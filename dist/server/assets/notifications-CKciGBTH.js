import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { A as AdminGuard, a as AdminLayout } from "./admin-layout-BFGTm6By.js";
import { t as fetchNotifications, b as fetchCompanies, v as createNotification, w as deleteNotification, x as markNotificationRead, y as markNotificationsReadMultiple } from "./auth-ATVJn5u0.js";
import { a as useSettings, I as Input, B as Button, S as Select, c as SelectTrigger, d as SelectValue, e as SelectContent, f as SelectItem, h as Badge, C as Card, g as CardContent, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell } from "./router-CTVAwSR8.js";
import { L as Label } from "./label-SZrZpdES.js";
import { T as Textarea } from "./textarea-BmcP_vmP.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter, d as DialogDescription } from "./dialog-CMF2hblO.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-B7uaj-7_.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem } from "./tooltip-DVV6DgP8.js";
import { toast } from "sonner";
import { Search, CheckCheck, Plus, MoreVertical, Eye, Trash2, Bell, Send } from "lucide-react";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
import "@radix-ui/react-label";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
const emptyForm = {
  title: "",
  message: "",
  date: "",
  author: "",
  user_type: "",
  company_id: "none"
};
function AdminNotificationsPage() {
  const {
    t
  } = useSettings();
  const queryClient = useQueryClient();
  const [companyFilter, setCompanyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: notifications = [],
    isLoading
  } = useQuery({
    queryKey: ["admin-notifications", companyFilter],
    queryFn: () => fetchNotifications(companyFilter !== "all" ? Number(companyFilter) : void 0)
  });
  const {
    data: companies = []
  } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies()
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const filteredNotifications = notifications.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.message && n.message.toLowerCase().includes(q) || n.author && n.author.toLowerCase().includes(q);
  });
  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-notifications"]
      });
      toast.success("Bildirishnoma muvaffaqiyatli yuborildi");
      setIsCreateDialogOpen(false);
      setFormData(emptyForm);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-notifications"]
      });
      toast.success("Bildirishnoma o'chirildi");
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-notifications"]
      });
      toast.success("Bildirishnoma o'qilgan deb belgilandi");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => {
      const unreadIds = notifications.filter((n) => !n.status?.is_read).map((n) => n.id);
      return markNotificationsReadMultiple(unreadIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-notifications"]
      });
      toast.success("Barcha bildirishnomalar o'qilgan deb belgilandi");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const handleCreate = () => {
    setFormData(emptyForm);
    setIsCreateDialogOpen(true);
  };
  const handleView = (notification) => {
    setSelectedNotification(notification);
    setIsViewDialogOpen(true);
    if (!notification.status?.is_read) {
      markReadMutation.mutate(notification.id);
    }
  };
  const handleDelete = (notification) => {
    setSelectedNotification(notification);
    setIsDeleteDialogOpen(true);
  };
  const handleSaveCreate = () => {
    if (!formData.title.trim()) {
      toast.error("Sarlavha majburiy");
      return;
    }
    const payload = {
      title: formData.title
    };
    if (formData.message) payload.message = formData.message;
    if (formData.date) payload.date = formData.date;
    if (formData.author) payload.author = formData.author;
    if (formData.user_type) payload.user_type = formData.user_type;
    if (formData.company_id !== "none") payload.company_id = Number(formData.company_id);
    createMutation.mutate(payload);
  };
  const confirmDelete = () => {
    if (selectedNotification) {
      deleteMutation.mutate(selectedNotification.id);
    }
  };
  const unreadCount = notifications.filter((n) => !n.status?.is_read).length;
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsxs(AdminLayout, { title: t("adminNotifications"), subtitle: t("adminNotificationsSubtitle"), children: [
    isLoading && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-12", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-md", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Qidirish (sarlavha, xabar, muallif)...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          unreadCount > 0 && /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => markAllReadMutation.mutate(), children: [
            /* @__PURE__ */ jsx(CheckCheck, { className: "h-4 w-4 mr-2" }),
            "Hammasini o'qilgan"
          ] }),
          /* @__PURE__ */ jsxs(Button, { onClick: handleCreate, children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            t("add")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 items-center", children: [
        /* @__PURE__ */ jsxs(Select, { value: companyFilter, onValueChange: setCompanyFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Kompaniya" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Barcha kompaniyalar" }),
            companies.map((company) => /* @__PURE__ */ jsx(SelectItem, { value: company.id.toString(), children: company.name }, company.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "Jami: ",
          filteredNotifications.length,
          " ta bildirishnoma",
          unreadCount > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "destructive", className: "ml-2", children: [
            unreadCount,
            " yangi"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: t("date") }),
          /* @__PURE__ */ jsx(TableHead, { children: t("calendarTitle") }),
          /* @__PURE__ */ jsx(TableHead, { children: "Xabar" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Muallif" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Holat" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[80px]", children: "Amallar" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filteredNotifications.map((notification) => /* @__PURE__ */ jsxs(TableRow, { className: !notification.status?.is_read ? "font-medium bg-muted/30" : "text-muted-foreground", children: [
          /* @__PURE__ */ jsx(TableCell, { children: new Date(notification.created_at).toLocaleString() }),
          /* @__PURE__ */ jsx(TableCell, { children: notification.title }),
          /* @__PURE__ */ jsx(TableCell, { className: "max-w-[300px] truncate", children: notification.message }),
          /* @__PURE__ */ jsx(TableCell, { children: notification.author || "—" }),
          /* @__PURE__ */ jsx(TableCell, { children: notification.status?.is_read ? /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "O'qilgan" }) : /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Yangi" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
              /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Amallar" }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleView(notification), children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
                "Ko'rish"
              ] }),
              !notification.status?.is_read && /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => markReadMutation.mutate(notification.id), children: [
                /* @__PURE__ */ jsx(CheckCheck, { className: "h-4 w-4 mr-2" }),
                "O'qilgan"
              ] }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleDelete(notification), className: "text-red-600 focus:text-red-600", children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                "O'chirish"
              ] })
            ] })
          ] }) })
        ] }, notification.id)) })
      ] }),
      filteredNotifications.length === 0 && !isLoading && /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Bell, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
        /* @__PURE__ */ jsx("p", { children: "Bildirishnomalar topilmadi" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Bildirishnoma ma'lumotlari" }) }),
      selectedNotification && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Sarlavha" }),
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedNotification.title })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Muallif" }),
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedNotification.author || "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Sana" }),
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: new Date(selectedNotification.created_at).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Holat" }),
            selectedNotification.status?.is_read ? /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "O'qilgan" }) : /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Yangi" })
          ] })
        ] }),
        selectedNotification.message && /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Xabar" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium whitespace-pre-wrap", children: selectedNotification.message })
        ] })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsViewDialogOpen(false), children: "Yopish" }) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isCreateDialogOpen, onOpenChange: (open) => {
      setIsCreateDialogOpen(open);
      if (!open) setFormData(emptyForm);
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Yangi bildirishnoma yuborish" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Yangi bildirishnoma yaratish va yuborish" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "notif-title", children: "Sarlavha *" }),
          /* @__PURE__ */ jsx(Input, { id: "notif-title", value: formData.title, onChange: (e) => setFormData({
            ...formData,
            title: e.target.value
          }), placeholder: "Bildirishnoma sarlavhasi" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "notif-message", children: "Xabar" }),
          /* @__PURE__ */ jsx(Textarea, { id: "notif-message", value: formData.message, onChange: (e) => setFormData({
            ...formData,
            message: e.target.value
          }), placeholder: "Bildirishnoma matni", rows: 4 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "notif-date", children: "Sana" }),
            /* @__PURE__ */ jsx(Input, { id: "notif-date", value: formData.date, onChange: (e) => setFormData({
              ...formData,
              date: e.target.value
            }), placeholder: "DD.MM.YYYY" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "notif-author", children: "Muallif" }),
            /* @__PURE__ */ jsx(Input, { id: "notif-author", value: formData.author, onChange: (e) => setFormData({
              ...formData,
              author: e.target.value
            }), placeholder: "Muallif nomi" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "notif-user-type", children: "Foydalanuvchi turi" }),
            /* @__PURE__ */ jsxs(Select, { value: formData.user_type || "all", onValueChange: (v) => setFormData({
              ...formData,
              user_type: v === "all" ? "" : v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Barcha" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "USER", children: "User" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "AGENT", children: "Agent" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "DELIVERER", children: "Yetkazib beruvchi" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "MANAGER", children: "Menejer" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "notif-company", children: "Kompaniya" }),
            /* @__PURE__ */ jsxs(Select, { value: formData.company_id, onValueChange: (v) => setFormData({
              ...formData,
              company_id: v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "none", children: "Barcha kompaniyalar" }),
                companies.map((company) => /* @__PURE__ */ jsx(SelectItem, { value: company.id.toString(), children: company.name }, company.id))
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
          setIsCreateDialogOpen(false);
          setFormData(emptyForm);
        }, children: "Bekor qilish" }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleSaveCreate, children: [
          /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-2" }),
          "Yuborish"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Bildirishnomani o'chirish" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "Haqiqatan ham ",
          /* @__PURE__ */ jsx("strong", { children: selectedNotification?.title }),
          " bildirishnomasini o'chirmoqchimisiz?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: confirmDelete, className: "bg-red-600 hover:bg-red-700", children: "O'chirish" })
      ] })
    ] }) })
  ] }) });
}
export {
  AdminNotificationsPage as component
};
