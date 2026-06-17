import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, Plus, Disc, Loader2, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useTable } from "@/hooks/useTable";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { toast } from "sonner";
import { createServerFn } from "@tanstack/react-start";

// Custom Clé de Sol (Treble Clef) SVG Icon
function Clef({ className, strokeWidth = 1.5, ...props }: React.ComponentProps<"svg"> & { strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 22V5c0-1.5 1-3 2.5-3S17 3.5 17 5c0 2-3.5 4-5 5.5-2.5 2.5-4.5 4.5-4.5 7s1.8 4 4 4 4-2 4-4.5-1.5-3.5-3.5-3.5c-1 0-2 .5-2.5 1.5" />
      <circle cx="10.5" cy="21.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

// ─── Server-side Deezer search ───────────────────────────────────────────────
// Deezer blocks browser requests (CORS). The server calls it freely.
// No API key or auth needed — Deezer's public API is completely free.
export const searchDeezer = createServerFn({ method: "GET" })
  .validator((q: string) => q)
  .handler(async ({ data: q }) => {
    if (!q || !q.trim()) return [];

    const url = `https://api.deezer.com/search?q=${encodeURIComponent(q.trim())}&limit=5`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`Deezer error: ${res.status}`);

    const json = (await res.json()) as {
      data: Array<{
        id: number;
        title: string;
        duration: number; // seconds
        artist: { name: string };
        album: { cover_medium: string };
      }>;
    };

    return (json.data || []).map((t) => ({
      id: String(t.id),
      name: t.title,
      artist: t.artist.name,
      coverUrl: t.album.cover_medium,
      durationMs: t.duration * 1000, // convert to ms
    }));
  });

export const Route = createFileRoute("/songs")({
  head: () => ({
    meta: [
      { title: "Jukebox — Le Patio" },
      { name: "description", content: "Suggest your favorite songs to Le Patio's queue directly from your table." },
    ],
  }),
  component: Songs,
});

interface Track {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  durationMs: number;
}

interface QueuedSong extends Track {
  queueId: string;
  tableId: string;
  createdAt: any;
}

function Songs() {
  const { t } = useI18n();
  const { tableId } = useTable();

  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [queue, setQueue] = useState<QueuedSong[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Real-time Firestore queue subscription ─────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "song_queue"),
      orderBy("createdAt", "asc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: QueuedSong[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          items.push({
            queueId: doc.id,
            id: d.id,
            name: d.name,
            artist: d.artist,
            coverUrl: d.coverUrl,
            durationMs: d.durationMs,
            tableId: d.tableId || "?",
            createdAt: d.createdAt,
          });
        });
        setQueue(items);
      },
      (error) => console.error("Firestore queue error:", error)
    );

    return () => unsubscribe();
  }, []);

  // ── Debounced Deezer search (via server function) ──────────────────────────
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!queryText.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const tracks = await searchDeezer({ data: queryText });
        setResults(Array.isArray(tracks) ? tracks : []);
      } catch (err) {
        console.error("Deezer search error:", err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [queryText]);

  // ── Add song to Firestore queue ────────────────────────────────────────────
  const addToQueue = async (track: Track) => {
    const isDuplicate = queue.some((s) => s.id === track.id);
    if (isDuplicate) {
      toast.info("This song is already in the queue!", {
        description: "Let's wait for it to play first ✨",
      });
      return;
    }

    try {
      await addDoc(collection(db, "song_queue"), {
        id: track.id,
        name: track.name,
        artist: track.artist,
        coverUrl: track.coverUrl,
        durationMs: track.durationMs,
        tableId,
        createdAt: serverTimestamp(),
        status: "queued",
      });

      toast.success(t("songs.addedToast"), {
        description: `"${track.name}" — Table ${tableId} 🎶`,
      });

      setQueryText("");
      setResults([]);
    } catch (err) {
      console.error("Queue add error:", err);
      toast.error("Could not add song. Please try again.");
    }
  };

  const formatDuration = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <PageShell
      eyebrow={t("songs.eyebrow")}
      title={t("songs.title")}
      subtitle={t("songs.subtitle")}
    >
      <div className="mt-4 flex flex-col gap-6">
        {/* ── SEARCH BAR ──────────────────────────────────────────────────── */}
        <div className="relative z-30">
          <div className="relative flex items-center rounded-3xl border border-border bg-card/60 px-4 py-3 shadow-soft backdrop-blur transition-all focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/30">
            <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={t("songs.searchPlaceholder")}
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60"
            />
            {searching && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
          </div>

          {/* ── SUGGESTIONS DROPDOWN ──────────────────────────────────────── */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-0 right-0 mt-2 overflow-hidden rounded-[2rem] border border-border bg-card shadow-elegant"
              >
                <div className="flex max-h-[320px] flex-col divide-y divide-border/40 overflow-y-auto p-2">
                  {results.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => addToQueue(track)}
                      className="flex items-center gap-3.5 rounded-2xl p-3 text-left transition-colors hover:bg-accent/10 active:bg-accent/15"
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm">
                        {track.coverUrl ? (
                          <img src={track.coverUrl} alt={track.name} className="h-full w-full object-cover" />
                        ) : (
                          <Disc className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold leading-snug text-foreground">{track.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground mt-0.5">{track.artist}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-[10px] font-medium text-muted-foreground/80">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(track.durationMs)}</span>
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent">
                          <Plus className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── QUEUE ───────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Clef className="h-4 w-4 text-accent" />
              {t("songs.queueTitle")}
            </h2>
            <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-[10px] font-semibold text-accent">
              <Sparkles className="h-3 w-3" />
              <span>{queue.length} {queue.length === 1 ? "song" : "songs"}</span>
            </div>
          </div>

          {queue.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/40 px-6 py-14 text-center"
            >
              <div className="mb-3.5 grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
                <Clef className="h-6 w-6" />
              </div>
              <p className="max-w-[200px] text-sm font-medium leading-relaxed text-muted-foreground">
                {t("songs.emptyQueue")}
              </p>
            </motion.div>
          ) : (
            <div className="flex max-h-[480px] flex-col gap-2.5 overflow-y-auto">
              {queue.map((song, index) => (
                <motion.div
                  key={song.queueId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-center gap-3.5 rounded-3xl border border-border bg-card p-3 shadow-soft"
                >
                  {/* Cover */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt={song.name} className="h-full w-full object-cover" />
                    ) : (
                      <Disc className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                    )}
                    {index === 0 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-accent/30">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-accent opacity-75" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-bold leading-snug text-foreground">{song.name}</p>
                      {index === 0 && (
                        <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-accent">
                          Up Next
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground mt-0.5">{song.artist}</p>
                  </div>

                  {/* Duration + table */}
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/80">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(song.durationMs)}</span>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-semibold text-primary">
                      Table {song.tableId}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
