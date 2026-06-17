import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, Phone, GlassWater, Receipt, Cigarette, Armchair } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nProvider";
import { useTable } from "@/hooks/useTable";
import { useServiceRequests } from "@/hooks/useServiceRequests";

export function ServiceFAB() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const { tableId } = useTable();
  const { createRequest } = useServiceRequests();

  const actions = [
    { key: "fab.callWaiter", icon: Phone },
    { key: "fab.water", icon: GlassWater },
    { key: "fab.bill", icon: Receipt },
    { key: "fab.ashtray", icon: Cigarette },
    { key: "fab.chairs", icon: Armchair },
  ];

  const handleRequest = async (key: string, label: string) => {
    try {
      const type = key.replace("fab.", "");
      await createRequest(tableId, type);
      toast.success(t("fab.toast.title", { action: label }), {
        description: t("fab.toast.desc"),
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 sm:bottom-28 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass absolute bottom-16 right-0 w-64 rounded-3xl p-2 shadow-elegant"
          >
            <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t("fab.title")}
            </p>
            <div className="flex flex-col">
              {actions.map(({ key, icon: Icon }) => {
                const label = t(key);
                return (
                  <button
                    key={key}
                    onClick={() => handleRequest(key, label)}
                    className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-start text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={t("fab.title")}
        className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-gold ring-1 ring-accent/40"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="bell" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bell className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
