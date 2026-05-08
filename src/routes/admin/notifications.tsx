import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import {
  fetchNotifications,
  createNotification,
  deleteNotification,
  markNotificationRead,
  markNotificationsReadMultiple,
  fetchCompanies,
  type ApiNotification,
  type CreateNotificationPayload,
} from "@/lib/admin-api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings } from "@/lib/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, MoreVertical, Trash2, Bell, Eye, Search, CheckCheck, Send } from "lucide-react";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotificationsPage,
});

type NotificationFormData = {
  title: string;
  message: string;
  date: string;
  author: string;
  user_type: string;
  company_id: string;
};

const emptyForm: NotificationFormData = {
  title: "",
  message: "",
  date: "",
  author: "",
  user_type: "",
  company_id: "none",
};

function AdminNotificationsPage() {
  const { t } = useSettings();
  const queryClient = useQueryClient();

  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["admin-notifications", companyFilter],
    queryFn: () => fetchNotifications(companyFilter !== "all" ? Number(companyFilter) : undefined),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => fetchCompanies(),
  });

  const [selectedNotification, setSelectedNotification] = useState<ApiNotification | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NotificationFormData>(emptyForm);

  const filteredNotifications = notifications.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      (n.message && n.message.toLowerCase().includes(q)) ||
      (n.author && n.author.toLowerCase().includes(q))
    );
  });

  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Bildirishnoma muvaffaqiyatli yuborildi");
      setIsCreateDialogOpen(false);
      setFormData(emptyForm);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Bildirishnoma o'chirildi");
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Bildirishnoma o'qilgan deb belgilandi");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => {
      const unreadIds = notifications.filter((n) => !n.status?.is_read).map((n) => n.id);
      return markNotificationsReadMultiple(unreadIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Barcha bildirishnomalar o'qilgan deb belgilandi");
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const handleCreate = () => {
    setFormData(emptyForm);
    setIsCreateDialogOpen(true);
  };

  const handleView = (notification: ApiNotification) => {
    setSelectedNotification(notification);
    setIsViewDialogOpen(true);
    if (!notification.status?.is_read) {
      markReadMutation.mutate(notification.id);
    }
  };

  const handleDelete = (notification: ApiNotification) => {
    setSelectedNotification(notification);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCreate = () => {
    if (!formData.title.trim()) {
      toast.error("Sarlavha majburiy");
      return;
    }
    const payload: CreateNotificationPayload = { title: formData.title };
    if (formData.message) payload.message = formData.message;
    if (formData.date) payload.date = formData.date;
    if (formData.author) payload.author = formData.author;
    if (formData.user_type) payload.user_type = formData.user_type;
    if (formData.company_id !== "none") payload.company_id = Number(formData.company_id);
    createMutation.mutate(payload);
  };

  const confirmDelete = () => {
    if (selectedNotification) {
      deleteMutation.mutate(selectedNotification.id);
    }
  };

  const unreadCount = notifications.filter((n) => !n.status?.is_read).length;

  return (
    <AdminGuard>
      <AdminLayout title={t("adminNotifications")} subtitle={t("adminNotificationsSubtitle")}>
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
                placeholder="Qidirish (sarlavha, xabar, muallif)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Hammasini o'qilgan
                </Button>
              )}
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                {t("add")}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kompaniya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha kompaniyalar</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Jami: {filteredNotifications.length} ta bildirishnoma
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">{unreadCount} yangi</Badge>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("calendarTitle")}</TableHead>
                  <TableHead>Xabar</TableHead>
                  <TableHead>Muallif</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead className="w-[80px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow
                    key={notification.id}
                    className={!notification.status?.is_read ? "font-medium bg-muted/30" : "text-muted-foreground"}
                  >
                    <TableCell>{new Date(notification.created_at).toLocaleString()}</TableCell>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{notification.message}</TableCell>
                    <TableCell>{notification.author || "—"}</TableCell>
                    <TableCell>
                      {notification.status?.is_read ? (
                        <Badge variant="outline">O'qilgan</Badge>
                      ) : (
                        <Badge variant="default">Yangi</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleView(notification)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ko'rish
                          </DropdownMenuItem>
                          {!notification.status?.is_read && (
                            <DropdownMenuItem onClick={() => markReadMutation.mutate(notification.id)}>
                              <CheckCheck className="h-4 w-4 mr-2" />
                              O'qilgan
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(notification)}
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

            {filteredNotifications.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bildirishnomalar topilmadi</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Bildirishnoma ma'lumotlari</DialogTitle>
            </DialogHeader>
            {selectedNotification && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sarlavha</p>
                    <p className="font-medium">{selectedNotification.title}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Muallif</p>
                    <p className="font-medium">{selectedNotification.author || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sana</p>
                    <p className="font-medium">{new Date(selectedNotification.created_at).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Holat</p>
                    {selectedNotification.status?.is_read ? (
                      <Badge variant="outline">O'qilgan</Badge>
                    ) : (
                      <Badge variant="default">Yangi</Badge>
                    )}
                  </div>
                </div>
                {selectedNotification.message && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Xabar</p>
                    <p className="font-medium whitespace-pre-wrap">{selectedNotification.message}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Yopish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) setFormData(emptyForm); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Yangi bildirishnoma yuborish</DialogTitle>
              <DialogDescription>Yangi bildirishnoma yaratish va yuborish</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="notif-title">Sarlavha *</Label>
                <Input
                  id="notif-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Bildirishnoma sarlavhasi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notif-message">Xabar</Label>
                <Textarea
                  id="notif-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Bildirishnoma matni"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notif-date">Sana</Label>
                  <Input
                    id="notif-date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="DD.MM.YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notif-author">Muallif</Label>
                  <Input
                    id="notif-author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Muallif nomi"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notif-user-type">Foydalanuvchi turi</Label>
                  <Select
                    value={formData.user_type || "all"}
                    onValueChange={(v) => setFormData({ ...formData, user_type: v === "all" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="AGENT">Agent</SelectItem>
                      <SelectItem value="DELIVERER">Yetkazib beruvchi</SelectItem>
                      <SelectItem value="MANAGER">Menejer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notif-company">Kompaniya</Label>
                  <Select
                    value={formData.company_id}
                    onValueChange={(v) => setFormData({ ...formData, company_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Barcha kompaniyalar</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); setFormData(emptyForm); }}>
                Bekor qilish
              </Button>
              <Button onClick={handleSaveCreate}>
                <Send className="h-4 w-4 mr-2" />
                Yuborish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bildirishnomani o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham <strong>{selectedNotification?.title}</strong> bildirishnomasini o'chirmoqchimisiz?
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
      </AdminLayout>
    </AdminGuard>
  );
}
