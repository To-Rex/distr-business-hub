import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
export type UserRole =
  | "Foydalanuvchi"
  | "Super Admin"
  | "Admin"
  | "Menejer"
  | "Supervizor"
  | "Agent"
  | "Yetkazib beruvchi"
  | "Vendor Agent"
  | "Klient"
  | "Dealer"
  | "Fabrika"
  | "Bosh direktor"
  | "Buhgalter"
  | "Ombor"
  | "Sotuvchi"
  | "Kassir"
  | "HR"
  | "Marketing"
  | "Tashqi sotuvchi"
  | "Merchandiser";
export type UserStatus = "Faol" | "Kutilmoqda" | "Blokirovka";

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
import { fetchUsers, createUser, updateUser, deleteUser, fetchCompanies, getUserFullName, getUserTypeLabel, getUserStatusLabel, type ApiUser, type ApiUserType, type ApiUserStatus } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
} from "lucide-react";

type SortField = "id" | "fullName" | "email" | "role" | "status" | "companyId" | "lastLogin" | "createdAt";
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
    return apiUsers.map(u => ({
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
      _apiUser: u
    }));
  }, [apiUsers]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    fullName: "",
    email: "",
    phone: "",
    role: "Agent",
    status: "Kutilmoqda",
    companyId: null,
    companyName: null,
    department: "",
    address: "",
    twoFactorEnabled: false,
    permissions: [],
  });

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
          (user.department && user.department.toLowerCase().includes(query))
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
  }, [users, searchQuery, sortField, sortOrder, companyFilter, roleFilter, statusFilter]);

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
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      companyId: user.companyId,
      companyName: user.companyName,
      department: user.department || "",
      address: user.address || "",
      twoFactorEnabled: user.twoFactorEnabled,
      permissions: user.permissions,
    });
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
      role: "Agent",
      status: "Kutilmoqda",
      companyId: null,
      companyName: null,
      department: "",
      address: "",
      twoFactorEnabled: false,
      permissions: [],
    });
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
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Foydalanuvchi muvaffaqiyatli tahrirlandi");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  });

  const handleSaveUser = () => {
    if (!formData.fullName || !formData.email) {
      toast.error("Ism va email majburiy maydonlar");
      return;
    }

    // Map UI role to API user_type
    const roleMap: Record<string, ApiUserType> = {
      "Foydalanuvchi": "USER",
      "Super Admin": "SUPERADMIN",
      "Admin": "ADMIN",
      "Menejer": "MANAGER",
      "Supervizor": "SUPERVISOR",
      "Agent": "AGENT",
      "Yetkazib beruvchi": "DELIVERER",
      "Vendor Agent": "VENDOR_AGENT",
      "Klient": "CLIENT",
      "Dealer": "DEALER",
      "Fabrika": "FACTORY",
      "Bosh direktor": "CEO",
      "Buhgalter": "FINANCIST",
      "Ombor": "WAREHOUSE",
      "Sotuvchi": "SALESMAN",
      "Kassir": "CASHIER",
      "HR": "HR",
      "Marketing": "MARKETING",
      "Tashqi sotuvchi": "EXTERNAL_SELLER",
      "Merchandiser": "MERCHANDISER",
    };
    
    // Map UI status to API user_status
    const statusMap: Record<string, ApiUserStatus> = {
      "Faol": "ACTIVE",
      "Kutilmoqda": "ACTIVE",
      "Blokirovka": "BLOCKED"
    };

    const userType = roleMap[formData.role || "Agent"] || "USER";
    const userStatus = statusMap[formData.status || "Faol"] || "ACTIVE";

    if (selectedUser) {
      // Edit
      updateMutation.mutate({
        id: selectedUser.id,
        data: {
          username: formData.email!.split('@')[0],
          email: formData.email,
          first_name: formData.fullName!.split(' ')[0] || '',
          last_name: formData.fullName!.split(' ').slice(1).join(' ') || '',
          phone_number: formData.phone,
          user_type: userType,
          user_status: userStatus,
          company_id: formData.companyId || undefined,
        }
      });
    } else {
      // Create
      createMutation.mutate({
        username: formData.email!.split('@')[0] || `user_${Date.now()}`,
        password: "password123", // default password
        email: formData.email,
        first_name: formData.fullName!.split(' ')[0] || '',
        last_name: formData.fullName!.split(' ').slice(1).join(' ') || '',
        phone_number: formData.phone,
        user_type: userType,
      });
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...(prev.permissions || []), permissionId]
        : (prev.permissions || []).filter((p) => p !== permissionId),
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
      case "Kutilmoqda":
        return "secondary";
      case "Blokirovka":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "Super Admin":
        return "destructive";
      case "Admin":
        return "default";
      case "Menejer":
        return "outline";
      case "Bosh direktor":
        return "outline";
      case "Supervizor":
        return "outline";
      case "Agent":
        return "secondary";
      case "Yetkazib beruvchi":
        return "secondary";
      default:
        return "secondary";
    }
  };

  // User Card Component for card view
  const UserCard = ({ user }: { user: AdminUser }) => (
    <Card className="hover:shadow-md transition-shadow">
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
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Amallar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleView(user)}>
                <Eye className="h-4 w-4 mr-2" />
                Ko'rish
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                <Edit className="h-4 w-4 mr-2" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(user)}
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
                <SelectItem value="Foydalanuvchi">Foydalanuvchi</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Menejer">Menejer</SelectItem>
                <SelectItem value="Supervizor">Supervizor</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
                <SelectItem value="Yetkazib beruvchi">Yetkazib beruvchi</SelectItem>
                <SelectItem value="Vendor Agent">Vendor Agent</SelectItem>
                <SelectItem value="Klient">Klient</SelectItem>
                <SelectItem value="Dealer">Dealer</SelectItem>
                <SelectItem value="Fabrika">Fabrika</SelectItem>
                <SelectItem value="Bosh direktor">Bosh direktor</SelectItem>
                <SelectItem value="Buhgalter">Buhgalter</SelectItem>
                <SelectItem value="Ombor">Ombor</SelectItem>
                <SelectItem value="Sotuvchi">Sotuvchi</SelectItem>
                <SelectItem value="Kassir">Kassir</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Tashqi sotuvchi">Tashqi sotuvchi</SelectItem>
                <SelectItem value="Merchandiser">Merchandiser</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Holat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                <SelectItem value="Faol">Faol</SelectItem>
                <SelectItem value="Kutilmoqda">Kutilmoqda</SelectItem>
                <SelectItem value="Blokirovka">Blokirovka</SelectItem>
              </SelectContent>
            </Select>

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
                    <TableRow key={user.id} className="group">
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
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ko'rish
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(user)}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Foydalanuvchi ma'lumotlari</DialogTitle>
              <DialogDescription>
                Foydalanuvchi haqida to'liq ma'lumot
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.fullName} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.fullName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                        {selectedUser.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Kompaniya</p>
                    <p className="font-medium">{selectedUser.companyName || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bo'lim</p>
                    <p className="font-medium">{selectedUser.department || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Manzil</p>
                    <p className="font-medium">{selectedUser.address || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ro'yxatdan o'tgan</p>
                    <p className="font-medium">{selectedUser.createdAt}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Oxirgi kirish</p>
                    <p className="font-medium">{selectedUser.lastLogin || "Kirmagan"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">2FA</p>
                    <div className="flex items-center gap-2">
                      {selectedUser.twoFactorEnabled ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Yoqilgan</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="font-medium">O'chirilgan</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Ruxsatnomalar</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.permissions.includes("all") ? (
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
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Yopish
              </Button>
              <Button onClick={() => { setIsViewDialogOpen(false); handleEdit(selectedUser!); }}>
                Tahrirlash
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit User Dialog */}
        <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditDialogOpen ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi qo'shish"}
              </DialogTitle>
              <DialogDescription>
                {isEditDialogOpen
                  ? "Foydalanuvchi ma'lumotlarini tahrirlang"
                  : "Yangi foydalanuvchi qo'shish uchun ma'lumotlarni kiriting"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ism *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="To'liq ism"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Foydalanuvchi">Foydalanuvchi</SelectItem>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Menejer">Menejer</SelectItem>
                      <SelectItem value="Supervizor">Supervizor</SelectItem>
                      <SelectItem value="Agent">Agent</SelectItem>
                      <SelectItem value="Yetkazib beruvchi">Yetkazib beruvchi</SelectItem>
                      <SelectItem value="Vendor Agent">Vendor Agent</SelectItem>
                      <SelectItem value="Klient">Klient</SelectItem>
                      <SelectItem value="Dealer">Dealer</SelectItem>
                      <SelectItem value="Fabrika">Fabrika</SelectItem>
                      <SelectItem value="Bosh direktor">Bosh direktor</SelectItem>
                      <SelectItem value="Buhgalter">Buhgalter</SelectItem>
                      <SelectItem value="Ombor">Ombor</SelectItem>
                      <SelectItem value="Sotuvchi">Sotuvchi</SelectItem>
                      <SelectItem value="Kassir">Kassir</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Tashqi sotuvchi">Tashqi sotuvchi</SelectItem>
                      <SelectItem value="Merchandiser">Merchandiser</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Holat</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as UserStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Faol">Faol</SelectItem>
                      <SelectItem value="Kutilmoqda">Kutilmoqda</SelectItem>
                      <SelectItem value="Blokirovka">Blokirovka</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Kompaniya</Label>
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
                    <SelectTrigger>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Bo'lim</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Bo'lim nomi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Manzil</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Manzil"
                  />
                </div>
              </div>

              {isEditDialogOpen && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="twoFactor"
                    checked={formData.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, twoFactorEnabled: checked as boolean })
                    }
                  />
                  <Label htmlFor="twoFactor">Ikki bosqichli autentifikatsiya (2FA)</Label>
                </div>
              )}

              <div className="space-y-2">
                <Label>Ruxsatnomalar</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${perm.id}`}
                        checked={formData.permissions?.includes(perm.id)}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(perm.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`perm-${perm.id}`} className="text-sm font-normal">
                        {perm.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
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
              <Button onClick={handleSaveUser}>
                {t("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Foydalanuvchini o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham <strong>{selectedUser?.fullName}</strong> foydalanuvchisini o'chirmoqchimisiz?
                <br />
                <span className="text-red-600">Bu amalni qaytarib bo'lmaydi.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminGuard>
  );
}