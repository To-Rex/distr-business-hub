import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import { useSettings } from "@/lib/settings";
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
  Check,
  Clock,
  Server,
  Webhook,
  Mail,
  CreditCard,
  Download,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

// Security Keys data
const initialSecurityKeys = [
  { id: 1, name: "Production API Key", key: "pk_live_••••••••••••••••", created: "2026-01-15", lastUsed: "2026-05-07", status: "active" },
  { id: 2, name: "Development API Key", key: "pk_test_••••••••••••••••", created: "2026-02-20", lastUsed: "2026-05-06", status: "active" },
  { id: 3, name: "Webhook Secret", key: "whsec_••••••••••••••••", created: "2026-03-10", lastUsed: "2026-05-07", status: "active" },
];

// Alembic Versions data
const alembicVersions = [
  { version: "0042", name: "Add notification preferences", timestamp: "2026-05-01 14:30:00", status: "applied" },
  { version: "0041", name: "Update user permissions schema", timestamp: "2026-04-28 09:15:00", status: "applied" },
  { version: "0040", name: "Add warehouse zones", timestamp: "2026-04-15 11:45:00", status: "applied" },
  { version: "0039", name: "Create analytics tables", timestamp: "2026-04-01 16:20:00", status: "applied" },
  { version: "0038", name: "Add payment methods", timestamp: "2026-03-20 10:00:00", status: "applied" },
];

// Webhooks data
const initialWebhooks = [
  { id: 1, url: "https://api.example.com/webhooks/orders", events: ["order.created", "order.updated"], active: true },
  { id: 2, url: "https://api.example.com/webhooks/payments", events: ["payment.received", "payment.failed"], active: true },
];

