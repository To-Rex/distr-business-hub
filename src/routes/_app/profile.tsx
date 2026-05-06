import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import {
  Mail, Phone, User as UserIcon, Building2, Calendar,
  Hash, Globe, Key, Link, Shield, Users,
} from "lucide-react";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

function formatPhone(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "").replace(/^998/, "");
  if (digits.length !== 9) return raw;
  return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}

function Field({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value ?? "—"}</div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const name = user?.name ?? "User";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString("uz-UZ", { day: "2-digit", month: "long", year: "numeric" }) : null;

  return (
    <div>
      <PageHeader title={t("profile")} description={t("profileDesc")} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-6 text-center">
            {user?.photo ? (
              <img src={user.photo} alt={name} className="h-24 w-24 mx-auto rounded-full object-cover" />
            ) : (
              <div className="h-24 w-24 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-semibold">
                {initials}
              </div>
            )}
            <div className="mt-4 text-lg font-semibold">{name}</div>
            <div className="text-sm text-muted-foreground">{user?.user_type}</div>
            <Separator className="my-4" />
            <div className="space-y-1 text-sm text-left">
              <Field icon={Mail} label={t("email")} value={user?.email} />
              <Field icon={Phone} label={t("phone")} value={formatPhone(user?.phone_number)} />
              <Field icon={UserIcon} label={t("username")} value={user?.username} />
              <Field icon={Calendar} label={t("calendar") ?? "Sana"} value={created} />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />{t("company")}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <Field icon={Building2} label={t("name")} value={user?.company_rel?.name} />
                <Field icon={Hash} label="INN" value={user?.company_rel?.inn} />
              </div>
            </CardContent>
          </Card>

          {user?.manager && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />{t("manager")}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <Field icon={UserIcon} label={t("name")} value={`${user.manager.first_name} ${user.manager.last_name}`} />
                  <Field icon={Mail} label={t("email")} value={user.manager.email} />
                  <Field icon={Phone} label={t("phone")} value={formatPhone(user.manager.phone_number)} />
                  <Field icon={Shield} label={t("role")} value={user.manager.user_type} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />{t("oneCData")}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <Field icon={Hash} label={t("oneCId")} value={user?.user_1c_id} />
                <Field icon={UserIcon} label={t("oneCLogin")} value={user?.user_1c_login} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
