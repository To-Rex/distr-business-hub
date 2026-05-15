import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import { useSettings } from "@/lib/settings";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  fetchCompanies,
  fetchSecurityKeys,
  createSecurityKey,
  updateSecurityKey,
  deleteSecurityKey,
  fetchAlembicVersions,
  createAlembicVersion,
  deleteAlembicVersion,
  fetchDatabaseInfo,
  getAdminToken,
  type ApiSecurityKey,
  type DatabaseInfoData,
} from "@/lib/admin-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Key,
  Database,
  Shield,
  Globe,
  Bell,
  Lock,
  RefreshCw,
  Plus,
  MoreVertical,
  Copy,
  Trash2,
  Edit3,
  Clock,
  Server,
  Webhook,
  Mail,
  CreditCard,

  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";



const initialWebhooks = [
  { id: 1, url: "https://api.example.com/webhooks/orders", events: ["order.created", "order.updated"], active: true },
  { id: 2, url: "https://api.example.com/webhooks/payments", events: ["payment.received", "payment.failed"], active: true },
];

const emailTemplates = [
  { id: 1, name: "Order Confirmation", subject: "Buyurtmangiz qabul qilindi", status: "active" },
  { id: 2, name: "Payment Receipt", subject: "To'lov qabul qilindi", status: "active" },
  { id: 3, name: "Password Reset", subject: "Parolni tiklash", status: "active" },
  { id: 4, name: "Welcome Email", subject: "Xush kelibsiz", status: "draft" },
];

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { t } = useSettings();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [isAddWebhookDialogOpen, setIsAddWebhookDialogOpen] = useState(false);
  const [newKeyCompanyId, setNewKeyCompanyId] = useState<string>("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [showAdminToken, setShowAdminToken] = useState(false);

  const { data: dbInfo, isLoading: isLoadingDbInfo } = useQuery({
    queryKey: ["admin-database-info"],
    queryFn: () => fetchDatabaseInfo(),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies(),
  });

  const { data: allSecurityKeys = [], isLoading: isLoadingKeys } = useQuery({
    queryKey: ["admin-all-security-keys"],
    queryFn: async () => {
      const allKeys: (ApiSecurityKey & { company_name?: string })[] = [];
      for (const company of companies) {
        const keys = await fetchSecurityKeys(company.id);
        allKeys.push(...keys.map((k) => ({ ...k, company_name: company.name })));
      }
      return allKeys;
    },
    enabled: companies.length > 0,
  });

  const { data: alembicVersions = [], isLoading: isLoadingAlembic } = useQuery({
    queryKey: ["admin-alembic-versions"],
    queryFn: () => fetchAlembicVersions(),
  });

  const currentAlembicVersion = alembicVersions.length > 0 ? alembicVersions[alembicVersions.length - 1].version_num : null;

  const [isAddAlembicDialogOpen, setIsAddAlembicDialogOpen] = useState(false);
  const [newAlembicVersionNum, setNewAlembicVersionNum] = useState("");

  const createAlembicMutation = useMutation({
    mutationFn: createAlembicVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-alembic-versions"] });
      toast.success("Alembic versiyasi qo'shildi");
      setIsAddAlembicDialogOpen(false);
      setNewAlembicVersionNum("");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const deleteAlembicMutation = useMutation({
    mutationFn: deleteAlembicVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-alembic-versions"] });
      toast.success("Alembic versiyasi o'chirildi");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const createKeyMutation = useMutation({
    mutationFn: ({ companyId, data }: { companyId: number; data: { key: string; company_id: number } }) =>
      createSecurityKey(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-security-keys"] });
      toast.success("Yangi xavfsizlik kaliti qo'shildi");
      setIsAddKeyDialogOpen(false);
      setNewKeyValue("");
      setNewKeyCompanyId("");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const deleteKeyMutation = useMutation({
    mutationFn: deleteSecurityKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-security-keys"] });
      toast.success("Xavfsizlik kaliti o'chirildi");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const updateKeyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { key?: string } }) => updateSecurityKey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-security-keys"] });
      toast.success("Xavfsizlik kaliti yangilandi");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const [generalSettings, setGeneralSettings] = useState({
    platformName: "Distr Business Hub",
    defaultLanguage: "uz",
    timezone: "Asia/Tashkent",
    dateFormat: "DD.MM.YYYY",
    pushNotifications: true,
    emailNotifications: true,
  });

  const [securitySettings, setSecuritySettings] = useState(() => ({
    sessionTimeout: localStorage.getItem("admin_session_timeout") || "8",
    maxLoginAttempts: localStorage.getItem("admin_max_login_attempts") || "5",
  }));

  const updateSecuritySetting = (key: string, value: string) => {
    setSecuritySettings((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(`admin_${key}`, value);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API kalit nusxalandi");
  };

  const handleToggleKeyVisibility = (id: number) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
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
      data: { key: newKeyValue, company_id: companyId },
    });
  };

  const handleDeleteSecurityKey = (id: number) => {
    deleteKeyMutation.mutate(id);
  };

  const handleAddWebhook = () => {
    if (!newWebhookUrl.trim()) {
      toast.error("Webhook URL manzilini kiriting");
      return;
    }
    const newWebhook = {
      id: Date.now(),
      url: newWebhookUrl,
      events: ["order.created"],
      active: true,
    };
    setWebhooks([...webhooks, newWebhook]);
    setNewWebhookUrl("");
    setIsAddWebhookDialogOpen(false);
    toast.success("Webhook qo'shildi");
  };

  const handleToggleWebhook = (id: number) => {
    setWebhooks(webhooks.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
    toast.success("Webhook holati o'zgartirildi");
  };

  const handleDeleteWebhook = (id: number) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    toast.success("Webhook o'chirildi");
  };

  return (
    <AdminGuard>
      <AdminLayout title={t("adminSettings")} subtitle={t("adminSettingsSubtitle")}>
        <div className="space-y-6">

           <Tabs defaultValue="general" className="space-y-6">
             <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
               <TabsTrigger value="general" className="gap-2">
                 <Shield className="h-4 w-4" />
                 <span className="hidden sm:inline">{t("general")}</span>
               </TabsTrigger>
               <TabsTrigger value="security" className="gap-2">
                 <Key className="h-4 w-4" />
                 <span className="hidden sm:inline">{t("securityKeys")}</span>
               </TabsTrigger>
               <TabsTrigger value="database" className="gap-2">
                 <Database className="h-4 w-4" />
                 <span className="hidden sm:inline">{t("database")}</span>
               </TabsTrigger>
             </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {t("localization")}
                  </CardTitle>
                  <CardDescription>{t("localizationDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platformName">{t("platformName")}</Label>
                      <Input
                        id="platformName"
                        value={generalSettings.platformName}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, platformName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultLanguage">{t("defaultLanguage")}</Label>
                      <Select
                        value={generalSettings.defaultLanguage}
                        onValueChange={(value) =>
                          setGeneralSettings({ ...generalSettings, defaultLanguage: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uz">O'zbekcha</SelectItem>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">{t("timezone")}</Label>
                      <Select
                        value={generalSettings.timezone}
                        onValueChange={(value) =>
                          setGeneralSettings({ ...generalSettings, timezone: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Tashkent">Toshkent (UTC+5)</SelectItem>
                          <SelectItem value="Asia/Samarkand">Samarqand (UTC+5)</SelectItem>
                          <SelectItem value="Europe/Moscow">Moskva (UTC+3)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">{t("dateFormat")}</Label>
                      <Select
                        value={generalSettings.dateFormat}
                        onValueChange={(value) =>
                          setGeneralSettings({ ...generalSettings, dateFormat: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {t("notifications")}
                  </CardTitle>
                  <CardDescription>{t("notificationsDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t("pushNotifications")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("pushNotificationsDesc")}
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, pushNotifications: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t("emailNotifications")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("emailNotificationsDesc")}
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, emailNotifications: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    {t("security")}
                  </CardTitle>
                  <CardDescription>{t("securityDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">{t("sessionTimeout")}</Label>
                      <Select
                        value={securitySettings.sessionTimeout}
                        onValueChange={(value) => updateSecuritySetting("sessionTimeout", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 soat</SelectItem>
                          <SelectItem value="4">4 soat</SelectItem>
                          <SelectItem value="8">8 soat</SelectItem>
                          <SelectItem value="24">24 soat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">{t("maxLoginAttempts")}</Label>
                      <Select
                        value={securitySettings.maxLoginAttempts}
                        onValueChange={(value) => updateSecuritySetting("maxLoginAttempts", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 urinish</SelectItem>
                          <SelectItem value="5">5 urinish</SelectItem>
                          <SelectItem value="10">10 urinish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {t("apiKeys")}
                    </CardTitle>
                    <CardDescription>{t("apiKeysDesc")}</CardDescription>
                  </div>
                  <Dialog open={isAddKeyDialogOpen} onOpenChange={(open) => { setIsAddKeyDialogOpen(open); if (!open) { setNewKeyValue(""); setNewKeyCompanyId(""); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("addKey")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("addNewKey")}</DialogTitle>
                        <DialogDescription>{t("addNewKeyDesc")}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Kompaniya *</Label>
                          <Select value={newKeyCompanyId} onValueChange={setNewKeyCompanyId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kompaniyani tanlang" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="keyValue">Kalit qiymati *</Label>
                          <Input
                            id="keyValue"
                            placeholder="API kalit qiymati"
                            value={newKeyValue}
                            onChange={(e) => setNewKeyValue(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddKeyDialogOpen(false)}>
                          {t("cancel")}
                        </Button>
                        <Button onClick={handleAddSecurityKey}>{t("create")}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {isLoadingKeys ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                   ) : isMobile ? (
                     <div className="space-y-3">
                       {allSecurityKeys.map((key) => (
                         <div key={key.id} className="rounded-lg border bg-card p-4 space-y-2">
                           <div className="flex items-center justify-between">
                             <span className="font-mono text-xs text-muted-foreground">#{key.id}</span>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 text-destructive shrink-0"
                               onClick={() => handleDeleteSecurityKey(key.id)}
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                           <p className="text-sm font-medium">{key.company_name || `#${key.company_id}`}</p>
                           <div className="flex items-center gap-2 font-mono text-xs bg-muted/50 rounded p-2 break-all">
                             <span className="flex-1 min-w-0">
                               {showKey[key.id]
                                 ? key.key
                                 : key.key.length > 20 ? key.key.slice(0, 8) + "••••" + key.key.slice(-4) : key.key}
                             </span>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-6 w-6 shrink-0"
                               onClick={() => handleToggleKeyVisibility(key.id)}
                             >
                               {showKey[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                             </Button>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-6 w-6 shrink-0"
                               onClick={() => handleCopyKey(key.key)}
                             >
                               <Copy className="h-3 w-3" />
                             </Button>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Kompaniya</TableHead>
                          <TableHead>{t("apiKey")}</TableHead>
                          <TableHead className="text-right">{t("actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allSecurityKeys.map((key) => (
                          <TableRow key={key.id}>
                            <TableCell className="font-mono text-sm">{key.id}</TableCell>
                            <TableCell>{key.company_name || `#${key.company_id}`}</TableCell>
                            <TableCell className="font-mono text-sm">
                              <span className="flex items-center gap-2">
                                {showKey[key.id]
                                  ? key.key
                                  : key.key.length > 20 ? key.key.slice(0, 8) + "••••" + key.key.slice(-4) : key.key}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleToggleKeyVisibility(key.id)}
                                >
                                  {showKey[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleCopyKey(key.key)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDeleteSecurityKey(key.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                   )}
                   {allSecurityKeys.length === 0 && !isLoadingKeys && (
                     <div className="text-center py-8 text-muted-foreground">
                       <Key className="h-10 w-10 mx-auto mb-2 opacity-50" />
                       <p>Xavfsizlik kalitlari topilmadi</p>
                     </div>
                   )}
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Lock className="h-5 w-5" />
                     Admin sessiya tokeni
                   </CardTitle>
                   <CardDescription>Joriy admin sessiyasi uchun autentifikatsiya tokeni</CardDescription>
                 </CardHeader>
                 <CardContent>
                   {(() => {
                     const token = getAdminToken();
                      return (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <Input
                            readOnly
                            value={token || "Token topilmadi"}
                            className="font-mono text-sm"
                            type={showAdminToken ? "text" : "password"}
                          />
                          <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0"
                           onClick={() => setShowAdminToken(!showAdminToken)}
                         >
                           {showAdminToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                         </Button>
                         {token && (
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-10 w-10"
                             onClick={() => {
                               navigator.clipboard.writeText(token);
                               toast.success("Token nusxalandi");
                             }}
                           >
                             <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          </div>
                        </div>
                     );
                   })()}
                 </CardContent>
               </Card>
             </TabsContent>

               <TabsContent value="database" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        {t("alembicVersions")}
                      </CardTitle>
                      <CardDescription>{t("alembicVersionsDesc")}</CardDescription>
                    </div>
                    <Dialog open={isAddAlembicDialogOpen} onOpenChange={(open) => { setIsAddAlembicDialogOpen(open); if (!open) setNewAlembicVersionNum(""); }}>
                      <DialogTrigger asChild>
                          <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Yangi versiya
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Yangi versiya</DialogTitle>
                          <DialogDescription>Yangi alembic versiyasini qo'shish</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="versionNum">Version num</Label>
                            <Input
                              id="versionNum"
                              placeholder="993860a7c014"
                              value={newAlembicVersionNum}
                              onChange={(e) => setNewAlembicVersionNum(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddAlembicDialogOpen(false)}>
                            {t("cancel")}
                          </Button>
                          <Button
                            onClick={() => {
                              if (!newAlembicVersionNum.trim()) {
                                toast.error("Version num ni kiriting");
                                return;
                              }
                              createAlembicMutation.mutate({ version_num: newAlembicVersionNum });
                            }}
                            disabled={createAlembicMutation.isPending}
                          >
                            {t("create")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                 <CardContent>
                   {isLoadingAlembic ? (
                     <div className="flex items-center justify-center p-8">
                       <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                     </div>
                   ) : (
                     <div className="space-y-4">
                       <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                           <Database className="h-5 w-5 text-primary" />
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-medium">{t("currentVersion")}</p>
                           <p className="text-xs text-muted-foreground">{t("headRevision")}</p>
                         </div>
                         <Badge variant="default" className="font-mono">
                           {currentAlembicVersion ? `${currentAlembicVersion.slice(0, 8)} (head)` : "-"}
                         </Badge>
                       </div>

                        {isMobile ? (
                          <div className="space-y-2">
                            {alembicVersions.map((version) => (
                              <div key={version.version_num} className="flex items-center justify-between rounded-lg border bg-card p-3">
                                <Badge variant="outline" className="font-mono">{version.version_num}</Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive shrink-0"
                                  onClick={() => deleteAlembicMutation.mutate(version.version_num)}
                                  disabled={deleteAlembicMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("version")}</TableHead>
                              <TableHead className="w-[100px]">{t("actions")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alembicVersions.map((version) => (
                              <TableRow key={version.version_num}>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono">{version.version_num}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => deleteAlembicMutation.mutate(version.version_num)}
                                    disabled={deleteAlembicMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        )}
                       {alembicVersions.length === 0 && (
                         <div className="text-center py-8 text-muted-foreground">
                           <Database className="h-10 w-10 mx-auto mb-2 opacity-50" />
                           <p>Alembic versiyalari topilmadi</p>
                         </div>
                       )}
                     </div>
                   )}
                 </CardContent>
               </Card>

               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    {t("databaseInfo")}
                  </CardTitle>
                  <CardDescription>{t("databaseInfoDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDbInfo ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : dbInfo ? (
                    <div className="space-y-6">
                      {/* Summary cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg border bg-card">
                          <p className="text-sm text-muted-foreground">{t("dbSize")}</p>
                          <p className="text-2xl font-bold mt-1">{dbInfo.database_size}</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                          <p className="text-sm text-muted-foreground">{t("tables")}</p>
                          <p className="text-2xl font-bold mt-1">{dbInfo.total_tables}</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                          <p className="text-sm text-muted-foreground">{t("connections")}</p>
                          <p className="text-2xl font-bold mt-1">{dbInfo.active_connections} / {dbInfo.max_connections}</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                          <p className="text-sm text-muted-foreground">{t("uptime")}</p>
                          <p className="text-2xl font-bold mt-1">{dbInfo.server_uptime}</p>
                        </div>
                      </div>

                      {/* Server details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg border bg-card">
                          <p className="text-xs text-muted-foreground">Database nomi</p>
                          <p className="text-sm font-medium">{dbInfo.database_name}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <p className="text-xs text-muted-foreground">Server versiyasi</p>
                          <p className="text-sm font-medium">{dbInfo.server_version}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <p className="text-xs text-muted-foreground">Cache hit ratio</p>
                          <p className="text-sm font-medium">{dbInfo.cache_hit_ratio}%</p>
                        </div>
                      </div>

                      {/* Connections table */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Ulanishlar ({dbInfo.connections.length})</h4>
                        <div className="max-h-48 overflow-y-auto border rounded-lg">
                          <table className="w-full text-xs">
                            <thead className="bg-muted/50 sticky top-0">
                              <tr>
                                <th className="text-left p-2 font-medium">PID</th>
                                <th className="text-left p-2 font-medium">Username</th>
                                <th className="text-left p-2 font-medium">Application</th>
                                <th className="text-left p-2 font-medium">State</th>
                                <th className="text-left p-2 font-medium">Query</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dbInfo.connections.map((conn) => (
                                <tr key={conn.pid} className="border-t">
                                  <td className="p-2 font-mono">{conn.pid}</td>
                                  <td className="p-2">{conn.username || "—"}</td>
                                  <td className="p-2">{conn.application_name || "—"}</td>
                                  <td className="p-2">{conn.state || "—"}</td>
                                  <td className="p-2 max-w-[200px] truncate">{conn.query || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Tables list */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Jadvallar ({dbInfo.tables.length})</h4>
                        <div className="max-h-64 overflow-y-auto border rounded-lg">
                          <table className="w-full text-xs">
                            <thead className="bg-muted/50 sticky top-0">
                              <tr>
                                <th className="text-left p-2 font-medium">#</th>
                                <th className="text-left p-2 font-medium">Table nomi</th>
                                <th className="text-right p-2 font-medium">Qatorlar</th>
                                <th className="text-right p-2 font-medium">Umumiy</th>
                                <th className="text-right p-2 font-medium">Table</th>
                                <th className="text-right p-2 font-medium">Index</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dbInfo.tables.map((tbl, i) => (
                                <tr key={tbl.table_name} className="border-t">
                                  <td className="p-2 text-muted-foreground">{i + 1}</td>
                                  <td className="p-2 font-medium">{tbl.table_name}</td>
                                  <td className="p-2 text-right">{tbl.row_count.toLocaleString()}</td>
                                  <td className="p-2 text-right">{tbl.total_size}</td>
                                  <td className="p-2 text-right">{tbl.table_size}</td>
                                  <td className="p-2 text-right">{tbl.index_size}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Server className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Ma'lumotlar bazasi ma'lumotlari yuklanmadi</p>
                    </div>
                  )}
                </CardContent>
               </Card>
             </TabsContent>
           </Tabs>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