// Email templates data
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
  const [securityKeys, setSecurityKeys] = useState(initialSecurityKeys);
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [isAddWebhookDialogOpen, setIsAddWebhookDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "Distr Business Hub",
    defaultLanguage: "uz",
    timezone: "Asia/Tashkent",
    dateFormat: "DD.MM.YYYY",
    pushNotifications: true,
    emailNotifications: true,
    sessionTimeout: "8",
    maxLoginAttempts: "5",
  });

  const handleCopyKey = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    toast.success("API kalit nusxalandi");
  };

  const handleToggleKeyVisibility = (id: number) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSecurityKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Kalit nomini kiriting");
      return;
    }
    const newKey = {
      id: Date.now(),
      name: newKeyName,
      key: `pk_${Math.random().toString(36).substring(2, 15)}_••••••••••••`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Hech qachon",
      status: "active",
    };
    setSecurityKeys([...securityKeys, newKey]);
    setNewKeyName("");
    setIsAddKeyDialogOpen(false);
    toast.success("Yangi API kalit qo'shildi");
  };

  const handleDeleteSecurityKey = (id: number) => {
    setSecurityKeys(securityKeys.filter((k) => k.id !== id));
    toast.success("API kalit o'chirildi");
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

  const handleSaveGeneralSettings = () => {
    toast.success("Sozlamalar saqlandi");
  };

  const handleExportSettings = () => {
    const data = JSON.stringify({ generalSettings, securityKeys, webhooks }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-settings-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sozlamalar eksport qilindi");
  };

  return (
    <AdminGuard>
      <AdminLayout title={t("adminSettings")} subtitle={t("adminSettingsSubtitle")}>
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportSettings}>
                <Download className="h-4 w-4 mr-2" />
                {t("export")}
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                {t("import")}
              </Button>
            </div>
            <Button size="sm" onClick={handleSaveGeneralSettings}>
              <Check className="h-4 w-4 mr-2" />
              {t("saveAll")}
            </Button>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid lg:grid-cols-4">
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
              <TabsTrigger value="integrations" className="gap-2">
                <Webhook className="h-4 w-4" />
                <span className="hidden sm:inline">{t("integrations")}</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
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
                        value={generalSettings.sessionTimeout}
                        onValueChange={(value) =>
                          setGeneralSettings({ ...generalSettings, sessionTimeout: value })
                        }
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
                        value={generalSettings.maxLoginAttempts}
                        onValueChange={(value) =>
                          setGeneralSettings({ ...generalSettings, maxLoginAttempts: value })
                        }
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

            {/* Security Keys Tab */}
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
                  <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("addKey")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("addNewKey")}</DialogTitle>
                        <DialogDescription>
                          {t("addNewKeyDesc")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="keyName">{t("keyName")}</Label>
                          <Input
                            id="keyName"
                            placeholder="Masalan: Production API Key"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("name")}</TableHead>
                        <TableHead>{t("apiKey")}</TableHead>
                        <TableHead>{t("created")}</TableHead>
                        <TableHead>{t("lastUsed")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead className="text-right">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {securityKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell className="font-medium">{key.name}</TableCell>
                          <TableCell className="font-mono text-sm">
                            <span className="flex items-center gap-2">
                              {showKey[key.id]
                                ? key.key.replace(/•/g, "x")
                                : key.key}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleToggleKeyVisibility(key.id)}
                              >
                                {showKey[key.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopyKey(key.key, key.id)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </span>
                          </TableCell>
                          <TableCell>{key.created}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {key.lastUsed}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={key.status === "active" ? "default" : "secondary"}>
                              {key.status === "active" ? t("active") : t("inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  {t("edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  {t("regenerate")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteSecurityKey(key.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t("delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Database Tab */}
            <TabsContent value="database" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {t("alembicVersions")}
                  </CardTitle>
                  <CardDescription>{t("alembicVersionsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Current Version Badge */}
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{t("currentVersion")}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("headRevision")}
                        </p>
                      </div>
                      <Badge variant="default" className="font-mono">
                        0042 (head)
                      </Badge>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("version")}</TableHead>
                          <TableHead>{t("description")}</TableHead>
                          <TableHead>{t("timestamp")}</TableHead>
                          <TableHead>{t("status")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alembicVersions.map((version) => (
                          <TableRow key={version.version}>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {version.version}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {version.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {version.timestamp}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={version.status === "applied" ? "default" : "secondary"}
                                className="gap-1"
                              >
                                <Check className="h-3 w-3" />
                                {version.status === "applied" ? t("applied") : t("pending")}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground">{t("dbSize")}</p>
                      <p className="text-2xl font-bold mt-1">2.4 GB</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground">{t("tables")}</p>
                      <p className="text-2xl font-bold mt-1">42</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground">{t("connections")}</p>
                      <p className="text-2xl font-bold mt-1">12 / 100</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground">{t("uptime")}</p>
                      <p className="text-2xl font-bold mt-1">99.9%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Webhook className="h-5 w-5" />
                      {t("webhooks")}
                    </CardTitle>
                    <CardDescription>{t("webhooksDesc")}</CardDescription>
                  </div>
                  <Dialog open={isAddWebhookDialogOpen} onOpenChange={setIsAddWebhookDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("addWebhook")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("addNewWebhook")}</DialogTitle>
                        <DialogDescription>
                          {t("addNewWebhookDesc")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="webhookUrl">{t("webhookUrl")}</Label>
                          <Input
                            id="webhookUrl"
                            placeholder="https://api.example.com/webhooks"
                            value={newWebhookUrl}
                            onChange={(e) => setNewWebhookUrl(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddWebhookDialogOpen(false)}>
                          {t("cancel")}
                        </Button>
                        <Button onClick={handleAddWebhook}>{t("add")}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("url")}</TableHead>
                        <TableHead>{t("events")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead className="text-right">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhooks.map((webhook) => (
                        <TableRow key={webhook.id}>
                          <TableCell className="font-mono text-sm max-w-xs truncate">
                            {webhook.url}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {webhook.events.map((event) => (
                                <Badge key={event} variant="secondary" className="text-xs">
                                  {event}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={webhook.active}
                              onCheckedChange={() => handleToggleWebhook(webhook.id)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  {t("edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  {t("copyUrl")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteWebhook(webhook.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t("delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {t("emailTemplates")}
                  </CardTitle>
                  <CardDescription>{t("emailTemplatesDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("templateName")}</TableHead>
                        <TableHead>{t("subject")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead className="text-right">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {template.subject}
                          </TableCell>
                          <TableCell>
                            <Badge variant={template.status === "active" ? "default" : "secondary"}>
                              {template.status === "active" ? t("active") : t("draft")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Edit3 className="h-4 w-4 mr-2" />
                              {t("edit")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t("paymentMethods")}
                  </CardTitle>
                  <CardDescription>{t("paymentMethodsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "Click", status: "active", icon: "💳" },
                      { name: "Payme", status: "active", icon: "💳" },
                      { name: "Uzcard", status: "active", icon: "💳" },
                      { name: "Humo", status: "active", icon: "💳" },
                      { name: "Visa", status: "pending", icon: "💳" },
                      { name: "Mastercard", status: "pending", icon: "💳" },
                    ].map((method) => (
                      <div
                        key={method.name}
                        className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium">{method.name}</p>
                          <Badge
                            variant={method.status === "active" ? "default" : "secondary"}
                            className="mt-1"
                          >
                            {method.status === "active" ? t("connected") : t("pending")}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}