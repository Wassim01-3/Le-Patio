import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { useI18n } from "@/i18n/I18nProvider";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function PageShell({ eyebrow, title, subtitle, children }: Props) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen pb-32">
      <header className="sticky top-0 z-30 px-4 pt-3">
        <div className="glass mx-auto flex max-w-2xl items-center justify-between rounded-full px-4 py-2 shadow-soft">
          <Logo className="h-8 w-auto" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {t("common.location")}
          </span>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl px-5 pt-8"
      >
        {eyebrow && (
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-accent-foreground/80">
            <span className="text-accent">●</span> {eyebrow}
          </p>
        )}
        <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-prose text-balance text-base leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
        <div className="hairline-gold mt-6 w-16" />
      </motion.section>

      <main className="mx-auto max-w-2xl px-5 pt-6">{children}</main>
    </div>
  );
}
