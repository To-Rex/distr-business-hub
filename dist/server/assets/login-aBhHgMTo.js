import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { EyeOff, Eye } from "lucide-react";
import { u as useAuth, a as useSettings, L as LANGS, I as Input, B as Button } from "./router-CTVAwSR8.js";
import { L as Label } from "./label-SZrZpdES.js";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-label";
function LoginPage() {
  const {
    user,
    login
  } = useAuth();
  const {
    t,
    lang,
    setLang
  } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (user) navigate({
      to: "/dashboard"
    });
  }, [user, navigate]);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const loginEmail = email.includes("@") ? email : `${email}@gmail.com`;
    try {
      await login(loginEmail, password);
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex flex-1 bg-primary text-primary-foreground p-12 flex-col justify-between relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-foreground/5" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-foreground/5" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "Distr", className: "h-10 w-10 rounded-xl object-contain" }),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: "Distr" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative space-y-5 max-w-md", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-semibold leading-tight tracking-tight", children: "Distr — biznesingizni boshqaring." }),
        /* @__PURE__ */ jsx("p", { className: "text-primary-foreground/80 text-lg", children: t("appTagline") }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-6 pt-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-semibold", children: "12+" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-primary-foreground/70", children: "modullar" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-semibold", children: "3" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-primary-foreground/70", children: t("language").toLowerCase() })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-semibold", children: "99%" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-primary-foreground/70", children: "uptime" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative text-sm text-primary-foreground/60", children: "© 2026 Distr · distr.mxsoft.uz" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center justify-center p-6 relative", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 flex gap-1", children: LANGS.map((l) => /* @__PURE__ */ jsxs("button", { onClick: () => setLang(l.code), className: `px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${lang === l.code ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`, children: [
        l.flag,
        " ",
        l.code.toUpperCase()
      ] }, l.code)) }),
      /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:hidden flex items-center gap-2 justify-center", children: [
          /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "Distr", className: "h-10 w-10 rounded-xl object-contain" }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: "Distr" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: t("welcomeBack") }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t("signInSubtitle") })
        ] }),
        error && /* @__PURE__ */ jsx("div", { className: "rounded-md bg-destructive/10 text-destructive text-sm px-4 py-3", children: error }),
        /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: t("email") }),
            /* @__PURE__ */ jsx(Input, { id: "email", type: "text", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: t("password") }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Input, { id: "password", type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading, className: "pr-10" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors", tabIndex: -1, children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-11", disabled: loading, children: loading ? "..." : t("signIn") })
        ] })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
