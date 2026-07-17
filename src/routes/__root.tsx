import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1e3a8a" },
      { title: "US360" },
      {
        name: "description",
        content:
          "O copiloto do médico ultrassonografista. Microaprendizado diário em ultrassonografia musculoesquelética.",
      },
      { name: "author", content: "Dr. Charles Amaral de Oliveira" },
      { property: "og:title", content: "US360" },
      {
        property: "og:description",
        content: "Plataforma de aprendizado contínuo em sonoanatomia e medicina da dor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "US360" },
      { name: "description", content: "piloto do aplicativo de charles ultrassom" },
      { property: "og:description", content: "piloto do aplicativo de charles ultrassom" },
      { name: "twitter:description", content: "piloto do aplicativo de charles ultrassom" },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f32fbab-a556-4568-a8bd-2a684b97f80b/id-preview-6ab8df80--5b359dfd-f0a7-4cb4-9eca-408d15846ddf.lovable.app-1781197888578.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f32fbab-a556-4568-a8bd-2a684b97f80b/id-preview-6ab8df80--5b359dfd-f0a7-4cb4-9eca-408d15846ddf.lovable.app-1781197888578.png",
      },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "US360" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap",
      },
      // iOS ignora os ícones do manifest e usa este — 180x180, achatado sobre
      // o azul da marca (ele não respeita transparência aqui).
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// O service worker usa cache-first para assets (public/sw.js). Em produção é o
// que faz o app abrir offline. Em desenvolvimento ele intercepta os módulos do
// Vite, guarda a primeira versão e passa a servi-la para sempre: o código muda,
// o navegador continua com o antigo e a tela quebra de formas difíceis de
// entender. Por isso só registramos em produção.
//
// Quem já visitou o app em dev tem um SW registrado que continuaria sequestrando
// as requisições mesmo depois desta correção — daí o unregister + limpeza de
// cache: o ambiente se conserta sozinho, sem ninguém precisar mexer no DevTools.
function setupServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      if (regs.length === 0) return;
      Promise.all(regs.map((r) => r.unregister()))
        .then(() => caches?.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))))
        .then(() => {
          console.info("[dev] service worker removido; recarregando com código atual.");
          window.location.reload();
        })
        .catch(() => {});
    });
    return;
  }

  const register = () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("SW registration failed:", err));
  };
  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register);
  }
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    setupServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* AuthProvider fica dentro do QueryClientProvider: ele limpa o cache de
          queries ao trocar de conta, então precisa do queryClient. */}
      <AuthProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
