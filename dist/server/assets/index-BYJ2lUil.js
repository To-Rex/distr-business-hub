import { jsx } from "react/jsx-runtime";
import { Navigate } from "@tanstack/react-router";
import { u as useAdminAuth } from "./auth-_nxzhuNb.js";
import "react";
import "./router-cZ9I3NNJ.js";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "lucide-react";
import "@tanstack/react-query";
import "@radix-ui/react-select";
import "./admin-api-CFYqZiB0.js";
function AdminEntryPage() {
  const {
    isAuthenticated
  } = useAdminAuth();
  return /* @__PURE__ */ jsx(Navigate, { to: isAuthenticated ? "/admin/dashboard" : "/admin/login" });
}
export {
  AdminEntryPage as component
};
