import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Instagram, Facebook, MessageCircle, CalendarHeart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useContactSettings } from "@/hooks/useContactSettings";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Le Patio · Djerba" },
      { name: "description", content: "Phone, address, opening hours and reservations for Le Patio Food & Drinks in Djerba." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { t, locale } = useI18n();
  const { settings, loading, error } = useContactSettings();

  // Resolve language-specific settings or fallback
  const getLocalizedAddress = () => {
    if (!settings) return "";
    if (locale === "en" && settings.addressValueEn) return settings.addressValueEn;
    if (locale === "ar" && settings.addressValueAr) return settings.addressValueAr;
    if (locale === "de" && settings.addressValueDe) return settings.addressValueDe;
    if (locale === "it" && settings.addressValueIt) return settings.addressValueIt;
    return settings.addressValue;
  };

  const getLocalizedOpen = () => {
    if (!settings) return "";
    if (locale === "en" && settings.openValueEn) return settings.openValueEn;
    if (locale === "ar" && settings.openValueAr) return settings.openValueAr;
    if (locale === "de" && settings.openValueDe) return settings.openValueDe;
    if (locale === "it" && settings.openValueIt) return settings.openValueIt;
    return settings.openValue;
  };

  const info = settings ? [
    { icon: Phone, label: t("contact.phone"), value: settings.phone, href: `tel:${settings.phone.replace(/\s+/g, "")}` },
    { icon: MapPin, label: t("contact.address"), value: getLocalizedAddress() || t("contact.addressValue"), href: "https://www.google.com/maps?q=33.88413261231503,10.85585697476593" },
    { icon: Clock, label: t("contact.open"), value: getLocalizedOpen() || t("contact.openValue") },
  ] : [];

  const socials = settings ? [
    { icon: Instagram, label: "Instagram", href: settings.instagram },
    { icon: Facebook, label: "Facebook", href: settings.facebook },
    { icon: MessageCircle, label: "WhatsApp", href: settings.whatsapp },
  ] : [];

  return (
    <PageShell
      eyebrow={t("contact.eyebrow")}
      title={t("contact.title")}
      subtitle={t("contact.subtitle")}
    >
      {loading ? (
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-3xl" />
          ))}
          <Skeleton className="h-64 w-full rounded-[2rem] mt-3" />
          <Skeleton className="h-16 w-full rounded-full mt-3" />
        </div>
      ) : error ? (
        <p className="mt-8 text-center text-sm text-destructive rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
          Failed to load contact information.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-3">
            {info.map((c, i) => (
              <motion.a
                key={c.label}
                href={c.href ?? "#"}
                target={c.href?.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-elegant"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent-foreground">
                  <c.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
                  <p className="truncate font-display text-base font-semibold">{c.value}</p>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
            <iframe
              title="Le Patio — Djerba map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=10.8498%2C33.8801%2C10.8619%2C33.8882&layer=mapnik&marker=33.88413261231503%2C10.85585697476593"
              className="h-64 w-full"
              loading="lazy"
            />
          </div>

          <a
            href={settings?.whatsapp || "https://wa.me/21600000000"}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex h-16 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-elegant transition-transform active:scale-[0.99]"
          >
            <CalendarHeart className="h-5 w-5" />
            {t("contact.reserve")}
          </a>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-2 py-4 text-xs font-medium transition-colors hover:border-accent/50"
              >
                <s.icon className="h-5 w-5 text-accent-foreground" />
                {s.label}
              </a>
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
