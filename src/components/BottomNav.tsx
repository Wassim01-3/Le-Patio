import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UtensilsCrossed, Compass, Clef, Images, Calendar, Star, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();

  const items = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/menu", label: t("nav.menu"), icon: UtensilsCrossed },
    { to: "/explore", label: t("nav.explore"), icon: Compass },
    { to: "/songs", label: t("nav.songs"), icon: Clef },
    { to: "/gallery", label: t("nav.gallery"), icon: Images },
    { to: "/events", label: t("nav.events"), icon: Calendar },
    { to: "/reviews", label: t("nav.reviews"), icon: Star },
    { to: "/contact", label: t("nav.contact"), icon: Phone },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Primary"
    >
      <div className="glass mx-auto flex max-w-2xl items-center justify-between overflow-x-auto rounded-full px-1.5 py-1.5 shadow-elegant scrollbar-none">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className="relative flex shrink-0 flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {active && (
                <motion.span
                  layoutId="navPill"
                  className="absolute inset-0 -z-10 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className={`h-5 w-5 ${active ? "text-primary-foreground" : ""}`} strokeWidth={active ? 2.2 : 1.6} />
              <span className={active ? "text-primary-foreground" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
