import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import { Bell, Send, CheckCheck, Loader2, MailOpen } from "lucide-react";
import { toast } from "sonner";

type Employee = {
  id: number;
  user_1c_id: number | null;
  username: string;
  first_name: string;
  last_name: string;
  user_type: string;
  user_status: string | null;
};

type NotificationItem = {
  id: number;
  company_id: number;
  user_1c_id: number;
  created_at: string;
  title: string;
  message: string;
  status: { id: number; is_read: boolean; read_at: string | null } | null;
  author: string;
};

export const Route = createFileRoute("/_app/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  const { t } = useSettings();
  const { accessToken, user } = useAuth();
  const authorName = useMemo(() => {
    if (!user) return "";
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
  }, [user]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [sending, setSending] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);

  const fetchNotificationsList = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(API.notifications, {
        headers: { accept: "application/json", Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchNotificationsList();
  }, [fetchNotificationsList]);

  const fetchEmployees = useCallback(async () => {
    if (!accessToken) return;
    setEmployeesLoading(true);
    try {
      const res = await fetch(API.userManager, {
        headers: { accept: "application/json", Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setEmployeesLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSend = async () => {
    if (!formTitle.trim()) {
      toast.error("Sarlavha majburiy");
      return;
    }
    if (selectedEmployeeIds.length === 0) {
      toast.error("Kamida bitta xodim tanlang");
      return;
    }
    if (!accessToken) return;

    setSending(true);
    try {
      const payload: Record<string, unknown> = {
        title: formTitle.trim(),
        users_1c_id: selectedEmployeeIds,
      };
      if (formMessage.trim()) payload.message = formMessage.trim();
      if (formAuthor.trim()) payload.author = formAuthor.trim();

      const res = await fetch(API.notificationsCreate, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to send notification");
      }

      toast.success(t("notificationSent"));
      setIsDialogOpen(false);
      setFormTitle("");
      setFormMessage("");
      setFormAuthor("");
      setSelectedEmployeeIds([]);
      fetchNotificationsList();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    if (!accessToken) return;
    try {
      await fetch(API.notificationRead(id), {
        method: "POST",
        headers: { accept: "application/json", Authorization: `Bearer ${accessToken}` },
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: n.status ? { ...n.status, is_read: true, read_at: new Date().toISOString() } : null } : n
        )
      );
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => n.status && !n.status.is_read).map((n) => n.id);
    if (unreadIds.length === 0 || !accessToken) return;

    setMarkingRead(true);
    try {
      await fetch(API.notificationsReadMultiple, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(unreadIds),
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.status && !n.status.is_read ? { ...n, status: { ...n.status, is_read: true, read_at: new Date().toISOString() } } : n
        )
      );
    } catch {
      // silently fail
    } finally {
      setMarkingRead(false);
    }
  };

  const toggleEmployee = (user1cId: number) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(user1cId) ? prev.filter((id) => id !== user1cId) : [...prev, user1cId]
    );
  };

  const validEmployees = useMemo(
    () => employees.filter((e) => e.user_1c_id != null && e.user_status !== "BLOCKED"),
    [employees]
  );

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("ru-RU", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const unreadCount = notifications.filter((n) => n.status && !n.status.is_read).length;

  return (
    <div className="relative">
      <PageHeader
        title={t("notifications")}
        description={t("notificationsDesc")}
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllRead} disabled={markingRead}>
                {markingRead ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4 mr-2" />
                )}
                {t("markRead")}
              </Button>
            )}
            <Button onClick={() => { setIsDialogOpen(true); setFormAuthor(authorName); fetchEmployees(); }}>
              <Send className="h-4 w-4 mr-2" />
              {t("sendNotification")}
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">{t("loading")}</span>
        </div>
      ) : fetchError ? (
        <Card className="p-8 text-center">
          <p className="text-destructive">{fetchError}</p>
          <Button variant="outline" className="mt-4" onClick={fetchNotificationsList}>
            Qayta yuklash
          </Button>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">{t("noNotifications")}</p>
        </Card>
      ) : (
        <>
          <Card className="divide-y">
            {notifications.map((n) => {
              const isUnread = n.status && !n.status.is_read;
              return (
                <div key={n.id} className={`flex items-start gap-4 p-4 group ${isUnread ? "bg-accent/30" : ""}`}>
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{n.title}</span>
                      {isUnread && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    {n.message && (
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    )}
                    {n.author && (
                      <p className="text-xs text-muted-foreground mt-1">{n.author}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(n.created_at)}</span>
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleMarkRead(n.id)}
                      >
                        <MailOpen className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
          <p className="text-xs text-muted-foreground mt-3">
            {notifications.length} jami, {unreadCount} {t("new")}
          </p>
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("newNotification")}</DialogTitle>
            <DialogDescription>{t("notificationsDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("selectEmployees")}</Label>
              {employeesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("loading")}
                </div>
              ) : validEmployees.length === 0 ? (
                <p className="text-sm text-muted-foreground">Xodimlar topilmadi</p>
              ) : (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {validEmployees.map((emp) => {
                    const checked = emp.user_1c_id != null && selectedEmployeeIds.includes(emp.user_1c_id);
                    return (
                      <label
                        key={emp.id}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent ${checked ? "bg-accent" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => emp.user_1c_id != null && toggleEmployee(emp.user_1c_id)}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {[emp.first_name, emp.last_name].filter(Boolean).join(" ") || emp.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {emp.user_type} · 1C ID: {emp.user_1c_id}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              {selectedEmployeeIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedEmployeeIds.length} xodim tanlandi
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-title">{t("title")} *</Label>
              <Input
                id="notif-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Sarlavhani kiriting"
                maxLength={250}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-message">{t("message")}</Label>
              <Textarea
                id="notif-message"
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Xabar matnini kiriting"
                rows={3}
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
