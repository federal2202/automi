"use client";

import { cn } from "@/utils/cn";
import type { FullScreenLoaderProps } from "./types";
import { Loader } from "./Loader";

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
