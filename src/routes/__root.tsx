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
import { BottomNav } from "@/components/BottomNav";
import { ServiceFAB } from "@/components/ServiceFAB";
import { TableWelcome } from "@/components/TableWelcome";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n/I18nProvider";
import { TableProvider } from "@/hooks/useTable";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-semibold text-foreground">404</h1>
        <h2 className="mt-4 font-display text-xl text-foreground">Page not found</h2>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Home
        </Link>
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
        <h1 className="font-display text-xl text-foreground">Something went wrong</h1>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#F5F1E8" },
      { title: "Le Patio — Food & Drinks · Djerba" },
      { name: "description", content: "Le Patio Food & Drinks — élégance, confort et charme méditerranéen au cœur de Djerba." },
      { property: "og:title", content: "Le Patio — Food & Drinks" },
      { property: "og:description", content: "Where elegance, comfort and Mediterranean charm come together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@500;600;700&display=swap" },
      { rel: "apple-touch-icon", href: "/logo.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAdmin = router.state.location.pathname.startsWith("/admin");

  return (
    <html lang="fr">
      <head>
        <HeadContent />
        {isAdmin ? (
          <>
            <link rel="manifest" href="/manifest-admin.json" />
            <meta name="apple-mobile-web-app-title" content="Le Patio Dashboard" />
          </>
        ) : (
          <>
            <link rel="manifest" href="/manifest.json" />
            <meta name="apple-mobile-web-app-title" content="Le Patio" />
          </>
        )}
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TableProvider>
          <TableWelcome />
          <Outlet />
          <ServiceFAB />
          <BottomNav />
          <Toaster position="top-center" />
        </TableProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

