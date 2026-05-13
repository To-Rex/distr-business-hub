import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
export type UserRole =
  | "USER"
  | "SUPERADMIN"
  | "ADMIN"
  | "MANAGER"
  | "SUPERVISOR"
  | "AGENT"
  | "DELIVERER"
  | "VENDOR_AGENT"
  | "CLIENT"
  | "DEALER"
  | "FACTORY"
  | "CEO"
  | "FINANCIST"
  | "WAREHOUSE"
  | "SALESMAN"
  | "CASHIER"
  | "HR"
  | "MARKETING"
  | "EXTERNAL_SELLER"
  | "MERCHANDISER";
export type UserStatus = "Faol" | "Faol emas" | "Kutilmoqda" | "Blokirovka";

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  companyId: number | null;
  companyName: string | null;
  avatar?: string;
  lastLogin: string | null;
  createdAt: string;
  permissions: string[];
  twoFactorEnabled: boolean;
  department?: string;
  address?: string;
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchCompanies,
  getUserFullName,
  getUserTypeLabel,
  getUserStatusLabel,
  fetchUserLocationHistory,
  type ApiUser,
  type ApiUserType,
  type ApiUserStatus,
  type ApiLocationHistory,
} from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSettings } from "@/lib/settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  Search,
  User,
  Users,
  Grid,
  Trash2,
  Edit,
  Eye,
  Shield,
  Building,
  Calendar,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  UserPlus,
  Mail,
  Database,
  Lock,
} from "lucide-react";

type SortField =
  | "id"
  | "fullName"
  | "email"
  | "role"
  | "status"
  | "companyId"
  | "lastLogin"
  | "createdAt";
