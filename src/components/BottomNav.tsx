import { Link } from "@tanstack/react-router";
import { Home, BookOpen, Brain, Stethoscope, User, Trophy } from "lucide-react";

const items = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/atlas", label: "Atlas", icon: BookOpen },
  { to: "/quiz", label: "Quiz", icon: Brain },
  { to: "/caso", label: "Caso", icon: Stethoscope },
  { to: "/ranking", label: "Ranking", icon: Trophy },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: false }}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
