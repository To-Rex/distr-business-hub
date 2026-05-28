import { jsx } from "react/jsx-runtime";
import { Navigate } from "@tanstack/react-router";
import { P as useAdminAuth } from "./auth-e3kfMlw4.js";
import "react";
import "./router-CefM0D5R.js";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "lucide-react";
import "@tanstack/react-query";
import "@radix-ui/react-select";
function AdminEntryPage() {
  const {
    isAuthenticated
  } = useAdminAuth();
  return /* @__PURE__ */ jsx(Navigate, { to: isAuthenticated ? "/admin/dashboard" : "/admin/login" });
}
export {
  AdminEntryPage as component
};
