import { jsxs, jsx } from "react/jsx-runtime";
import { a as useSettings, u as useAuth, P as PageHeader, C as Card, g as CardContent, o as CardHeader, p as CardTitle } from "./router-CTVAwSR8.js";
import { S as Separator } from "./separator-ZBy7-fIk.js";
import { Mail, Phone, User, Calendar, Building2, Hash, Users, Shield, Globe } from "lucide-react";
import "@tanstack/react-router";
import "react";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "@radix-ui/react-separator";
function formatPhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "").replace(/^998/, "");
  if (digits.length !== 9) return raw;
  return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}
function Field({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 py-2", children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsx("div", { className: "text-sm font-medium truncate", children: value ?? "—" })
    ] })
  ] });
}
function ProfilePage() {
  const {
    t
  } = useSettings();
  const {
    user
  } = useAuth();
  const name = user?.name ?? "User";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }) : null;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("profile"), description: t("profileDesc") }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl", children: [
      /* @__PURE__ */ jsx(Card, { className: "lg:col-span-1 h-fit", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 text-center", children: [
        user?.photo ? /* @__PURE__ */ jsx("img", { src: user.photo, alt: name, className: "h-24 w-24 mx-auto rounded-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "h-24 w-24 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-semibold", children: initials }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 text-lg font-semibold", children: name }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: user?.user_type }),
        /* @__PURE__ */ jsx(Separator, { className: "my-4" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-sm text-left", children: [
          /* @__PURE__ */ jsx(Field, { icon: Mail, label: t("email"), value: user?.email }),
          /* @__PURE__ */ jsx(Field, { icon: Phone, label: t("phone"), value: formatPhone(user?.phone_number) }),
          /* @__PURE__ */ jsx(Field, { icon: User, label: t("username"), value: user?.username }),
          /* @__PURE__ */ jsx(Field, { icon: Calendar, label: t("calendar") ?? "Sana", value: created })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
            t("company")
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-6", children: [
            /* @__PURE__ */ jsx(Field, { icon: Building2, label: t("name"), value: user?.company_rel?.name }),
            /* @__PURE__ */ jsx(Field, { icon: Hash, label: "INN", value: user?.company_rel?.inn })
          ] }) })
        ] }),
        user?.manager && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
            t("manager")
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-6", children: [
            /* @__PURE__ */ jsx(Field, { icon: User, label: t("name"), value: `${user.manager.first_name} ${user.manager.last_name}` }),
            /* @__PURE__ */ jsx(Field, { icon: Mail, label: t("email"), value: user.manager.email }),
            /* @__PURE__ */ jsx(Field, { icon: Phone, label: t("phone"), value: formatPhone(user.manager.phone_number) }),
            /* @__PURE__ */ jsx(Field, { icon: Shield, label: t("role"), value: user.manager.user_type })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }),
            t("oneCData")
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-6", children: [
            /* @__PURE__ */ jsx(Field, { icon: Hash, label: t("oneCId"), value: user?.user_1c_id }),
            /* @__PURE__ */ jsx(Field, { icon: User, label: t("oneCLogin"), value: user?.user_1c_login })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  ProfilePage as component
};
