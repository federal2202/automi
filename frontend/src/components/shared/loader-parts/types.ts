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

export interface FullScreenLoaderProps extends Omit<LoaderProps, "className"> {
  /** Whether the overlay is visible. Defaults to true. */
  open?: boolean;
  /** Adds a stronger backdrop blur. Useful for auth/route gates. */
  intense?: boolean;
}
