import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import {
  fetchUsers,
  fetchWorkingSessions,
  getUserFullName,
  type ApiUser,
  type ApiWorkingSession,
} from "@/lib/admin-api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettings } from "@/lib/settings";
import { useIsMobile } from "@/hooks/use-mobile";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Clock,
  Smartphone,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Monitor,
  TestTube,
  Calendar,
  X,
  LayoutGrid,
  Rows3,
} from "lucide-react";

export const Route = createFileRoute("/admin/working-sessions")({
  component: AdminWorkingSessionsPage,
});

type SortField = "user_name" | "session" | "device_name" | "app" | "created_at";
type SortOrder = "asc" | "desc";

type SessionWithUser = ApiWorkingSession & {
  user_id: number;
  user_name: string;
  user_email: string;
};

function AdminWorkingSessionsPage() {
  const { t } = useSettings();

  const { data: apiUsers = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
  });

  const { data: apiSessions = [], isLoading: isSessionsLoading } = useQuery({
    queryKey: ["admin-working-sessions"],
    queryFn: () => fetchWorkingSessions(),
  });

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const isMobile = useIsMobile();

  useEffect(() => {
    setViewMode(isMobile ? "cards" : "table");
  }, [isMobile]);

  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [appFilter, setAppFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedSession, setSelectedSession] = useState<SessionWithUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const userMap = useMemo(() => {
    const map = new Map<number, ApiUser>();
    apiUsers.forEach((u) => map.set(u.id, u));
    return map;
  }, [apiUsers]);

  const sessionsWithUsers: SessionWithUser[] = useMemo(() => {
    return apiSessions.map((s) => {
      const user = userMap.get((s as any).user_id);
      return {
        ...s,
        user_id: (s as any).user_id || 0,
        user_name: user ? getUserFullName(user) : `ID: ${(s as any).user_id || "?"}`,
        user_email: user?.email || "",
      };
    });
  }, [apiSessions, userMap]);

  const filteredAndSorted = useMemo(() => {
    let result = [...sessionsWithUsers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.user_name.toLowerCase().includes(q) ||
          s.device_name.toLowerCase().includes(q) ||
          s.app.toLowerCase().includes(q) ||
          s.user_email.toLowerCase().includes(q),
      );
    }

    if (userFilter !== "all") {
      result = result.filter((s) => String(s.user_id) === userFilter);
    }

    if (appFilter !== "all") {
      result = result.filter((s) => s.app === appFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((s) => new Date(s.session).getTime() >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo).getTime();
      result = result.filter((s) => new Date(s.session).getTime() <= to);
    }

    result.sort((a, b) => {
      let aVal: string | number = a[sortField] || "";
      let bVal: string | number = b[sortField] || "";
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return result;
  }, [sessionsWithUsers, searchQuery, userFilter, appFilter, dateFrom, dateTo, sortField, sortOrder]);

  const usersWithSessions = useMemo(() => {
    const set = new Set<number>();
    sessionsWithUsers.forEach((s) => {
      if (s.user_id) set.add(s.user_id);
    });
    return apiUsers.filter((u) => set.has(u.id));
  }, [apiUsers, sessionsWithUsers]);

  const uniqueApps = useMemo(() => {
    const apps = new Set<string>();
    sessionsWithUsers.forEach((s) => {
      if (s.app) apps.add(s.app);
    });
    return Array.from(apps).sort();
  }, [sessionsWithUsers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const handleView = (session: SessionWithUser) => {
    setSelectedSession(session);
    setIsViewDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const isLoading = isUsersLoading || isSessionsLoading;

  return (
    <AdminGuard>
      <AdminLayout
        title={t("adminWorkingSessions")}
        subtitle={t("adminWorkingSessionsSubtitle")}
      >
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
                placeholder={t("adminWorkingSessionsSearch")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder={t("user")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allUsers")}</SelectItem>
                {usersWithSessions.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {getUserFullName(u)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={appFilter} onValueChange={setAppFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("application")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allApps")}</SelectItem>
                {uniqueApps.map((app) => (
                  <SelectItem key={app} value={app}>
                    {app}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-1.5">
                <Input
                  type="datetime-local"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[200px] h-9 text-sm"
                  placeholder={t("dateBegin")}
                />
                <span className="text-sm text-muted-foreground">—</span>
                <Input
                  type="datetime-local"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[200px] h-9 text-sm"
                  placeholder={t("dateEnd")}
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {t("total")}: {filteredAndSorted.length} {t("sessions")}
            </div>
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => { if (v) setViewMode(v as "table" | "cards"); }} className="hidden sm:flex">
              <ToggleGroupItem value="table" aria-label="Table view">
                <Rows3 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="cards" aria-label="Cards view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAndSorted.map((session) => (
                  <div key={session.id} className="rounded-xl border bg-card p-4 space-y-3 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">#{session.id}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(session)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("sessionTime")}</p>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {formatDate(session.session)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("device")}</p>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Smartphone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {session.device_name || "—"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{session.app}</Badge>
                      {session.is_testing ? (
                        <Badge variant="secondary" className="text-xs">
                          <TestTube className="h-3 w-3 mr-1" />
                          Test
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">{t("active")}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("created")}: {formatDate(session.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
            <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="w-[60px]">ID</TableHead>
                   <TableHead>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleSort("session")}
                       className="p-0 h-auto font-medium"
                     >
                       {t("sessionTime")} <SortIcon field="session" />
                     </Button>
                   </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("device_name")}
                      className="p-0 h-auto font-medium"
                    >
                      {t("device")} <SortIcon field="device_name" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("app")}
                      className="p-0 h-auto font-medium"
                    >
                      {t("application")} <SortIcon field="app" />
                    </Button>
                  </TableHead>
                  <TableHead>{t("testing")}</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("created_at")}
                      className="p-0 h-auto font-medium"
                    >
                      {t("created")} <SortIcon field="created_at" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[80px]">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredAndSorted.map((session) => (
                   <TableRow key={session.id} className="group">
                     <TableCell className="font-mono text-sm">{session.id}</TableCell>
                     <TableCell>
                       <div className="flex items-center gap-1.5 text-sm">
                         <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                         {formatDate(session.session)}
                       </div>
                     </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                        {session.device_name || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {session.app}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {session.is_testing ? (
                        <Badge variant="secondary" className="text-xs">
                          <TestTube className="h-3 w-3 mr-1" />
                          Test
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">
                          {t("active")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(session.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(session)}
                        className="opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
            {filteredAndSorted.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t("noSessionsFound")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("sessionDetails")}</DialogTitle>
              <DialogDescription>{t("sessionDetailsDesc")}</DialogDescription>
            </DialogHeader>
            {selectedSession && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-medium font-mono">{selectedSession.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("user")}</p>
                    <p className="font-medium">{selectedSession.user_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("sessionTime")}</p>
                    <p className="font-medium">{formatDate(selectedSession.session)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("device")}</p>
                    <p className="font-medium">{selectedSession.device_name || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("application")}</p>
                    <p className="font-medium">{selectedSession.app}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("testing")}</p>
                    <p className="font-medium">
                      {selectedSession.is_testing ? t("yes") : t("no")}
                    </p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-sm text-muted-foreground">{t("created")}</p>
                    <p className="font-medium">{formatDate(selectedSession.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                {t("cancel")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
}
