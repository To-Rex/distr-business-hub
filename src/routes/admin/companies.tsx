import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  fetchSecurityKeys,
  createSecurityKey,
  deleteSecurityKey,
  createBranch,
  updateBranch,
  deleteBranch,
  type ApiCompany,
  type ApiBranch,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
  type CreateBranchPayload,
} from "@/lib/admin-api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  Eye,
  Search,
  Building2,
  LayoutGrid,
  List,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Globe,
  Hash,
  Copy,
  GitBranch,
  Pencil,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/admin/companies")({
  component: AdminCompaniesPage,
});

type CompanyFormData = {
  name: string;
  inn: string;
  base_url: string;
  asl_belgi_token: string;
};

const emptyForm: CompanyFormData = {
  name: "",
  inn: "",
  base_url: "",
  asl_belgi_token: "",
};

type SortField = "id" | "name" | "inn" | "base_url";
type SortDir = "asc" | "desc";
type ViewMode = "table" | "grid";

function SortableHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  return (
    <button
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
    >
      {label}
      {sortField === field ? (
        sortDir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </button>
  );
}

function CompanyCard({
  company,
  onEdit,
  onDelete,
  onView,
  onKeys,
  t,
}: {
  company: ApiCompany;
  onEdit: (c: ApiCompany) => void;
  onDelete: (c: ApiCompany) => void;
  onView: (c: ApiCompany) => void;
  onKeys: (c: ApiCompany) => void;
  t: (k: any) => string;
}) {
  return (
    <div className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{company.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">ID: {company.id}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onView(company)}>
              <Eye className="h-4 w-4 mr-2" />
              {t("adminCompanyView")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(company)}>
              <Edit className="h-4 w-4 mr-2" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onKeys(company)}>
              <Key className="h-4 w-4 mr-2" />
              {t("adminCompanyKeys")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(company)} className="text-red-600 focus:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              {t("adminCompanyDelete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">INN:</span>
          <span className={cn("font-mono text-xs", !company.inn && "text-muted-foreground/50 italic")}>
            {company.inn || t("adminCompanyNotSet")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className={cn("truncate text-xs", !company.base_url && "text-muted-foreground/50 italic")}>
            {company.base_url || t("notAvailable")}
          </span>
        </div>
        <div className="pt-2">
          <p className="text-xs text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            {t("adminCompanyBranches")}
          </p>
          {company.branches && company.branches.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {company.branches.map((branch) => (
                <span
                  key={branch.id}
                  className="inline-flex items-center gap-1 text-xs bg-secondary/50 px-2 py-0.5 rounded-full"
                >
                  {branch.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">{t("notAvailable")}</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={() => onView(company)}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          {t("adminCompanyView")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={() => onEdit(company)}
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          {t("edit")}
        </Button>
      </div>
    </div>
  );
}

function AdminCompaniesPage() {
  const { t } = useSettings();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies(),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) setViewMode("grid");
  }, [isMobile]);

  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedCompany, setSelectedCompany] = useState<ApiCompany | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isKeysDialogOpen, setIsKeysDialogOpen] = useState(false);
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [formData, setFormData] = useState<CompanyFormData>(emptyForm);
  const [isAddBranchDialogOpen, setIsAddBranchDialogOpen] = useState(false);
  const [isEditBranchDialogOpen, setIsEditBranchDialogOpen] = useState(false);
  const [isDeleteBranchDialogOpen, setIsDeleteBranchDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<ApiBranch | null>(null);
  const [branchName, setBranchName] = useState("");

  const { data: securityKeys = [] } = useQuery({
    queryKey: ["admin-security-keys", selectedCompany?.id],
    queryFn: () => fetchSecurityKeys(selectedCompany!.id),
    enabled: !!selectedCompany && isKeysDialogOpen,
  });

  const filteredCompanies = useMemo(() => {
    let result = companies.filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.inn && c.inn.toLowerCase().includes(q)) ||
        (c.base_url && c.base_url.toLowerCase().includes(q)) ||
        (c.branches && c.branches.some((b) => b.name.toLowerCase().includes(q)))
      );
    });

    result.sort((a, b) => {
      let cmp = 0;
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      if (sortField === "id") {
        cmp = a.id - b.id;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), "uz");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [companies, searchQuery, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success(t("adminCompanyCreated"));
      setIsAddDialogOpen(false);
      setFormData(emptyForm);
    },
    onError: (err: any) => toast.error(err.message || t("adminErrorOccurred")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompanyPayload }) => updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success(t("adminCompanyUpdated"));
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      setFormData(emptyForm);
    },
    onError: (err: any) => toast.error(err.message || t("adminErrorOccurred")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success(t("adminCompanyDeleted"));
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
    },
    onError: (err: any) => toast.error(err.message || t("adminErrorOccurred")),
  });

  const createKeyMutation = useMutation({
    mutationFn: ({ companyId, data }: { companyId: number; data: { key: string; company_id: number } }) =>
      createSecurityKey(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-security-keys", selectedCompany?.id] });
      toast.success(t("adminKeyAdded"));
      setIsAddKeyDialogOpen(false);
      setNewKeyName("");
    },
    onError: (err: any) => toast.error(err.message || t("adminErrorOccurred")),
  });

  const deleteKeyMutation = useMutation({
    mutationFn: deleteSecurityKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-security-keys", selectedCompany?.id] });
      toast.success(t("adminKeyDeleted"));
    },
    onError: (err: any) => toast.error(err.message || t("adminErrorOccurred")),
  });

  const createBranchMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success(t("adminBranchAdded"));
      setIsAddBranchDialogOpen(false);
      setBranchName("");
    },
    onError: (err: any) => toast.error(err.message || t("adminErrorOccurred")),
  });

  const updateBranchMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; company_id?: number } }) =>
      updateBranch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success(t("adminBranchUpdated"));
      setIsEditBranchDialogOpen(false);
      setSelectedBranch(null);
      setBranchName("");
    },
    onError: (err: any) => toast.error(err.message || t("adminErrorOccurred")),
  });

  const deleteBranchMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success(t("adminBranchDeleted"));
      setIsDeleteBranchDialogOpen(false);
      setSelectedBranch(null);
    },
    onError: (err: any) => toast.error(err.message || t("adminErrorOccurred")),
  });

  const handleAdd = () => {
    setFormData(emptyForm);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (company: ApiCompany) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      inn: company.inn || "",
      base_url: company.base_url || "",
      asl_belgi_token: company.asl_belgi_token || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (company: ApiCompany) => {
    setSelectedCompany(company);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (company: ApiCompany) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleKeys = (company: ApiCompany) => {
    setSelectedCompany(company);
    setIsKeysDialogOpen(true);
  };

  const handleAddBranch = () => {
    setBranchName("");
    setIsAddBranchDialogOpen(true);
  };

  const handleEditBranch = (branch: ApiBranch) => {
    setSelectedBranch(branch);
    setBranchName(branch.name);
    setIsEditBranchDialogOpen(true);
  };

  const handleDeleteBranch = (branch: ApiBranch) => {
    setSelectedBranch(branch);
    setIsDeleteBranchDialogOpen(true);
  };

  const confirmAddBranch = () => {
    if (!branchName.trim() || !selectedCompany) {
      toast.error(t("adminBranchNameRequired") || "Filial nomi majburiy");
      return;
    }
    createBranchMutation.mutate({ name: branchName, company_id: selectedCompany.id });
  };

  const confirmEditBranch = () => {
    if (!branchName.trim() || !selectedBranch) {
      toast.error(t("adminBranchNameRequired") || "Filial nomi majburiy");
      return;
    }
    updateBranchMutation.mutate({ id: selectedBranch.id, data: { name: branchName, company_id: selectedBranch.company_id } });
  };

  const confirmDeleteBranch = () => {
    if (selectedBranch) {
      deleteBranchMutation.mutate(selectedBranch.id);
    }
  };

  const handleSaveCreate = () => {
    if (!formData.name.trim()) {
      toast.error(t("adminCompanyNameRequired"));
      return;
    }
    const payload: CreateCompanyPayload = { name: formData.name };
    if (formData.inn) payload.inn = formData.inn;
    if (formData.base_url) payload.base_url = formData.base_url;
    if (formData.asl_belgi_token) payload.asl_belgi_token = formData.asl_belgi_token;
    createMutation.mutate(payload);
  };

  const handleSaveEdit = () => {
    if (!selectedCompany) return;
    const payload: UpdateCompanyPayload = {};
    if (formData.name) payload.name = formData.name;
    if (formData.inn) payload.inn = formData.inn;
    if (formData.base_url) payload.base_url = formData.base_url;
    if (formData.asl_belgi_token) payload.asl_belgi_token = formData.asl_belgi_token;
    updateMutation.mutate({ id: selectedCompany.id, data: payload });
  };

  const handleAddKey = () => {
    if (!selectedCompany || !newKeyName.trim()) {
      toast.error(t("adminEnterKeyName"));
      return;
    }
    createKeyMutation.mutate({
      companyId: selectedCompany.id,
      data: { key: newKeyName, company_id: selectedCompany.id },
    });
  };

  const confirmDelete = () => {
    if (selectedCompany) {
      deleteMutation.mutate(selectedCompany.id);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("adminCopied"));
  };

  return (
    <AdminGuard>
      <AdminLayout title={t("adminCompanies")} subtitle={t("adminCompaniesSubtitle")}>
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("adminSearchCompanies")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-card"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground tabular-nums">
              {t("adminItemsCount").replace("{n}", String(filteredCompanies.length))}
            </div>
            <div className="h-4 w-px bg-border" />
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => { if (v) setViewMode(v as ViewMode); }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="table" aria-label={t("adminTableView")}>
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label={t("adminGridView")}>
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button size="sm" onClick={handleAdd} className="h-8">
              <Plus className="h-4 w-4 mr-1.5" />
              {t("add")}
            </Button>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="py-3">
                    <SortableHeader label={t("id")} field="id" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="py-3">
                    <SortableHeader label={t("adminCompanyName")} field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="py-3">
                    <SortableHeader label="INN" field="inn" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="py-3">
                    <SortableHeader label={t("adminBaseUrl")} field="base_url" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="py-3 hidden lg:table-cell">{t("adminToken")}</TableHead>
                  <TableHead className="py-3 hidden md:table-cell w-[160px]">{t("adminCompanyBranches")}</TableHead>
                  <TableHead className="w-[60px] py-3" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="group cursor-pointer transition-colors"
                    onClick={() => handleView(company)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">{company.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{company.inn || "—"}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate text-muted-foreground">{company.base_url || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {company.asl_belgi_token ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md max-w-[160px] truncate">
                          {company.asl_belgi_token.slice(0, 12)}…
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {company.branches && company.branches.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {company.branches.map((branch) => (
                            <span
                              key={branch.id}
                              className="inline-flex items-center text-xs bg-secondary/50 px-1.5 py-0.5 rounded-full"
                            >
                              {branch.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(company); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("adminCompanyView")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(company); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleKeys(company); }}>
                            <Key className="h-4 w-4 mr-2" />
                            {t("securityKeys")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleDelete(company); }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("adminCompanyDelete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCompanies.length === 0 && !isLoading && (
              <div className="text-center py-16 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t("adminCompaniesNotFound")}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {filteredCompanies.length === 0 && !isLoading ? (
              <div className="text-center py-16 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t("adminCompaniesNotFound")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onKeys={handleKeys}
                    t={t}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                {t("adminCompanyDetails")}
              </DialogTitle>
              <DialogDescription>{t("adminCompanyDetailsDesc")}</DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{t("id")}</p>
                    <p className="font-mono text-sm font-medium">{selectedCompany.id}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{t("adminCompanyName")}</p>
                    <p className="text-sm font-medium">{selectedCompany.name}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">INN</p>
                    <p className="font-mono text-sm font-medium">{selectedCompany.inn || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{t("adminBaseUrl")}</p>
                    <p className="text-sm font-medium break-all">{selectedCompany.base_url || "—"}</p>
                  </div>
                </div>
                {selectedCompany.asl_belgi_token && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{t("adminAslBelgiToken")}</p>
                    <div className="flex items-start gap-2">
                      <p className="font-mono text-sm break-all flex-1">{selectedCompany.asl_belgi_token}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => copyToClipboard(selectedCompany.asl_belgi_token)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {t("adminCompanyBranches")}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={handleAddBranch}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {selectedCompany.branches && selectedCompany.branches.length > 0 ? (
                    <div className="space-y-1.5 mt-1">
                      {selectedCompany.branches.map((branch) => (
                        <div
                          key={branch.id}
                          className="flex items-center justify-between rounded-md bg-background/50 px-2.5 py-1.5"
                        >
                          <span className="text-xs font-medium">{branch.name}</span>
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEditBranch(branch)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteBranch(branch)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground/60 italic">{t("notAvailable")}</span>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                {t("adminClose")}
              </Button>
              <Button onClick={() => { setIsViewDialogOpen(false); handleEdit(selectedCompany!); }}>
                {t("edit")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddBranchDialogOpen} onOpenChange={(open) => { if (!open) { setIsAddBranchDialogOpen(false); setBranchName(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("adminAddBranch")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="branch-name">{t("adminBranchName")}</Label>
                <Input
                  id="branch-name"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder={t("adminBranchNamePlaceholder")}
                  onKeyDown={(e) => { if (e.key === "Enter") confirmAddBranch(); }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddBranchDialogOpen(false); setBranchName(""); }}>
                {t("cancel")}
              </Button>
              <Button onClick={confirmAddBranch}>{t("add")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditBranchDialogOpen} onOpenChange={(open) => { if (!open) { setIsEditBranchDialogOpen(false); setSelectedBranch(null); setBranchName(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("adminEditBranch")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-branch-name">{t("adminBranchName")}</Label>
                <Input
                  id="edit-branch-name"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder={t("adminBranchNamePlaceholder")}
                  onKeyDown={(e) => { if (e.key === "Enter") confirmEditBranch(); }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditBranchDialogOpen(false); setSelectedBranch(null); setBranchName(""); }}>
                {t("cancel")}
              </Button>
              <Button onClick={confirmEditBranch}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteBranchDialogOpen} onOpenChange={(open) => { if (!open) { setIsDeleteBranchDialogOpen(false); setSelectedBranch(null); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("adminDeleteBranch")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("adminBranchDeleteConfirm").replace("{name}", selectedBranch?.name || "")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteBranch} className="bg-red-600 hover:bg-red-700">
                {t("adminCompanyDelete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); setFormData(emptyForm); }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditDialogOpen ? t("adminCompanyEdit") : t("adminCompanyAdd")}</DialogTitle>
              <DialogDescription>
                {isEditDialogOpen ? t("adminCompanyEditDesc") : t("adminCompanyAddDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">{t("adminCompanyNameLabel")}</Label>
                <Input
                  id="company-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("adminCompanyNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-inn">INN</Label>
                <Input
                  id="company-inn"
                  value={formData.inn}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  placeholder={t("adminInnNumber")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-url">{t("adminBaseUrl")}</Label>
                <Input
                  id="company-url"
                  value={formData.base_url}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  placeholder="https://api.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-token">{t("adminAslBelgiToken")}</Label>
                <Input
                  id="company-token"
                  value={formData.asl_belgi_token}
                  onChange={(e) => setFormData({ ...formData, asl_belgi_token: e.target.value })}
                  placeholder={t("adminToken")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); setFormData(emptyForm); }}>
                {t("cancel")}
              </Button>
              <Button onClick={isEditDialogOpen ? handleSaveEdit : handleSaveCreate}>
                {t("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("adminDeleteCompany")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("adminDeleteConfirm").replace("{name}", selectedCompany?.name || "")}
                <br />
                <span className="text-red-600">{t("adminIrreversible")}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                {t("adminCompanyDelete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isKeysDialogOpen} onOpenChange={(open) => { setIsKeysDialogOpen(open); if (!open) setSelectedCompany(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("securityKeys")} — {selectedCompany?.name}</DialogTitle>
              <DialogDescription>{t("adminManageKeys")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setIsAddKeyDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addKey")}
                </Button>
              </div>
              {securityKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>{t("adminKeysNotFound")}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("id")}</TableHead>
                      <TableHead>{t("keyName")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityKeys.map((sk) => (
                      <TableRow key={sk.id}>
                        <TableCell className="font-mono text-sm">{sk.id}</TableCell>
                        <TableCell className="font-mono text-sm max-w-[300px] truncate">{sk.key}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteKeyMutation.mutate(sk.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsKeysDialogOpen(false)}>{t("adminClose")}</Button>
            </DialogFooter>
          </DialogContent>

          <Dialog open={isAddKeyDialogOpen} onOpenChange={(open) => { setIsAddKeyDialogOpen(open); if (!open) setNewKeyName(""); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("adminNewKey")}</DialogTitle>
                <DialogDescription>{t("adminNewKeyDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-value">{t("adminKeyDetails")}</Label>
                  <Input
                    id="key-value"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder={t("adminKeyDetailsPlaceholder")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddKeyDialogOpen(false)}>{t("cancel")}</Button>
                <Button onClick={handleAddKey}>{t("create")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
}
