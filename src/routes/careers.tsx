import { createFileRoute } from "@tanstack/react-router";
import { CareersPortal } from "@/components/careers-portal";

export const Route = createFileRoute("/careers")({
  component: CareersPortal,
  head: () => ({
    meta: [
      { title: "Careers — Sambea Son and Daughter Home Care" },
      {
        name: "description",
        content:
          "Build a career around making lives better. Join a home-care team in Assin Foso, Ghana — browse open roles and apply in two short steps.",
      },
    ],
  }),
});
