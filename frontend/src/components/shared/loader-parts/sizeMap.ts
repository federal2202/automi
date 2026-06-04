import type { LoaderSize } from "./types";

export const SIZE_MAP: Record<LoaderSize, { box: string; core: string; label: string; orbit: string }> = {
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
