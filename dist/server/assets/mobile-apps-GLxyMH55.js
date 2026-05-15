import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useRef } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { A as AdminGuard, a as AdminLayout } from "./admin-layout-BFGTm6By.js";
import { s as getAdminToken, z as fetchApps, A as fetchAppVersions, B as createApp, C as updateApp, D as deleteApp, E as createVersion, F as updateVersion, G as deleteVersion } from "./auth-ATVJn5u0.js";
import { n as cn, a as useSettings, I as Input, B as Button, C as Card, g as CardContent, T as Table, i as TableHeader, j as TableRow, k as TableHead, l as TableBody, m as TableCell, h as Badge, S as Select, c as SelectTrigger, d as SelectValue, e as SelectContent, f as SelectItem } from "./router-CTVAwSR8.js";
import { L as Label } from "./label-SZrZpdES.js";
import { T as Textarea } from "./textarea-BmcP_vmP.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Smartphone, Store, Search, Plus, Package, MoreVertical, Edit, Trash2, Loader2, Download, RefreshCw, Upload, Eye, Image } from "lucide-react";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bxa6R2gx.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-CMF2hblO.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-B7uaj-7_.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem } from "./tooltip-DVV6DgP8.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
const API_BASE = "https://distr.mxsoft.uz/api";
const BACKEND_HOST = API_BASE.replace(/\/api$/, "");
const APPSTORE_BASE = BACKEND_HOST + "/appstore";
function getAppStoreAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return BACKEND_HOST + (path.startsWith("/") ? path : "/" + path);
}
async function appstoreUploadWithProgress(url, data, method, onProgress) {
  const token = getAdminToken();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round(e.loaded / e.total * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (xhr.status === 204) resolve(null);
        else resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.responseText || `Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(data);
  });
}
async function appstoreFetch(url, options) {
  const token = getAdminToken();
  const headers = {
    Accept: "application/json"
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options?.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options?.headers || {} }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `AppStore API Error: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
async function fetchAppStoreApps() {
  const res = await appstoreFetch(
    `${APPSTORE_BASE}/admin/apps`
  );
  return (res.data || []).map((app) => {
    const latest = app.versions?.find((v) => v.isLatest)?.version || app.versions?.[0]?.version || "";
    return { ...app, latestVersion: latest };
  });
}
async function fetchAppStoreUsers() {
  const res = await appstoreFetch(
    `${APPSTORE_BASE}/admin/users`
  );
  return res.data;
}
async function fetchAppStoreCategories() {
  const res = await appstoreFetch(
    `${APPSTORE_BASE}/categories`
  );
  return res.data;
}
async function fetchAppStoreApp(id) {
  const res = await appstoreFetch(
    `${APPSTORE_BASE}/admin/apps/${id}`
  );
  return res.data;
}
async function createAppStoreAppWithProgress(data, onProgress) {
  const res = await appstoreUploadWithProgress(
    `${APPSTORE_BASE}/admin/apps`,
    data,
    "POST",
    onProgress
  );
  return res.data;
}
async function uploadAppStoreAppScreenshotsWithProgress(appId, files, onProgress) {
  const fd = new FormData();
  for (const f of files) fd.append("screenshots", f);
  await appstoreUploadWithProgress(
    `${APPSTORE_BASE}/admin/apps/${appId}/screenshots`,
    fd,
    "POST",
    onProgress
  );
}
async function createAppStoreAppVersionWithProgress(appId, data, onProgress) {
  await appstoreUploadWithProgress(
    `${APPSTORE_BASE}/admin/apps/${appId}/versions`,
    data,
    "POST",
    onProgress
  );
}
async function updateAppStoreApp(id, data) {
  const res = await appstoreFetch(
    `${APPSTORE_BASE}/admin/apps/${id}`,
    { method: "PUT", body: data }
  );
  return res.data;
}
async function deleteAppStoreApp(id) {
  await appstoreFetch(
    `${APPSTORE_BASE}/admin/apps/${id}`,
    { method: "DELETE" }
  );
}
async function toggleAppStoreAppPublish(id) {
  await appstoreFetch(
    `${APPSTORE_BASE}/admin/apps/${id}/toggle-publish`,
    { method: "PATCH" }
  );
}
async function createAppStoreAppVersion(appId, data) {
  await appstoreFetch(
    `${APPSTORE_BASE}/admin/apps/${appId}/versions`,
    { method: "POST", body: data }
  );
}
async function deleteAppStoreAppVersion(appId, version) {
  await appstoreFetch(
    `${APPSTORE_BASE}/admin/apps/${appId}/versions/${version}`,
    { method: "DELETE" }
  );
}
async function uploadAppStoreAppScreenshots(appId, files) {
  const fd = new FormData();
  for (const f of files) {
    fd.append("screenshots", f);
  }
  await appstoreFetch(
    `${APPSTORE_BASE}/admin/apps/${appId}/screenshots`,
    { method: "POST", body: fd }
  );
}
async function deleteAppStoreAppScreenshot(appId, index) {
  await appstoreFetch(
    `${APPSTORE_BASE}/admin/apps/${appId}/screenshots/${index}`,
    { method: "DELETE" }
  );
}
async function clearAppStoreData() {
  await appstoreFetch(
    `${APPSTORE_BASE}/admin/data/clear`,
    { method: "POST" }
  );
}
async function exportAppStoreData() {
  const res = await appstoreFetch(
    `${APPSTORE_BASE}/admin/data/export`
  );
  return res.data;
}
async function importAppStoreData(file) {
  const fd = new FormData();
  fd.append("file", file);
  await appstoreFetch(
    `${APPSTORE_BASE}/admin/data/import`,
    { method: "POST", body: fd }
  );
}
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
const emptyAppForm = {
  name: "",
  tag: ""
};
const emptyVersionForm = {
  version: "",
  build_number: "1",
  force_update: false,
  update_url: "",
  message: "",
  title: ""
};
const emptyAppStoreAppForm = {
  name: "",
  shortDescription: "",
  category: "productivity",
  developer: "",
  description: "",
  tags: "",
  published: true
};
const emptyAppStoreVersionForm = {
  version: "",
  minAndroid: "8.0",
  changelog: ""
};
function AdminMobileAppsPage() {
  const {
    t
  } = useSettings();
  const queryClient = useQueryClient();
  const {
    data: apps = [],
    isLoading
  } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: () => fetchApps(),
    refetchOnMount: "always"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [appstoreSearchQuery, setAppstoreSearchQuery] = useState("");
  const [appstoreViewMode, setAppstoreViewMode] = useState("items");
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isAddAppDialogOpen, setIsAddAppDialogOpen] = useState(false);
  const [isEditAppDialogOpen, setIsEditAppDialogOpen] = useState(false);
  const [isDeleteAppDialogOpen, setIsDeleteAppDialogOpen] = useState(false);
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);
  const [isAddVersionDialogOpen, setIsAddVersionDialogOpen] = useState(false);
  const [isEditVersionDialogOpen, setIsEditVersionDialogOpen] = useState(false);
  const [isDeleteVersionDialogOpen, setIsDeleteVersionDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [appFormData, setAppFormData] = useState(emptyAppForm);
  const [versionFormData, setVersionFormData] = useState(emptyVersionForm);
  const [selectedAppStoreApp, setSelectedAppStoreApp] = useState(null);
  const [isAddAppStoreAppDialogOpen, setIsAddAppStoreAppDialogOpen] = useState(false);
  const [isEditAppStoreAppDialogOpen, setIsEditAppStoreAppDialogOpen] = useState(false);
  const [isDeleteAppStoreAppDialogOpen, setIsDeleteAppStoreAppDialogOpen] = useState(false);
  const [isAppStoreVersionsDialogOpen, setIsAppStoreVersionsDialogOpen] = useState(false);
  const [isAddAppStoreVersionDialogOpen, setIsAddAppStoreVersionDialogOpen] = useState(false);
  const [isDeleteAppStoreVersionDialogOpen, setIsDeleteAppStoreVersionDialogOpen] = useState(false);
  const [selectedAppStoreVersion, setSelectedAppStoreVersion] = useState(null);
  const [selectedAppStoreAppForUrl, setSelectedAppStoreAppForUrl] = useState("");
  const [selectedAppStoreAppVersionForUrl, setSelectedAppStoreAppVersionForUrl] = useState("");
  const [isClearAppStoreDataDialogOpen, setIsClearAppStoreDataDialogOpen] = useState(false);
  const appStoreImportInputRef = useRef(null);
  const [appStoreFormData, setAppStoreFormData] = useState(emptyAppStoreAppForm);
  const [appStoreVersionFormData, setAppStoreVersionFormData] = useState(emptyAppStoreVersionForm);
  const [appStoreApkFile, setAppStoreApkFile] = useState(null);
  const [appStoreScreenshotFiles, setAppStoreScreenshotFiles] = useState([]);
  const [editAppStoreScreenshotFiles, setEditAppStoreScreenshotFiles] = useState([]);
  const [appStoreAppDetail, setAppStoreAppDetail] = useState(null);
  const [createAppApkFile, setCreateAppApkFile] = useState(null);
  const [createAppInitialVersion, setCreateAppInitialVersion] = useState("1.0.0");
  const [createAppIconFile, setCreateAppIconFile] = useState(null);
  const [editAppIconFile, setEditAppIconFile] = useState(null);
  const createScreenshotInputRef = useRef(null);
  const editScreenshotInputRef = useRef(null);
  const createApkInputRef = useRef(null);
  const createIconInputRef = useRef(null);
  const editIconInputRef = useRef(null);
  const {
    data: versions = []
  } = useQuery({
    queryKey: ["admin-app-versions", selectedApp?.id],
    queryFn: () => fetchAppVersions(selectedApp.id),
    enabled: !!selectedApp && isVersionsDialogOpen
  });
  const {
    data: appstoreApps = [],
    isLoading: appstoreLoading,
    refetch: refetchAppStoreApps,
    isFetching: isAppStoreFetching
  } = useQuery({
    queryKey: ["admin-appstore-apps"],
    queryFn: () => fetchAppStoreApps(),
    refetchOnMount: "always",
    refetchOnWindowFocus: true
  });
  const {
    data: appstoreAppVersionsDetail
  } = useQuery({
    queryKey: ["admin-appstore-app-versions-detail", selectedAppStoreApp?.id],
    queryFn: () => fetchAppStoreApp(selectedAppStoreApp.id),
    enabled: !!selectedAppStoreApp && isAppStoreVersionsDialogOpen
  });
  const appstoreVersions = appstoreAppVersionsDetail?.versions || [];
  const {
    data: appstoreUsers = []
  } = useQuery({
    queryKey: ["admin-appstore-users"],
    queryFn: () => fetchAppStoreUsers()
  });
  const {
    data: appstoreCategories = []
  } = useQuery({
    queryKey: ["admin-appstore-categories"],
    queryFn: () => fetchAppStoreCategories()
  });
  const {
    data: appstoreAppDetailForUrl
  } = useQuery({
    queryKey: ["admin-appstore-app-detail-url", selectedAppStoreAppForUrl],
    queryFn: () => fetchAppStoreApp(selectedAppStoreAppForUrl),
    enabled: !!selectedAppStoreAppForUrl && (isAddVersionDialogOpen || isEditVersionDialogOpen)
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
    return app.name.toLowerCase().includes(q) || (app.shortDescription || "").toLowerCase().includes(q) || (app.developer || "").toLowerCase().includes(q) || app.category.toLowerCase().includes(q) || tags.includes(q);
  });
  const createAppMutation = useMutation({
    mutationFn: createApp,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-apps"]
      });
      toast.success("Ilova muvaffaqiyatli yaratildi");
      setIsAddAppDialogOpen(false);
      setAppFormData(emptyAppForm);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const updateAppMutation = useMutation({
    mutationFn: ({
      id,
      data
    }) => updateApp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-apps"]
      });
      toast.success("Ilova muvaffaqiyatli yangilandi");
      setIsEditAppDialogOpen(false);
      setSelectedApp(null);
      setAppFormData(emptyAppForm);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const deleteAppMutation = useMutation({
    mutationFn: deleteApp,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-apps"]
      });
      toast.success("Ilova muvaffaqiyatli o'chirildi");
      setIsDeleteAppDialogOpen(false);
      setSelectedApp(null);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const createVersionMutation = useMutation({
    mutationFn: (data) => createVersion(selectedApp.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-app-versions", selectedApp?.id]
      });
      toast.success("Versiya muvaffaqiyatli yaratildi");
      setIsAddVersionDialogOpen(false);
      setVersionFormData(emptyVersionForm);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const updateVersionMutation = useMutation({
    mutationFn: ({
      id,
      data
    }) => updateVersion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-app-versions", selectedApp?.id]
      });
      toast.success("Versiya muvaffaqiyatli yangilandi");
      setIsEditVersionDialogOpen(false);
      setSelectedVersion(null);
      setVersionFormData(emptyVersionForm);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const deleteVersionMutation = useMutation({
    mutationFn: deleteVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-app-versions", selectedApp?.id]
      });
      toast.success("Versiya o'chirildi");
      setIsDeleteVersionDialogOpen(false);
      setSelectedVersion(null);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const [createProgress, setCreateProgress] = useState(0);
  const [createPhase, setCreatePhase] = useState("");
  const createAppStoreAppMutation = useMutation({
    mutationFn: async (data) => {
      setCreatePhase("ilova");
      setCreateProgress(0);
      const result = await createAppStoreAppWithProgress(data, (p) => {
        setCreateProgress(Math.round(p * 0.5));
      });
      if (appStoreScreenshotFiles.length > 0) {
        setCreatePhase("skrinshot");
        setCreateProgress(50);
        try {
          await uploadAppStoreAppScreenshotsWithProgress(result.id, appStoreScreenshotFiles, (p) => {
            setCreateProgress(50 + Math.round(p * 0.25));
          });
        } catch {
          toast.warning("Ilova yaratildi, ammo skrinshotlarni yuklashda xatolik");
        }
      }
      if (createAppApkFile) {
        setCreatePhase("apk");
        setCreateProgress(75);
        const vfd = new FormData();
        vfd.append("version", createAppInitialVersion.trim() || "1.0.0");
        vfd.append("file", createAppApkFile);
        vfd.append("minAndroid", "8.0");
        vfd.append("changelog", "");
        try {
          await createAppStoreAppVersionWithProgress(result.id, vfd, (p) => {
            setCreateProgress(75 + Math.round(p * 0.25));
          });
        } catch {
          toast.warning("Ilova yaratildi, ammo APK yuklashda xatolik yuz berdi");
        }
      }
      setCreateProgress(100);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-appstore-apps"]
      });
      toast.success("AppStore ilovasi muvaffaqiyatli yaratildi");
      setIsAddAppStoreAppDialogOpen(false);
      setAppStoreFormData(emptyAppStoreAppForm);
      setAppStoreScreenshotFiles([]);
      setCreateAppApkFile(null);
      setCreateAppInitialVersion("1.0.0");
      setCreateAppIconFile(null);
      setCreateProgress(0);
      setCreatePhase("");
    },
    onError: (err) => {
      toast.error(err.message || "Xatolik yuz berdi");
      setCreateProgress(0);
      setCreatePhase("");
    }
  });
  const updateAppStoreAppMutation = useMutation({
    mutationFn: ({
      id,
      data
    }) => updateAppStoreApp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-appstore-apps"]
      });
      toast.success("AppStore ilovasi muvaffaqiyatli yangilandi");
      setIsEditAppStoreAppDialogOpen(false);
      setSelectedAppStoreApp(null);
      setAppStoreFormData(emptyAppStoreAppForm);
      setEditAppIconFile(null);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const deleteAppStoreAppMutation = useMutation({
    mutationFn: deleteAppStoreApp,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-appstore-apps"]
      });
      toast.success("AppStore ilovasi o'chirildi");
      setIsDeleteAppStoreAppDialogOpen(false);
      setSelectedAppStoreApp(null);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const toggleAppStoreAppPublishMutation = useMutation({
    mutationFn: toggleAppStoreAppPublish,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-appstore-apps"]
      });
      toast.success("Holat muvaffaqiyatli o'zgartirildi");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const editUploadScreenshotsMutation = useMutation({
    mutationFn: ({
      appId,
      files
    }) => uploadAppStoreAppScreenshots(appId, files),
    onSuccess: () => {
      toast.success("Skrinshotlar yuklandi");
      setEditAppStoreScreenshotFiles([]);
      if (selectedAppStoreApp) {
        fetchAppStoreApp(selectedAppStoreApp.id).then((d) => setAppStoreAppDetail(d)).catch(() => {
        });
      }
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const editDeleteScreenshotMutation = useMutation({
    mutationFn: ({
      appId,
      index
    }) => deleteAppStoreAppScreenshot(appId, index),
    onSuccess: () => {
      toast.success("Skrinshot o'chirildi");
      if (selectedAppStoreApp) {
        fetchAppStoreApp(selectedAppStoreApp.id).then((d) => setAppStoreAppDetail(d)).catch(() => {
        });
      }
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const createAppStoreVersionMutation = useMutation({
    mutationFn: ({
      appId,
      data
    }) => createAppStoreAppVersion(appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-appstore-versions", selectedAppStoreApp?.id]
      });
      toast.success("Versiya muvaffaqiyatli yaratildi");
      setIsAddAppStoreVersionDialogOpen(false);
      setAppStoreVersionFormData(emptyAppStoreVersionForm);
      setAppStoreApkFile(null);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const deleteAppStoreVersionMutation = useMutation({
    mutationFn: ({
      appId,
      version
    }) => deleteAppStoreAppVersion(appId, version),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-appstore-versions", selectedAppStoreApp?.id]
      });
      toast.success("Versiya o'chirildi");
      setIsDeleteAppStoreVersionDialogOpen(false);
      setSelectedAppStoreVersion(null);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const clearAppStoreDataMutation = useMutation({
    mutationFn: clearAppStoreData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-appstore-apps"]
      });
      toast.success("AppStore ma'lumotlari tozalandi");
      setIsClearAppStoreDataDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const exportAppStoreDataMutation = useMutation({
    mutationFn: exportAppStoreData,
    onSuccess: (data) => {
      const fullUrl = getAppStoreAssetUrl(data.download_url);
      window.open(fullUrl, "_blank");
      toast.success("Eksport boshlandi");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const importAppStoreDataMutation = useMutation({
    mutationFn: importAppStoreData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-appstore-apps"]
      });
      toast.success("Import muvaffaqiyatli");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi")
  });
  const handleAddApp = () => {
    setAppFormData(emptyAppForm);
    setIsAddAppDialogOpen(true);
  };
  const handleEditApp = (app) => {
    setSelectedApp(app);
    setAppFormData({
      name: app.name,
      tag: app.tag
    });
    setIsEditAppDialogOpen(true);
  };
  const handleDeleteApp = (app) => {
    setSelectedApp(app);
    setIsDeleteAppDialogOpen(true);
  };
  const handleVersions = (app) => {
    setSelectedApp(app);
    setIsVersionsDialogOpen(true);
  };
  const handleSaveApp = () => {
    if (isEditAppDialogOpen && selectedApp) {
      updateAppMutation.mutate({
        id: selectedApp.id,
        data: {
          name: appFormData.name
        }
      });
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
  const handleEditVersion = (version) => {
    setSelectedVersion(version);
    setVersionFormData({
      version: version.version,
      build_number: String(version.build_number),
      force_update: version.force_update,
      update_url: version.update_url || "",
      message: version.message || "",
      title: version.title || ""
    });
    setSelectedAppStoreAppForUrl("");
    setSelectedAppStoreAppVersionForUrl("");
    setIsEditVersionDialogOpen(true);
  };
  const handleDeleteVersion = (version) => {
    setSelectedVersion(version);
    setIsDeleteVersionDialogOpen(true);
  };
  const handleSaveVersion = () => {
    if (!versionFormData.version.trim()) {
      toast.error("Versiya raqami majburiy");
      return;
    }
    const payload = {
      version: versionFormData.version,
      build_number: Number(versionFormData.build_number) || 1,
      force_update: versionFormData.force_update,
      app_id: selectedApp.id
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
          title: payload.title
        }
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
    setCreateAppApkFile(null);
    setCreateAppInitialVersion("1.0.0");
    setCreateAppIconFile(null);
    setIsAddAppStoreAppDialogOpen(true);
  };
  const handleAddCreateScreenshots = (e) => {
    const files = Array.from(e.target.files || []);
    setAppStoreScreenshotFiles((prev) => [...prev, ...files]);
    if (createScreenshotInputRef.current) createScreenshotInputRef.current.value = "";
  };
  const handleRemoveCreateScreenshot = (idx) => {
    setAppStoreScreenshotFiles((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleAddEditScreenshots = (e) => {
    const files = Array.from(e.target.files || []);
    setEditAppStoreScreenshotFiles((prev) => [...prev, ...files]);
    if (editScreenshotInputRef.current) editScreenshotInputRef.current.value = "";
  };
  const handleRemoveEditScreenshot = (idx) => {
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
    if (createAppIconFile) fd.append("icon", createAppIconFile);
    createAppStoreAppMutation.mutate(fd);
  };
  const handleEditAppStoreApp = (app) => {
    setSelectedAppStoreApp(app);
    setAppStoreFormData({
      name: app.name,
      shortDescription: app.shortDescription,
      category: app.category,
      developer: app.developer || "",
      description: "",
      tags: (app.tags || []).join(", "),
      published: app.published
    });
    setEditAppStoreScreenshotFiles([]);
    setEditAppIconFile(null);
    setAppStoreAppDetail(null);
    fetchAppStoreApp(app.id).then((d) => setAppStoreAppDetail(d)).catch(() => {
    });
    setIsEditAppStoreAppDialogOpen(true);
  };
  const handleDeleteAppStoreApp = (app) => {
    setSelectedAppStoreApp(app);
    setIsDeleteAppStoreAppDialogOpen(true);
  };
  const handleToggleAppStoreAppPublish = (app) => {
    setSelectedAppStoreApp(app);
    toggleAppStoreAppPublishMutation.mutate(app.id);
  };
  const handleAppStoreVersions = (app) => {
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
    if (editAppIconFile) fd.append("icon", editAppIconFile);
    updateAppStoreAppMutation.mutate({
      id: selectedAppStoreApp.id,
      data: fd
    });
  };
  const handleConfirmDeleteAppStoreApp = () => {
    if (selectedAppStoreApp) deleteAppStoreAppMutation.mutate(selectedAppStoreApp.id);
  };
  const handleAddAppStoreVersion = () => {
    setAppStoreVersionFormData(emptyAppStoreVersionForm);
    setAppStoreApkFile(null);
    setIsAddAppStoreVersionDialogOpen(true);
  };
  const handleDeleteAppStoreVersion = (version) => {
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
    createAppStoreVersionMutation.mutate({
      appId: selectedAppStoreApp.id,
      data: fd
    });
  };
  const handleConfirmDeleteAppStoreVersion = () => {
    if (selectedAppStoreApp && selectedAppStoreVersion) {
      deleteAppStoreVersionMutation.mutate({
        appId: selectedAppStoreApp.id,
        version: selectedAppStoreVersion
      });
    }
  };
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsxs(AdminLayout, { title: t("adminMobileApps"), subtitle: t("adminMobileAppsSubtitle"), children: [
    isLoading && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-12", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "main", className: "space-y-4 mb-6", children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "main", children: [
          /* @__PURE__ */ jsx(Smartphone, { className: "h-4 w-4 mr-1.5" }),
          "Mavjud Ilovalar"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "appstore", children: [
          /* @__PURE__ */ jsx(Store, { className: "h-4 w-4 mr-1.5" }),
          "AppStore"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "main", className: "space-y-4 mt-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative max-w-md flex-1 min-w-[200px]", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { placeholder: "Qidirish (nomi, tag)...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground whitespace-nowrap", children: [
              "Jami: ",
              filteredApps.length,
              " ta ilova"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "inline-flex rounded-xl border bg-muted/40 p-1", children: [
              /* @__PURE__ */ jsx(Button, { type: "button", variant: viewMode === "table" ? "default" : "ghost", size: "sm", className: "rounded-lg px-4", onClick: () => setViewMode("table"), children: t("tableView") }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: viewMode === "items" ? "default" : "ghost", size: "sm", className: "rounded-lg px-4", onClick: () => setViewMode("items"), children: t("cardsView") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Button, { onClick: handleAddApp, className: "w-full sm:w-auto", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            t("add")
          ] })
        ] }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
          viewMode === "table" ? /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: t("name") }),
              /* @__PURE__ */ jsx(TableHead, { children: "Tag" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Yaratilgan sana" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Versiyalar" }),
              /* @__PURE__ */ jsx(TableHead, { className: "w-[80px]", children: "Amallar" })
            ] }) }),
            /* @__PURE__ */ jsx(TableBody, { children: filteredApps.map((app) => /* @__PURE__ */ jsxs(TableRow, { className: "group", children: [
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-lg border bg-muted/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(Smartphone, { className: "h-5 w-5 text-muted-foreground" }) }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: app.name })
              ] }) }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", children: app.tag }) }),
              /* @__PURE__ */ jsx(TableCell, { children: new Date(app.created_at).toLocaleDateString() }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleVersions(app), children: [
                /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 mr-1" }),
                "Boshqarish"
              ] }) }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "opacity-0 group-hover:opacity-100 transition-opacity max-sm:opacity-100", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
                /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
                  /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Amallar" }),
                  /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleVersions(app), children: [
                    /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 mr-2" }),
                    "Versiyalar"
                  ] }),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleEditApp(app), children: [
                    /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
                    "Tahrirlash"
                  ] }),
                  /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleDeleteApp(app), className: "text-red-600 focus:text-red-600", children: [
                    /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                    "O'chirish"
                  ] })
                ] })
              ] }) })
            ] }, app.id)) })
          ] }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-2", children: filteredApps.map((app) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-background p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl border bg-muted/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(Smartphone, { className: "h-5 w-5 text-muted-foreground" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-medium", children: app.name }),
                  /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "mt-0.5", children: app.tag })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
                /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleVersions(app), children: [
                    /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 mr-2" }),
                    "Versiyalar"
                  ] }),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleEditApp(app), children: [
                    /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
                    "Tahrirlash"
                  ] }),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleDeleteApp(app), className: "text-red-600", children: [
                    /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                    "O'chirish"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "Yaratilgan: ",
              new Date(app.created_at).toLocaleDateString()
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "mt-2 w-full", onClick: () => handleVersions(app), children: [
              /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 mr-2" }),
              "Versiyalarni boshqarish"
            ] })
          ] }, app.id)) }),
          filteredApps.length === 0 && !isLoading && /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Smartphone, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
            /* @__PURE__ */ jsx("p", { children: "Ilovalar topilmadi" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "appstore", className: "space-y-4 mt-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative max-w-md flex-1 min-w-[200px]", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { placeholder: "Qidirish (nomi, dasturchi, kategoriya)...", value: appstoreSearchQuery, onChange: (e) => setAppstoreSearchQuery(e.target.value), className: "pl-9" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground whitespace-nowrap", children: [
              "Jami: ",
              filteredAppStoreApps.length,
              " ta ilova"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "inline-flex rounded-xl border bg-muted/40 p-1", children: [
              /* @__PURE__ */ jsx(Button, { type: "button", variant: appstoreViewMode === "table" ? "default" : "ghost", size: "sm", className: "rounded-lg px-4", onClick: () => setAppstoreViewMode("table"), children: t("tableView") }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: appstoreViewMode === "items" ? "default" : "ghost", size: "sm", className: "rounded-lg px-4", onClick: () => setAppstoreViewMode("items"), children: t("cardsView") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxs(Button, { onClick: handleAddAppStoreApp, className: "w-full sm:w-auto", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
              t("add")
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600", onClick: () => setIsClearAppStoreDataDialogOpen(true), title: "AppStore ma'lumotlarini tozalash", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", onClick: () => exportAppStoreDataMutation.mutate(), disabled: exportAppStoreDataMutation.isPending, title: "Eksport", children: exportAppStoreDataMutation.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", onClick: () => {
              refetchAppStoreApps();
            }, disabled: isAppStoreFetching, title: "Yangilash", children: /* @__PURE__ */ jsx(RefreshCw, { className: `h-4 w-4 ${isAppStoreFetching ? "animate-spin" : ""}` }) }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", onClick: () => appStoreImportInputRef.current?.click(), disabled: importAppStoreDataMutation.isPending, title: "Import", children: importAppStoreDataMutation.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("input", { ref: appStoreImportInputRef, type: "file", accept: ".zip,application/zip", className: "hidden", onChange: (e) => {
              const file = e.target.files?.[0];
              if (file) importAppStoreDataMutation.mutate(file);
              if (e.target) e.target.value = "";
            } })
          ] })
        ] }),
        (importAppStoreDataMutation.isPending || exportAppStoreDataMutation.isPending) && /* @__PURE__ */ jsx("div", { className: "w-full bg-muted rounded-full h-2 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "bg-primary h-full rounded-full animate-pulse", style: {
          width: "60%"
        } }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: appstoreLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-12", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : filteredAppStoreApps.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Store, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
          /* @__PURE__ */ jsx("p", { children: "AppStore ilovalari topilmadi" })
        ] }) : appstoreViewMode === "table" ? /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: t("name") }),
            /* @__PURE__ */ jsx(TableHead, { children: "Dasturchi" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Kategoriya" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Versiya" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Yuklamalar" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Holat" }),
            /* @__PURE__ */ jsx(TableHead, { className: "w-[80px]", children: "Amallar" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: filteredAppStoreApps.map((app) => /* @__PURE__ */ jsxs(TableRow, { className: "group", children: [
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "h-9 w-9 rounded-lg border bg-muted/20 flex items-center justify-center overflow-hidden shrink-0", children: [
                app.icon ? /* @__PURE__ */ jsx("img", { src: getAppStoreAssetUrl(app.icon), alt: app.name, className: "h-full w-full object-cover", onError: (e) => {
                  const img = e.target;
                  img.style.display = "none";
                  const parent = img.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector(".app-icon-fallback");
                    if (fallback) fallback.classList.remove("hidden");
                  }
                } }) : null,
                /* @__PURE__ */ jsx(Store, { className: "h-5 w-5 text-muted-foreground app-icon-fallback" + (app.icon ? " hidden" : "") })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium truncate block", children: app.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate", children: app.shortDescription })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "truncate block max-w-[120px]", children: app.developer || "—" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", children: app.category }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "font-mono whitespace-nowrap", children: app.latestVersion || "—" }),
            /* @__PURE__ */ jsx(TableCell, { className: "whitespace-nowrap", children: app.totalDownloads.toLocaleString() }),
            /* @__PURE__ */ jsx(TableCell, { children: app.published ? /* @__PURE__ */ jsx(Badge, { variant: "default", className: "bg-green-600 whitespace-nowrap", children: "Nashr qilingan" }) : /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "whitespace-nowrap", children: "Qoralama" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "opacity-0 group-hover:opacity-100 transition-opacity max-sm:opacity-100", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
              /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
                /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Amallar" }),
                /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleAppStoreVersions(app), children: [
                  /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 mr-2" }),
                  "Versiyalar"
                ] }),
                /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleEditAppStoreApp(app), children: [
                  /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
                  "Tahrirlash"
                ] }),
                /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleToggleAppStoreAppPublish(app), children: [
                  /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
                  app.published ? "Qoralama" : "Nashr qilish"
                ] }),
                /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleDeleteAppStoreApp(app), className: "text-red-600 focus:text-red-600", children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                  "O'chirish"
                ] })
              ] })
            ] }) })
          ] }, app.id)) })
        ] }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2", children: appstoreApps.map((app) => /* @__PURE__ */ jsxs("div", { className: "group rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border flex items-center justify-center overflow-hidden shrink-0 shadow-sm", children: [
                  app.icon ? /* @__PURE__ */ jsx("img", { src: getAppStoreAssetUrl(app.icon), alt: app.name, className: "h-full w-full object-cover", onError: (e) => {
                    const img = e.target;
                    img.style.display = "none";
                    const parent = img.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector(".app-icon-fallback");
                      if (fallback) fallback.classList.remove("hidden");
                    }
                  } }) : null,
                  /* @__PURE__ */ jsx(Store, { className: "h-7 w-7 text-primary/60 app-icon-fallback" + (app.icon ? " hidden" : "") })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-base truncate", children: app.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground line-clamp-2", children: app.shortDescription })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity max-sm:opacity-100", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
                /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-44", children: [
                  /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Amallar" }),
                  /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleAppStoreVersions(app), children: [
                    /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 mr-2" }),
                    "Versiyalar"
                  ] }),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleEditAppStoreApp(app), children: [
                    /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
                    "Tahrirlash"
                  ] }),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleToggleAppStoreAppPublish(app), children: [
                    /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
                    app.published ? "Qoralama" : "Nashr qilish"
                  ] }),
                  /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleDeleteAppStoreApp(app), className: "text-red-600 focus:text-red-600", children: [
                    /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                    "O'chirish"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 mt-4 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "rounded-md px-2 py-0.5 text-xs font-normal shrink-0", children: app.developer || app.category }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Package, { className: "h-3.5 w-3.5 shrink-0" }),
                app.latestVersion || "—"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 ml-auto max-sm:ml-0", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium tabular-nums", children: app.totalDownloads.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { children: "yuklama" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex border-t bg-muted/20 divide-x", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => handleAppStoreVersions(app), className: "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors", children: [
              /* @__PURE__ */ jsx(Package, { className: "h-3.5 w-3.5" }),
              "Versiyalar"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => handleEditAppStoreApp(app), className: "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors", children: [
              /* @__PURE__ */ jsx(Edit, { className: "h-3.5 w-3.5" }),
              "Tahrirlash"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { className: "flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors w-full h-full", children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" }),
                app.published ? "Nashr" : "Qoralama"
              ] }) }),
              /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-44", children: [
                /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleToggleAppStoreAppPublish(app), children: [
                  /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
                  app.published ? "Qoralama" : "Nashr qilish"
                ] }),
                /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleDeleteAppStoreApp(app), className: "text-red-600 focus:text-red-600", children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                  "O'chirish"
                ] })
              ] })
            ] }) })
          ] })
        ] }, app.id)) }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AlertDialog, { open: isClearAppStoreDataDialogOpen, onOpenChange: setIsClearAppStoreDataDialogOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { className: "text-red-600", children: "AppStore ma'lumotlarini tozalash" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground", children: "Bu amal qaytarib bo'lmaydi!" }),
          /* @__PURE__ */ jsx("p", { children: "Barcha AppStore ilovalari, versiyalar, skrinshotlar, foydalanuvchilar va boshqa ma'lumotlar butunlay o'chiriladi. Ma'lumotlar dastlabki holatga qaytariladi." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: () => clearAppStoreDataMutation.mutate(), className: "bg-red-600 hover:bg-red-700", children: "Ha, tozalash" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isEditAppStoreAppDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsEditAppStoreAppDialogOpen(false);
        setSelectedAppStoreApp(null);
        setAppStoreFormData(emptyAppStoreAppForm);
        setEditAppIconFile(null);
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "AppStore ilovasini tahrirlash" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Ilova ma'lumotlarini tahrirlang" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative group cursor-pointer", onClick: () => editIconInputRef.current?.click(), children: [
            /* @__PURE__ */ jsx("div", { className: "h-24 w-24 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary/50 group-hover:bg-muted/40", children: editAppIconFile ? /* @__PURE__ */ jsx("img", { src: URL.createObjectURL(editAppIconFile), alt: "Icon preview", className: "h-full w-full object-cover" }) : selectedAppStoreApp?.icon ? /* @__PURE__ */ jsx("img", { src: getAppStoreAssetUrl(selectedAppStoreApp.icon), alt: "Current icon", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Image, { className: "h-8 w-8" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-center leading-tight", children: [
                "Ikonka",
                /* @__PURE__ */ jsx("br", {}),
                "yuklash"
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow", children: /* @__PURE__ */ jsx(Upload, { className: "h-3 w-3" }) }),
            editAppIconFile && /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => {
              e.stopPropagation();
              setEditAppIconFile(null);
              if (editIconInputRef.current) editIconInputRef.current.value = "";
            }, className: "absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: editAppIconFile ? `Yangi ikonka tanlandi: ${editAppIconFile.name}` : selectedAppStoreApp?.icon ? "Bosib yangi ikonka tanlang" : "Ikonka (max 512KB, ixtiyoriy)" }),
          /* @__PURE__ */ jsx("input", { ref: editIconInputRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
            const file = e.target.files?.[0];
            if (file) setEditAppIconFile(file);
            if (editIconInputRef.current) editIconInputRef.current.value = "";
          } })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-name", children: "Nomi *" }),
          /* @__PURE__ */ jsx(Input, { id: "as-name", value: appStoreFormData.name, onChange: (e) => setAppStoreFormData({
            ...appStoreFormData,
            name: e.target.value
          }), placeholder: "Ilova nomi" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-desc", children: "Qisqa tavsif *" }),
          /* @__PURE__ */ jsx(Input, { id: "as-desc", value: appStoreFormData.shortDescription, onChange: (e) => setAppStoreFormData({
            ...appStoreFormData,
            shortDescription: e.target.value
          }), placeholder: "Qisqa tavsif" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-category", children: "Kategoriya" }),
          /* @__PURE__ */ jsxs(Select, { value: appStoreFormData.category, onValueChange: (val) => setAppStoreFormData({
            ...appStoreFormData,
            category: val
          }), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { id: "as-category", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Kategoriyani tanlang" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: appstoreCategories.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c.id, children: c.labelUz || c.name }, c.id)) })
          ] }, appStoreFormData.category)
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-developer", children: "Dasturchi" }),
          /* @__PURE__ */ jsxs(Select, { value: appStoreFormData.developer, onValueChange: (val) => setAppStoreFormData({
            ...appStoreFormData,
            developer: val
          }), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { id: "as-developer", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Dasturchini tanlang" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: appstoreUsers.map((u) => /* @__PURE__ */ jsx(SelectItem, { value: u.displayName || u.username, children: u.displayName || u.username }, u.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-tags", children: "Teglar" }),
          /* @__PURE__ */ jsx(Input, { id: "as-tags", value: appStoreFormData.tags, onChange: (e) => setAppStoreFormData({
            ...appStoreFormData,
            tags: e.target.value
          }), placeholder: "vergul bilan ajrating" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Skrinshotlar" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-nowrap gap-2 overflow-x-auto pb-1 max-w-full", children: [
            appStoreAppDetail?.screenshots?.map((url, idx) => /* @__PURE__ */ jsxs("div", { className: "relative group flex-none", children: [
              /* @__PURE__ */ jsx("img", { src: getAppStoreAssetUrl(url), alt: `Screenshot ${idx + 1}`, className: "h-20 w-28 rounded-lg border object-cover" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                if (selectedAppStoreApp) {
                  editDeleteScreenshotMutation.mutate({
                    appId: selectedAppStoreApp.id,
                    index: idx
                  });
                }
              }, className: "absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
            ] }, idx)),
            editAppStoreScreenshotFiles.map((file, idx) => /* @__PURE__ */ jsxs("div", { className: "relative group flex-none", children: [
              /* @__PURE__ */ jsx("img", { src: URL.createObjectURL(file), alt: `New screenshot ${idx + 1}`, className: "h-20 w-28 rounded-lg border object-cover opacity-70" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleRemoveEditScreenshot(idx), className: "absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
            ] }, `new-${idx}`)),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 flex-none", children: [
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => editScreenshotInputRef.current?.click(), className: "h-20 w-28 flex-none rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/60 hover:text-muted-foreground/80 transition-colors", children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "Qo'shish" })
              ] }),
              /* @__PURE__ */ jsx("input", { ref: editScreenshotInputRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: handleAddEditScreenshots }),
              editAppStoreScreenshotFiles.length > 0 && /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "outline", className: "h-7 text-xs", disabled: !selectedAppStoreApp, onClick: () => {
                if (selectedAppStoreApp && editAppStoreScreenshotFiles.length > 0) {
                  editUploadScreenshotsMutation.mutate({
                    appId: selectedAppStoreApp.id,
                    files: editAppStoreScreenshotFiles
                  });
                }
              }, children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-3 w-3 mr-1" }),
                "Yuklash"
              ] })
            ] })
          ] }),
          !appStoreAppDetail?.screenshots?.length && editAppStoreScreenshotFiles.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Hali skrinshot yo'q" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx(Checkbox, { id: "as-published", checked: appStoreFormData.published, onCheckedChange: (checked) => setAppStoreFormData({
            ...appStoreFormData,
            published: checked
          }) }),
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-published", children: "Nashr qilingan" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
          setIsEditAppStoreAppDialogOpen(false);
          setSelectedAppStoreApp(null);
          setAppStoreFormData(emptyAppStoreAppForm);
          setEditAppStoreScreenshotFiles([]);
          setEditAppIconFile(null);
          setAppStoreAppDetail(null);
        }, children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSaveAppStoreApp, children: t("save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isAddAppStoreAppDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsAddAppStoreAppDialogOpen(false);
        setAppStoreFormData(emptyAppStoreAppForm);
        setAppStoreScreenshotFiles([]);
        setCreateAppApkFile(null);
        setCreateAppInitialVersion("1.0.0");
        setCreateAppIconFile(null);
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Yangi AppStore ilovasi" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Yangi ilova yaratish uchun ma'lumotlarni kiriting" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative group cursor-pointer", onClick: () => createIconInputRef.current?.click(), children: [
            /* @__PURE__ */ jsx("div", { className: "h-24 w-24 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary/50 group-hover:bg-muted/40", children: createAppIconFile ? /* @__PURE__ */ jsx("img", { src: URL.createObjectURL(createAppIconFile), alt: "Icon preview", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Image, { className: "h-8 w-8" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-center leading-tight", children: [
                "Ikonka",
                /* @__PURE__ */ jsx("br", {}),
                "yuklash"
              ] })
            ] }) }),
            createAppIconFile && /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => {
              e.stopPropagation();
              setCreateAppIconFile(null);
              if (createIconInputRef.current) createIconInputRef.current.value = "";
            }, className: "absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Ikonka (max 512KB, ixtiyoriy)" }),
          /* @__PURE__ */ jsx("input", { ref: createIconInputRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
            const file = e.target.files?.[0];
            if (file) setCreateAppIconFile(file);
            if (createIconInputRef.current) createIconInputRef.current.value = "";
          } })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-new-name", children: "Nomi *" }),
          /* @__PURE__ */ jsx(Input, { id: "as-new-name", value: appStoreFormData.name, onChange: (e) => setAppStoreFormData({
            ...appStoreFormData,
            name: e.target.value
          }), placeholder: "Ilova nomi" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-new-desc", children: "Qisqa tavsif *" }),
          /* @__PURE__ */ jsx(Input, { id: "as-new-desc", value: appStoreFormData.shortDescription, onChange: (e) => setAppStoreFormData({
            ...appStoreFormData,
            shortDescription: e.target.value
          }), placeholder: "Qisqa tavsif" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-new-category", children: "Kategoriya" }),
          /* @__PURE__ */ jsxs(Select, { value: appStoreFormData.category, onValueChange: (val) => setAppStoreFormData({
            ...appStoreFormData,
            category: val
          }), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { id: "as-new-category", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Kategoriyani tanlang" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: appstoreCategories.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c.id, children: c.labelUz || c.name }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-new-developer", children: "Dasturchi" }),
          /* @__PURE__ */ jsxs(Select, { value: appStoreFormData.developer, onValueChange: (val) => setAppStoreFormData({
            ...appStoreFormData,
            developer: val
          }), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { id: "as-new-developer", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Dasturchini tanlang" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: appstoreUsers.map((u) => /* @__PURE__ */ jsx(SelectItem, { value: u.displayName || u.username, children: u.displayName || u.username }, u.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-new-tags", children: "Teglar" }),
          /* @__PURE__ */ jsx(Input, { id: "as-new-tags", value: appStoreFormData.tags, onChange: (e) => setAppStoreFormData({
            ...appStoreFormData,
            tags: e.target.value
          }), placeholder: "vergul bilan ajrating" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Skrinshotlar" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-nowrap gap-2 overflow-x-auto pb-1 max-w-full", children: [
            appStoreScreenshotFiles.map((file, idx) => /* @__PURE__ */ jsxs("div", { className: "relative group flex-none", children: [
              /* @__PURE__ */ jsx("img", { src: URL.createObjectURL(file), alt: `Screenshot ${idx + 1}`, className: "h-20 w-28 rounded-lg border object-cover" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleRemoveCreateScreenshot(idx), className: "absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
            ] }, idx)),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => createScreenshotInputRef.current?.click(), className: "h-20 w-28 flex-none rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/60 hover:text-muted-foreground/80 transition-colors", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "Qo'shish" })
            ] }),
            /* @__PURE__ */ jsx("input", { ref: createScreenshotInputRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: handleAddCreateScreenshots })
          ] }),
          appStoreScreenshotFiles.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Hali skrinshot tanlanmadi" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Birinchi versiya (ixtiyoriy)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Input, { value: createAppInitialVersion, onChange: (e) => setCreateAppInitialVersion(e.target.value), placeholder: "1.0.0", className: "w-24 font-mono shrink-0" }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", className: "flex-1 justify-start text-left font-normal truncate", onClick: () => createApkInputRef.current?.click(), children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-2 shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: createAppApkFile ? createAppApkFile.name : "APK fayl tanlang" })
            ] }),
            createAppApkFile && /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "shrink-0 text-red-500 hover:text-red-600", onClick: () => {
              setCreateAppApkFile(null);
              if (createApkInputRef.current) createApkInputRef.current.value = "";
            }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("input", { ref: createApkInputRef, type: "file", accept: ".apk,application/vnd.android.package-archive", className: "hidden", onChange: (e) => {
              const file = e.target.files?.[0];
              if (file) setCreateAppApkFile(file);
              if (createApkInputRef.current) createApkInputRef.current.value = "";
            } })
          ] }),
          createAppApkFile && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            (createAppApkFile.size / 1024 / 1024).toFixed(2),
            " MB"
          ] }),
          !createAppApkFile && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: `APK yuklash ixtiyoriy. Keyinroq "Versiyalar" bo'limidan qo'shish mumkin.` })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx(Checkbox, { id: "as-new-published", checked: appStoreFormData.published, onCheckedChange: (checked) => setAppStoreFormData({
            ...appStoreFormData,
            published: checked
          }) }),
          /* @__PURE__ */ jsx(Label, { htmlFor: "as-new-published", children: "Nashr qilingan" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
          setIsAddAppStoreAppDialogOpen(false);
          setAppStoreFormData(emptyAppStoreAppForm);
          setAppStoreScreenshotFiles([]);
          setCreateAppApkFile(null);
          setCreateAppInitialVersion("1.0.0");
          setCreateAppIconFile(null);
        }, children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSaveNewAppStoreApp, disabled: createAppStoreAppMutation.isPending, className: "min-w-[140px]", children: createAppStoreAppMutation.isPending ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 w-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 w-full", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-1 h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary rounded-full transition-all duration-300", style: {
              width: `${createProgress}%`
            } }) }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium tabular-nums", children: [
              createProgress,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: createPhase === "ilova" ? "Ma'lumotlar yuklanmoqda..." : createPhase === "skrinshot" ? "Skrinshotlar yuklanmoqda..." : createPhase === "apk" ? "APK yuklanmoqda..." : "" })
        ] }) : t("save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: isDeleteAppStoreAppDialogOpen, onOpenChange: setIsDeleteAppStoreAppDialogOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "AppStore ilovasini o'chirish" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "Haqiqatan ham ",
          /* @__PURE__ */ jsx("strong", { children: selectedAppStoreApp?.name }),
          " ilovasini o'chirmoqchimisiz?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleConfirmDeleteAppStoreApp, className: "bg-red-600 hover:bg-red-700", children: "O'chirish" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isAppStoreVersionsDialogOpen, onOpenChange: (open) => {
      setIsAppStoreVersionsDialogOpen(open);
      if (!open) setSelectedAppStoreApp(null);
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-3xl max-h-[80vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { children: [
          "Versiyalar — ",
          selectedAppStoreApp?.name
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "AppStore ilova versiyalarini boshqarish" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: handleAddAppStoreVersion, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Yangi versiya"
        ] }) }),
        appstoreVersions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Package, { className: "h-10 w-10 mx-auto mb-2 opacity-50" }),
          /* @__PURE__ */ jsx("p", { children: "Versiyalar topilmadi" })
        ] }) : /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Versiya" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Android" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Hajmi" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Yuklamalar" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Oxirgi" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Sana" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Amallar" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: appstoreVersions.slice().sort((a, b) => {
            if (a.isLatest) return -1;
            if (b.isLatest) return 1;
            return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
          }).map((v) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "font-mono font-medium", children: v.version }),
            /* @__PURE__ */ jsx(TableCell, { children: v.minAndroid }),
            /* @__PURE__ */ jsx(TableCell, { children: v.fileSize || "—" }),
            /* @__PURE__ */ jsx(TableCell, { children: v.downloadCount }),
            /* @__PURE__ */ jsx(TableCell, { children: v.isLatest ? /* @__PURE__ */ jsx(Badge, { variant: "default", className: "bg-blue-600", children: "So'nggi" }) : /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Eski" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: new Date(v.releaseDate).toLocaleDateString() }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
              v.downloadUrl && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => window.open(getAppStoreAssetUrl(v.downloadUrl), "_blank"), children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", onClick: () => handleDeleteAppStoreVersion(v.version), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] }) })
          ] }, v.version)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsAppStoreVersionsDialogOpen(false), children: "Yopish" }) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isAddAppStoreVersionDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsAddAppStoreVersionDialogOpen(false);
        setAppStoreVersionFormData(emptyAppStoreVersionForm);
        setAppStoreApkFile(null);
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Yangi versiya qo'shish" }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          selectedAppStoreApp?.name,
          " ilovasi uchun yangi versiya"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "asv-version", children: "Versiya *" }),
          /* @__PURE__ */ jsx(Input, { id: "asv-version", value: appStoreVersionFormData.version, onChange: (e) => setAppStoreVersionFormData({
            ...appStoreVersionFormData,
            version: e.target.value
          }), placeholder: "1.0.0" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "asv-minandroid", children: "Min Android" }),
          /* @__PURE__ */ jsx(Input, { id: "asv-minandroid", value: appStoreVersionFormData.minAndroid, onChange: (e) => setAppStoreVersionFormData({
            ...appStoreVersionFormData,
            minAndroid: e.target.value
          }), placeholder: "8.0" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "asv-changelog", children: "O'zgarishlar tarixi" }),
          /* @__PURE__ */ jsx(Textarea, { id: "asv-changelog", value: appStoreVersionFormData.changelog, onChange: (e) => setAppStoreVersionFormData({
            ...appStoreVersionFormData,
            changelog: e.target.value
          }), placeholder: "Versiyadagi o'zgarishlar", rows: 3 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "asv-apk", children: "APK fayl *" }),
          /* @__PURE__ */ jsx(Input, { id: "asv-apk", type: "file", accept: ".apk,application/vnd.android.package-archive", onChange: (e) => setAppStoreApkFile(e.target.files?.[0] || null) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
          setIsAddAppStoreVersionDialogOpen(false);
          setAppStoreVersionFormData(emptyAppStoreVersionForm);
          setAppStoreApkFile(null);
        }, children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSaveAppStoreVersion, children: t("save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: isDeleteAppStoreVersionDialogOpen, onOpenChange: setIsDeleteAppStoreVersionDialogOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Versiyani o'chirish" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "Haqiqatan ham ",
          /* @__PURE__ */ jsx("strong", { children: selectedAppStoreVersion }),
          " versiyasini o'chirmoqchimisiz?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleConfirmDeleteAppStoreVersion, className: "bg-red-600 hover:bg-red-700", children: "O'chirish" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isAddAppDialogOpen || isEditAppDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsAddAppDialogOpen(false);
        setIsEditAppDialogOpen(false);
        setAppFormData(emptyAppForm);
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: isEditAppDialogOpen ? "Ilovani tahrirlash" : "Yangi ilova qo'shish" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: isEditAppDialogOpen ? "Ilova ma'lumotlarini tahrirlang" : "Yangi ilova yaratish uchun ma'lumotlarni kiriting" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "app-name", children: "Nomi *" }),
          /* @__PURE__ */ jsx(Input, { id: "app-name", value: appFormData.name, onChange: (e) => setAppFormData({
            ...appFormData,
            name: e.target.value
          }), placeholder: "Ilova nomi" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(Label, { htmlFor: "app-tag", children: [
            "Tag ",
            !isEditAppDialogOpen && "*"
          ] }),
          /* @__PURE__ */ jsx(Input, { id: "app-tag", value: appFormData.tag, onChange: (e) => setAppFormData({
            ...appFormData,
            tag: e.target.value
          }), placeholder: "Masalan: agent, delivery", disabled: isEditAppDialogOpen })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
          setIsAddAppDialogOpen(false);
          setIsEditAppDialogOpen(false);
          setAppFormData(emptyAppForm);
        }, children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSaveApp, children: t("save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: isDeleteAppDialogOpen, onOpenChange: setIsDeleteAppDialogOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Ilovani o'chirish" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "Haqiqatan ham ",
          /* @__PURE__ */ jsx("strong", { children: selectedApp?.name }),
          " ilovasini o'chirmoqchimisiz?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: confirmDeleteApp, className: "bg-red-600 hover:bg-red-700", children: "O'chirish" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isVersionsDialogOpen, onOpenChange: (open) => {
      setIsVersionsDialogOpen(open);
      if (!open) setSelectedApp(null);
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-3xl max-h-[80vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { children: [
          "Versiyalar — ",
          selectedApp?.name
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Ilova versiyalarini boshqarish" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: handleAddVersion, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Yangi versiya"
        ] }) }),
        versions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Package, { className: "h-10 w-10 mx-auto mb-2 opacity-50" }),
          /* @__PURE__ */ jsx("p", { children: "Versiyalar topilmadi" })
        ] }) : /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Versiya" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Build #" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Majburiy" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Sarlavha" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Sana" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Amallar" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: versions.map((v) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "font-mono font-medium", children: v.version }),
            /* @__PURE__ */ jsx(TableCell, { children: v.build_number }),
            /* @__PURE__ */ jsx(TableCell, { children: v.force_update ? /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: "Ha" }) : /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Yo'q" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "max-w-[200px] truncate", children: v.title || "—" }),
            /* @__PURE__ */ jsx(TableCell, { children: new Date(v.created_at).toLocaleDateString() }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleEditVersion(v), children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", onClick: () => handleDeleteVersion(v), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] }) })
          ] }, v.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsVersionsDialogOpen(false), children: "Yopish" }) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isAddVersionDialogOpen || isEditVersionDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setIsAddVersionDialogOpen(false);
        setIsEditVersionDialogOpen(false);
        setVersionFormData(emptyVersionForm);
        setSelectedAppStoreAppForUrl("");
        setSelectedAppStoreAppVersionForUrl("");
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: isEditVersionDialogOpen ? "Versiyani tahrirlash" : "Yangi versiya" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: isEditVersionDialogOpen ? "Versiya ma'lumotlarini yangilang" : `Yangi versiya — ${selectedApp?.name}` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ver-version", children: "Versiya *" }),
            /* @__PURE__ */ jsx(Input, { id: "ver-version", value: versionFormData.version, onChange: (e) => setVersionFormData({
              ...versionFormData,
              version: e.target.value
            }), placeholder: "1.0.0" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ver-build", children: "Build raqami" }),
            /* @__PURE__ */ jsx(Input, { id: "ver-build", type: "number", value: versionFormData.build_number, onChange: (e) => setVersionFormData({
              ...versionFormData,
              build_number: e.target.value
            }), placeholder: "1" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "AppStore ilovasidan URL olish" }),
          /* @__PURE__ */ jsxs(Select, { value: selectedAppStoreAppForUrl, onValueChange: (val) => {
            setSelectedAppStoreAppForUrl(val);
            setSelectedAppStoreAppVersionForUrl("");
          }, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Ilovani tanlang..." }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: appstoreApps.map((app) => /* @__PURE__ */ jsx(SelectItem, { value: app.id, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              app.icon && /* @__PURE__ */ jsx("img", { src: getAppStoreAssetUrl(app.icon), alt: "", className: "h-5 w-5 rounded object-cover" }),
              /* @__PURE__ */ jsx("span", { children: app.name })
            ] }) }, app.id)) })
          ] }),
          selectedAppStoreAppForUrl && appstoreAppDetailForUrl && /* @__PURE__ */ jsxs(Select, { value: selectedAppStoreAppVersionForUrl, onValueChange: (val) => {
            setSelectedAppStoreAppVersionForUrl(val);
            const versions2 = appstoreAppDetailForUrl.versions || [];
            const found = versions2.find((v) => v.version === val);
            if (found?.downloadUrl) {
              setVersionFormData((prev) => ({
                ...prev,
                update_url: getAppStoreAssetUrl(found.downloadUrl)
              }));
            }
          }, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Versiyani tanlang..." }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: (appstoreAppDetailForUrl.versions || []).slice().sort((a, b) => {
              if (a.isLatest) return -1;
              if (b.isLatest) return 1;
              return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
            }).map((v) => /* @__PURE__ */ jsxs(SelectItem, { value: v.version, children: [
              v.version,
              v.isLatest ? " (so'nggi)" : ""
            ] }, v.version)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ver-title", children: "Sarlavha" }),
            /* @__PURE__ */ jsx(Input, { id: "ver-title", value: versionFormData.title, onChange: (e) => setVersionFormData({
              ...versionFormData,
              title: e.target.value
            }), placeholder: "Yangilik sarlavhasi" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "ver-url", children: "Update URL" }),
            /* @__PURE__ */ jsx(Input, { id: "ver-url", value: versionFormData.update_url, onChange: (e) => setVersionFormData({
              ...versionFormData,
              update_url: e.target.value
            }), placeholder: "https://..." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "ver-message", children: "Xabar" }),
          /* @__PURE__ */ jsx(Textarea, { id: "ver-message", value: versionFormData.message, onChange: (e) => setVersionFormData({
            ...versionFormData,
            message: e.target.value
          }), placeholder: "Yangiliklar haqida ma'lumot", rows: 3 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx(Checkbox, { id: "ver-force", checked: versionFormData.force_update, onCheckedChange: (checked) => setVersionFormData({
            ...versionFormData,
            force_update: checked
          }) }),
          /* @__PURE__ */ jsx(Label, { htmlFor: "ver-force", children: "Majburiy yangilash" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
          setIsAddVersionDialogOpen(false);
          setIsEditVersionDialogOpen(false);
          setVersionFormData(emptyVersionForm);
        }, children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSaveVersion, children: t("save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: isDeleteVersionDialogOpen, onOpenChange: setIsDeleteVersionDialogOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Versiyani o'chirish" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "Haqiqatan ham ",
          /* @__PURE__ */ jsx("strong", { children: selectedVersion?.version }),
          " versiyasini o'chirmoqchimisiz?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Bekor qilish" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: confirmDeleteVersion, className: "bg-red-600 hover:bg-red-700", children: "O'chirish" })
      ] })
    ] }) })
  ] }) });
}
export {
  AdminMobileAppsPage as component
};
