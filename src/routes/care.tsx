import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home/home-page";

export const Route = createFileRoute("/care")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "JonnyBee Son and Daughter Home Care Services — Assin Foso, Ghana" },
      {
        name: "description",
        content:
          "Your Family, Our Care! Home care in Assin Foso, Central Region, Ghana: personal care, elderly care, child care, housekeeping, meal preparation, companionship and health monitoring support.",
      },
    ],
  }),
});
