import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { n as cn, a as useSettings, b as useIsMobile, I as Input, B as Button, S as Select, c as SelectTrigger, d as SelectValue, e as SelectContent, f as SelectItem, C as Card, g as CardContent, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell, h as Badge, o as CardHeader, p as CardTitle } from "./router-CTVAwSR8.js";
import { A as AdminGuard, a as AdminLayout } from "./admin-layout-BFGTm6By.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { f as fetchUsers, b as fetchCompanies, c as getUserStatusLabel, d as getUserTypeLabel, g as getUserFullName, e as fetchUserLocationHistory, h as deleteUser, i as createUser, j as updateUser } from "./auth-ATVJn5u0.js";
import { S as Separator } from "./separator-ZBy7-fIk.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem } from "./tooltip-DVV6DgP8.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-CMF2hblO.js";
import { L as Label } from "./label-SZrZpdES.js";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-Bxa6R2gx.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-B7uaj-7_.js";
import { toast } from "sonner";
import { Search, Plus, Users, Grid, User, MapPin, Building, MoreVertical, Eye, Edit, Trash2, EyeOff, UserPlus, Mail, Lock, Shield, Database, ChevronUp, ChevronDown, Phone, LogOut, Clock } from "lucide-react";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
import "@radix-ui/react-separator";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-dialog";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
import "@radix-ui/react-alert-dialog";
const Avatar = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Root,
  {
    ref,
    className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
function AdminUsersPage() {
  const {
    t
  } = useSettings();
  const queryClient = useQueryClient();
  const {
    data: apiUsers = [],
    isLoading: isUsersLoading
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers()
  });
  const {
    data: apiCompanies = []
  } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies()
  });
  const users = useMemo(() => {
    return apiUsers.map((u) => ({
      id: u.id,
      fullName: getUserFullName(u),
      email: u.email || "",
      phone: u.phone_number || "",
      role: getUserTypeLabel(u.user_type),
      status: getUserStatusLabel(u.user_status),
      companyId: u.company_id,
      companyName: u.company_rel?.name || null,
      avatar: u.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
      lastLogin: null,
      createdAt: new Date(u.created_at).toISOString().split("T")[0],
      permissions: [],
      twoFactorEnabled: false,
      department: "",
      address: "",
      _apiUser: u
    }));
  }, [apiUsers]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const isMobile = useIsMobile();
  useEffect(() => {
    setViewMode(isMobile ? "card" : "table");
  }, [isMobile]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLocationHistoryDialogOpen, setIsLocationHistoryDialogOpen] = useState(false);
  const [locationHistoryUserId, setLocationHistoryUserId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "Agent",
    status: "Kutilmoqda",
    companyId: null,
    companyName: null,
    department: "",
    address: "",
    twoFactorEnabled: false,
    permissions: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [show1cPassword, setShow1cPassword] = useState(false);
  const [showView1cPassword, setShowView1cPassword] = useState(false);
  const managers = useMemo(() => {
    return apiUsers.filter((u) => u.user_type === "MANAGER" || u.user_type === "SUPERVISOR");
  }, [apiUsers]);
  const managerOptions = useMemo(() => {
    const companyId = formData.companyId;
    return managers.filter((m) => {
      if (!companyId) return true;
      return m.company_id === companyId;
    });
  }, [managers, formData.companyId]);
  const {
    data: locationHistory = [],
    isLoading: isLocationHistoryLoading
  } = useQuery({
    queryKey: ["user-location-history", locationHistoryUserId],
    queryFn: () => locationHistoryUserId ? fetchUserLocationHistory(locationHistoryUserId) : Promise.resolve([]),
    enabled: locationHistoryUserId !== null && isLocationHistoryDialogOpen
  });
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((user) => user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.phone.includes(query) || user.role.toLowerCase().includes(query) || user.companyName && user.companyName.toLowerCase().includes(query) || user.department && user.department.toLowerCase().includes(query));
    }
    if (companyFilter !== "all") {
      result = result.filter((user) => user.companyId === Number(companyFilter));
    }
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter);
    }
    if (dateFrom) {
      result = result.filter((user) => user.createdAt >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((user) => user.createdAt <= dateTo);
    }
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (aVal === null) aVal = "";
      if (bVal === null) bVal = "";
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    return result;
  }, [users, searchQuery, sortField, sortOrder, companyFilter, roleFilter, statusFilter, dateFrom, dateTo]);
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  const handleEdit = (user) => {
    setSelectedUser(user);
    const apiUser = user._apiUser;
    const apiStatusToForm = {
      ACTIVE: "Faol",
      INACTIVE: "Faol emas",
      PENDING: "Kutilmoqda",
      BLOCKED: "Blokirovka"
    };
    setFormData({
      fullName: apiUser ? `${apiUser.first_name || ""} ${apiUser.last_name || ""}`.trim() || apiUser.username : user.fullName,
      email: apiUser?.email || user.email,
      phone: apiUser?.phone_number || user.phone || "",
      password: "",
      role: apiUser?.user_type || user.role,
      status: apiStatusToForm[apiUser?.user_status || ""] || user.status,
      companyId: apiUser?.company_id ?? user.companyId,
      companyName: apiUser?.company_rel?.name ?? user.companyName,
      department: user.department || "",
      address: user.address || "",
      twoFactorEnabled: user.twoFactorEnabled,
      permissions: user.permissions,
      photoUrl: apiUser?.photo || "",
      managerId: apiUser?.manager_id ?? void 0,
      managerName: apiUser?.manager ? `${apiUser.manager.first_name} ${apiUser.manager.last_name}` : "",
      user1cId: apiUser?.user_1c_id ?? void 0,
      user1cLogin: apiUser?.user_1c_login || "",
      user1cPassword: apiUser?.user_1c_password || ""
    });
    setShowPassword(false);
    setIsEditDialogOpen(true);
  };
  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };
  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  const handleViewLocationHistory = (user) => {
    setSelectedUser(user);
    setLocationHistoryUserId(user.id);
    setIsLocationHistoryDialogOpen(true);
  };
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-users"]
      });
      toast.success("Foydalanuvchi muvaffaqiyatli o'chirildi");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (err) => {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  });
  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    } else {
      setIsDeleteDialogOpen(false);
    }
  };
  const handleAddNew = () => {
    console.log("Opening add user dialog");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "Agent",
      status: "Kutilmoqda",
      companyId: null,
      companyName: null,
      department: "",
      address: "",
      twoFactorEnabled: false,
      permissions: [],
      photoUrl: "",
      managerId: void 0,
      managerName: "",
      user1cId: void 0,
      user1cLogin: "",
      user1cPassword: ""
    });
    setShowPassword(false);
    setSelectedUser(null);
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(true);
    console.log("Dialog should be open now");
  };
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-users"]
      });
      toast.success("Yangi foydalanuvchi qo'shildi");
      setIsAddDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (err) => {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data
    }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-users"]
      });
      toast.success("Foydalanuvchi muvaffaqiyatli tahrirlandi");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (err) => {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  });
  const handleSaveUser = () => {
    if (!formData.fullName || !formData.email) {
      toast.error("Ism va email majburiy maydonlar");
      return;
    }
    if (!selectedUser && !formData.password) {
      toast.error("Parol majburiy maydon");
      return;
    }
    if (formData.password && formData.password.length < 3) {
      toast.error("Parol kamida 3 ta belgidan iborat bo'lishi kerak");
      return;
    }
    const roleMap = {
      USER: "USER",
      SUPERADMIN: "SUPERADMIN",
      ADMIN: "ADMIN",
      MANAGER: "MANAGER",
      SUPERVISOR: "SUPERVISOR",
      AGENT: "AGENT",
      DELIVERER: "DELIVERER",
      VENDOR_AGENT: "VENDOR_AGENT",
      CLIENT: "CLIENT",
      DEALER: "DEALER",
      FACTORY: "FACTORY",
      CEO: "CEO",
      FINANCIST: "FINANCIST",
      WAREHOUSE: "WAREHOUSE",
      SALESMAN: "SALESMAN",
      CASHIER: "CASHIER",
      HR: "HR",
      MARKETING: "MARKETING",
      EXTERNAL_SELLER: "EXTERNAL_SELLER",
      MERCHANDISER: "MERCHANDISER"
    };
    const statusMap = {
      Faol: "ACTIVE",
      "Faol emas": "INACTIVE",
      Kutilmoqda: "PENDING",
      Blokirovka: "BLOCKED"
    };
    const userType = roleMap[formData.role || "Agent"] || "USER";
    const userStatus = statusMap[formData.status || "Kutilmoqda"] || "PENDING";
    if (selectedUser) {
      const editData = {};
      if (formData.email) {
        editData.username = formData.email.split("@")[0];
        editData.email = formData.email;
      }
      if (formData.fullName) {
        const parts = formData.fullName.split(" ");
        if (parts[0]) editData.first_name = parts[0];
        if (parts.slice(1).join(" ")) editData.last_name = parts.slice(1).join(" ");
      }
      if (formData.phone) editData.phone_number = formData.phone;
      editData.user_type = userType;
      editData.user_status = userStatus;
      if (formData.companyId) editData.company_id = formData.companyId;
      if (formData.managerId) editData.manager_id = Number(formData.managerId);
      if (formData.password) editData.password = formData.password;
      if (formData.user1cId !== void 0 && formData.user1cId !== "") editData.user_1c_id = Number(formData.user1cId);
      if (formData.user1cLogin) editData.user_1c_login = formData.user1cLogin;
      if (formData.user1cPassword) editData.user_1c_password = formData.user1cPassword;
      if (formData.photoUrl) editData.photo = formData.photoUrl;
      updateMutation.mutate({
        id: selectedUser.id,
        data: editData
      });
    } else {
      const payload = {
        username: formData.email.split("@")[0] || `user_${Date.now()}`,
        password: formData.password,
        email: formData.email,
        first_name: formData.fullName.split(" ")[0] || "",
        last_name: formData.fullName.split(" ").slice(1).join(" ") || "",
        phone_number: formData.phone,
        user_type: userType,
        ...formData.companyId ? {
          company_id: Number(formData.companyId)
        } : {},
        ...formData.photoUrl ? {
          photo: formData.photoUrl
        } : {},
        ...formData.managerId ? {
          manager_id: Number(formData.managerId)
        } : {},
        ...formData.user1cId !== void 0 && formData.user1cId !== "" ? {
          user_1c_id: Number(formData.user1cId)
        } : {},
        ...formData.user1cLogin ? {
          user_1c_login: formData.user1cLogin
        } : {},
        ...formData.user1cPassword ? {
          user_1c_password: formData.user1cPassword
        } : {}
      };
      createMutation.mutate(payload);
    }
  };
  const SortIcon = ({
    field
  }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4 ml-1" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 ml-1" });
  };
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Faol":
        return "default";
      case "Faol emas":
        return "secondary";
      case "Kutilmoqda":
        return "outline";
      case "Blokirovka":
        return "destructive";
      default:
        return "secondary";
    }
  };
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "SUPERADMIN":
        return "destructive";
      case "ADMIN":
        return "default";
      case "USER":
        return "secondary";
      case "MANAGER":
        return "outline";
      case "SUPERVISOR":
        return "outline";
      case "AGENT":
        return "secondary";
      case "DELIVERER":
        return "secondary";
      case "VENDOR_AGENT":
        return "secondary";
      case "CLIENT":
        return "secondary";
      case "DEALER":
        return "secondary";
      case "FACTORY":
        return "secondary";
      case "CEO":
        return "outline";
      case "FINANCIST":
        return "outline";
      case "WAREHOUSE":
        return "secondary";
      case "SALESMAN":
        return "secondary";
      case "CASHIER":
        return "secondary";
      case "HR":
        return "secondary";
      case "MARKETING":
        return "secondary";
      case "EXTERNAL_SELLER":
        return "secondary";
      case "MERCHANDISER":
        return "secondary";
      default:
        return "secondary";
    }
  };
  const UserCard = ({
    user
  }) => /* @__PURE__ */ jsx(Card, { className: "hover:shadow-md transition-shadow cursor-pointer", onClick: () => handleView(user), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs(Avatar, { className: "h-12 w-12", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: user.avatar, alt: user.fullName }),
          /* @__PURE__ */ jsx(AvatarFallback, { children: /* @__PURE__ */ jsx(User, { className: "h-6 w-6" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg", children: user.fullName }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: user.email })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
        /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
          /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Amallar" }),
          /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
            e.stopPropagation();
            handleView(user);
          }, children: [
            /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
            "Ko'rish"
          ] }),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
            e.stopPropagation();
            handleEdit(user);
          }, children: [
            /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
            "Tahrirlash"
          ] }),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
            e.stopPropagation();
            handleViewLocationHistory(user);
          }, children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 mr-2" }),
            "Joylashuvlar tarixi"
          ] }),
          /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
            e.stopPropagation();
            handleDelete(user);
          }, className: "text-red-600 focus:text-red-600", children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
            "O'chirish"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Badge, { variant: getRoleBadgeVariant(user.role), children: user.role }),
        /* @__PURE__ */ jsx(Badge, { variant: getStatusBadgeVariant(user.status), children: user.status })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { children: user.phone })
      ] }),
      user.companyName && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Building, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { children: user.companyName })
      ] }),
      user.department && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { children: user.department })
      ] }),
      user.lastLogin ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Oxirgi kirish: ",
          user.lastLogin
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { children: "Hali kirmagan" })
      ] }),
      user.twoFactorEnabled && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-green-600", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { children: "2FA yoqilgan" })
      ] })
    ] })
  ] }) });
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsxs(AdminLayout, { title: t("adminUsers"), subtitle: t("adminUsersSubtitle"), children: [
    isUsersLoading && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-12", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-md", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Qidirish (ism, email, telefon, kompaniya)...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleAddNew, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          t("add")
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs(Select, { value: companyFilter, onValueChange: setCompanyFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Kompaniya" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Barcha kompaniyalar" }),
            apiCompanies.map((company) => /* @__PURE__ */ jsx(SelectItem, { value: company.id.toString(), children: company.name }, company.id)),
            /* @__PURE__ */ jsx(SelectItem, { value: "no-company", children: "Kompaniyasi yo'q" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: roleFilter, onValueChange: setRoleFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Rol" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Barcha rollar" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "USER", children: "USER" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "SUPERADMIN", children: "SUPERADMIN" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "ADMIN", children: "ADMIN" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "MANAGER", children: "MANAGER" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "SUPERVISOR", children: "SUPERVISOR" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "AGENT", children: "AGENT" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "DELIVERER", children: "DELIVERER" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "VENDOR_AGENT", children: "VENDOR_AGENT" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "CLIENT", children: "CLIENT" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "DEALER", children: "DEALER" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "FACTORY", children: "FACTORY" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "CEO", children: "CEO" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "FINANCIST", children: "FINANCIST" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "WAREHOUSE", children: "WAREHOUSE" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "SALESMAN", children: "SALESMAN" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "CASHIER", children: "CASHIER" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "HR", children: "HR" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "MARKETING", children: "MARKETING" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "EXTERNAL_SELLER", children: "EXTERNAL_SELLER" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "MERCHANDISER", children: "MERCHANDISER" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Holat" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Barcha holatlar" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "Faol", children: "Faol" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "Faol emas", children: "Faol emas" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "Kutilmoqda", children: "Kutilmoqda" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "Blokirovka", children: "Blokirovka" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: "Sana:" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: dateFrom, onChange: (e) => setDateFrom(e.target.value), className: "h-9 w-[140px]", placeholder: "Dan" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "—" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: dateTo, onChange: (e) => setDateTo(e.target.value), className: "h-9 w-[140px]", placeholder: "Gacha" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "ml-auto", children: /* @__PURE__ */ jsx(Tabs, { value: viewMode, onValueChange: (v) => setViewMode(v), children: /* @__PURE__ */ jsxs(TabsList, { children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "table", children: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "card", children: /* @__PURE__ */ jsx(Grid, { className: "h-4 w-4" }) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Jami: ",
        filteredAndSortedUsers.length,
        " ta foydalanuvchi"
      ] })
    ] }),
    viewMode === "table" ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-[60px]", children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleSort("id"), className: "p-0 h-auto font-medium", children: [
            "ID ",
            /* @__PURE__ */ jsx(SortIcon, { field: "id" })
          ] }) }),
          /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleSort("fullName"), className: "p-0 h-auto font-medium", children: [
            t("name"),
            " ",
            /* @__PURE__ */ jsx(SortIcon, { field: "fullName" })
          ] }) }),
          /* @__PURE__ */ jsx(TableHead, { children: "Email" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Telefon" }),
          /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleSort("role"), className: "p-0 h-auto font-medium", children: [
            t("role"),
            " ",
            /* @__PURE__ */ jsx(SortIcon, { field: "role" })
          ] }) }),
          /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleSort("status"), className: "p-0 h-auto font-medium", children: [
            t("status"),
            " ",
            /* @__PURE__ */ jsx(SortIcon, { field: "status" })
          ] }) }),
          /* @__PURE__ */ jsx(TableHead, { children: "Kompaniya" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Bo'lim" }),
          /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleSort("lastLogin"), className: "p-0 h-auto font-medium", children: [
            "Oxirgi kirish ",
            /* @__PURE__ */ jsx(SortIcon, { field: "lastLogin" })
          ] }) }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[80px]", children: "Amallar" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filteredAndSortedUsers.map((user) => /* @__PURE__ */ jsxs(TableRow, { className: "cursor-pointer group", onClick: () => handleView(user), children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: user.id }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8", children: [
              /* @__PURE__ */ jsx(AvatarImage, { src: user.avatar, alt: user.fullName }),
              /* @__PURE__ */ jsx(AvatarFallback, { children: /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: user.fullName }),
              user.address && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                user.address
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: user.email }),
          /* @__PURE__ */ jsx(TableCell, { children: user.phone }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: getRoleBadgeVariant(user.role), children: user.role }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: getStatusBadgeVariant(user.status), children: user.status }) }),
          /* @__PURE__ */ jsx(TableCell, { children: user.companyName ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Building, { className: "h-3 w-3" }),
            user.companyName
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: user.department || "—" }),
          /* @__PURE__ */ jsx(TableCell, { children: user.lastLogin ? /* @__PURE__ */ jsx("span", { className: "text-sm", children: user.lastLogin }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-sm", children: "Kirmagan" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "opacity-0 group-hover:opacity-100 transition-opacity", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
              /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Amallar" }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                handleView(user);
              }, children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
                "Ko'rish"
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                handleEdit(user);
              }, children: [
                /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
                "Tahrirlash"
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                handleViewLocationHistory(user);
              }, children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 mr-2" }),
                "Joylashuvlar tarixi"
              ] }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: (e) => {
                e.stopPropagation();
                handleDelete(user);
              }, className: "text-red-600 focus:text-red-600", children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                "O'chirish"
              ] })
            ] })
          ] }) })
        ] }, user.id)) })
      ] }),
      filteredAndSortedUsers.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(User, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
        /* @__PURE__ */ jsx("p", { children: "Hech qanday foydalanuvchi topilmadi" })
      ] })
    ] }) }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [
      filteredAndSortedUsers.map((user) => /* @__PURE__ */ jsx(UserCard, { user }, user.id)),
      filteredAndSortedUsers.length === 0 && /* @__PURE__ */ jsxs("div", { className: "col-span-full text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(User, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
        /* @__PURE__ */ jsx("p", { children: "Hech qanday foydalanuvchi topilmadi" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: isViewDialogOpen, onOpenChange: setIsViewDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto sm:max-w-[95vw] md:max-w-3xl", children: [
      /* @__PURE__ */ jsx(DialogHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10", children: /* @__PURE__ */ jsx(Eye, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl", children: "Foydalanuvchi ma'lumotlari" }),
          /* @__PURE__ */ jsx(DialogDescription, { className: "text-sm", children: "Foydalanuvchi haqida to'liq ma'lumot" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Separator, {}),
      selectedUser && (() => {
        const apiUser = selectedUser._apiUser;
        return /* @__PURE__ */ jsxs("div", { className: "space-y-5 py-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5", children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-20 w-20 ring-2 ring-border", children: [
              /* @__PURE__ */ jsx(AvatarImage, { src: selectedUser.avatar, alt: selectedUser.fullName }),
              /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-primary/5", children: /* @__PURE__ */ jsx(User, { className: "h-8 w-8 text-primary" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold", children: selectedUser.fullName }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Badge, { variant: getRoleBadgeVariant(selectedUser.role), children: selectedUser.role }),
                /* @__PURE__ */ jsx(Badge, { variant: getStatusBadgeVariant(selectedUser.status), children: selectedUser.status }),
                apiUser?.id && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  "#",
                  apiUser.id
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Username" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: apiUser?.username || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Email" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedUser.email })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Telefon" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedUser.phone || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Manzil" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedUser.address || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Rol" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedUser.role })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Holat" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedUser.status })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Kompaniya" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedUser.companyName || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Bo'lim" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedUser.department || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Ro'yxatdan o'tgan" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: selectedUser.createdAt })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Manager ID" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: apiUser?.manager_id ?? "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Manager" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: apiUser?.manager ? `${apiUser.manager.first_name} ${apiUser.manager.last_name}` : "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Manager kompaniyasi" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: apiUser?.manager?.company_rel?.name || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "1C ID" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: apiUser?.user_1c_id ?? "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "1C Login" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: apiUser?.user_1c_login || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "1C Password" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: apiUser?.user_1c_password ? showView1cPassword ? apiUser.user_1c_password : "••••••••" : "—" }),
                apiUser?.user_1c_password && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowView1cPassword(!showView1cPassword), className: "text-muted-foreground hover:text-foreground transition-colors", tabIndex: -1, children: showView1cPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" }) })
              ] })
            ] })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsViewDialogOpen(false), children: "Yopish" }),
        /* @__PURE__ */ jsx(Button, { onClick: () => {
          setIsViewDialogOpen(false);
          handleEdit(selectedUser);
        }, children: "Tahrirlash" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isAddDialogOpen || isEditDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx(DialogHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10", children: /* @__PURE__ */ jsx(UserPlus, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl", children: isEditDialogOpen ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi qo'shish" }),
          /* @__PURE__ */ jsx(DialogDescription, { className: "text-sm", children: isEditDialogOpen ? "Foydalanuvchi ma'lumotlarini tahrirlang" : "Yangi foydalanuvchi qo'shish uchun ma'lumotlarni kiriting" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5 py-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold", children: "Shaxsiy ma'lumotlar" })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Label, { htmlFor: "fullName", className: "text-xs font-medium", children: [
                  "Ism ",
                  /* @__PURE__ */ jsx("span", { className: "text-destructive", children: "*" })
                ] }),
                /* @__PURE__ */ jsx(Input, { id: "fullName", value: formData.fullName, onChange: (e) => setFormData({
                  ...formData,
                  fullName: e.target.value
                }), placeholder: "To'liq ism", className: "h-9" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Label, { htmlFor: "email", className: "text-xs font-medium", children: [
                  "Email ",
                  /* @__PURE__ */ jsx("span", { className: "text-destructive", children: "*" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(Mail, { className: "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
                  /* @__PURE__ */ jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => setFormData({
                    ...formData,
                    email: e.target.value
                  }), placeholder: "email@example.com", className: "h-9 pl-8" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "phone", className: "text-xs font-medium", children: "Telefon" }),
              /* @__PURE__ */ jsx(Input, { id: "phone", value: formData.phone, onChange: (e) => setFormData({
                ...formData,
                phone: e.target.value
              }), placeholder: "+998 90 123 45 67", className: "h-9" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs(Label, { htmlFor: "password", className: "text-xs font-medium", children: [
                "Parol",
                !isEditDialogOpen && /* @__PURE__ */ jsx("span", { className: "text-destructive", children: " *" }),
                isEditDialogOpen && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-normal", children: " (ixtiyoriy)" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Lock, { className: "absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
                /* @__PURE__ */ jsx(Input, { id: "password", type: showPassword ? "text" : "password", value: formData.password || "", onChange: (e) => setFormData({
                  ...formData,
                  password: e.target.value
                }), placeholder: isEditDialogOpen ? "Bo'sh qoldirsangiz o'zgarmaydi" : "Kamida 3 ta belgi", className: "h-9 pl-8 pr-10" }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPassword((prev) => !prev), className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors", tabIndex: -1, children: showPassword ? /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ jsx("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" }),
                  /* @__PURE__ */ jsx("path", { d: "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" }),
                  /* @__PURE__ */ jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })
                ] }) : /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
                  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" })
                ] }) })
              ] }),
              formData.password && formData.password.length < 3 && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: "Parol kamida 3 ta belgidan iborat bo'lishi kerak" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold", children: "Hisob ma'lumotlari" })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "role", className: "text-xs font-medium", children: "Rol" }),
                /* @__PURE__ */ jsxs(Select, { value: formData.role, onValueChange: (v) => setFormData({
                  ...formData,
                  role: v
                }), children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { className: "max-h-60", children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "USER", children: "USER" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "SUPERADMIN", children: "SUPERADMIN" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "ADMIN", children: "ADMIN" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "MANAGER", children: "MANAGER" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "SUPERVISOR", children: "SUPERVISOR" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "AGENT", children: "AGENT" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "DELIVERER", children: "DELIVERER" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "VENDOR_AGENT", children: "VENDOR_AGENT" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "CLIENT", children: "CLIENT" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "DEALER", children: "DEALER" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "FACTORY", children: "FACTORY" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "CEO", children: "CEO" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "FINANCIST", children: "FINANCIST" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "WAREHOUSE", children: "WAREHOUSE" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "SALESMAN", children: "SALESMAN" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "CASHIER", children: "CASHIER" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "HR", children: "HR" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "MARKETING", children: "MARKETING" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "EXTERNAL_SELLER", children: "EXTERNAL_SELLER" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "MERCHANDISER", children: "MERCHANDISER" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "status", className: "text-xs font-medium", children: "Holat" }),
                /* @__PURE__ */ jsxs(Select, { value: formData.status, onValueChange: (v) => setFormData({
                  ...formData,
                  status: v
                }), children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "Faol", children: "Faol" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "Faol emas", children: "Faol emas" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "Kutilmoqda", children: "Kutilmoqda" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "Blokirovka", children: "Blokirovka" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "company", className: "text-xs font-medium", children: "Kompaniya" }),
                /* @__PURE__ */ jsxs(Select, { value: formData.companyId?.toString() || "none", onValueChange: (v) => {
                  if (v === "none") {
                    setFormData({
                      ...formData,
                      companyId: null,
                      companyName: null
                    });
                  } else {
                    const company = apiCompanies.find((c) => c.id === Number(v));
                    setFormData({
                      ...formData,
                      companyId: company ? company.id : null,
                      companyName: company ? company.name : null
                    });
                  }
                }, children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Tanlanmagan" }) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "none", children: "Tanlanmagan" }),
                    apiCompanies.map((company) => /* @__PURE__ */ jsx(SelectItem, { value: company.id.toString(), children: company.name }, company.id))
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "department", className: "text-xs font-medium", children: "Bo'lim" }),
                /* @__PURE__ */ jsx(Input, { id: "department", value: formData.department, onChange: (e) => setFormData({
                  ...formData,
                  department: e.target.value
                }), placeholder: "Bo'lim nomi", className: "h-9" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "address", className: "text-xs font-medium", children: "Manzil" }),
              /* @__PURE__ */ jsx(Input, { id: "address", value: formData.address, onChange: (e) => setFormData({
                ...formData,
                address: e.target.value
              }), placeholder: "Manzil", className: "h-9" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-semibold", children: "Qo'shimcha sozlamalar" })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "photoUrl", className: "text-xs font-medium", children: "Photo URL" }),
                /* @__PURE__ */ jsx(Input, { id: "photoUrl", value: formData.photoUrl || "", onChange: (e) => setFormData({
                  ...formData,
                  photoUrl: e.target.value
                }), placeholder: "https://example.com/photo.jpg", className: "h-9" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "managerId", className: "text-xs font-medium", children: "Manager" }),
                /* @__PURE__ */ jsxs(Select, { value: formData.managerId?.toString() || "none", onValueChange: (v) => {
                  if (v === "none") {
                    setFormData({
                      ...formData,
                      managerId: void 0,
                      managerName: ""
                    });
                  } else {
                    const mgr = managerOptions.find((m) => m.id === Number(v));
                    setFormData({
                      ...formData,
                      managerId: mgr ? mgr.id : void 0,
                      managerName: mgr ? `${mgr.first_name} ${mgr.last_name}` : ""
                    });
                  }
                }, children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Tanlanmagan" }) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "none", children: "Tanlanmagan" }),
                    managerOptions.map((mgr) => /* @__PURE__ */ jsxs(SelectItem, { value: mgr.id.toString(), children: [
                      mgr.first_name,
                      " ",
                      mgr.last_name,
                      " [",
                      mgr.user_type,
                      "]",
                      " ",
                      mgr.company_rel ? `(${mgr.company_rel.name})` : ""
                    ] }, mgr.id))
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Separator, {}),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "1C integratsiyasi" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "user1cId", className: "text-xs font-medium", children: "1C ID" }),
                  /* @__PURE__ */ jsx(Input, { id: "user1cId", type: "number", value: formData.user1cId ?? "", onChange: (e) => setFormData({
                    ...formData,
                    user1cId: e.target.value ? Number(e.target.value) : void 0
                  }), placeholder: "0", className: "h-9" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "user1cLogin", className: "text-xs font-medium", children: "1C Login" }),
                  /* @__PURE__ */ jsx(Input, { id: "user1cLogin", value: formData.user1cLogin || "", onChange: (e) => setFormData({
                    ...formData,
                    user1cLogin: e.target.value
                  }), placeholder: "1C login", className: "h-9" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "user1cPassword", className: "text-xs font-medium", children: "1C Password" }),
                  /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx(Input, { id: "user1cPassword", type: show1cPassword ? "text" : "password", value: formData.user1cPassword || "", onChange: (e) => setFormData({
                      ...formData,
                      user1cPassword: e.target.value
                    }), placeholder: "1C parol", className: "h-9 pr-10" }),
                    /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShow1cPassword(!show1cPassword), className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors", tabIndex: -1, children: show1cPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
        }, children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSaveUser, children: t("save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Foydalanuvchini o'chirish" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "Haqiqatan ham ",
          /* @__PURE__ */ jsx("strong", { children: selectedUser?.fullName }),
          " foydalanuvchisini o'chirmoqchimisiz?",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-red-600", children: "Bu amalni qaytarib bo'lmaydi." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: confirmDelete, className: "bg-red-600 hover:bg-red-700", children: "O'chirish" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isLocationHistoryDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsLocationHistoryDialogOpen(false);
        setLocationHistoryUserId(null);
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsx(DialogHeader, { className: "pb-2 flex-shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10", children: /* @__PURE__ */ jsx(MapPin, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl", children: "Joylashuvlar tarixi" }),
          /* @__PURE__ */ jsxs(DialogDescription, { className: "text-sm", children: [
            selectedUser?.fullName,
            " - foydalanuvchining joylashuvlar tarixi"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Separator, { className: "flex-shrink-0" }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto py-4 min-h-0", children: isLocationHistoryLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : locationHistory.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(MapPin, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
        /* @__PURE__ */ jsx("p", { children: "Joylashuvlar tarixi mavjud emas" })
      ] }) : /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { className: "sticky top-0 bg-background", children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-[60px]", children: "ID" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Vaqt" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Kenglik" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Uzunlik" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Aniqlik" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Tezlik" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Yo'nalish" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Balandlik" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: locationHistory.map((loc) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: loc.id }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: loc.created_at ? new Date(loc.created_at).toLocaleString("uz-UZ") : "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: loc.latitude?.toFixed(6) || "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: loc.longitude?.toFixed(6) || "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: loc.accuracy !== null && loc.accuracy !== void 0 ? `${loc.accuracy} m` : "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: loc.speed !== null && loc.speed !== void 0 ? `${loc.speed} m/s` : "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: loc.bearing !== null && loc.bearing !== void 0 ? `${loc.bearing}°` : "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: loc.altitude !== null && loc.altitude !== void 0 ? `${loc.altitude} m` : "—" })
        ] }, loc.id)) })
      ] }) }),
      /* @__PURE__ */ jsx(DialogFooter, { className: "flex-shrink-0 pt-2", children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
        setIsLocationHistoryDialogOpen(false);
        setLocationHistoryUserId(null);
      }, children: "Yopish" }) })
    ] }) })
  ] }) });
}
export {
  AdminUsersPage as component
};
