"use client";

import { cn } from "@/utils/cn";
import type { LoaderProps } from "./types";
import { SIZE_MAP } from "./sizeMap";

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

export default Loader;
