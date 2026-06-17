import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquarePlus, X } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useReviews } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Le Patio" },
      { name: "description", content: "What guests say about Le Patio: food, service, atmosphere, decoration and WiFi." },
    ],
  }),
  component: Reviews,
});

function Stars({ n, interactive = false, onChange }: { n: number, interactive?: boolean, onChange?: (val: number) => void }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i + 1)}
          className={`${interactive ? "hover:scale-110 active:scale-95 transition-transform p-0.5" : ""}`}
        >
          <Star className={`h-3 w-3 sm:h-4 sm:w-4 ${i < n ? "fill-accent text-accent" : "text-border"}`} />
        </button>
      ))}
    </span>
  );
}

function Reviews() {
  const { t } = useI18n();
  const { reviews, loading, error, addReview } = useReviews(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [food, setFood] = useState(5);
  const [service, setService] = useState(5);
  const [atmosphere, setAtmosphere] = useState(5);
  const [decoration, setDecoration] = useState(5);
  const [wifi, setWifi] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview({
        name,
        quote,
        roleKey: "Guest", // default role designation
        scores: { food, service, atmosphere, decoration, wifi },
      });
      toast.success("Review submitted", {
        description: "Thank you! Your review has been submitted for moderation. 🌿",
      });
      // reset form
      setName("");
      setQuote("");
      setFood(5);
      setService(5);
      setAtmosphere(5);
      setDecoration(5);
      setWifi(5);
      setShowForm(false);
    } catch (err) {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      eyebrow={t("reviews.eyebrow")}
      title={t("reviews.title")}
      subtitle={t("reviews.subtitle")}
    >
      <div className="flex justify-between items-center mt-2 mb-6">
        <h2 className="text-xs uppercase tracking-[0.24em] text-accent">Guest Feedback</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-accent text-wood font-semibold hover:bg-accent/85 h-10 px-4 flex items-center gap-1.5"
        >
          <MessageSquarePlus className="h-4 w-4" /> {showForm ? "Close Form" : "Write Review"}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <form onSubmit={handleSubmit} className="p-5 border border-accent/20 rounded-3xl bg-card/65 shadow-soft flex flex-col gap-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-display text-lg font-semibold">Share Your Experience</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Your Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Sarah K." className="bg-background/40" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Your Review</label>
                <Textarea value={quote} onChange={e => setQuote(e.target.value)} required placeholder="How was the food, service and garden terrace?" className="bg-background/40" />
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-t border-b border-border/80 my-1">
                {[
                  { label: t("rv.food"), score: food, setScore: setFood },
                  { label: t("rv.service"), score: service, setScore: setService },
                  { label: t("rv.atmosphere"), score: atmosphere, setScore: setAtmosphere },
                  { label: t("rv.decoration"), score: decoration, setScore: setDecoration },
                  { label: t("rv.wifi"), score: wifi, setScore: setWifi },
                ].map(({ label, score, setScore }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-foreground">{label}</span>
                    <Stars n={score} interactive onChange={setScore} />
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-accent text-wood rounded-full h-11 font-semibold">
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-8 text-center text-sm text-destructive rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
          Failed to load guest reviews.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r, i) => {
            const reviewRole = t(r.roleKey) !== r.roleKey ? t(r.roleKey) : r.roleKey;
            const reviewQuote = t(r.quote) !== r.quote ? t(r.quote) : r.quote;

            // Calculate overall score or default to 5
            const overall = r.scores 
              ? Math.round((r.scores.food + r.scores.service + r.scores.atmosphere + r.scores.decoration + r.scores.wifi) / 5) 
              : 5;

            return (
              <motion.article
                key={r.id || r.name || i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="rounded-3xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 font-display text-base font-semibold text-accent-foreground">
                      {r.name ? r.name[0] : "G"}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold leading-tight">{r.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{reviewRole}</p>
                    </div>
                  </div>
                  <Stars n={overall} />
                </div>

                <p className="mt-4 text-sm leading-relaxed text-foreground">
                  <span className="font-display text-accent">“</span>
                  {reviewQuote}
                  <span className="font-display text-accent">”</span>
                </p>

                {r.scores && (
                  <div className="mt-4 grid grid-cols-5 gap-2 border-t border-border pt-3">
                    {[
                      { key: "food", val: r.scores.food },
                      { key: "service", val: r.scores.service },
                      { key: "atmosphere", val: r.scores.atmosphere },
                      { key: "decoration", val: r.scores.decoration },
                      { key: "wifi", val: r.scores.wifi },
                    ].map(({ key, val }) => (
                      <div key={key} className="flex flex-col items-center text-center">
                        <Stars n={val} />
                        <span className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-muted-foreground leading-tight">{t(`rv.${key}`)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
