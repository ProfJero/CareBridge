import { createFileRoute, redirect } from "@tanstack/react-router";

// The old sample workspace lived here; staff now use the real admin dashboard.
export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    throw redirect({ to: "/manage" });
  },
});
