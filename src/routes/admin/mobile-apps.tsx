import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import {
  fetchApps,
  createApp,
  updateApp,
  deleteApp,
  fetchAppVersions,
  createVersion,
  updateVersion,
  deleteVersion,
  uploadApk,
  type ApiApp,
  type ApiAppVersion,
  type CreateAppPayload,
  type CreateVersionPayload,
} from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings } from "@/lib/settings";
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
import { toast } from "sonner";
import {
  Smartphone,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Search,
  Upload,
  ChevronDown,
  ChevronUp,
  Package,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/admin/mobile-apps")({
  component: AdminMobileAppsPage,
});

type AppFormData = {
  name: string;
  tag: string;
};

type VersionFormData = {
  version: string;
  build_number: string;
  force_update: boolean;
  update_url: string;
  message: string;
  title: string;
};

const emptyAppForm: AppFormData = { name: "", tag: "" };
const emptyVersionForm: VersionFormData = {
  version: "",
  build_number: "1",
  force_update: false,
  update_url: "",
  message: "",
  title: "",
};

function AdminMobileAppsPage() {
  const { t } = useSettings();
  const queryClient = useQueryClient();

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: () => fetchApps(),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "items">("table");
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);

  const [selectedApp, setSelectedApp] = useState<ApiApp | null>(null);
  const [isAddAppDialogOpen, setIsAddAppDialogOpen] = useState(false);
  const [isEditAppDialogOpen, setIsEditAppDialogOpen] = useState(false);
  const [isDeleteAppDialogOpen, setIsDeleteAppDialogOpen] = useState(false);

  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);
  const [isAddVersionDialogOpen, setIsAddVersionDialogOpen] = useState(false);
  const [isEditVersionDialogOpen, setIsEditVersionDialogOpen] = useState(false);
  const [isDeleteVersionDialogOpen, setIsDeleteVersionDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ApiAppVersion | null>(null);

  const [appFormData, setAppFormData] = useState<AppFormData>(emptyAppForm);
  const [versionFormData, setVersionFormData] = useState<VersionFormData>(emptyVersionForm);

  const { data: versions = [] } = useQuery({
    queryKey: ["admin-app-versions", selectedApp?.id],
    queryFn: () => fetchAppVersions(selectedApp!.id),
    enabled: !!selectedApp && isVersionsDialogOpen,
  });

  const filteredApps = apps.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return app.name.toLowerCase().includes(q) || app.tag.toLowerCase().includes(q);
  });

  const createAppMutation = useMutation({
    mutationFn: createApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-apps"] });
      toast.success("Ilova muvaffaqiyatli yaratildi");
      setIsAddAppDialogOpen(false);
      setAppFormData(emptyAppForm);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const updateAppMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string } }) => updateApp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-apps"] });
      toast.success("Ilova muvaffaqiyatli yangilandi");
      setIsEditAppDialogOpen(false);
      setSelectedApp(null);
      setAppFormData(emptyAppForm);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const deleteAppMutation = useMutation({
    mutationFn: deleteApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-apps"] });
      toast.success("Ilova muvaffaqiyatli o'chirildi");
      setIsDeleteAppDialogOpen(false);
      setSelectedApp(null);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const createVersionMutation = useMutation({
    mutationFn: (data: CreateVersionPayload) => createVersion(selectedApp!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-app-versions", selectedApp?.id] });
      toast.success("Versiya muvaffaqiyatli yaratildi");
      setIsAddVersionDialogOpen(false);
      setVersionFormData(emptyVersionForm);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const updateVersionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateVersion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-app-versions", selectedApp?.id] });
      toast.success("Versiya muvaffaqiyatli yangilandi");
      setIsEditVersionDialogOpen(false);
      setSelectedVersion(null);
      setVersionFormData(emptyVersionForm);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const deleteVersionMutation = useMutation({
    mutationFn: deleteVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-app-versions", selectedApp?.id] });
      toast.success("Versiya o'chirildi");
      setIsDeleteVersionDialogOpen(false);
      setSelectedVersion(null);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const handleAddApp = () => {
    setAppFormData(emptyAppForm);
    setIsAddAppDialogOpen(true);
  };

  const handleEditApp = (app: ApiApp) => {
    setSelectedApp(app);
    setAppFormData({ name: app.name, tag: app.tag });
    setIsEditAppDialogOpen(true);
  };

  const handleDeleteApp = (app: ApiApp) => {
    setSelectedApp(app);
    setIsDeleteAppDialogOpen(true);
  };

  const handleVersions = (app: ApiApp) => {
    setSelectedApp(app);
    setIsVersionsDialogOpen(true);
  };

  const handleSaveApp = () => {
    if (isEditAppDialogOpen && selectedApp) {
      updateAppMutation.mutate({ id: selectedApp.id, data: { name: appFormData.name } });
    } else {
      if (!appFormData.name.trim() || !appFormData.tag.trim()) {
        toast.error("Nomi va tag majburiy");
        return;
      }
      createAppMutation.mutate(appFormData);
    }
  };

  const handleAddVersion = () => {
    setVersionFormData(emptyVersionForm);
    setIsAddVersionDialogOpen(true);
  };

  const handleEditVersion = (version: ApiAppVersion) => {
    setSelectedVersion(version);
    setVersionFormData({
      version: version.version,
      build_number: String(version.build_number),
      force_update: version.force_update,
      update_url: version.update_url || "",
      message: version.message || "",
      title: version.title || "",
    });
    setIsEditVersionDialogOpen(true);
  };

  const handleDeleteVersion = (version: ApiAppVersion) => {
    setSelectedVersion(version);
    setIsDeleteVersionDialogOpen(true);
  };

  const handleSaveVersion = () => {
    if (!versionFormData.version.trim()) {
      toast.error("Versiya raqami majburiy");
      return;
    }
    const payload: CreateVersionPayload = {
      version: versionFormData.version,
      build_number: Number(versionFormData.build_number) || 1,
      force_update: versionFormData.force_update,
      app_id: selectedApp!.id,
    };
    if (versionFormData.update_url) payload.update_url = versionFormData.update_url;
    if (versionFormData.message) payload.message = versionFormData.message;
    if (versionFormData.title) payload.title = versionFormData.title;

    if (isEditVersionDialogOpen && selectedVersion) {
      updateVersionMutation.mutate({
        id: selectedVersion.id,
        data: {
          version: payload.version,
          build_number: payload.build_number,
          force_update: payload.force_update,
          update_url: payload.update_url,
          message: payload.message,
          title: payload.title,
        },
      });
    } else {
      createVersionMutation.mutate(payload);
    }
  };

  const confirmDeleteApp = () => {
    if (selectedApp) deleteAppMutation.mutate(selectedApp.id);
  };

  const confirmDeleteVersion = () => {
    if (selectedVersion) deleteVersionMutation.mutate(selectedVersion.id);
  };

  return (
    <AdminGuard>
      <AdminLayout title={t("adminMobileApps")} subtitle={t("adminMobileAppsSubtitle")}>
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
                placeholder="Qidirish (nomi, tag)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <div className="inline-flex rounded-xl border bg-muted/40 p-1">
                <Button
                  type="button"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-lg px-4"
                  onClick={() => setViewMode("table")}
                >
                  {t("tableView")}
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "items" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-lg px-4"
                  onClick={() => setViewMode("items")}
                >
                  {t("cardsView")}
                </Button>
              </div>
              <Button onClick={handleAddApp}>
                <Plus className="h-4 w-4 mr-2" />
                {t("add")}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Jami: {filteredApps.length} ta ilova
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {viewMode === "table" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Yaratilgan sana</TableHead>
                    <TableHead>Versiyalar</TableHead>
                    <TableHead className="w-[80px]">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app) => (
                    <TableRow key={app.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg border bg-muted/20 flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{app.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{app.tag}</Badge></TableCell>
                      <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleVersions(app)}>
                          <Package className="h-4 w-4 mr-1" />
                          Boshqarish
                        </Button>
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
                            <DropdownMenuItem onClick={() => handleVersions(app)}>
                              <Package className="h-4 w-4 mr-2" />
                              Versiyalar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditApp(app)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteApp(app)}
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
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredApps.map((app) => (
                  <div key={app.id} className="rounded-lg border bg-background p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl border bg-muted/20 flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{app.name}</h3>
                          <Badge variant="outline" className="mt-0.5">{app.tag}</Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleVersions(app)}>
                            <Package className="h-4 w-4 mr-2" />Versiyalar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditApp(app)}>
                            <Edit className="h-4 w-4 mr-2" />Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteApp(app)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-muted-foreground">Yaratilgan: {new Date(app.created_at).toLocaleDateString()}</p>
                    <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => handleVersions(app)}>
                      <Package className="h-4 w-4 mr-2" />Versiyalarni boshqarish
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {filteredApps.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ilovalar topilmadi</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isAddAppDialogOpen || isEditAppDialogOpen} onOpenChange={(open) => {
          if (!open) { setIsAddAppDialogOpen(false); setIsEditAppDialogOpen(false); setAppFormData(emptyAppForm); }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditAppDialogOpen ? "Ilovani tahrirlash" : "Yangi ilova qo'shish"}</DialogTitle>
              <DialogDescription>
                {isEditAppDialogOpen ? "Ilova ma'lumotlarini tahrirlang" : "Yangi ilova yaratish uchun ma'lumotlarni kiriting"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Nomi *</Label>
                <Input
                  id="app-name"
                  value={appFormData.name}
                  onChange={(e) => setAppFormData({ ...appFormData, name: e.target.value })}
                  placeholder="Ilova nomi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-tag">Tag {!isEditAppDialogOpen && "*"}</Label>
                <Input
                  id="app-tag"
                  value={appFormData.tag}
                  onChange={(e) => setAppFormData({ ...appFormData, tag: e.target.value })}
                  placeholder="Masalan: agent, delivery"
                  disabled={isEditAppDialogOpen}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddAppDialogOpen(false); setIsEditAppDialogOpen(false); setAppFormData(emptyAppForm); }}>
                Bekor qilish
              </Button>
              <Button onClick={handleSaveApp}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteAppDialogOpen} onOpenChange={setIsDeleteAppDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ilovani o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham <strong>{selectedApp?.name}</strong> ilovasini o'chirmoqchimisiz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteApp} className="bg-red-600 hover:bg-red-700">
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isVersionsDialogOpen} onOpenChange={(open) => { setIsVersionsDialogOpen(open); if (!open) setSelectedApp(null); }}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Versiyalar — {selectedApp?.name}</DialogTitle>
              <DialogDescription>Ilova versiyalarini boshqarish</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={handleAddVersion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi versiya
                </Button>
              </div>
              {versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Versiyalar topilmadi</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Versiya</TableHead>
                      <TableHead>Build #</TableHead>
                      <TableHead>Majburiy</TableHead>
                      <TableHead>Sarlavha</TableHead>
                      <TableHead>Sana</TableHead>
                      <TableHead>Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono font-medium">{v.version}</TableCell>
                        <TableCell>{v.build_number}</TableCell>
                        <TableCell>
                          {v.force_update ? (
                            <Badge variant="destructive">Ha</Badge>
                          ) : (
                            <Badge variant="secondary">Yo'q</Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{v.title || "—"}</TableCell>
                        <TableCell>{new Date(v.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditVersion(v)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteVersion(v)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVersionsDialogOpen(false)}>Yopish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddVersionDialogOpen || isEditVersionDialogOpen} onOpenChange={(open) => {
          if (!open) { setIsAddVersionDialogOpen(false); setIsEditVersionDialogOpen(false); setVersionFormData(emptyVersionForm); }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditVersionDialogOpen ? "Versiyani tahrirlash" : "Yangi versiya"}</DialogTitle>
              <DialogDescription>
                {isEditVersionDialogOpen ? "Versiya ma'lumotlarini yangilang" : `Yangi versiya — ${selectedApp?.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ver-version">Versiya *</Label>
                  <Input
                    id="ver-version"
                    value={versionFormData.version}
                    onChange={(e) => setVersionFormData({ ...versionFormData, version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ver-build">Build raqami</Label>
                  <Input
                    id="ver-build"
                    type="number"
                    value={versionFormData.build_number}
                    onChange={(e) => setVersionFormData({ ...versionFormData, build_number: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ver-title">Sarlavha</Label>
                  <Input
                    id="ver-title"
                    value={versionFormData.title}
                    onChange={(e) => setVersionFormData({ ...versionFormData, title: e.target.value })}
                    placeholder="Yangilik sarlavhasi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ver-url">Update URL</Label>
                  <Input
                    id="ver-url"
                    value={versionFormData.update_url}
                    onChange={(e) => setVersionFormData({ ...versionFormData, update_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ver-message">Xabar</Label>
                <Textarea
                  id="ver-message"
                  value={versionFormData.message}
                  onChange={(e) => setVersionFormData({ ...versionFormData, message: e.target.value })}
                  placeholder="Yangiliklar haqida ma'lumot"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ver-force"
                  checked={versionFormData.force_update}
                  onCheckedChange={(checked) => setVersionFormData({ ...versionFormData, force_update: checked as boolean })}
                />
                <Label htmlFor="ver-force">Majburiy yangilash</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddVersionDialogOpen(false); setIsEditVersionDialogOpen(false); setVersionFormData(emptyVersionForm); }}>
                Bekor qilish
              </Button>
              <Button onClick={handleSaveVersion}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteVersionDialogOpen} onOpenChange={setIsDeleteVersionDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Versiyani o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham <strong>{selectedVersion?.version}</strong> versiyasini o'chirmoqchimisiz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteVersion} className="bg-red-600 hover:bg-red-700">
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminGuard>
  );
}
