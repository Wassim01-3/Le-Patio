import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";

interface PortraitLandscapeGuardProps {
  children: React.ReactNode;
}

export function PortraitLandscapeGuard({ children }: PortraitLandscapeGuardProps) {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkOrientation = () => {
      // If width < 768px (mobile devices/tablets) and height > width, it's portrait
      const isMobileOrTablet = window.innerWidth < 1024;
      const portrait = isMobileOrTablet && window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  if (isPortrait) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background p-6 text-center text-foreground">
        <motion.div
          animate={{
            rotate: [0, 90, 90, 0, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1,
          }}
          className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-accent/30 bg-card shadow-elegant"
        >
          {/* Animated phone skeleton */}
          <div className="absolute h-16 w-9 rounded-lg border-2 border-muted-foreground/60 p-0.5 flex flex-col justify-between items-center">
            <div className="w-4 h-1 bg-muted-foreground/40 rounded-full" />
            <div className="w-1.5 h-1.5 bg-accent rounded-full mb-0.5" />
          </div>
          <RotateCw className="absolute -right-2 -top-2 h-6 w-6 text-accent animate-pulse" />
        </motion.div>

        <h3 className="font-display text-xl font-semibold mb-2">
          Rotate your phone to landscape mode 🌿
        </h3>
        <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
          For the best experience, the live floor plan is available only in horizontal orientation.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
