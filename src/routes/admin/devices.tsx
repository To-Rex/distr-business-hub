import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/devices")({
  component: () => <Navigate to="/" />,
});
