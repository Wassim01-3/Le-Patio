import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/i18n/I18nProvider";
import terrace from "@/assets/terrace.jpg";
import lounge from "@/assets/lounge.jpg";
import couple from "@/assets/couple.jpg";
import student from "@/assets/student.jpg";
import family from "@/assets/family.jpg";
import decor from "@/assets/decor.jpg";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Le Patio — Djerba" },
      { name: "description", content: "Walk through Le Patio's terrace, lounge, family, couple, student and non-smoking spaces." },
    ],
  }),
  component: Explore,
});

const sections = [
  { img: terrace, n: "01", key: "terrace" },
  { img: lounge, n: "02", key: "lounge" },
  { img: couple, n: "03", key: "couple" },
  { img: student, n: "04", key: "student" },
  { img: family, n: "05", key: "family" },
  { img: decor, n: "06", key: "quiet" },
];

function Explore() {
  const { t } = useI18n();
  return (
    <PageShell
      eyebrow={t("explore.eyebrow")}
      title={t("explore.title")}
      subtitle={t("explore.subtitle")}
    >
      <div className="mt-4 flex flex-col gap-8">
        {sections.map((s, i) => (
          <motion.article
            key={s.key}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10]">
              <img src={s.img} alt={t(`ex.${s.key}.t`)} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-wood/70 via-transparent to-transparent" />
              <p className="absolute start-5 top-5 rounded-full bg-ivory/85 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-wood backdrop-blur">
                {s.n} · {t(`ex.${s.key}.t`)}
              </p>
            </div>
            <div className="p-6">
              <h2 className="font-display text-2xl font-semibold leading-tight">{t(`ex.${s.key}.t`)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`ex.${s.key}.d`)}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </PageShell>
  );
}
