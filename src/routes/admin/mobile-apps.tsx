import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
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
import {
  fetchAppStoreApps,
  fetchAppStoreApp,
  fetchAppStoreUsers,
  fetchAppStoreCategories,
  createAppStoreApp,
  updateAppStoreApp,
  deleteAppStoreApp,
  toggleAppStoreAppPublish,
  fetchAppStoreAppVersions,
  createAppStoreAppVersion,
  deleteAppStoreAppVersion,
  uploadAppStoreAppScreenshots,
  deleteAppStoreAppScreenshot,
  getAppStoreAssetUrl,
  type AppStoreApp,
  type AppStoreAppDetail,
  type AppStoreAppVersion,
  type AppStoreUser,
  type AppStoreCategory,
} from "@/lib/appstore-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings } from "@/lib/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Store,
  Image,
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

type AppStoreAppFormData = {
  name: string;
  shortDescription: string;
  category: string;
  developer: string;
  description: string;
  tags: string;
  published: boolean;
};

type AppStoreVersionFormData = {
  version: string;
  minAndroid: string;
  changelog: string;
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

const emptyAppStoreAppForm: AppStoreAppFormData = {
  name: "",
  shortDescription: "",
  category: "productivity",
  developer: "",
  description: "",
  tags: "",
  published: true,
};

const emptyAppStoreVersionForm: AppStoreVersionFormData = {
  version: "",
  minAndroid: "8.0",
  changelog: "",
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
  const [appstoreSearchQuery, setAppstoreSearchQuery] = useState("");
  const [appstoreViewMode, setAppstoreViewMode] = useState<"table" | "items">("items");
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

  const [selectedAppStoreApp, setSelectedAppStoreApp] = useState<AppStoreApp | null>(null);
  const [isAddAppStoreAppDialogOpen, setIsAddAppStoreAppDialogOpen] = useState(false);
  const [isEditAppStoreAppDialogOpen, setIsEditAppStoreAppDialogOpen] = useState(false);
  const [isDeleteAppStoreAppDialogOpen, setIsDeleteAppStoreAppDialogOpen] = useState(false);
  const [isAppStoreVersionsDialogOpen, setIsAppStoreVersionsDialogOpen] = useState(false);
  const [isAddAppStoreVersionDialogOpen, setIsAddAppStoreVersionDialogOpen] = useState(false);
  const [isDeleteAppStoreVersionDialogOpen, setIsDeleteAppStoreVersionDialogOpen] = useState(false);
  const [selectedAppStoreVersion, setSelectedAppStoreVersion] = useState<string | null>(null);
  const [selectedAppStoreAppForUrl, setSelectedAppStoreAppForUrl] = useState("");
  const [selectedAppStoreAppVersionForUrl, setSelectedAppStoreAppVersionForUrl] = useState("");

  const [appStoreFormData, setAppStoreFormData] = useState<AppStoreAppFormData>(emptyAppStoreAppForm);
  const [appStoreVersionFormData, setAppStoreVersionFormData] = useState<AppStoreVersionFormData>(emptyAppStoreVersionForm);
  const [appStoreApkFile, setAppStoreApkFile] = useState<File | null>(null);
  const [appStoreScreenshotFiles, setAppStoreScreenshotFiles] = useState<File[]>([]);
  const [editAppStoreScreenshotFiles, setEditAppStoreScreenshotFiles] = useState<File[]>([]);
  const [appStoreAppDetail, setAppStoreAppDetail] = useState<AppStoreAppDetail | null>(null);
  const createScreenshotInputRef = useRef<HTMLInputElement>(null);
  const editScreenshotInputRef = useRef<HTMLInputElement>(null);

  const { data: versions = [] } = useQuery({
    queryKey: ["admin-app-versions", selectedApp?.id],
    queryFn: () => fetchAppVersions(selectedApp!.id),
    enabled: !!selectedApp && isVersionsDialogOpen,
  });

  const { data: appstoreApps = [], isLoading: appstoreLoading } = useQuery({
    queryKey: ["admin-appstore-apps"],
    queryFn: () => fetchAppStoreApps(),
  });

  const { data: appstoreAppVersionsDetail } = useQuery({
    queryKey: ["admin-appstore-app-versions-detail", selectedAppStoreApp?.id],
    queryFn: () => fetchAppStoreApp(selectedAppStoreApp!.id),
    enabled: !!selectedAppStoreApp && isAppStoreVersionsDialogOpen,
  });
  const appstoreVersions = appstoreAppVersionsDetail?.versions || [];

  const { data: appstoreUsers = [] } = useQuery({
    queryKey: ["admin-appstore-users"],
    queryFn: () => fetchAppStoreUsers(),
  });

  const { data: appstoreCategories = [] } = useQuery({
    queryKey: ["admin-appstore-categories"],
    queryFn: () => fetchAppStoreCategories(),
  });

  const { data: appstoreAppDetailForUrl } = useQuery({
    queryKey: ["admin-appstore-app-detail-url", selectedAppStoreAppForUrl],
    queryFn: () => fetchAppStoreApp(selectedAppStoreAppForUrl),
    enabled: !!selectedAppStoreAppForUrl && (isAddVersionDialogOpen || isEditVersionDialogOpen),
  });

  const filteredApps = apps.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return app.name.toLowerCase().includes(q) || app.tag.toLowerCase().includes(q);
  });

  const filteredAppStoreApps = appstoreApps.filter((app) => {
    if (!appstoreSearchQuery) return true;
    const q = appstoreSearchQuery.toLowerCase();
    const tags = (app.tags || []).join(" ").toLowerCase();
    return (
      app.name.toLowerCase().includes(q) ||
      (app.shortDescription || "").toLowerCase().includes(q) ||
      (app.developer || "").toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      tags.includes(q)
    );
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

  const createAppStoreAppMutation = useMutation({
    mutationFn: (data: FormData) => createAppStoreApp(data),
    onSuccess: async (result) => {
      if (appStoreScreenshotFiles.length > 0) {
        try {
          await uploadAppStoreAppScreenshots(result.id, appStoreScreenshotFiles);
        } catch {
          toast.warning("Ilova yaratildi, ammo skrinshotlarni yuklashda xatolik");
        }
      }
      queryClient.invalidateQueries({ queryKey: ["admin-appstore-apps"] });
      toast.success("AppStore ilovasi muvaffaqiyatli yaratildi");
      setIsAddAppStoreAppDialogOpen(false);
      setAppStoreFormData(emptyAppStoreAppForm);
      setAppStoreScreenshotFiles([]);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const updateAppStoreAppMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateAppStoreApp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appstore-apps"] });
      toast.success("AppStore ilovasi muvaffaqiyatli yangilandi");
      setIsEditAppStoreAppDialogOpen(false);
      setSelectedAppStoreApp(null);
      setAppStoreFormData(emptyAppStoreAppForm);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const deleteAppStoreAppMutation = useMutation({
    mutationFn: deleteAppStoreApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appstore-apps"] });
      toast.success("AppStore ilovasi o'chirildi");
      setIsDeleteAppStoreAppDialogOpen(false);
      setSelectedAppStoreApp(null);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const toggleAppStoreAppPublishMutation = useMutation({
    mutationFn: toggleAppStoreAppPublish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appstore-apps"] });
      toast.success("Holat muvaffaqiyatli o'zgartirildi");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const editUploadScreenshotsMutation = useMutation({
    mutationFn: ({ appId, files }: { appId: string; files: File[] }) =>
      uploadAppStoreAppScreenshots(appId, files),
    onSuccess: () => {
      toast.success("Skrinshotlar yuklandi");
      setEditAppStoreScreenshotFiles([]);
      if (selectedAppStoreApp) {
        fetchAppStoreApp(selectedAppStoreApp.id)
          .then((d) => setAppStoreAppDetail(d))
          .catch(() => {});
      }
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const editDeleteScreenshotMutation = useMutation({
    mutationFn: ({ appId, index }: { appId: string; index: number }) =>
      deleteAppStoreAppScreenshot(appId, index),
    onSuccess: () => {
      toast.success("Skrinshot o'chirildi");
      if (selectedAppStoreApp) {
        fetchAppStoreApp(selectedAppStoreApp.id)
          .then((d) => setAppStoreAppDetail(d))
          .catch(() => {});
      }
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const createAppStoreVersionMutation = useMutation({
    mutationFn: ({ appId, data }: { appId: string; data: FormData }) =>
      createAppStoreAppVersion(appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appstore-versions", selectedAppStoreApp?.id] });
      toast.success("Versiya muvaffaqiyatli yaratildi");
      setIsAddAppStoreVersionDialogOpen(false);
      setAppStoreVersionFormData(emptyAppStoreVersionForm);
      setAppStoreApkFile(null);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const deleteAppStoreVersionMutation = useMutation({
    mutationFn: ({ appId, version }: { appId: string; version: string }) =>
      deleteAppStoreAppVersion(appId, version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appstore-versions", selectedAppStoreApp?.id] });
      toast.success("Versiya o'chirildi");
      setIsDeleteAppStoreVersionDialogOpen(false);
      setSelectedAppStoreVersion(null);
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
    setSelectedAppStoreAppForUrl("");
    setSelectedAppStoreAppVersionForUrl("");
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
    setSelectedAppStoreAppForUrl("");
    setSelectedAppStoreAppVersionForUrl("");
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

  const handleAddAppStoreApp = () => {
    setAppStoreFormData(emptyAppStoreAppForm);
    setAppStoreScreenshotFiles([]);
    setIsAddAppStoreAppDialogOpen(true);
  };

  const handleAddCreateScreenshots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAppStoreScreenshotFiles((prev) => [...prev, ...files]);
    if (createScreenshotInputRef.current) createScreenshotInputRef.current.value = "";
  };

  const handleRemoveCreateScreenshot = (idx: number) => {
    setAppStoreScreenshotFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddEditScreenshots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditAppStoreScreenshotFiles((prev) => [...prev, ...files]);
    if (editScreenshotInputRef.current) editScreenshotInputRef.current.value = "";
  };

  const handleRemoveEditScreenshot = (idx: number) => {
    setEditAppStoreScreenshotFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveNewAppStoreApp = () => {
    if (!appStoreFormData.name.trim() || !appStoreFormData.shortDescription.trim()) {
      toast.error("Nomi va qisqa tavsif majburiy");
      return;
    }
    const fd = new FormData();
    fd.append("name", appStoreFormData.name);
    fd.append("shortDescription", appStoreFormData.shortDescription);
    fd.append("category", appStoreFormData.category);
    fd.append("developer", appStoreFormData.developer);
    fd.append("description", appStoreFormData.description);
    fd.append("tags", appStoreFormData.tags);
    fd.append("published", String(appStoreFormData.published));
    createAppStoreAppMutation.mutate(fd);
  };

  const handleEditAppStoreApp = (app: AppStoreApp) => {
    setSelectedAppStoreApp(app);
    setAppStoreFormData({
      name: app.name,
      shortDescription: app.shortDescription,
      category: app.category,
      developer: app.developer || "",
      description: "",
      tags: (app.tags || []).join(", "),
      published: app.published,
    });
    setEditAppStoreScreenshotFiles([]);
    setAppStoreAppDetail(null);
    fetchAppStoreApp(app.id)
      .then((d) => setAppStoreAppDetail(d))
      .catch(() => {});
    setIsEditAppStoreAppDialogOpen(true);
  };

  const handleDeleteAppStoreApp = (app: AppStoreApp) => {
    setSelectedAppStoreApp(app);
    setIsDeleteAppStoreAppDialogOpen(true);
  };

  const handleToggleAppStoreAppPublish = (app: AppStoreApp) => {
    setSelectedAppStoreApp(app);
    toggleAppStoreAppPublishMutation.mutate(app.id);
  };

  const handleAppStoreVersions = (app: AppStoreApp) => {
    setSelectedAppStoreApp(app);
    setIsAppStoreVersionsDialogOpen(true);
  };

  const handleSaveAppStoreApp = () => {
    if (!selectedAppStoreApp) return;
    const fd = new FormData();
    fd.append("name", appStoreFormData.name);
    fd.append("shortDescription", appStoreFormData.shortDescription);
    fd.append("category", appStoreFormData.category);
    fd.append("developer", appStoreFormData.developer);
    fd.append("description", appStoreFormData.description);
    fd.append("tags", appStoreFormData.tags);
    fd.append("published", String(appStoreFormData.published));
    updateAppStoreAppMutation.mutate({ id: selectedAppStoreApp.id, data: fd });
  };

  const handleConfirmDeleteAppStoreApp = () => {
    if (selectedAppStoreApp) deleteAppStoreAppMutation.mutate(selectedAppStoreApp.id);
  };

  const handleAddAppStoreVersion = () => {
    setAppStoreVersionFormData(emptyAppStoreVersionForm);
    setAppStoreApkFile(null);
    setIsAddAppStoreVersionDialogOpen(true);
  };

  const handleDeleteAppStoreVersion = (version: string) => {
    setSelectedAppStoreVersion(version);
    setIsDeleteAppStoreVersionDialogOpen(true);
  };

  const handleSaveAppStoreVersion = () => {
    if (!appStoreVersionFormData.version.trim()) {
      toast.error("Versiya raqami majburiy");
      return;
    }
    if (!appStoreApkFile) {
      toast.error("APK faylni tanlang");
      return;
    }
    if (!selectedAppStoreApp) return;
    const fd = new FormData();
    fd.append("version", appStoreVersionFormData.version);
    fd.append("file", appStoreApkFile);
    fd.append("minAndroid", appStoreVersionFormData.minAndroid);
    fd.append("changelog", appStoreVersionFormData.changelog);
    createAppStoreVersionMutation.mutate({ appId: selectedAppStoreApp.id, data: fd });
  };

  const handleConfirmDeleteAppStoreVersion = () => {
    if (selectedAppStoreApp && selectedAppStoreVersion) {
      deleteAppStoreVersionMutation.mutate({
        appId: selectedAppStoreApp.id,
        version: selectedAppStoreVersion,
      });
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title={t("adminMobileApps")} subtitle={t("adminMobileAppsSubtitle")}>
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        <Tabs defaultValue="main" className="space-y-4 mb-6">
          <TabsList>
            <TabsTrigger value="main">Mobil ilovalar</TabsTrigger>
            <TabsTrigger value="appstore">
              <Store className="h-4 w-4 mr-1.5" />
              AppStore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4 mt-0">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Qidirish (nomi, tag)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                Jami: {filteredApps.length} ta ilova
              </div>
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
            </div>
            <Button onClick={handleAddApp}>
              <Plus className="h-4 w-4 mr-2" />
              {t("add")}
            </Button>
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
        </TabsContent>

        <TabsContent value="appstore" className="space-y-4 mt-0">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Qidirish (nomi, dasturchi, kategoriya)..."
                  value={appstoreSearchQuery}
                  onChange={(e) => setAppstoreSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                Jami: {filteredAppStoreApps.length} ta ilova
              </div>
              <div className="inline-flex rounded-xl border bg-muted/40 p-1">
                <Button
                  type="button"
                  variant={appstoreViewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-lg px-4"
                  onClick={() => setAppstoreViewMode("table")}
                >
                  {t("tableView")}
                </Button>
                <Button
                  type="button"
                  variant={appstoreViewMode === "items" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-lg px-4"
                  onClick={() => setAppstoreViewMode("items")}
                >
                  {t("cardsView")}
                </Button>
              </div>
            </div>
            <Button onClick={handleAddAppStoreApp}>
              <Plus className="h-4 w-4 mr-2" />
              {t("add")}
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {appstoreLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredAppStoreApps.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>AppStore ilovalari topilmadi</p>
                </div>
              ) : appstoreViewMode === "table" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>Dasturchi</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Versiya</TableHead>
                      <TableHead>Yuklamalar</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead className="w-[80px]">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppStoreApps.map((app) => (
                      <TableRow key={app.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg border bg-muted/20 flex items-center justify-center overflow-hidden">
                              {app.icon ? (
                                <img src={getAppStoreAssetUrl(app.icon)} alt={app.name} className="h-full w-full object-cover" />
                              ) : (
                                <Store className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <span className="font-medium">{app.name}</span>
                              <p className="text-xs text-muted-foreground">{app.shortDescription}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{app.developer || "—"}</TableCell>
                        <TableCell><Badge variant="outline">{app.category}</Badge></TableCell>
                        <TableCell className="font-mono">{app.latestVersion || "—"}</TableCell>
                        <TableCell>{app.totalDownloads.toLocaleString()}</TableCell>
                        <TableCell>
                          {app.published ? (
                            <Badge variant="default" className="bg-green-600">Nashr qilingan</Badge>
                          ) : (
                            <Badge variant="secondary">Qoralama</Badge>
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
                              <DropdownMenuItem onClick={() => handleAppStoreVersions(app)}>
                                <Package className="h-4 w-4 mr-2" />
                                Versiyalar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditAppStoreApp(app)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Tahrirlash
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleAppStoreAppPublish(app)}>
                                <Eye className="h-4 w-4 mr-2" />
                                {app.published ? "Qoralama" : "Nashr qilish"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteAppStoreApp(app)}
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
                <div className="grid gap-4 md:grid-cols-2">
                  {appstoreApps.map((app) => (
                    <div key={app.id} className="group rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              {app.icon ? (
                                <img src={getAppStoreAssetUrl(app.icon)} alt={app.name} className="h-full w-full object-cover" />
                              ) : (
                                <Store className="h-7 w-7 text-primary/60" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-base truncate">{app.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{app.shortDescription}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAppStoreVersions(app)}>
                                <Package className="h-4 w-4 mr-2" />Versiyalar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditAppStoreApp(app)}>
                                <Edit className="h-4 w-4 mr-2" />Tahrirlash
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleAppStoreAppPublish(app)}>
                                <Eye className="h-4 w-4 mr-2" />{app.published ? "Qoralama" : "Nashr qilish"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteAppStoreApp(app)} className="text-red-600 focus:text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />O'chirish
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-xs font-normal">{app.developer || app.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            {app.latestVersion || "—"}
                          </span>
                          <span className="flex items-center gap-1 ml-auto">
                            <span className="font-medium tabular-nums">{app.totalDownloads.toLocaleString()}</span>
                            <span>yuklama</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex border-t bg-muted/20 divide-x">
                        <button
                          onClick={() => handleAppStoreVersions(app)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                        >
                          <Package className="h-3.5 w-3.5" />
                          Versiyalar
                        </button>
                        <button
                          onClick={() => handleEditAppStoreApp(app)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Tahrirlash
                        </button>
                        <div className="relative">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors w-full h-full">
                                <Eye className="h-3.5 w-3.5" />
                                {app.published ? "Nashr" : "Qoralama"}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => handleToggleAppStoreAppPublish(app)}>
                                <Eye className="h-4 w-4 mr-2" />{app.published ? "Qoralama" : "Nashr qilish"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteAppStoreApp(app)} className="text-red-600 focus:text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />O'chirish
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

        <Dialog open={isEditAppStoreAppDialogOpen} onOpenChange={(open) => {
          if (!open) { setIsEditAppStoreAppDialogOpen(false); setSelectedAppStoreApp(null); setAppStoreFormData(emptyAppStoreAppForm); }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>AppStore ilovasini tahrirlash</DialogTitle>
              <DialogDescription>Ilova ma'lumotlarini tahrirlang</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="as-name">Nomi *</Label>
                <Input
                  id="as-name"
                  value={appStoreFormData.name}
                  onChange={(e) => setAppStoreFormData({ ...appStoreFormData, name: e.target.value })}
                  placeholder="Ilova nomi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-desc">Qisqa tavsif *</Label>
                <Input
                  id="as-desc"
                  value={appStoreFormData.shortDescription}
                  onChange={(e) => setAppStoreFormData({ ...appStoreFormData, shortDescription: e.target.value })}
                  placeholder="Qisqa tavsif"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-category">Kategoriya</Label>
                <Select
                  key={appStoreFormData.category}
                  value={appStoreFormData.category}
                  onValueChange={(val) => setAppStoreFormData({ ...appStoreFormData, category: val })}
                >
                  <SelectTrigger id="as-category">
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {appstoreCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.labelUz || c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-developer">Dasturchi</Label>
                <Select
                  value={appStoreFormData.developer}
                  onValueChange={(val) => setAppStoreFormData({ ...appStoreFormData, developer: val })}
                >
                  <SelectTrigger id="as-developer">
                    <SelectValue placeholder="Dasturchini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {appstoreUsers.map((u) => (
                      <SelectItem key={u.id} value={u.displayName || u.username}>
                        {u.displayName || u.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-tags">Teglar</Label>
                <Input
                  id="as-tags"
                  value={appStoreFormData.tags}
                  onChange={(e) => setAppStoreFormData({ ...appStoreFormData, tags: e.target.value })}
                  placeholder="vergul bilan ajrating"
                />
              </div>
              <div className="space-y-2">
                <Label>Skrinshotlar</Label>
                <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 max-w-full">
                  {appStoreAppDetail?.screenshots?.map((url, idx) => (
                    <div key={idx} className="relative group flex-none">
                      <img
                        src={getAppStoreAssetUrl(url)}
                        alt={`Screenshot ${idx + 1}`}
                        className="h-20 w-28 rounded-lg border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedAppStoreApp) {
                            editDeleteScreenshotMutation.mutate({ appId: selectedAppStoreApp.id, index: idx });
                          }
                        }}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {editAppStoreScreenshotFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative group flex-none">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New screenshot ${idx + 1}`}
                        className="h-20 w-28 rounded-lg border object-cover opacity-70"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEditScreenshot(idx)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1 flex-none">
                    <button
                      type="button"
                      onClick={() => editScreenshotInputRef.current?.click()}
                      className="h-20 w-28 flex-none rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/60 hover:text-muted-foreground/80 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="text-[10px]">Qo'shish</span>
                    </button>
                    <input
                      ref={editScreenshotInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAddEditScreenshots}
                    />
                    {editAppStoreScreenshotFiles.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={!selectedAppStoreApp}
                        onClick={() => {
                          if (selectedAppStoreApp && editAppStoreScreenshotFiles.length > 0) {
                            editUploadScreenshotsMutation.mutate({
                              appId: selectedAppStoreApp.id,
                              files: editAppStoreScreenshotFiles,
                            });
                          }
                        }}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Yuklash
                      </Button>
                    )}
                  </div>
                </div>
                {!appStoreAppDetail?.screenshots?.length && editAppStoreScreenshotFiles.length === 0 && (
                  <p className="text-xs text-muted-foreground">Hali skrinshot yo'q</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="as-published"
                  checked={appStoreFormData.published}
                  onCheckedChange={(checked) => setAppStoreFormData({ ...appStoreFormData, published: checked as boolean })}
                />
                <Label htmlFor="as-published">Nashr qilingan</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditAppStoreAppDialogOpen(false); setSelectedAppStoreApp(null); setAppStoreFormData(emptyAppStoreAppForm); setEditAppStoreScreenshotFiles([]); setAppStoreAppDetail(null); }}>
                Bekor qilish
              </Button>
              <Button onClick={handleSaveAppStoreApp}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddAppStoreAppDialogOpen} onOpenChange={(open) => {
          if (!open) { setIsAddAppStoreAppDialogOpen(false); setAppStoreFormData(emptyAppStoreAppForm); }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Yangi AppStore ilovasi</DialogTitle>
              <DialogDescription>Yangi ilova yaratish uchun ma'lumotlarni kiriting</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="as-new-name">Nomi *</Label>
                <Input
                  id="as-new-name"
                  value={appStoreFormData.name}
                  onChange={(e) => setAppStoreFormData({ ...appStoreFormData, name: e.target.value })}
                  placeholder="Ilova nomi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-new-desc">Qisqa tavsif *</Label>
                <Input
                  id="as-new-desc"
                  value={appStoreFormData.shortDescription}
                  onChange={(e) => setAppStoreFormData({ ...appStoreFormData, shortDescription: e.target.value })}
                  placeholder="Qisqa tavsif"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-new-category">Kategoriya</Label>
                <Select
                  value={appStoreFormData.category}
                  onValueChange={(val) => setAppStoreFormData({ ...appStoreFormData, category: val })}
                >
                  <SelectTrigger id="as-new-category">
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {appstoreCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.labelUz || c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-new-developer">Dasturchi</Label>
                <Select
                  value={appStoreFormData.developer}
                  onValueChange={(val) => setAppStoreFormData({ ...appStoreFormData, developer: val })}
                >
                  <SelectTrigger id="as-new-developer">
                    <SelectValue placeholder="Dasturchini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {appstoreUsers.map((u) => (
                      <SelectItem key={u.id} value={u.displayName || u.username}>
                        {u.displayName || u.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-new-tags">Teglar</Label>
                <Input
                  id="as-new-tags"
                  value={appStoreFormData.tags}
                  onChange={(e) => setAppStoreFormData({ ...appStoreFormData, tags: e.target.value })}
                  placeholder="vergul bilan ajrating"
                />
              </div>
              <div className="space-y-2">
                <Label>Skrinshotlar</Label>
                <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 max-w-full">
                  {appStoreScreenshotFiles.map((file, idx) => (
                    <div key={idx} className="relative group flex-none">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Screenshot ${idx + 1}`}
                        className="h-20 w-28 rounded-lg border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCreateScreenshot(idx)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => createScreenshotInputRef.current?.click()}
                    className="h-20 w-28 flex-none rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/60 hover:text-muted-foreground/80 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px]">Qo'shish</span>
                  </button>
                  <input
                    ref={createScreenshotInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAddCreateScreenshots}
                  />
                </div>
                {appStoreScreenshotFiles.length === 0 && (
                  <p className="text-xs text-muted-foreground">Hali skrinshot tanlanmadi</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="as-new-published"
                  checked={appStoreFormData.published}
                  onCheckedChange={(checked) => setAppStoreFormData({ ...appStoreFormData, published: checked as boolean })}
                />
                <Label htmlFor="as-new-published">Nashr qilingan</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddAppStoreAppDialogOpen(false); setAppStoreFormData(emptyAppStoreAppForm); setAppStoreScreenshotFiles([]); }}>
                Bekor qilish
              </Button>
              <Button onClick={handleSaveNewAppStoreApp}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteAppStoreAppDialogOpen} onOpenChange={setIsDeleteAppStoreAppDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>AppStore ilovasini o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham <strong>{selectedAppStoreApp?.name}</strong> ilovasini o'chirmoqchimisiz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteAppStoreApp} className="bg-red-600 hover:bg-red-700">
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isAppStoreVersionsDialogOpen} onOpenChange={(open) => { setIsAppStoreVersionsDialogOpen(open); if (!open) setSelectedAppStoreApp(null); }}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Versiyalar — {selectedAppStoreApp?.name}</DialogTitle>
              <DialogDescription>AppStore ilova versiyalarini boshqarish</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={handleAddAppStoreVersion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi versiya
                </Button>
              </div>
              {appstoreVersions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Versiyalar topilmadi</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Versiya</TableHead>
                      <TableHead>Android</TableHead>
                      <TableHead>Hajmi</TableHead>
                      <TableHead>Yuklamalar</TableHead>
                      <TableHead>Oxirgi</TableHead>
                      <TableHead>Sana</TableHead>
                      <TableHead>Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appstoreVersions.slice().sort((a, b) => {
                      if (a.isLatest) return -1;
                      if (b.isLatest) return 1;
                      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                    }).map((v) => (
                      <TableRow key={v.version}>
                        <TableCell className="font-mono font-medium">{v.version}</TableCell>
                        <TableCell>{v.minAndroid}</TableCell>
                        <TableCell>{v.fileSize || "—"}</TableCell>
                        <TableCell>{v.downloadCount}</TableCell>
                        <TableCell>
                          {v.isLatest ? (
                            <Badge variant="default" className="bg-blue-600">So'nggi</Badge>
                          ) : (
                            <Badge variant="secondary">Eski</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(v.releaseDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteAppStoreVersion(v.version)}>
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
              <Button variant="outline" onClick={() => setIsAppStoreVersionsDialogOpen(false)}>Yopish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddAppStoreVersionDialogOpen} onOpenChange={(open) => {
          if (!open) { setIsAddAppStoreVersionDialogOpen(false); setAppStoreVersionFormData(emptyAppStoreVersionForm); setAppStoreApkFile(null); }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Yangi versiya qo'shish</DialogTitle>
              <DialogDescription>
                {selectedAppStoreApp?.name} ilovasi uchun yangi versiya
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="asv-version">Versiya *</Label>
                <Input
                  id="asv-version"
                  value={appStoreVersionFormData.version}
                  onChange={(e) => setAppStoreVersionFormData({ ...appStoreVersionFormData, version: e.target.value })}
                  placeholder="1.0.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asv-minandroid">Min Android</Label>
                <Input
                  id="asv-minandroid"
                  value={appStoreVersionFormData.minAndroid}
                  onChange={(e) => setAppStoreVersionFormData({ ...appStoreVersionFormData, minAndroid: e.target.value })}
                  placeholder="8.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asv-changelog">O'zgarishlar tarixi</Label>
                <Textarea
                  id="asv-changelog"
                  value={appStoreVersionFormData.changelog}
                  onChange={(e) => setAppStoreVersionFormData({ ...appStoreVersionFormData, changelog: e.target.value })}
                  placeholder="Versiyadagi o'zgarishlar"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asv-apk">APK fayl *</Label>
                <Input
                  id="asv-apk"
                  type="file"
                  accept=".apk,application/vnd.android.package-archive"
                  onChange={(e) => setAppStoreApkFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddAppStoreVersionDialogOpen(false); setAppStoreVersionFormData(emptyAppStoreVersionForm); setAppStoreApkFile(null); }}>
                Bekor qilish
              </Button>
              <Button onClick={handleSaveAppStoreVersion}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteAppStoreVersionDialogOpen} onOpenChange={setIsDeleteAppStoreVersionDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Versiyani o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham <strong>{selectedAppStoreVersion}</strong> versiyasini o'chirmoqchimisiz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteAppStoreVersion} className="bg-red-600 hover:bg-red-700">
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
          if (!open) { setIsAddVersionDialogOpen(false); setIsEditVersionDialogOpen(false); setVersionFormData(emptyVersionForm); setSelectedAppStoreAppForUrl(""); setSelectedAppStoreAppVersionForUrl(""); }
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
              <div className="space-y-2">
                <Label>AppStore ilovasidan URL olish</Label>
                <Select
                  value={selectedAppStoreAppForUrl}
                  onValueChange={(val) => {
                    setSelectedAppStoreAppForUrl(val);
                    setSelectedAppStoreAppVersionForUrl("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ilovani tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {appstoreApps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        <div className="flex items-center gap-2">
                          {app.icon && (
                            <img src={getAppStoreAssetUrl(app.icon)} alt="" className="h-5 w-5 rounded object-cover" />
                          )}
                          <span>{app.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAppStoreAppForUrl && appstoreAppDetailForUrl && (
                  <Select
                    value={selectedAppStoreAppVersionForUrl}
                    onValueChange={(val) => {
                      setSelectedAppStoreAppVersionForUrl(val);
                      const versions = appstoreAppDetailForUrl.versions || [];
                      const found = versions.find((v) => v.version === val);
                      if (found?.downloadUrl) {
                        setVersionFormData((prev) => ({ ...prev, update_url: getAppStoreAssetUrl(found.downloadUrl) }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Versiyani tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(appstoreAppDetailForUrl.versions || [])
                        .slice()
                        .sort((a, b) => {
                          if (a.isLatest) return -1;
                          if (b.isLatest) return 1;
                          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                        })
                        .map((v) => (
                        <SelectItem key={v.version} value={v.version}>
                          {v.version}{v.isLatest ? " (so'nggi)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
