import logo from "@/assets/logo.png";

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src={logo} alt="Le Patio — Food & Drinks" className={className} />;
}