type SortOrder = "asc" | "desc";
type ViewMode = "table" | "card";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { t } = useSettings();
  const queryClient = useQueryClient();

  const { data: apiUsers = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
  });

  const { data: apiCompanies = [] } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies(),
  });

  const users: (AdminUser & { _apiUser?: ApiUser })[] = useMemo(() => {
    return apiUsers.map((u) => ({
      id: u.id,
      fullName: getUserFullName(u),
      email: u.email || "",
      phone: u.phone_number || "",
      role: getUserTypeLabel(u.user_type) as UserRole,
      status: getUserStatusLabel(u.user_status) as UserStatus,
      companyId: u.company_id,
      companyName: u.company_rel?.name || null,
      avatar: u.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
      lastLogin: null,
      createdAt: new Date(u.created_at).toISOString().split("T")[0],
      permissions: [],
      twoFactorEnabled: false,
      department: "",
      address: "",
      _apiUser: u,
    }));
  }, [apiUsers]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLocationHistoryDialogOpen, setIsLocationHistoryDialogOpen] = useState(false);
  const [locationHistoryUserId, setLocationHistoryUserId] = useState<number | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState<Record<string, any>>({
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
  });
  const [showPassword, setShowPassword] = useState(false);

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

  // Available permissions
  const availablePermissions = [
    { id: "users.read", label: "Foydalanuvchilarni ko'rish" },
    { id: "users.write", label: "Foydalanuvchilarni tahrirlash" },
    { id: "companies.read", label: "Kompaniyalarni ko'rish" },
    { id: "companies.write", label: "Kompaniyalarni tahrirlash" },
    { id: "sales.read", label: "Sotuvlarni ko'rish" },
    { id: "sales.write", label: "Sotuvlarni tahrirlash" },
    { id: "clients.read", label: "Mijozlarni ko'rish" },
    { id: "clients.write", label: "Mijozlarni tahrirlash" },
    { id: "reports.read", label: "Hisobotlarni ko'rish" },
    { id: "analytics.read", label: "Tahlillarni ko'rish" },
  ];

  const { data: locationHistory = [], isLoading: isLocationHistoryLoading } = useQuery({
    queryKey: ["user-location-history", locationHistoryUserId],
    queryFn: () =>
      locationHistoryUserId ? fetchUserLocationHistory(locationHistoryUserId) : Promise.resolve([]),
    enabled: locationHistoryUserId !== null && isLocationHistoryDialogOpen,
  });

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.includes(query) ||
          user.role.toLowerCase().includes(query) ||
          (user.companyName && user.companyName.toLowerCase().includes(query)) ||
          (user.department && user.department.toLowerCase().includes(query)),
      );
    }

    // Company filter
    if (companyFilter !== "all") {
      result = result.filter((user) => user.companyId === Number(companyFilter));
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter((user) => user.createdAt >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((user) => user.createdAt <= dateTo);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null values
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    const apiUser = (user as any)._apiUser as ApiUser | undefined;

    const apiStatusToForm: Record<string, string> = {
      ACTIVE: "Faol",
      INACTIVE: "Faol emas",
      PENDING: "Kutilmoqda",
      BLOCKED: "Blokirovka",
    };

    setFormData({
      fullName: apiUser
        ? `${apiUser.first_name || ""} ${apiUser.last_name || ""}`.trim() || apiUser.username
        : user.fullName,
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
      managerId: apiUser?.manager_id ?? undefined,
      managerName: apiUser?.manager
        ? `${apiUser.manager.first_name} ${apiUser.manager.last_name}`
        : "",
      user1cId: apiUser?.user_1c_id ?? undefined,
      user1cLogin: apiUser?.user_1c_login || "",
      user1cPassword: apiUser?.user_1c_password || "",
    });
    setShowPassword(false);
    setIsEditDialogOpen(true);
  };

  const handleView = (user: AdminUser) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleViewLocationHistory = (user: AdminUser) => {
    setSelectedUser(user);
    setLocationHistoryUserId(user.id);
    setIsLocationHistoryDialogOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Foydalanuvchi muvaffaqiyatli o'chirildi");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    },
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
      managerId: undefined,
      managerName: "",
      user1cId: undefined,
      user1cLogin: "",
      user1cPassword: "",
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
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Yangi foydalanuvchi qo'shildi");
      setIsAddDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Foydalanuvchi muvaffaqiyatli tahrirlandi");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    },
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

    // Map UI role to API user_type
    const roleMap: Record<string, ApiUserType> = {
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
      MERCHANDISER: "MERCHANDISER",
    };

    // Map UI status to API user_status
    const statusMap: Record<string, ApiUserStatus> = {
      Faol: "ACTIVE",
      "Faol emas": "INACTIVE",
      Kutilmoqda: "PENDING",
      Blokirovka: "BLOCKED",
    };

    const userType = roleMap[formData.role || "Agent"] || "USER";
    const userStatus = statusMap[formData.status || "Kutilmoqda"] || "PENDING";

    if (selectedUser) {
      // Edit
      const editData: Record<string, any> = {};
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
      if (userType) editData.user_type = userType;
      if (userStatus) editData.user_status = userStatus;
      if (formData.companyId) editData.company_id = formData.companyId;
      if (formData.managerId) editData.manager_id = Number(formData.managerId);
      if (formData.password) editData.password = formData.password;
      if (formData.user1cId !== undefined && formData.user1cId !== "")
        editData.user_1c_id = Number(formData.user1cId);
      if (formData.user1cLogin) editData.user_1c_login = formData.user1cLogin;
      if (formData.user1cPassword) editData.user_1c_password = formData.user1cPassword;
      if (formData.photoUrl) editData.photo = formData.photoUrl;
      updateMutation.mutate({ id: selectedUser.id, data: editData });
    } else {
      // Create
      const payload: import("@/lib/admin-api").CreateUserPayload = {
        username: formData.email!.split("@")[0] || `user_${Date.now()}`,
        password: formData.password,
        email: formData.email,
        first_name: formData.fullName!.split(" ")[0] || "",
        last_name: formData.fullName!.split(" ").slice(1).join(" ") || "",
        phone_number: formData.phone,
        user_type: userType,
        ...(formData.companyId ? { company_id: Number(formData.companyId) } : {}),
        ...(formData.photoUrl ? { photo: formData.photoUrl } : {}),
        ...(formData.managerId ? { manager_id: Number(formData.managerId) } : {}),
      };
      createMutation.mutate(payload);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...(prev.permissions || []), permissionId]
        : (prev.permissions || []).filter((p: string) => p !== permissionId),
    }));
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const getStatusBadgeVariant = (status: UserStatus) => {
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

  const getRoleBadgeVariant = (role: UserRole) => {
    // switch (role) {
    //   case "Super Admin":
    //     return "destructive";
    //   case "Admin":
    //     return "default";
    //   case "Menejer":
    //     return "outline";
    //   case "Bosh direktor":
    //     return "outline";
    //   case "Supervizor":
    //     return "outline";
    //   case "Agent":
    //     return "secondary";
    //   case "Yetkazib beruvchi":
    //     return "secondary";
    //   default:
    //     return "secondary";
    // }
    //nst roleMap: Record<string, ApiUserType> = {
    // "USER": "USER",
    // "SUPERADMIN": "SUPERADMIN",
    // "ADMIN": "ADMIN",
    // "MANAGER": "MANAGER",
    // "SUPERVISOR": "SUPERVISOR",
    // "AGENT": "AGENT",
    // "DELIVERER": "DELIVERER",
    // "VENDOR_AGENT": "VENDOR_AGENT",
    // "CLIENT": "CLIENT",
    // "DEALER": "DEALER",
    // "FACTORY": "FACTORY",
    // "CEO": "CEO",
    // "FINANCIST": "FINANCIST",
    // "WAREHOUSE": "WAREHOUSE",
    // "SALESMAN": "SALESMAN",
    // "CASHIER": "CASHIER",
    // "HR": "HR",
    // "MARKETING": "MARKETING",
    // "EXTERNAL_SELLER": "EXTERNAL_SELLER",
    // "MERCHANDISER": "MERCHANDISER",

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

  // User Card Component for card view
  const UserCard = ({ user }: { user: AdminUser }) => (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleView(user)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{user.fullName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Amallar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(user);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ko'rish
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(user);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewLocationHistory(user);
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Joylashuvlar tarixi
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(user);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
            <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{user.phone}</span>
          </div>

          {user.companyName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{user.companyName}</span>
            </div>
          )}

          {user.department && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{user.department}</span>
            </div>
          )}

          {user.lastLogin ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LogOut className="h-4 w-4" />
              <span>Oxirgi kirish: {user.lastLogin}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Hali kirmagan</span>
            </div>
          )}

          {user.twoFactorEnabled && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Shield className="h-4 w-4" />
              <span>2FA yoqilgan</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminGuard>
      <AdminLayout title={t("adminUsers")} subtitle={t("adminUsersSubtitle")}>
        {/* Filters and Controls */}
        {isUsersLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        <div className="space-y-4 mb-6">
          {/* Search and Add */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish (ism, email, telefon, kompaniya)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              {t("add")}
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kompaniya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha kompaniyalar</SelectItem>
                {apiCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
                <SelectItem value="no-company">Kompaniyasi yo'q</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha rollar</SelectItem>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="MANAGER">MANAGER</SelectItem>
                <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                <SelectItem value="AGENT">AGENT</SelectItem>
                <SelectItem value="DELIVERER">DELIVERER</SelectItem>
                <SelectItem value="VENDOR_AGENT">VENDOR_AGENT</SelectItem>
                <SelectItem value="CLIENT">CLIENT</SelectItem>
                <SelectItem value="DEALER">DEALER</SelectItem>
                <SelectItem value="FACTORY">FACTORY</SelectItem>
                <SelectItem value="CEO">CEO</SelectItem>
                <SelectItem value="FINANCIST">FINANCIST</SelectItem>
                <SelectItem value="WAREHOUSE">WAREHOUSE</SelectItem>
                <SelectItem value="SALESMAN">SALESMAN</SelectItem>
                <SelectItem value="CASHIER">CASHIER</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="MARKETING">MARKETING</SelectItem>
                <SelectItem value="EXTERNAL_SELLER">EXTERNAL_SELLER</SelectItem>
                <SelectItem value="MERCHANDISER">MERCHANDISER</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Holat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                <SelectItem value="Faol">Faol</SelectItem>
                <SelectItem value="Faol emas">Faol emas</SelectItem>
                <SelectItem value="Kutilmoqda">Kutilmoqda</SelectItem>
                <SelectItem value="Blokirovka">Blokirovka</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Sana:</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 w-[140px]"
                placeholder="Dan"
              />
              <span className="text-xs text-muted-foreground">—</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 w-[140px]"
                placeholder="Gacha"
              />
            </div>

            <div className="ml-auto">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="table">
                    <Users className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="card">
                    <Grid className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Jami: {filteredAndSortedUsers.length} ta foydalanuvchi
          </div>
        </div>

        {/* Content */}
        {viewMode === "table" ? (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("id")}
                        className="p-0 h-auto font-medium"
                      >
                        ID <SortIcon field="id" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("fullName")}
                        className="p-0 h-auto font-medium"
                      >
                        {t("name")} <SortIcon field="fullName" />
                      </Button>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("role")}
                        className="p-0 h-auto font-medium"
                      >
                        {t("role")} <SortIcon field="role" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("status")}
                        className="p-0 h-auto font-medium"
                      >
                        {t("status")} <SortIcon field="status" />
                      </Button>
                    </TableHead>
                    <TableHead>Kompaniya</TableHead>
                    <TableHead>Bo'lim</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("lastLogin")}
                        className="p-0 h-auto font-medium"
                      >
                        Oxirgi kirish <SortIcon field="lastLogin" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[80px]">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer group"
                      onClick={() => handleView(user)}
                    >
                      <TableCell className="font-mono text-sm">{user.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.fullName} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            {user.address && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {user.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.companyName ? (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {user.companyName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{user.department || "—"}</TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <span className="text-sm">{user.lastLogin}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Kirmagan</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(user);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ko'rish
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(user);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLocationHistory(user);
                              }}
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Joylashuvlar tarixi
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(user);
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredAndSortedUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Hech qanday foydalanuvchi topilmadi</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
            {filteredAndSortedUsers.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Hech qanday foydalanuvchi topilmadi</p>
              </div>
            )}
          </div>
        )}

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Foydalanuvchi ma'lumotlari</DialogTitle>
                  <DialogDescription className="text-sm">
                    Foydalanuvchi haqida to'liq ma'lumot
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <Separator />
            {selectedUser &&
              (() => {
                const apiUser = (selectedUser as any)._apiUser as ApiUser | undefined;
                return (
                  <div className="space-y-5 py-4">
                    {/* Profile header */}
                    <div className="flex items-center gap-5">
                      <Avatar className="h-20 w-20 ring-2 ring-border">
                        <AvatarImage src={selectedUser.avatar} alt={selectedUser.fullName} />
                        <AvatarFallback className="bg-primary/5">
                          <User className="h-8 w-8 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-semibold">{selectedUser.fullName}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                            {selectedUser.role}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(selectedUser.status)}>
                            {selectedUser.status}
                          </Badge>
                          {apiUser?.id && (
                            <span className="text-xs text-muted-foreground">#{apiUser.id}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personal info */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-semibold">
                            Shaxsiy ma'lumotlar
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Username</p>
                            <p className="text-sm font-medium">{apiUser?.username || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{selectedUser.email}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Telefon</p>
                            <p className="text-sm font-medium">{selectedUser.phone || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Manzil</p>
                            <p className="text-sm font-medium">{selectedUser.address || "—"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Account info */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-semibold">
                            Hisob ma'lumotlari
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Rol</p>
                            <p className="text-sm font-medium">{selectedUser.role}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Holat</p>
                            <p className="text-sm font-medium">{selectedUser.status}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Kompaniya</p>
                            <p className="text-sm font-medium">{selectedUser.companyName || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Bo'lim</p>
                            <p className="text-sm font-medium">{selectedUser.department || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Ro'yxatdan o'tgan</p>
                            <p className="text-sm font-medium">{selectedUser.createdAt}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">2FA</p>
                            <div className="flex items-center gap-2">
                              {selectedUser.twoFactorEnabled ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium">Yoqilgan</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  <span className="text-sm font-medium">O'chirilgan</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Manager info */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-semibold">Manager</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Manager ID</p>
                            <p className="text-sm font-medium">{apiUser?.manager_id ?? "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Manager nomi</p>
                            <p className="text-sm font-medium">
                              {apiUser?.manager
                                ? `${apiUser.manager.first_name} ${apiUser.manager.last_name}`
                                : "—"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Manager kompaniyasi</p>
                            <p className="text-sm font-medium">
                              {apiUser?.manager?.company_rel?.name || "—"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 1C Integration */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-semibold">1C integratsiyasi</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">1C ID</p>
                            <p className="text-sm font-medium">{apiUser?.user_1c_id ?? "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">1C Login</p>
                            <p className="text-sm font-medium">{apiUser?.user_1c_login || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">1C Password</p>
                            <p className="text-sm font-medium">
                              {apiUser?.user_1c_password ? "••••••••" : "—"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Permissions */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-semibold">Ruxsatnomalar</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.permissions.length === 0 ? (
                            <span className="text-sm text-muted-foreground">
                              Ruxsatnomalar mavjud emas
                            </span>
                          ) : selectedUser.permissions.includes("all") ? (
                            <Badge variant="destructive">Barcha ruxsatnomalar</Badge>
                          ) : (
                            selectedUser.permissions.map((perm) => {
                              const label = availablePermissions.find((p) => p.id === perm);
                              return label ? (
                                <Badge key={perm} variant="outline">
                                  {label.label}
                                </Badge>
                              ) : null;
                            })
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Yopish
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEdit(selectedUser!);
                }}
              >
                Tahrirlash
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit User Dialog */}
        <Dialog
          open={isAddDialogOpen || isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    {isEditDialogOpen
                      ? "Foydalanuvchini tahrirlash"
                      : "Yangi foydalanuvchi qo'shish"}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {isEditDialogOpen
                      ? "Foydalanuvchi ma'lumotlarini tahrirlang"
                      : "Yangi foydalanuvchi qo'shish uchun ma'lumotlarni kiriting"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <Separator />
            <div className="space-y-5 py-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Shaxsiy ma'lumotlar</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-medium">
                        Ism <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="To'liq ism"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-medium">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                          className="h-9 pl-8"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-medium">
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-medium">
                      Parol{!isEditDialogOpen && <span className="text-destructive"> *</span>}
                      {isEditDialogOpen && (
                        <span className="text-muted-foreground font-normal"> (ixtiyoriy)</span>
                      )}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password || ""}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={
                          isEditDialogOpen ? "Bo'sh qoldirsangiz o'zgarmaydi" : "Kamida 3 ta belgi"
                        }
                        className="h-9 pl-8 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formData.password && formData.password.length < 3 && (
                      <p className="text-xs text-destructive">
                        Parol kamida 3 ta belgidan iborat bo'lishi kerak
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Hisob ma'lumotlari</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-xs font-medium">
                        Rol
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="USER">USER</SelectItem>
                          <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                          <SelectItem value="MANAGER">MANAGER</SelectItem>
                          <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                          <SelectItem value="AGENT">AGENT</SelectItem>
                          <SelectItem value="DELIVERER">DELIVERER</SelectItem>
                          <SelectItem value="VENDOR_AGENT">VENDOR_AGENT</SelectItem>
                          <SelectItem value="CLIENT">CLIENT</SelectItem>
                          <SelectItem value="DEALER">DEALER</SelectItem>
                          <SelectItem value="FACTORY">FACTORY</SelectItem>
                          <SelectItem value="CEO">CEO</SelectItem>
                          <SelectItem value="FINANCIST">FINANCIST</SelectItem>
                          <SelectItem value="WAREHOUSE">WAREHOUSE</SelectItem>
                          <SelectItem value="SALESMAN">SALESMAN</SelectItem>
                          <SelectItem value="CASHIER">CASHIER</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="MARKETING">MARKETING</SelectItem>
                          <SelectItem value="EXTERNAL_SELLER">EXTERNAL_SELLER</SelectItem>
                          <SelectItem value="MERCHANDISER">MERCHANDISER</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-xs font-medium">
                        Holat
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => setFormData({ ...formData, status: v as UserStatus })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Faol">Faol</SelectItem>
                          <SelectItem value="Faol emas">Faol emas</SelectItem>
                          <SelectItem value="Kutilmoqda">Kutilmoqda</SelectItem>
                          <SelectItem value="Blokirovka">Blokirovka</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-xs font-medium">
                        Kompaniya
                      </Label>
                      <Select
                        value={formData.companyId?.toString() || "none"}
                        onValueChange={(v) => {
                          if (v === "none") {
                            setFormData({
                              ...formData,
                              companyId: null,
                              companyName: null,
                            });
                          } else {
                            const company = apiCompanies.find((c) => c.id === Number(v));
                            setFormData({
                              ...formData,
                              companyId: company ? company.id : null,
                              companyName: company ? company.name : null,
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Tanlanmagan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tanlanmagan</SelectItem>
                          {apiCompanies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-xs font-medium">
                        Bo'lim
                      </Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Bo'lim nomi"
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-medium">
                      Manzil
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Manzil"
                      className="h-9"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Qo'shimcha sozlamalar</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="photoUrl" className="text-xs font-medium">
                        Photo URL
                      </Label>
                      <Input
                        id="photoUrl"
                        value={formData.photoUrl || ""}
                        onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                        placeholder="https://example.com/photo.jpg"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="managerId" className="text-xs font-medium">
                        Manager
                      </Label>
                      <Select
                        value={formData.managerId?.toString() || "none"}
                        onValueChange={(v) => {
                          if (v === "none") {
                            setFormData({ ...formData, managerId: undefined, managerName: "" });
                          } else {
                            const mgr = managerOptions.find((m) => m.id === Number(v));
                            setFormData({
                              ...formData,
                              managerId: mgr ? mgr.id : undefined,
                              managerName: mgr ? `${mgr.first_name} ${mgr.last_name}` : "",
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Tanlanmagan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tanlanmagan</SelectItem>
                          {managerOptions.map((mgr) => (
                            <SelectItem key={mgr.id} value={mgr.id.toString()}>
                              {mgr.first_name} {mgr.last_name} [{mgr.user_type}]{" "}
                              {mgr.company_rel ? `(${mgr.company_rel.name})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">1C integratsiyasi</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user1cId" className="text-xs font-medium">
                          1C ID
                        </Label>
                        <Input
                          id="user1cId"
                          type="number"
                          value={formData.user1cId ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              user1cId: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user1cLogin" className="text-xs font-medium">
                          1C Login
                        </Label>
                        <Input
                          id="user1cLogin"
                          value={formData.user1cLogin || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, user1cLogin: e.target.value })
                          }
                          placeholder="1C login"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user1cPassword" className="text-xs font-medium">
                          1C Password
                        </Label>
                        <Input
                          id="user1cPassword"
                          type="password"
                          value={formData.user1cPassword || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, user1cPassword: e.target.value })
                          }
                          placeholder="1C parol"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                }}
              >
                Bekor qilish
              </Button>
              <Button onClick={handleSaveUser}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Foydalanuvchini o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham <strong>{selectedUser?.fullName}</strong> foydalanuvchisini
                o'chirmoqchimisiz?
                <br />
                <span className="text-red-600">Bu amalni qaytarib bo'lmaydi.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Location History Dialog */}
        <Dialog
          open={isLocationHistoryDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsLocationHistoryDialogOpen(false);
              setLocationHistoryUserId(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-2 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Joylashuvlar tarixi</DialogTitle>
                  <DialogDescription className="text-sm">
                    {selectedUser?.fullName} - foydalanuvchining joylashuvlar tarixi
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <Separator className="flex-shrink-0" />
            <div className="flex-1 overflow-y-auto py-4 min-h-0">
              {isLocationHistoryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : locationHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Joylashuvlar tarixi mavjud emas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[60px]">ID</TableHead>
                      <TableHead>Vaqt</TableHead>
                      <TableHead>Kenglik</TableHead>
                      <TableHead>Uzunlik</TableHead>
                      <TableHead>Aniqlik</TableHead>
                      <TableHead>Tezlik</TableHead>
                      <TableHead>Yo'nalish</TableHead>
                      <TableHead>Balandlik</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locationHistory.map((loc: ApiLocationHistory) => (
                      <TableRow key={loc.id}>
                        <TableCell className="font-mono text-sm">{loc.id}</TableCell>
                        <TableCell className="text-sm">
                          {loc.created_at ? new Date(loc.created_at).toLocaleString("uz-UZ") : "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {loc.latitude?.toFixed(6) || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {loc.longitude?.toFixed(6) || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {loc.accuracy !== null && loc.accuracy !== undefined
                            ? `${loc.accuracy} m`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {loc.speed !== null && loc.speed !== undefined ? `${loc.speed} m/s` : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {loc.bearing !== null && loc.bearing !== undefined
                            ? `${loc.bearing}°`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {loc.altitude !== null && loc.altitude !== undefined
                            ? `${loc.altitude} m`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <DialogFooter className="flex-shrink-0 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLocationHistoryDialogOpen(false);
                  setLocationHistoryUserId(null);
                }}
              >
                Yopish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
}
