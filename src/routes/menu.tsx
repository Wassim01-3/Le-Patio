import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Crown } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useMenu } from "@/hooks/useMenu";
import { resolveImage } from "@/lib/image-mapping";
import { Skeleton } from "@/components/ui/skeleton";

type MenuSearch = {
  search?: string;
  cat?: string;
  craving?: string;
};

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => {
    return {
      search: search.search as string | undefined,
      cat: search.cat as string | undefined,
      craving: search.craving as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Menu — Le Patio · Djerba" },
      { name: "description", content: "Coffees, desserts, pizzas, pastas, burgers, cocktails and more — the full Le Patio menu." },
    ],
  }),
  component: MenuPage,
});

const CRAVINGS = [
  { id: "sweet", emoji: "🍰", cats: ["desserts", "icecream"] },
  { id: "healthy", emoji: "🥗", cats: ["salads", "drinks"] },
  { id: "romantic", emoji: "❤️", cats: ["cocktails", "main"] },
  { id: "family", emoji: "👨‍👩‍👧", cats: ["pizza", "pasta"] },
  { id: "student", emoji: "📚", cats: ["coffee", "desserts"] },
  { id: "refreshing", emoji: "🍹", cats: ["drinks", "cocktails"] },
] as const;

function MenuPage() {
  const { t } = useI18n();
  const { categories, items, loading, error } = useMenu();
  const [cat, setCat] = useState<string>("coffee");
  const [q, setQ] = useState("");
  const [craving, setCraving] = useState<string | null>(null);

  // Parse search params on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get("search");
      const catParam = params.get("cat");
      const cravingParam = params.get("craving");

      if (searchParam) {
        setQ(searchParam);
      }
      if (catParam) {
        setCat(catParam);
      }
      if (cravingParam) {
        setCraving(cravingParam);
      }
    }
  }, []);

  const visible = useMemo(() => {
    let list = items;

    // When a search query is active, search across ALL categories
    // so weather suggestions (e.g. "Lemonade") find items in any category
    if (q.trim()) {
      const s = q.toLowerCase();
      return list.filter((i) => i.name.toLowerCase().includes(s) || i.desc.toLowerCase().includes(s));
    }

    if (craving) {
      const cats = CRAVINGS.find((c) => c.id === craving)?.cats ?? [];
      list = list.filter((i) => cats.includes(i.category));
    } else {
      list = list.filter((i) => i.category === cat);
    }

    return list;
  }, [items, cat, q, craving]);

  const specials = useMemo(() => {
    return items.filter((i) => (i.chef || i.popular) && i.available).slice(0, 5);
  }, [items]);

  return (
    <PageShell
      eyebrow={t("menu.eyebrow")}
      title={t("menu.title")}
      subtitle={t("menu.subtitle")}
    >
      <div className="relative mt-2">
        <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("menu.search")}
          className="h-14 w-full rounded-full border border-border bg-card pe-5 ps-11 text-sm text-foreground shadow-soft outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {loading ? (
        <div className="mt-8 flex flex-col gap-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-64 shrink-0 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-12 w-full rounded-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-8 text-center text-sm text-destructive rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
          Failed to load the menu. Please check your connection or reload the page.
        </p>
      ) : (
        <>
          {/* SPECIALS */}
          {specials.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">{t("menu.specials")}</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent">{t("menu.specialsTag")}</span>
              </div>
              <div className="-mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 scrollbar-none">
                {specials.map((s) => (
                  <article
                    key={s.name}
                    className="relative w-64 shrink-0 snap-start overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
                  >
                    <img src={resolveImage(s.img)} alt={s.name} loading="lazy" className="h-32 w-full object-cover" />
                    <div className="p-4">
                      <h3 className="font-display text-base font-semibold leading-tight">{s.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.desc}</p>
                      <p className="mt-3 text-sm font-semibold text-accent-foreground">
                        <span className="text-accent">{s.price}</span> {t("common.currency")}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* CRAVINGS */}
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">{t("menu.cravingTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("menu.cravingSub")}</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {CRAVINGS.map((c) => {
                const active = craving === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setCraving(active ? null : c.id); setQ(""); }}
                    className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-4 text-center transition-all ${
                      active
                        ? "border-accent bg-accent/15 shadow-gold"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-[11px] font-medium leading-tight">{t(`crave.${c.id}`)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* CATEGORIES NAVIGATION */}
          <div className="sticky top-[68px] z-20 -mx-5 mt-8 bg-gradient-to-b from-background via-background to-background/80 px-5 py-3 backdrop-blur">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((c) => {
                const active = !craving && cat === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setCraving(null); setCat(c.id); setQ(""); }}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-soft"
                        : "border-border bg-card text-foreground hover:border-accent/50"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    {t(`cat.${c.id}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* VISIBLE ITEMS LIST */}
          <section className="mt-4 flex flex-col gap-3">
            {visible.length === 0 && (
              <p className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
                {t("menu.empty")}
              </p>
            )}
            {visible.map((item, i) => (
              <motion.article
                key={item.id || item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`group flex gap-4 overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-soft transition-shadow hover:shadow-elegant ${!item.available ? "opacity-60" : ""}`}
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                  <img src={resolveImage(item.img)} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-semibold leading-tight truncate">{item.name}</h3>
                    <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      {item.price} <span className="text-[10px] opacity-70">{t("common.currency")}</span>
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                    {item.popular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-olive/15 px-2 py-0.5 text-[10px] font-medium text-olive">
                        <Sparkles className="h-3 w-3" /> {t("menu.popular")}
                      </span>
                    )}
                    {item.chef && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                        <Crown className="h-3 w-3" /> {t("menu.chef")}
                      </span>
                    )}
                    {!item.available && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </section>
        </>
      )}
    </PageShell>
  );
}
