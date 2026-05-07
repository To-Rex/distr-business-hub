import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Ban, Building2, CalendarDays, CheckCircle2, LayoutGrid, Loader2, Mail, Phone, Rows3, Search, UserRound, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { API } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/staff")({ component: StaffPage });

type CompanyRel = {
  id: number;
  name: string;
  inn: string;
  base_url: string;
  asl_belgi_token: string;
};

type ManagerProfile = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  photo: string | null;
  user_type: string;
  company_rel: CompanyRel;
  created_at: string;
};

type StaffMember = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  photo: string | null;
  user_type: string;
  company_id: number;
  company_rel: CompanyRel;
  manager: ManagerProfile | null;
  manager_id: number | null;
  user_1c_id: number;
  user_1c_login: string;
  user_1c_password: string;
  created_at: string;
  user_status: "ACTIVE" | "BLOCKED" | null;
};

type SortMode = "name-asc" | "name-desc" | "type-asc" | "type-desc" | "date-asc" | "date-desc";

function getDisplayName(e: { first_name: string; last_name: string; username: string }) {
  return `${e.first_name} ${e.last_name}`.trim() || e.username;
}

function StaffPage() {
  const { t } = useSettings();
  const { user, accessToken } = useAuth();
  const [employees, setEmployees] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<StaffMember | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [sortMode, setSortMode] = useState<SortMode>("name-asc");

  const toggleStatus = (employee: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accessToken || togglingId !== null) return;
    const newStatus = employee.user_status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    setTogglingId(employee.id);
    fetch(API.userManagerStatus(employee.id), {
      method: "PATCH",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: employee.username, user_status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<StaffMember>;
      })
      .then((updated) => {
        setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        setSelectedEmployee((prev) => (prev?.id === updated.id ? updated : prev));
      })
      .catch(() => {})
      .finally(() => setTogglingId(null));
  };

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }

    fetch(API.userManager, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: StaffMember[]) => {
        setEmployees(data ?? []);
      })
      .catch((err: Error) => {
        setError(err.message || t("errorTitle"));
      })
      .finally(() => setLoading(false));
  }, [accessToken, t]);

  const filteredEmployees = useMemo(() => {
    if (!query.trim()) return employees;
    const lower = query.toLowerCase();
    return employees.filter(
      (e) =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(lower) ||
        e.username.toLowerCase().includes(lower) ||
        e.user_type.toLowerCase().includes(lower) ||
        e.phone_number.toLowerCase().includes(lower) ||
        String(e.id).includes(lower),
    );
  }, [employees, query]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      switch (sortMode) {
        case "name-desc":
          return getDisplayName(b).localeCompare(getDisplayName(a));
        case "type-asc":
          return a.user_type.localeCompare(b.user_type);
        case "type-desc":
          return b.user_type.localeCompare(a.user_type);
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "name-asc":
        default:
          return getDisplayName(a).localeCompare(getDisplayName(b));
      }
    });
  }, [filteredEmployees, sortMode]);

  const typeCounts = useMemo(
    () =>
      employees.reduce<Record<string, number>>((acc, e) => {
        acc[e.user_type] = (acc[e.user_type] ?? 0) + 1;
        return acc;
      }, {}),
    [employees],
  );

  const renderBlockButton = (employee: StaffMember) => {
    if (employee.id === user?.id) return null;
    return (
      <button
        onClick={(e) => toggleStatus(employee, e)}
        disabled={togglingId === employee.id}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
          employee.user_status === "BLOCKED"
            ? "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950"
            : "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950"
        }`}
      >
        {togglingId === employee.id ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : employee.user_status === "BLOCKED" ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : (
          <Ban className="h-3 w-3" />
        )}
        {employee.user_status === "BLOCKED" ? t("unblock") : t("block")}
      </button>
    );
  };

  return (
    <div>
      <PageHeader title={t("staff")} description={t("staffDesc")} />

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${t("search")}...`}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Users className="h-4 w-4" />
            <span>
              {filteredEmployees.length}/{employees.length}
            </span>
          </div>
          <div className="shrink-0">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="name-asc">{t("sortAZ")}</option>
              <option value="name-desc">{t("sortZA")}</option>
              <option value="type-asc">{t("sortTypeAsc")}</option>
              <option value="type-desc">{t("sortTypeDesc")}</option>
              <option value="date-desc">{t("sortDateNewOld")}</option>
              <option value="date-asc">{t("sortDateOldNew")}</option>
            </select>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
              {t("cardsView")}
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <Rows3 className="h-4 w-4" />
              {t("tableView")}
            </Button>
          </div>
        </div>
      </Card>

      {!loading && !error && Object.keys(typeCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(typeCounts).map(([type, count]) => (
            <Badge key={type} variant="secondary" className="rounded-md px-3 py-1">
              {type}: {count}
            </Badge>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <Card className="p-10">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <p className="text-sm font-medium">{t("errorTitle")}</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </Card>
      )}

      {!loading && !error && sortedEmployees.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">{t("notFound")}</Card>
      )}

      {!loading && !error && sortedEmployees.length > 0 && viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sortedEmployees.map((employee) => {
            const displayName = getDisplayName(employee);
            return (
              <Card
                key={employee.id}
                className="border-border/70 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => setSelectedEmployee(employee)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{employee.phone_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline">{employee.user_type}</Badge>
                      {employee.user_status === "BLOCKED" && (
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>{employee.company_rel?.name} · {employee.username}</span>
                    {renderBlockButton(employee)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && !error && sortedEmployees.length > 0 && viewMode === "table" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("staff")}</TableHead>
                  <TableHead>{t("phone")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead>{t("company")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("registered")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEmployees.map((employee) => {
                  const displayName = getDisplayName(employee);
                  return (
                    <TableRow
                      key={employee.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <UserRound className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground">@{employee.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.phone_number || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{employee.email || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.user_type}</Badge>
                      </TableCell>
                      <TableCell>{employee.company_rel?.name || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.user_status === "ACTIVE"
                              ? "default"
                              : employee.user_status === "BLOCKED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {employee.user_status ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(employee.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {renderBlockButton(employee)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedEmployee && (() => {
            const name = getDisplayName(selectedEmployee);
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {selectedEmployee.photo ? (
                        <img src={selectedEmployee.photo} alt={name} className="h-14 w-14 rounded-2xl object-cover" />
                      ) : (
                        <UserRound className="h-7 w-7" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <DialogTitle className="text-lg">{name}</DialogTitle>
                      <DialogDescription>@{selectedEmployee.username}</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" />{t("email")}</span>
                    <span className="truncate">{selectedEmployee.email}</span>

                    <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" />{t("phone")}</span>
                    <span>{selectedEmployee.phone_number}</span>

                    <span className="text-muted-foreground flex items-center gap-2"><UserRound className="h-4 w-4" />{t("role")}</span>
                    <span><Badge variant="outline">{selectedEmployee.user_type}</Badge></span>

                    <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />{t("status")}</span>
                    <span>
                      <Badge variant={selectedEmployee.user_status === "ACTIVE" ? "default" : selectedEmployee.user_status === "BLOCKED" ? "destructive" : "secondary"}>
                        {selectedEmployee.user_status ?? "—"}
                      </Badge>
                    </span>

                    <span className="text-muted-foreground flex items-center gap-2"><Building2 className="h-4 w-4" />{t("company")}</span>
                    <span>{selectedEmployee.company_rel?.name}</span>

                    {selectedEmployee.manager && (
                      <>
                        <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />{t("manager")}</span>
                        <span>{selectedEmployee.manager.first_name} {selectedEmployee.manager.last_name}</span>
                      </>
                    )}

                    <span className="text-muted-foreground flex items-center gap-2"><CalendarDays className="h-4 w-4" />{t("registered")}</span>
                    <span>{new Date(selectedEmployee.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
