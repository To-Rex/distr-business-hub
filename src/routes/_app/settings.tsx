import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings, LANGS } from "@/lib/settings";
import { Sun, Moon, Check } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { t, lang, setLang, theme, setTheme } = useSettings();
  return (
    <div>
      <PageHeader title={t("settings")} description={t("settingsDesc")} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("language")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${lang === l.code ? "border-primary bg-primary/5" : "hover:bg-secondary"}`}>
                <span className="text-2xl">{l.flag}</span>
                <span className="flex-1 text-left font-medium">{l.label}</span>
                {lang === l.code && <Check className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("theme")}</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <button onClick={() => setTheme("light")}
              className={`p-4 rounded-lg border transition-colors ${theme === "light" ? "border-primary bg-primary/5" : "hover:bg-secondary"}`}>
              <Sun className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">{t("light")}</div>
            </button>
            <button onClick={() => setTheme("dark")}
              className={`p-4 rounded-lg border transition-colors ${theme === "dark" ? "border-primary bg-primary/5" : "hover:bg-secondary"}`}>
              <Moon className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">{t("dark")}</div>
            </button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">{t("notifications")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { k: "Email notifications", d: "Receive updates via email" },
              { k: "Push notifications", d: "Browser push for new orders" },
              { k: "Weekly summary", d: "Weekly business summary every Monday" },
              { k: "Low stock alerts", d: "Get alerted when stock falls below threshold" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{p.k}</Label>
                  <p className="text-sm text-muted-foreground">{p.d}</p>
                </div>
                <Switch defaultChecked={i < 2} />
              </div>
            ))}
            <Button className="mt-2">{t("save")}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
