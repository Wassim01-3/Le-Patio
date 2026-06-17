import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useGallery } from "@/hooks/useGallery";
import { resolveImage } from "@/lib/image-mapping";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Le Patio" },
      { name: "description", content: "A visual walk through Le Patio — coffees, desserts, terrace, decoration and sunset moments." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const { t } = useI18n();
  const { photos, loading, error } = useGallery();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <PageShell
      eyebrow={t("gallery.eyebrow")}
      title={t("gallery.title")}
      subtitle={t("gallery.subtitle")}
    >
      {loading ? (
        <div className="mt-4 grid auto-rows-[140px] grid-cols-2 gap-2.5 sm:auto-rows-[180px] sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-full w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-8 text-center text-sm text-destructive rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
          Failed to load the gallery. Please try again.
        </p>
      ) : (
        <div className="mt-4 grid auto-rows-[140px] grid-cols-2 gap-2.5 sm:auto-rows-[180px] sm:grid-cols-3">
          {photos.map((p, i) => (
            <motion.button
              key={p.id || i}
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft ${p.span || ""}`}
              aria-label={t(p.key) || p.key}
            >
              <img src={resolveImage(p.src)} alt={t(p.key) || p.key} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-wood/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="absolute bottom-2 start-2 rounded-full bg-ivory/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-wood opacity-0 transition-opacity group-hover:opacity-100">
                {t(p.key) || p.key}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open !== null && photos[open] && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-wood/85 p-4 backdrop-blur"
            onClick={() => setOpen(null)}
          >
            <motion.img
              key={open}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              src={resolveImage(photos[open].src)}
              alt={t(photos[open].key) || photos[open].key}
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-elegant"
            />
            <button
              onClick={() => setOpen(null)}
              aria-label={t("common.dismiss")}
              className="absolute end-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-ivory text-wood shadow-soft"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
