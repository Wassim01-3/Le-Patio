import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Le Patio" },
      { name: "description", content: "Live music nights, match screenings, Ramadan specials and seasonal events at Le Patio Djerba." },
    ],
  }),
  component: Events,
});

function Events() {
  const { t } = useI18n();
  const { events, loading, error } = useEvents();

  return (
    <PageShell
      eyebrow={t("events.eyebrow")}
      title={t("events.title")}
      subtitle={t("events.subtitle")}
    >
      {loading ? (
        <div className="mt-8 flex flex-col gap-6 ps-6 border-s border-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative mb-6">
              <Skeleton className="absolute -start-[45px] top-3 h-10 w-10 rounded-full" />
              <Skeleton className="h-28 w-full rounded-3xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="mt-8 text-center text-sm text-destructive rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
          Failed to load the events schedule. Please check back later.
        </p>
      ) : (
        <ol className="relative mt-6 border-s border-border ps-6">
          {events.map((e, i) => {
            const Icon = (Icons as any)[e.icon || "Music"] || Icons.Music;
            // Support local keys for translations if they start with key (from static seed)
            const eventTitle = t(`ev.${e.key}.t`) !== `ev.${e.key}.t` ? t(`ev.${e.key}.t`) : e.title;
            const eventDesc = t(`ev.${e.key}.d`) !== `ev.${e.key}.d` ? t(`ev.${e.key}.d`) : e.desc;
            const eventDate = t(`ev.${e.key}.date`) !== `ev.${e.key}.date` ? t(`ev.${e.key}.date`) : e.date;

            return (
              <motion.li
                key={e.id || e.key || i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="relative mb-6 last:mb-0"
              >
                <span className="absolute -start-[35px] top-3 grid h-10 w-10 place-items-center rounded-full bg-card text-accent shadow-soft ring-1 ring-accent/30">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-accent">{eventDate}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-tight">{eventTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{eventDesc}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </PageShell>
  );
}
