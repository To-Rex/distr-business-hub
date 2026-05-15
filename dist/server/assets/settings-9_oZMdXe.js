import { jsxs, jsx } from "react/jsx-runtime";
import { a as useSettings, P as PageHeader, C as Card, o as CardHeader, p as CardTitle, g as CardContent, L as LANGS, B as Button } from "./router-CTVAwSR8.js";
import { L as Label } from "./label-SZrZpdES.js";
import { S as Switch } from "./switch-DZ8BWOwv.js";
import { Check, Sun, Moon } from "lucide-react";
import "@tanstack/react-router";
import "react";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
function SettingsPage() {
  const {
    t,
    lang,
    setLang,
    theme,
    setTheme
  } = useSettings();
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("settings"), description: t("settingsDesc") }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("language") }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-2", children: LANGS.map((l) => /* @__PURE__ */ jsxs("button", { onClick: () => setLang(l.code), className: `w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${lang === l.code ? "border-primary bg-primary/5" : "hover:bg-secondary"}`, children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: l.flag }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-left font-medium", children: l.label }),
          lang === l.code && /* @__PURE__ */ jsx(Check, { className: "h-5 w-5 text-primary" })
        ] }, l.code)) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("theme") }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => setTheme("light"), className: `p-4 rounded-lg border transition-colors ${theme === "light" ? "border-primary bg-primary/5" : "hover:bg-secondary"}`, children: [
            /* @__PURE__ */ jsx(Sun, { className: "h-6 w-6 mx-auto mb-2" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: t("light") })
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => setTheme("dark"), className: `p-4 rounded-lg border transition-colors ${theme === "dark" ? "border-primary bg-primary/5" : "hover:bg-secondary"}`, children: [
            /* @__PURE__ */ jsx(Moon, { className: "h-6 w-6 mx-auto mb-2" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: t("dark") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("notifications") }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          [{
            k: "Email notifications",
            d: "Receive updates via email"
          }, {
            k: "Push notifications",
            d: "Browser push for new orders"
          }, {
            k: "Weekly summary",
            d: "Weekly business summary every Monday"
          }, {
            k: "Low stock alerts",
            d: "Get alerted when stock falls below threshold"
          }].map((p, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "font-medium", children: p.k }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: p.d })
            ] }),
            /* @__PURE__ */ jsx(Switch, { defaultChecked: i < 2 })
          ] }, i)),
          /* @__PURE__ */ jsx(Button, { className: "mt-2", children: t("save") })
        ] })
      ] })
    ] })
  ] });
}
export {
  SettingsPage as component
};
