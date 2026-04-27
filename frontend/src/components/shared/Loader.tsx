"use client";

import { cn } from "@/utils/cn";

export type LoaderSize = "sm" | "md" | "lg";

export interface LoaderProps {
  /** Visual size of the loader. Defaults to `md`. */
  size?: LoaderSize;
  /** Optional label rendered below the loader. Styled in the protocol aesthetic. */
  label?: string;
  /** Hide the orbiting satellite dot. Defaults to false. */
  hideOrbit?: boolean;
  className?: string;
}

const SIZE_MAP: Record<LoaderSize, { box: string; core: string; label: string; orbit: string }> = {
  sm: {
    box: "h-8 w-8",
    core: "h-1.5 w-1.5",
    label: "text-[10px] tracking-[0.2em] mt-3",
    orbit: "h-1 w-1",
  },
  md: {
    box: "h-14 w-14",
    core: "h-2.5 w-2.5",
    label: "text-[11px] tracking-[0.25em] mt-4",
    orbit: "h-1.5 w-1.5",
  },
  lg: {
    box: "h-24 w-24",
    core: "h-3.5 w-3.5",
    label: "text-xs tracking-[0.3em] mt-6",
    orbit: "h-2 w-2",
  },
};

/**
 * Loader
 *
 * Branded "scan-pulse" loader for automi.
 * Concentric rings ripple outward at staggered intervals around a solid core,
 * with an orbiting satellite dot. Designed to feel cohesive with the
 * precision-protocol aesthetic of the rest of the app.
 */
export function Loader({ size = "md", label, hideOrbit = false, className }: LoaderProps) {
  const s = SIZE_MAP[size];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
      className={cn("inline-flex flex-col items-center justify-center", className)}
    >
      <div className={cn("relative", s.box)}>
        {/* Concentric scanning rings */}
        <span
          className="absolute inset-0 rounded-full border border-green-nice/60 animate-scan-ring"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="absolute inset-0 rounded-full border border-green-nice/50 animate-scan-ring"
          style={{ animationDelay: "0.5s" }}
        />
        <span
          className="absolute inset-0 rounded-full border border-green-nice/40 animate-scan-ring"
          style={{ animationDelay: "1s" }}
        />

        {/* Static thin guide ring */}
        <span className="absolute inset-[15%] rounded-full border border-[#ffffff]/10" />

        {/* Orbiting satellite */}
        {!hideOrbit && (
          <span
            className="absolute inset-0 animate-orbit-spin"
            aria-hidden="true"
          >
            <span
              className={cn(
                "absolute left-1/2 -translate-x-1/2 -top-[2px] rounded-full bg-green-nice shadow-[0_0_8px_var(--green-nice)]",
                s.orbit
              )}
            />
          </span>
        )}

        {/* Solid pulsing core */}
        <span
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-nice shadow-[0_0_12px_var(--green-nice)] animate-core-pulse",
            s.core
          )}
        />
      </div>

      {label && (
        <span
          className={cn(
            "font-display uppercase text-[#ffffff]/60 select-none",
            s.label
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export interface FullScreenLoaderProps extends Omit<LoaderProps, "className"> {
  /** Whether the overlay is visible. Defaults to true. */
  open?: boolean;
  /** Adds a stronger backdrop blur. Useful for auth/route gates. */
  intense?: boolean;
}

/**
 * FullScreenLoader
 *
 * Fixed overlay variant of {@link Loader}. Use for route transitions,
 * auth checks, or any global blocking state.
 */
export function FullScreenLoader({
  open = true,
  intense = false,
  size = "lg",
  label = "LOADING",
  hideOrbit,
}: FullScreenLoaderProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-background/70",
        intense ? "backdrop-blur-md" : "backdrop-blur-sm",
        "animate-fade-in-up"
      )}
      role="status"
      aria-live="polite"
    >
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
      <Loader size={size} label={label} hideOrbit={hideOrbit} />
    </div>
  );
}

export default Loader;
