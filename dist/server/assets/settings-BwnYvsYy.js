import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { A as AdminGuard, a as AdminLayout } from "./admin-layout-BFGTm6By.js";
import { a as useSettings, b as useIsMobile, C as Card, o as CardHeader, p as CardTitle, q as CardDescription, g as CardContent, I as Input, S as Select, c as SelectTrigger, d as SelectValue, e as SelectContent, f as SelectItem, B as Button, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell, h as Badge } from "./router-CTVAwSR8.js";
import { k as fetchDatabaseInfo, b as fetchCompanies, l as fetchSecurityKeys, m as fetchAlembicVersions, n as createAlembicVersion, o as deleteAlembicVersion, p as createSecurityKey, q as deleteSecurityKey, r as updateSecurityKey, s as getAdminToken } from "./auth-ATVJn5u0.js";
import { L as Label } from "./label-SZrZpdES.js";
import { S as Switch } from "./switch-DZ8BWOwv.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bxa6R2gx.js";
import { S as Separator } from "./separator-ZBy7-fIk.js";
import { D as Dialog, f as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-CMF2hblO.js";
import { Shield, Key, Database, Globe, Bell, Lock, Plus, Trash2, EyeOff, Eye, Copy, Server } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./tooltip-DVV6DgP8.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "@radix-ui/react-tabs";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
const initialWebhooks = [{
  id: 1,
  url: "https://api.example.com/webhooks/orders",
  events: ["order.created", "order.updated"],
  active: true
}, {
  id: 2,
  url: "https://api.example.com/webhooks/payments",
  events: ["payment.received", "payment.failed"],
  active: true
}];
function AdminSettingsPage() {
  const {
    t
  } = useSettings();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [showKey, setShowKey] = useState({});
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [isAddWebhookDialogOpen, setIsAddWebhookDialogOpen] = useState(false);
  const [newKeyCompanyId, setNewKeyCompanyId] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [showAdminToken, setShowAdminToken] = useState(false);
  const {
    data: dbInfo,
    isLoading: isLoadingDbInfo
  } = useQuery({
    queryKey: ["admin-database-info"],
    queryFn: () => fetchDatabaseInfo()
  });
  const {
    data: companies = []
  } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies()
  });
  const {
    data: allSecurityKeys = [],
    isLoading: isLoadingKeys
  } = useQuery({
    queryKey: ["admin-all-security-keys"],
    queryFn: async () => {
      const allKeys = [];
      for (const company of companies) {
        const keys = await fetchSecurityKeys(company.id);
        allKeys.push(...keys.map((k) => ({
          ...k,
          company_name: company.name
        })));
      }
      return allKeys;
    },
    enabled: companies.length > 0
  });
  const {
    data: alembicVersions = [],
    isLoading: isLoadingAlembic
  } = useQuery({
    queryKey: ["admin-alembic-versions"],
    queryFn: () => fetchAlembicVersions()
  });
  const currentAlembicVersion = alembicVersions.length > 0 ? alembicVersions[alembicVersions.length - 1].version_num : null;
  const [isAddAlembicDialogOpen, setIsAddAlembicDialogOpen] = useState(false);
  const [newAlembicVersionNum, setNewAlembicVersionNum] = useState("");
  const createAlembicMutation = useMutation({
    mutationFn: createAlembicVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-alembic-versions"]
      });
      toast.success("Alembic versiyasi qo'shildi");
      setIsAddAlembicDialogOpen(false);
      setNewAlembicVersionNum("");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const deleteAlembicMutation = useMutation({
    mutationFn: deleteAlembicVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-alembic-versions"]
      });
      toast.success("Alembic versiyasi o'chirildi");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const createKeyMutation = useMutation({
    mutationFn: ({
      companyId,
      data
    }) => createSecurityKey(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-all-security-keys"]
      });
      toast.success("Yangi xavfsizlik kaliti qo'shildi");
      setIsAddKeyDialogOpen(false);
      setNewKeyValue("");
      setNewKeyCompanyId("");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const deleteKeyMutation = useMutation({
    mutationFn: deleteSecurityKey,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-all-security-keys"]
      });
      toast.success("Xavfsizlik kaliti o'chirildi");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  useMutation({
    mutationFn: ({
      id,
      data
    }) => updateSecurityKey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-all-security-keys"]
      });
      toast.success("Xavfsizlik kaliti yangilandi");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "Distr Business Hub",
    defaultLanguage: "uz",
    timezone: "Asia/Tashkent",
    dateFormat: "DD.MM.YYYY",
    pushNotifications: true,
    emailNotifications: true
  });
  const [securitySettings, setSecuritySettings] = useState(() => ({
    sessionTimeout: localStorage.getItem("admin_session_timeout") || "8",
    maxLoginAttempts: localStorage.getItem("admin_max_login_attempts") || "5"
  }));
  const updateSecuritySetting = (key, value) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [key]: value
    }));
    localStorage.setItem(`admin_${key}`, value);
  };
  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success("API kalit nusxalandi");
  };
  const handleToggleKeyVisibility = (id) => {
    setShowKey((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const handleAddSecurityKey = () => {
    if (!newKeyValue.trim()) {
      toast.error("Kalit qiymatini kiriting");
      return;
    }
    if (!newKeyCompanyId || newKeyCompanyId === "none") {
      toast.error("Kompaniyani tanlang");
      return;
    }
    const companyId = Number(newKeyCompanyId);
    createKeyMutation.mutate({
      companyId,
      data: {
        key: newKeyValue,
        company_id: companyId
      }
    });
  };
  const handleDeleteSecurityKey = (id) => {
    deleteKeyMutation.mutate(id);
  };
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(AdminLayout, { title: t("adminSettings"), subtitle: t("adminSettingsSubtitle"), children: /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: "general", className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-3 lg:w-auto lg:inline-grid", children: [
      /* @__PURE__ */ jsxs(TabsTrigger, { value: "general", className: "gap-2", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: t("general") })
      ] }),
      /* @__PURE__ */ jsxs(TabsTrigger, { value: "security", className: "gap-2", children: [
        /* @__PURE__ */ jsx(Key, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: t("securityKeys") })
      ] }),
      /* @__PURE__ */ jsxs(TabsTrigger, { value: "database", className: "gap-2", children: [
        /* @__PURE__ */ jsx(Database, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: t("database") })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(TabsContent, { value: "general", className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5" }),
            t("localization")
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: t("localizationDesc") })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "platformName", children: t("platformName") }),
            /* @__PURE__ */ jsx(Input, { id: "platformName", value: generalSettings.platformName, onChange: (e) => setGeneralSettings({
              ...generalSettings,
              platformName: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "defaultLanguage", children: t("defaultLanguage") }),
            /* @__PURE__ */ jsxs(Select, { value: generalSettings.defaultLanguage, onValueChange: (value) => setGeneralSettings({
              ...generalSettings,
              defaultLanguage: value
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "uz", children: "O'zbekcha" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "ru", children: "Русский" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "en", children: "English" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "timezone", children: t("timezone") }),
            /* @__PURE__ */ jsxs(Select, { value: generalSettings.timezone, onValueChange: (value) => setGeneralSettings({
              ...generalSettings,
              timezone: value
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "Asia/Tashkent", children: "Toshkent (UTC+5)" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "Asia/Samarkand", children: "Samarqand (UTC+5)" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "Europe/Moscow", children: "Moskva (UTC+3)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "dateFormat", children: t("dateFormat") }),
            /* @__PURE__ */ jsxs(Select, { value: generalSettings.dateFormat, onValueChange: (value) => setGeneralSettings({
              ...generalSettings,
              dateFormat: value
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "DD.MM.YYYY", children: "DD.MM.YYYY" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "YYYY-MM-DD", children: "YYYY-MM-DD" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "MM/DD/YYYY", children: "MM/DD/YYYY" })
              ] })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" }),
            t("notifications")
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: t("notificationsDesc") })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-base", children: t("pushNotifications") }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("pushNotificationsDesc") })
            ] }),
            /* @__PURE__ */ jsx(Switch, { checked: generalSettings.pushNotifications, onCheckedChange: (checked) => setGeneralSettings({
              ...generalSettings,
              pushNotifications: checked
            }) })
          ] }),
          /* @__PURE__ */ jsx(Separator, {}),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-base", children: t("emailNotifications") }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("emailNotificationsDesc") })
            ] }),
            /* @__PURE__ */ jsx(Switch, { checked: generalSettings.emailNotifications, onCheckedChange: (checked) => setGeneralSettings({
              ...generalSettings,
              emailNotifications: checked
            }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Lock, { className: "h-5 w-5" }),
            t("security")
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: t("securityDesc") })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "sessionTimeout", children: t("sessionTimeout") }),
            /* @__PURE__ */ jsxs(Select, { value: securitySettings.sessionTimeout, onValueChange: (value) => updateSecuritySetting("sessionTimeout", value), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "1", children: "1 soat" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "4", children: "4 soat" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "8", children: "8 soat" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "24", children: "24 soat" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "maxLoginAttempts", children: t("maxLoginAttempts") }),
            /* @__PURE__ */ jsxs(Select, { value: securitySettings.maxLoginAttempts, onValueChange: (value) => updateSecuritySetting("maxLoginAttempts", value), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "3", children: "3 urinish" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "5", children: "5 urinish" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "10", children: "10 urinish" })
              ] })
            ] })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(TabsContent, { value: "security", className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" }),
              t("apiKeys")
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: t("apiKeysDesc") })
          ] }),
          /* @__PURE__ */ jsxs(Dialog, { open: isAddKeyDialogOpen, onOpenChange: (open) => {
            setIsAddKeyDialogOpen(open);
            if (!open) {
              setNewKeyValue("");
              setNewKeyCompanyId("");
            }
          }, children: [
            /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { size: "sm", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
              t("addKey")
            ] }) }),
            /* @__PURE__ */ jsxs(DialogContent, { children: [
              /* @__PURE__ */ jsxs(DialogHeader, { children: [
                /* @__PURE__ */ jsx(DialogTitle, { children: t("addNewKey") }),
                /* @__PURE__ */ jsx(DialogDescription, { children: t("addNewKeyDesc") })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { children: "Kompaniya *" }),
                  /* @__PURE__ */ jsxs(Select, { value: newKeyCompanyId, onValueChange: setNewKeyCompanyId, children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Kompaniyani tanlang" }) }),
                    /* @__PURE__ */ jsx(SelectContent, { children: companies.map((company) => /* @__PURE__ */ jsx(SelectItem, { value: company.id.toString(), children: company.name }, company.id)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "keyValue", children: "Kalit qiymati *" }),
                  /* @__PURE__ */ jsx(Input, { id: "keyValue", placeholder: "API kalit qiymati", value: newKeyValue, onChange: (e) => setNewKeyValue(e.target.value) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(DialogFooter, { children: [
                /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsAddKeyDialogOpen(false), children: t("cancel") }),
                /* @__PURE__ */ jsx(Button, { onClick: handleAddSecurityKey, children: t("create") })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          isLoadingKeys ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : isMobile ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: allSecurityKeys.map((key) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4 space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs text-muted-foreground", children: [
                "#",
                key.id
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive shrink-0", onClick: () => handleDeleteSecurityKey(key.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: key.company_name || `#${key.company_id}` }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-mono text-xs bg-muted/50 rounded p-2 break-all", children: [
              /* @__PURE__ */ jsx("span", { className: "flex-1 min-w-0", children: showKey[key.id] ? key.key : key.key.length > 20 ? key.key.slice(0, 8) + "••••" + key.key.slice(-4) : key.key }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 shrink-0", onClick: () => handleToggleKeyVisibility(key.id), children: showKey[key.id] ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 shrink-0", onClick: () => handleCopyKey(key.key), children: /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }) })
            ] })
          ] }, key.id)) }) : /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: "ID" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Kompaniya" }),
              /* @__PURE__ */ jsx(TableHead, { children: t("apiKey") }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: t("actions") })
            ] }) }),
            /* @__PURE__ */ jsx(TableBody, { children: allSecurityKeys.map((key) => /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: key.id }),
              /* @__PURE__ */ jsx(TableCell, { children: key.company_name || `#${key.company_id}` }),
              /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                showKey[key.id] ? key.key : key.key.length > 20 ? key.key.slice(0, 8) + "••••" + key.key.slice(-4) : key.key,
                /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => handleToggleKeyVisibility(key.id), children: showKey[key.id] ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3" }) }),
                /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => handleCopyKey(key.key), children: /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }) })
              ] }) }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive", onClick: () => handleDeleteSecurityKey(key.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
            ] }, key.id)) })
          ] }),
          allSecurityKeys.length === 0 && !isLoadingKeys && /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Key, { className: "h-10 w-10 mx-auto mb-2 opacity-50" }),
            /* @__PURE__ */ jsx("p", { children: "Xavfsizlik kalitlari topilmadi" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Lock, { className: "h-5 w-5" }),
            "Admin sessiya tokeni"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Joriy admin sessiyasi uchun autentifikatsiya tokeni" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: (() => {
          const token = getAdminToken();
          return /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-3", children: [
            /* @__PURE__ */ jsx(Input, { readOnly: true, value: token || "Token topilmadi", className: "font-mono text-sm", type: showAdminToken ? "text" : "password" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-10 w-10 shrink-0", onClick: () => setShowAdminToken(!showAdminToken), children: showAdminToken ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) }),
              token && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-10 w-10", onClick: () => {
                navigator.clipboard.writeText(token);
                toast.success("Token nusxalandi");
              }, children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
            ] })
          ] });
        })() })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(TabsContent, { value: "database", className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Database, { className: "h-5 w-5" }),
              t("alembicVersions")
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: t("alembicVersionsDesc") })
          ] }),
          /* @__PURE__ */ jsxs(Dialog, { open: isAddAlembicDialogOpen, onOpenChange: (open) => {
            setIsAddAlembicDialogOpen(open);
            if (!open) setNewAlembicVersionNum("");
          }, children: [
            /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { size: "sm", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
              "Yangi versiya"
            ] }) }),
            /* @__PURE__ */ jsxs(DialogContent, { children: [
              /* @__PURE__ */ jsxs(DialogHeader, { children: [
                /* @__PURE__ */ jsx(DialogTitle, { children: "Yangi versiya" }),
                /* @__PURE__ */ jsx(DialogDescription, { children: "Yangi alembic versiyasini qo'shish" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "versionNum", children: "Version num" }),
                /* @__PURE__ */ jsx(Input, { id: "versionNum", placeholder: "993860a7c014", value: newAlembicVersionNum, onChange: (e) => setNewAlembicVersionNum(e.target.value) })
              ] }) }),
              /* @__PURE__ */ jsxs(DialogFooter, { children: [
                /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsAddAlembicDialogOpen(false), children: t("cancel") }),
                /* @__PURE__ */ jsx(Button, { onClick: () => {
                  if (!newAlembicVersionNum.trim()) {
                    toast.error("Version num ni kiriting");
                    return;
                  }
                  createAlembicMutation.mutate({
                    version_num: newAlembicVersionNum
                  });
                }, disabled: createAlembicMutation.isPending, children: t("create") })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: isLoadingAlembic ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-4 rounded-lg bg-muted/50", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Database, { className: "h-5 w-5 text-primary" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("currentVersion") }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t("headRevision") })
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: "default", className: "font-mono", children: currentAlembicVersion ? `${currentAlembicVersion.slice(0, 8)} (head)` : "-" })
          ] }),
          isMobile ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: alembicVersions.map((version) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border bg-card p-3", children: [
            /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "font-mono", children: version.version_num }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive shrink-0", onClick: () => deleteAlembicMutation.mutate(version.version_num), disabled: deleteAlembicMutation.isPending, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] }, version.version_num)) }) : /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: t("version") }),
              /* @__PURE__ */ jsx(TableHead, { className: "w-[100px]", children: t("actions") })
            ] }) }),
            /* @__PURE__ */ jsx(TableBody, { children: alembicVersions.map((version) => /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "font-mono", children: version.version_num }) }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive", onClick: () => deleteAlembicMutation.mutate(version.version_num), disabled: deleteAlembicMutation.isPending, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
            ] }, version.version_num)) })
          ] }),
          alembicVersions.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Database, { className: "h-10 w-10 mx-auto mb-2 opacity-50" }),
            /* @__PURE__ */ jsx("p", { children: "Alembic versiyalari topilmadi" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Server, { className: "h-5 w-5" }),
            t("databaseInfo")
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: t("databaseInfoDesc") })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: isLoadingDbInfo ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : dbInfo ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg border bg-card", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("dbSize") }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: dbInfo.database_size })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg border bg-card", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("tables") }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: dbInfo.total_tables })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg border bg-card", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("connections") }),
              /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold mt-1", children: [
                dbInfo.active_connections,
                " / ",
                dbInfo.max_connections
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg border bg-card", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("uptime") }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: dbInfo.server_uptime })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg border bg-card", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Database nomi" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: dbInfo.database_name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg border bg-card", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Server versiyasi" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: dbInfo.server_version })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg border bg-card", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Cache hit ratio" }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium", children: [
                dbInfo.cache_hit_ratio,
                "%"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold mb-2", children: [
              "Ulanishlar (",
              dbInfo.connections.length,
              ")"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "max-h-48 overflow-y-auto border rounded-lg", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsx("thead", { className: "bg-muted/50 sticky top-0", children: /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("th", { className: "text-left p-2 font-medium", children: "PID" }),
                /* @__PURE__ */ jsx("th", { className: "text-left p-2 font-medium", children: "Username" }),
                /* @__PURE__ */ jsx("th", { className: "text-left p-2 font-medium", children: "Application" }),
                /* @__PURE__ */ jsx("th", { className: "text-left p-2 font-medium", children: "State" }),
                /* @__PURE__ */ jsx("th", { className: "text-left p-2 font-medium", children: "Query" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { children: dbInfo.connections.map((conn) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
                /* @__PURE__ */ jsx("td", { className: "p-2 font-mono", children: conn.pid }),
                /* @__PURE__ */ jsx("td", { className: "p-2", children: conn.username || "—" }),
                /* @__PURE__ */ jsx("td", { className: "p-2", children: conn.application_name || "—" }),
                /* @__PURE__ */ jsx("td", { className: "p-2", children: conn.state || "—" }),
                /* @__PURE__ */ jsx("td", { className: "p-2 max-w-[200px] truncate", children: conn.query || "—" })
              ] }, conn.pid)) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold mb-2", children: [
              "Jadvallar (",
              dbInfo.tables.length,
              ")"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "max-h-64 overflow-y-auto border rounded-lg", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsx("thead", { className: "bg-muted/50 sticky top-0", children: /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("th", { className: "text-left p-2 font-medium", children: "#" }),
                /* @__PURE__ */ jsx("th", { className: "text-left p-2 font-medium", children: "Table nomi" }),
                /* @__PURE__ */ jsx("th", { className: "text-right p-2 font-medium", children: "Qatorlar" }),
                /* @__PURE__ */ jsx("th", { className: "text-right p-2 font-medium", children: "Umumiy" }),
                /* @__PURE__ */ jsx("th", { className: "text-right p-2 font-medium", children: "Table" }),
                /* @__PURE__ */ jsx("th", { className: "text-right p-2 font-medium", children: "Index" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { children: dbInfo.tables.map((tbl, i) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
                /* @__PURE__ */ jsx("td", { className: "p-2 text-muted-foreground", children: i + 1 }),
                /* @__PURE__ */ jsx("td", { className: "p-2 font-medium", children: tbl.table_name }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-right", children: tbl.row_count.toLocaleString() }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-right", children: tbl.total_size }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-right", children: tbl.table_size }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-right", children: tbl.index_size })
              ] }, tbl.table_name)) })
            ] }) })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Server, { className: "h-10 w-10 mx-auto mb-2 opacity-50" }),
          /* @__PURE__ */ jsx("p", { children: "Ma'lumotlar bazasi ma'lumotlari yuklanmadi" })
        ] }) })
      ] })
    ] })
  ] }) }) }) });
}
export {
  AdminSettingsPage as component
};
