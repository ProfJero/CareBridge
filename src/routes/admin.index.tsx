import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminApp } from "@/components/admin/shell";
import { SECTIONS, type Section } from "@/data/demo";
import { isDemoSignedIn } from "@/lib/demo-session";

export const Route = createFileRoute("/admin/")({
  validateSearch: (search: Record<string, unknown>): { section: Section } => {
    const value = search.section;
    if (typeof value === "string" && (SECTIONS as readonly string[]).includes(value)) {
      return { section: value as Section };
    }
    return { section: "overview" };
  },
  component: AdminHome,
  head: () => ({
    meta: [{ title: "Workspace — CareBridge" }],
  }),
});

function AdminHome() {
  const { section } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/" });
  const [gate, setGate] = useState<"pending" | "in" | "out">("pending");

  useEffect(() => {
    setGate(isDemoSignedIn() ? "in" : "out");
  }, []);

  useEffect(() => {
    if (gate === "out") void navigate({ to: "/admin/login" });
  }, [gate, navigate]);

  if (gate !== "in") {
    return <main className="min-h-screen bg-paper" />;
  }

  return (
    <AdminApp
      section={section}
      onSection={(next) => {
        void navigate({ search: { section: next } });
      }}
    />
  );
}
