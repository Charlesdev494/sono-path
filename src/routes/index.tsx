import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadProfile } from "@/lib/profile";
import { Stethoscope } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "US360" },
      {
        name: "description",
        content:
          "O copiloto do médico ultrassonografista. Microaprendizado diário em ultrassonografia musculoesquelética.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const p = loadProfile();
    const id = setTimeout(() => {
      navigate({ to: p ? "/home" : "/onboarding" });
    }, 600);
    return () => clearTimeout(id);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary to-primary-glow px-6 text-primary-foreground">
      <div className="rounded-3xl bg-primary-foreground/15 p-5 backdrop-blur">
        <Stethoscope className="size-12" />
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">US360</h1>
        <p className="text-sm opacity-90">Companion · Dr. Charles Oliveira</p>
      </div>
    </div>
  );
}
