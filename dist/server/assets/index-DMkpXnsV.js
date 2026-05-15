import { jsx } from "react/jsx-runtime";
import { Navigate } from "@tanstack/react-router";
import { u as useAuth } from "./router-CTVAwSR8.js";
import "react";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "lucide-react";
import "@tanstack/react-query";
import "@radix-ui/react-select";
function Index() {
  const {
    user
  } = useAuth();
  return /* @__PURE__ */ jsx(Navigate, { to: user ? "/dashboard" : "/login" });
}
export {
  Index as component
};
