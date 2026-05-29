import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/no-access")({
  component: NoAccessPage,
});

function NoAccessPage() {
  const { t } = useSettings();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-md px-6">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("noAccessTitle") || "Ruxsat yo'q"}
        </h1>
        <p className="text-muted-foreground">
          {t("noAccessDesc") || "Sizda ushbu tizimga kirish uchun ruxsat yo'q. Iltimos, administrator bilan bog'lanishingizni so'raymiz."}
        </p>
        <Button variant="outline" className="gap-2" onClick={handleBackToLogin}>
          <ArrowLeft className="h-4 w-4" />
          {t("backToLoginPage") || "Login sahifasiga qaytish"}
        </Button>
      </div>
    </div>
  );
}
