import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Leaf, Snowflake, Ban, Wifi, Music2, UtensilsCrossed } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DjerbaWeather } from "@/components/DjerbaWeather";
import { useI18n } from "@/i18n/I18nProvider";
import hero from "@/assets/hero-patio.jpg";
import terrace from "@/assets/terrace.jpg";
import couple from "@/assets/couple.jpg";
import student from "@/assets/student.jpg";
import family from "@/assets/family.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Le Patio — Food & Drinks · Djerba" },
      { name: "description", content: "Where elegance, comfort and Mediterranean charm come together. Discover Le Patio in Djerba." },
      { property: "og:title", content: "Le Patio — Food & Drinks" },
      { property: "og:description", content: "Where elegance, comfort and Mediterranean charm come together." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();

  const features = [
    { emoji: "🌿", key: "terrace", icon: Leaf },
    { emoji: "❄️", key: "ac", icon: Snowflake },
    { emoji: "🚭", key: "smoke", icon: Ban },
    { emoji: "📶", key: "wifi", icon: Wifi },
    { emoji: "🎵", key: "music", icon: Music2 },
    { emoji: "🍽️", key: "menu", icon: UtensilsCrossed },
  ];

  const atmosphere = [
    { img: terrace, key: "terrace" },
    { img: family, key: "family" },
    { img: couple, key: "couple" },
    { img: student, key: "student" },
  ];

  return (
    <div className="min-h-screen pb-32">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={hero} alt="" className="h-full w-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-b from-wood/30 via-wood/40 to-background" />
        </div>

        <div className="px-5 pt-6">
          <div className="glass mx-auto flex max-w-2xl items-center justify-between rounded-full px-4 py-2 shadow-soft">
            <Logo className="h-8 w-auto" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-wood">
              {t("common.location")}
            </span>
          </div>
        </div>

        <div className="mx-auto flex min-h-[88vh] max-w-2xl flex-col justify-end px-5 pb-12 pt-32">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-[11px] uppercase tracking-[0.32em] text-ivory/90"
          >
            <span className="text-accent">●</span> {t("home.eyebrow")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.7 }}
            className="mt-4 text-balance font-display text-5xl font-semibold leading-[1.02] text-ivory sm:text-6xl"
          >
            {t("home.title1")}
            <span className="block text-accent">{t("home.title2")}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="mt-5 max-w-md text-balance text-base leading-relaxed text-ivory/85"
          >
            {t("home.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/menu"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-wood shadow-gold transition-transform active:scale-[0.98]"
            >
              {t("home.cta.menu")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-ivory/40 bg-ivory/10 px-6 text-sm font-semibold text-ivory backdrop-blur-md transition-colors hover:bg-ivory/20"
            >
              <Compass className="h-4 w-4" />
              {t("home.cta.explore")}
            </Link>
          </motion.div>

          {/* Language switcher */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-10"
          >
            <LanguageSwitcher variant="dark" />
          </motion.div>
        </div>
      </section>

      {/* WEATHER SUGGESTION WIDGET */}
      <section className="mx-auto max-w-2xl px-5 pt-8">
        <DjerbaWeather />
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-2xl px-5 pt-16">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent-foreground/80">
          <span className="text-accent">●</span> {t("home.featuresEyebrow")}
        </p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {t("home.featuresTitle")}
        </h2>
        <div className="hairline-gold mt-6 w-16" />

        <div className="mt-8 grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-elegant"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-lg">
                {f.emoji}
              </div>
              <h3 className="mt-4 font-display text-base font-semibold leading-tight">{t(`feat.${f.key}.t`)}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(`feat.${f.key}.d`)}</p>
              <span className="pointer-events-none absolute -end-6 -top-6 h-20 w-20 rounded-full bg-accent/10 blur-2xl transition-opacity group-hover:opacity-80" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ATMOSPHERE */}
      <section className="mx-auto max-w-2xl px-5 pt-20">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent-foreground/80">
          <span className="text-accent">●</span> {t("home.spacesEyebrow")}
        </p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {t("home.spacesTitle")}
        </h2>
        <div className="hairline-gold mt-6 w-16" />

        <div className="mt-8 flex flex-col gap-5">
          {atmosphere.map((a, i) => (
            <motion.article
              key={a.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.6 }}
              className="relative overflow-hidden rounded-[2rem] shadow-elegant"
            >
              <img src={a.img} alt={t(`atm.${a.key}.t`)} loading="lazy" className="h-72 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-wood/85 via-wood/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-2xl font-semibold text-ivory">{t(`atm.${a.key}.t`)}</h3>
                <p className="mt-1 max-w-sm text-sm text-ivory/85">{t(`atm.${a.key}.d`)}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section className="mx-auto mt-20 max-w-2xl px-5">
        <div className="glass-dark rounded-[2rem] p-8 text-center">
          <p className="font-display text-2xl leading-snug text-ivory">
            “{t("home.quote")}”
          </p>
          <div className="mx-auto mt-4 h-px w-12 bg-accent" />
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-accent">Le Patio · Djerba</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mx-auto mt-16 max-w-2xl px-5 pb-12">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
        <Logo className="h-10 w-auto" />
        <p className="mt-4 max-w-sm font-display text-lg leading-snug text-foreground">
          {t("footer.tagline")}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-y-2 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">{t("nav.home")}</Link>
          <Link to="/menu" className="text-muted-foreground hover:text-foreground">{t("nav.menu")}</Link>
          <Link to="/gallery" className="text-muted-foreground hover:text-foreground">{t("nav.gallery")}</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">{t("nav.contact")}</Link>
        </div>
        <div className="mt-6 flex gap-3">
          {[
            { label: "Instagram", href: "https://www.instagram.com/lepatio_djerba?igsh=MTNicnZ2ODZxeDg0aA==" },
            { label: "Facebook", href: "https://www.facebook.com/p/Le-Patio-61573872191824/" },
            { label: "WhatsApp", href: "https://wa.me/21698424600" },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {s.label}
            </a>
          ))}
        </div>
        <p className="mt-8 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          © {new Date().getFullYear()} {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
