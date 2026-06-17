import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useTable } from "@/hooks/useTable";

export function TableWelcome() {
  const { tableId } = useTable();
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setVisible(true);
    const id = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(id);
  }, [tableId]);


  return (
    <AnimatePresence>
      {visible && tableId && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed start-1/2 top-3 z-50 w-[min(92vw,28rem)] -translate-x-1/2"
        >
          <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-elegant">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-lg">🌿</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {t("table.eyebrow")}
              </p>
              <p className="truncate font-display text-base font-semibold text-foreground">
                {t("table.label")} {tableId}
              </p>
            </div>
            <button
              onClick={() => setVisible(false)}
              aria-label={t("common.dismiss")}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

}
