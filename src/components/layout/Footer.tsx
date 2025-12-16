import { Link } from "@/navigation";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 px-6 py-3 text-xs text-muted-foreground">
        {/* Left: Copyright */}
        <p className="text-center md:text-left">
          © 2025 Family Tracker - All Rights Reserved
        </p>

        {/* Middle: Designer Credit */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 opacity-80 hover:opacity-100 transition-opacity">
          <span>Developed with</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          <span>by</span>
          <a
            href="https://noctra.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="block">
            {/* Shows in Light Mode - Dark Logo */}
            <img
              src="/images/noctra-logo-dark.png"
              alt="Noctra Studio"
              className="h-4 w-auto dark:hidden"
            />
            {/* Shows in Dark Mode - Light Logo */}
            <img
              src="/images/noctra-logo-light.png"
              alt="Noctra Studio"
              className="h-4 w-auto hidden dark:block"
            />
          </a>
        </div>

        {/* Spacer for AI bubble */}
        <div className="hidden md:block w-12" />
      </div>
    </footer>
  );
}
