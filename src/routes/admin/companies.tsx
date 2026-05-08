import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, MoreVertical, Edit, Trash2, Key, Eye, Search, Building } from "lucide-react";

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

function AdminCompaniesPage() {
  const { t } = useSettings();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies(),
  });

  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredCompanies = companies.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.inn && c.inn.toLowerCase().includes(q)) ||
      (c.base_url && c.base_url.toLowerCase().includes(q))
    );
  });

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

  return (
    <AdminGuard>
      <AdminLayout title={t("adminCompanies")} subtitle={t("adminCompaniesSubtitle")}>
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish (nomi, INN, URL)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {t("add")}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Jami: {filteredCompanies.length} ta kompaniya
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("id")}</TableHead>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>INN</TableHead>
                  <TableHead>Base URL</TableHead>
                  <TableHead>Asl Belgi Token</TableHead>
                  <TableHead className="w-[80px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} className="group">
                    <TableCell className="font-mono text-sm">{company.id}</TableCell>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.inn || "—"}</TableCell>
                    <TableCell>{company.base_url || "—"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{company.asl_belgi_token || "—"}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleView(company)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ko'rish
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(company)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleKeys(company)}>
                            <Key className="h-4 w-4 mr-2" />
                            Xavfsizlik kalitlari
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(company)}
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
              <div className="text-center py-12 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Kompaniyalar topilmadi</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Kompaniya ma'lumotlari</DialogTitle>
              <DialogDescription>Kompaniya haqida to'liq ma'lumot</DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-medium">{selectedCompany.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nomi</p>
                    <p className="font-medium">{selectedCompany.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">INN</p>
                    <p className="font-medium">{selectedCompany.inn || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Base URL</p>
                    <p className="font-medium break-all">{selectedCompany.base_url || "—"}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-sm text-muted-foreground">Asl Belgi Token</p>
                    <p className="font-medium break-all text-sm">{selectedCompany.asl_belgi_token || "—"}</p>
                  </div>
                </div>
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
