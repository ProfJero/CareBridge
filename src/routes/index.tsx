import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home/home-page";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "SamBee Son and Daughter Home Care — Home care in Assin Foso, Ghana" },
      {
        name: "description",
        content:
          "Home care in Assin Foso, Central Region, Ghana: personal care, elderly care, recovery support, household help and companionship. Request care, shop care essentials and watch care videos.",
      },
    ],
  }),
});
