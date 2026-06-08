import { jsx } from "react/jsx-runtime";
import { Navigate } from "@tanstack/react-router";
import { u as useAdminAuth } from "./auth-7P5ByLu8.js";
import "react";
import "./router-Bi5ReRu6.js";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "lucide-react";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "./admin-api-CSqjd_Zg.js";
function AdminEntryPage() {
  const {
    isAuthenticated
  } = useAdminAuth();
  return /* @__PURE__ */ jsx(Navigate, { to: isAuthenticated ? "/admin/dashboard" : "/admin/login" });
}
export {
  AdminEntryPage as component
};
