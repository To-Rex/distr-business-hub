import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { ShieldX, ArrowLeft } from "lucide-react";
import { w as useSettings, u as useAuth, a as Button } from "./router-Bi5ReRu6.js";
import "react";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
function NoAccessPage() {
  const {
    t
  } = useSettings();
  const {
    logout
  } = useAuth();
  const navigate = useNavigate();
  const handleBackToLogin = () => {
    logout();
    navigate({
      to: "/login"
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-6 text-center max-w-md px-6", children: [
    /* @__PURE__ */ jsx("div", { className: "rounded-full bg-destructive/10 p-4", children: /* @__PURE__ */ jsx(ShieldX, { className: "h-12 w-12 text-destructive" }) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: t("noAccessTitle") || "Ruxsat yo'q" }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: t("noAccessDesc") || "Sizda ushbu tizimga kirish uchun ruxsat yo'q. Iltimos, administrator bilan bog'lanishingizni so'raymiz." }),
    /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2", onClick: handleBackToLogin, children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
      t("backToLoginPage") || "Login sahifasiga qaytish"
    ] })
  ] }) });
}
export {
  NoAccessPage as component
};
