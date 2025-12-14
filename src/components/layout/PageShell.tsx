import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  /** Page title displayed in the header */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional action buttons/controls in the header */
  headerAction?: ReactNode;
  /** Page content */
  children: ReactNode;
  /** Optional additional className for the container */
  className?: string;
  /** Whether to constrain max width (default: true) */
  constrainWidth?: boolean;
}

/**
 * PageShell - Standardized page wrapper for consistent layout
 *
 * Ensures pixel-perfect alignment across all pages with:
 * - Consistent padding (p-6)
 * - Standardized header typography
 * - Max-width constraint for large screens
 * - Internal scrolling (parent handles)
 */
export function PageShell({
  title,
  description,
  headerAction,
  children,
  className,
  constrainWidth = true,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "w-full space-y-6",
        constrainWidth && "max-w-[1600px] mx-auto",
        className
      )}>
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-[#93c5fd]">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm md:text-base">
              {description}
            </p>
          )}
        </div>

        {headerAction && (
          <div className="flex items-center gap-2 shrink-0">{headerAction}</div>
        )}
      </header>

      {/* Content Section */}
      <div className="w-full">{children}</div>
    </div>
  );
}
