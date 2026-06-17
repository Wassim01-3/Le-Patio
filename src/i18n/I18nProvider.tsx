import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { T, LANGS, type Lang } from "./translations";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  dir: "ltr" | "rtl";
};

const I18nCtx = createContext<Ctx | null>(null);

const DEFAULT: Lang = "fr";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lepatio.lang") as Lang | null;
      if (saved && LANGS.some((l) => l.code === saved)) setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lepatio.lang", l); } catch {}
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const raw = T[lang]?.[key] ?? T.en[key] ?? key;
      if (!vars) return raw;
      return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), v),
        raw,
      );
    },
    [lang],
  );

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }),
    [lang, setLang, t],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { LANGS };
export type { Lang };
