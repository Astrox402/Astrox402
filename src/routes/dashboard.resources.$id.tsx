import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/resources/$id")({
  component: () => <Outlet />,
});
