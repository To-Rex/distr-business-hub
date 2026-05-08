import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
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
  type ApiCompany,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
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
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

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
}: {
  company: ApiCompany;
  onEdit: (c: ApiCompany) => void;
  onDelete: (c: ApiCompany) => void;
  onView: (c: ApiCompany) => void;
  onKeys: (c: ApiCompany) => void;
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
              Ko'rish
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(company)}>
              <Edit className="h-4 w-4 mr-2" />
              Tahrirlash
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onKeys(company)}>
              <Key className="h-4 w-4 mr-2" />
              Kalitlar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(company)} className="text-red-600 focus:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              O'chirish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 space-y-2">
        {company.inn && (
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">INN:</span>
            <span className="font-mono text-xs">{company.inn}</span>
          </div>
        )}
        {company.base_url && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate text-xs text-muted-foreground">{company.base_url}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={() => onView(company)}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          Ko'rish
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={() => onEdit(company)}
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Tahrirlash
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
  const [viewMode, setViewMode] = useState<ViewMode>("table");
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
        (c.base_url && c.base_url.toLowerCase().includes(q))
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
      toast.success("Kompaniya muvaffaqiyatli yaratildi");
      setIsAddDialogOpen(false);
      setFormData(emptyForm);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompanyPayload }) => updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Kompaniya muvaffaqiyatli yangilandi");
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      setFormData(emptyForm);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Kompaniya muvaffaqiyatli o'chirildi");
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const createKeyMutation = useMutation({
    mutationFn: ({ companyId, data }: { companyId: number; data: { key: string; company_id: number } }) =>
      createSecurityKey(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-security-keys", selectedCompany?.id] });
      toast.success("Xavfsizlik kaliti qo'shildi");
      setIsAddKeyDialogOpen(false);
      setNewKeyName("");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const deleteKeyMutation = useMutation({
    mutationFn: deleteSecurityKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-security-keys", selectedCompany?.id] });
      toast.success("Xavfsizlik kaliti o'chirildi");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
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

  const handleSaveCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Kompaniya nomi majburiy");
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
      toast.error("Kalit nomini kiriting");
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
    toast.success("Nusxalandi");
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
              placeholder="Qidirish (nomi, INN, URL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-card"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground tabular-nums">
              {filteredCompanies.length} ta
            </div>
            <div className="h-4 w-px bg-border" />
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => { if (v) setViewMode(v as ViewMode); }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="table" aria-label="Jadval ko'rinishi">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Karta ko'rinishi">
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
                    <SortableHeader label="ID" field="id" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="py-3">
                    <SortableHeader label="Nomi" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="py-3">
                    <SortableHeader label="INN" field="inn" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="py-3">
                    <SortableHeader label="Base URL" field="base_url" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="py-3 hidden lg:table-cell">Token</TableHead>
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
                            Ko'rish
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(company); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleKeys(company); }}>
                            <Key className="h-4 w-4 mr-2" />
                            Xavfsizlik kalitlari
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleDelete(company); }}
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
            {filteredCompanies.length === 0 && !isLoading && (
              <div className="text-center py-16 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Kompaniyalar topilmadi</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {filteredCompanies.length === 0 && !isLoading ? (
              <div className="text-center py-16 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Kompaniyalar topilmadi</p>
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
                Kompaniya ma'lumotlari
              </DialogTitle>
              <DialogDescription>Kompaniya haqida to'liq ma'lumot</DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">ID</p>
                    <p className="font-mono text-sm font-medium">{selectedCompany.id}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Nomi</p>
                    <p className="text-sm font-medium">{selectedCompany.name}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">INN</p>
                    <p className="font-mono text-sm font-medium">{selectedCompany.inn || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Base URL</p>
                    <p className="text-sm font-medium break-all">{selectedCompany.base_url || "—"}</p>
                  </div>
                </div>
                {selectedCompany.asl_belgi_token && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Asl Belgi Token</p>
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
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Yopish
              </Button>
              <Button onClick={() => { setIsViewDialogOpen(false); handleEdit(selectedCompany!); }}>
                Tahrirlash
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); setFormData(emptyForm); }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditDialogOpen ? "Kompaniyani tahrirlash" : "Yangi kompaniya qo'shish"}</DialogTitle>
              <DialogDescription>
                {isEditDialogOpen ? "Kompaniya ma'lumotlarini tahrirlang" : "Yangi kompaniya qo'shish uchun ma'lumotlarni kiriting"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nomi *</Label>
                <Input
                  id="company-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kompaniya nomi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-inn">INN</Label>
                <Input
                  id="company-inn"
                  value={formData.inn}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  placeholder="INN raqami"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-url">Base URL</Label>
                <Input
                  id="company-url"
                  value={formData.base_url}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  placeholder="https://api.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-token">Asl Belgi Token</Label>
                <Input
                  id="company-token"
                  value={formData.asl_belgi_token}
                  onChange={(e) => setFormData({ ...formData, asl_belgi_token: e.target.value })}
                  placeholder="Token"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); setFormData(emptyForm); }}>
                Bekor qilish
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
              <AlertDialogTitle>Kompaniyani o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham <strong>{selectedCompany?.name}</strong> kompaniyasini o'chirmoqchimisiz?
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

        <Dialog open={isKeysDialogOpen} onOpenChange={(open) => { setIsKeysDialogOpen(open); if (!open) setSelectedCompany(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Xavfsizlik kalitlari — {selectedCompany?.name}</DialogTitle>
              <DialogDescription>Kompaniya xavfsizlik kalitlarini boshqarish</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setIsAddKeyDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Kalit qo'shish
                </Button>
              </div>
              {securityKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Xavfsizlik kalitlari topilmadi</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Kalit</TableHead>
                      <TableHead>Amallar</TableHead>
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
              <Button variant="outline" onClick={() => setIsKeysDialogOpen(false)}>Yopish</Button>
            </DialogFooter>
          </DialogContent>

          <Dialog open={isAddKeyDialogOpen} onOpenChange={(open) => { setIsAddKeyDialogOpen(open); if (!open) setNewKeyName(""); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi xavfsizlik kaliti</DialogTitle>
                <DialogDescription>Kompaniya uchun yangi kalit yarating</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-value">Kalit qiymati</Label>
                  <Input
                    id="key-value"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Kalit qiymatini kiriting"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddKeyDialogOpen(false)}>Bekor qilish</Button>
                <Button onClick={handleAddKey}>{t("create")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
}
