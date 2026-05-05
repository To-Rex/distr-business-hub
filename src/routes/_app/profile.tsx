import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { Mail, Phone, MapPin, Briefcase } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

function ProfilePage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const name = user?.name ?? "User";
  return (
    <div>
      <PageHeader title={t("profile")} description={t("profileDesc")} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="h-24 w-24 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-semibold">
              {name[0]?.toUpperCase()}
            </div>
            <div className="mt-4 text-lg font-semibold capitalize">{name}</div>
            <div className="text-sm text-muted-foreground">Administrator</div>
            <div className="mt-6 space-y-2 text-sm text-left">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{user?.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />+998 90 000 0000</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />Tashkent, Uzbekistan</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" />Distr · MX Soft</div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">{t("profile")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("name")}</Label><Input defaultValue={name} /></div>
              <div className="space-y-2"><Label>{t("email")}</Label><Input defaultValue={user?.email} /></div>
              <div className="space-y-2"><Label>{t("phone")}</Label><Input defaultValue="+998 90 000 0000" /></div>
              <div className="space-y-2"><Label>{t("location")}</Label><Input defaultValue="Tashkent" /></div>
            </div>
            <Button>{t("save")}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
