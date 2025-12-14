import { Link } from "@/navigation";

export function Footer() {
  return (
    <footer className="w-full border-t bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 px-6 py-3 text-xs text-muted-foreground">
        {/* Left: Copyright */}
        <p className="text-center md:text-left">
          © 2025 Family Tracker - All Rights Reserved
        </p>

        {/* Middle: Designer Credit */}
        <p className="text-center">
          Designed and Developed by{" "}
          <Link
            href="https://manudequevedo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium">
            Manu de Quevedo
          </Link>
        </p>

        {/* Spacer for AI bubble */}
        <div className="hidden md:block w-12" />
      </div>
    </footer>
  );
}
