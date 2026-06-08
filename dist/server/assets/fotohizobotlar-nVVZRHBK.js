import { jsxs, jsx } from "react/jsx-runtime";
import { w as useSettings, P as PageHeader, C as Card } from "./router-Bi5ReRu6.js";
import "@tanstack/react-router";
import "react";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "lucide-react";
import "@tanstack/react-query";
import "@radix-ui/react-select";
function FotohizobotlarPage() {
  const {
    t
  } = useSettings();
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("fotohizobotlar"), description: t("fotohizobotlarDesc") }),
    /* @__PURE__ */ jsx(Card, { className: "p-8 flex items-center justify-center min-h-[300px]", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: t("fotohizobotlarDesc") }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-[2px]", children: /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-white/30 bg-white/15 px-8 py-5 shadow-lg", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-semibold tracking-wide text-foreground", children: t("comingSoon") }) }) })
  ] });
}
export {
  FotohizobotlarPage as component
};
