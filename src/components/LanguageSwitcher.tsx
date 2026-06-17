import { motion } from "framer-motion";
import { LANGS, useI18n } from "@/i18n/I18nProvider";

interface Props {
  variant?: "light" | "dark";
  className?: string;
}

// Custom premium SVG flags for the supported languages (rendered as uniform circles)
const FlagIcon = ({ code }: { code: string }) => {
  const svgClass = "w-5 h-5 rounded-full shadow-sm shrink-0 border border-white/20 object-cover";
  switch (code) {
    case "fr":
      return (
        <svg className={svgClass} viewBox="0 0 30 30">
          <rect width="10" height="30" fill="#002395" />
          <rect x="10" width="10" height="30" fill="#FFFFFF" />
          <rect x="20" width="10" height="30" fill="#ED2939" />
        </svg>
      );
    case "en":
      return (
        <svg className={svgClass} viewBox="0 0 30 30">
          <clipPath id="u">
            <circle cx="15" cy="15" r="15" />
          </clipPath>
          <g clipPath="url(#u)">
            <rect width="30" height="30" fill="#012169" />
            <path d="M0 0 L30 30 M30 0 L0 30" stroke="#FFFFFF" strokeWidth="4" />
            <path d="M0 0 L30 30 M30 0 L0 30" stroke="#C8102E" strokeWidth="2.5" />
            <path d="M15 0 V30 M0 15 H30" stroke="#FFFFFF" strokeWidth="6" />
            <path d="M15 0 V30 M0 15 H30" stroke="#C8102E" strokeWidth="4" />
          </g>
        </svg>
      );
    case "ar": // Tunisia flag representing Arabic locally
      return (
        <svg className={svgClass} viewBox="0 0 30 30">
          <rect width="30" height="30" fill="#E71E26" />
          <circle cx="15" cy="15" r="7.5" fill="#FFFFFF" />
          <circle cx="16.2" cy="15" r="5.6" fill="#E71E26" />
          <circle cx="17.7" cy="15" r="4.6" fill="#FFFFFF" />
          <polygon points="15,12.1 16.6,16.8 12.6,14 17.4,14 13.4,16.8" fill="#E71E26" />
        </svg>
      );
    case "de":
      return (
        <svg className={svgClass} viewBox="0 0 30 30">
          <rect width="30" height="10" fill="#000000" />
          <rect y="10" width="30" height="10" fill="#FF0000" />
          <rect y="20" width="30" height="10" fill="#FFCC00" />
        </svg>
      );
    case "it":
      return (
        <svg className={svgClass} viewBox="0 0 30 30">
          <rect width="10" height="30" fill="#009246" />
          <rect x="10" width="10" height="30" fill="#F1F2F1" />
          <rect x="20" width="10" height="30" fill="#CE2B37" />
        </svg>
      );
    default:
      return null;
  }
};

export function LanguageSwitcher({ variant = "light", className = "" }: Props) {
  const { lang, setLang, t } = useI18n();
  const dark = variant === "dark";

  return (
    <div className={`mx-auto max-w-[280px] w-full ${className}`}>
      <p
        className={`mb-2 text-center text-[9px] uppercase tracking-[0.3em] font-semibold ${
          dark ? "text-ivory/60" : "text-muted-foreground"
        }`}
      >
        <span className="text-accent">●</span> {t("lang.title")}
      </p>
      <div
        className={`flex justify-between items-center gap-1 rounded-full p-1 border ${
          dark ? "glass-dark border-ivory/5" : "glass border-border/40"
        }`}
      >
        {LANGS.map((l) => {
          const active = lang === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              aria-pressed={active}
              aria-label={l.label}
              className={`relative flex items-center justify-center rounded-full p-2.5 transition-all duration-300 ${
                active
                  ? dark
                    ? "scale-110"
                    : "scale-110"
                  : "opacity-60 hover:opacity-100 hover:scale-105"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="langPill"
                  className={`absolute inset-0 -z-10 rounded-full shadow-soft ${
                    dark ? "bg-accent" : "bg-primary"
                  }`}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <FlagIcon code={l.code} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

