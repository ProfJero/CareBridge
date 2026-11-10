import { createFileRoute } from "@tanstack/react-router";
import { CareersPortal } from "@/components/careers-portal";

export const Route = createFileRoute("/")({
  component: CareersPortal,
  head: () => ({
    meta: [
      { title: "CareBridge Careers — Make a difference every day" },
      {
        name: "description",
        content:
          "Apply to join CareBridge home care in Ghana. Browse open roles and send a caregiver application by email.",
      },
    ],
  }),
});
