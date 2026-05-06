import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Search, UserRound, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { API } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/staff")({ component: StaffPage });

type Employee = {
  branch_id: number;
  id: number;
  name: string;
  type: string;
};

type EmployeesResponse = {
  data: Employee[];
};

function StaffPage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }

    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    fetch(API.employees(user.company_rel.base_url), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: EmployeesResponse) => {
        setEmployees(data.data ?? []);
      })
      .catch((err: Error) => {
        setError(err.message || t("errorTitle"));
      })
      .finally(() => setLoading(false));
  }, [user, t]);

  const filteredEmployees = useMemo(() => {
    if (!query.trim()) return employees;
    const lower = query.toLowerCase();
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(lower) ||
        employee.type.toLowerCase().includes(lower) ||
        String(employee.id).includes(lower) ||
        String(employee.branch_id).includes(lower),
    );
  }, [employees, query]);

  const typeCounts = useMemo(
    () =>
      employees.reduce<Record<string, number>>((acc, employee) => {
        acc[employee.type] = (acc[employee.type] ?? 0) + 1;
        return acc;
      }, {}),
    [employees],
  );

  return (
    <div>
      <PageHeader title={t("staff")} description={t("staffDesc")} />

      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${t("search")}...`}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {filteredEmployees.length}/{employees.length}
            </span>
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

      {!loading && !error && filteredEmployees.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">{t("notFound")}</Card>
      )}

      {!loading && !error && filteredEmployees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="border-border/70 hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {employee.id}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {employee.type}
                  </Badge>
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  Branch ID: {employee.branch_id}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
