import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Navigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ExternalLink, EyeOff, Eye, ArrowRight } from "lucide-react";
import { a as useSettings, B as Button, I as Input } from "./router-CTVAwSR8.js";
import { L as Label } from "./label-SZrZpdES.js";
import { u as useAdminAuth } from "./auth-ATVJn5u0.js";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-label";
function AdminLoginPage() {
  const {
    isAuthenticated,
    login
  } = useAdminAuth();
  const {
    t
  } = useSettings();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  if (isAuthenticated) return /* @__PURE__ */ jsx(Navigate, { to: "/admin/users" });
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const ok = await login(username, password);
    setIsLoading(false);
    if (!ok) {
      setError(t("adminLoginRequired") || "Xato login yoki parol");
      return;
    }
    navigate({
      to: "/admin/users"
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex flex-1 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border border-white/5" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "Distr", className: "h-10 w-10 rounded-xl object-contain" }),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: "Distr" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative space-y-5 max-w-md", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5" }),
          t("adminPanel")
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-semibold leading-tight tracking-tight", children: t("adminLoginTitle") }),
        /* @__PURE__ */ jsx("p", { className: "text-white/70 text-lg", children: t("adminLoginSubtitle") }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-6 pt-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-semibold", children: "24/7" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-white/50", children: "monitoring" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-semibold", children: "99.9%" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-white/50", children: "uptime" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-semibold", children: "AES-256" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-white/50", children: "encryption" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative text-sm text-white/40", children: "© 2026 Distr · distr.mxsoft.uz" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center justify-center p-6 relative", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4", children: /* @__PURE__ */ jsx(Link, { to: "/login", children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "gap-1.5 text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
        t("goToMainSite")
      ] }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:hidden flex items-center gap-2 justify-center", children: [
          /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "Distr", className: "h-10 w-10 rounded-xl object-contain" }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: "Distr" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: t("adminLoginTitle") }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t("adminLoginSubtitle") })
        ] }),
        error && /* @__PURE__ */ jsx("div", { className: "rounded-md bg-destructive/10 text-destructive text-sm px-4 py-3", children: error }),
        /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "admin-username", children: t("username") }),
            /* @__PURE__ */ jsx(Input, { id: "admin-username", value: username, onChange: (e) => setUsername(e.target.value), placeholder: t("username"), required: true, disabled: isLoading })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "admin-password", children: t("password") }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Input, { id: "admin-password", type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "********", required: true, disabled: isLoading, className: "pr-10" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors", tabIndex: -1, children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "submit", className: "w-full h-11 gap-2", disabled: isLoading, children: [
            isLoading ? "..." : t("signIn"),
            !isLoading && /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:hidden text-center", children: /* @__PURE__ */ jsx(Link, { to: "/login", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
          t("goToMainSite")
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  AdminLoginPage as component
};
