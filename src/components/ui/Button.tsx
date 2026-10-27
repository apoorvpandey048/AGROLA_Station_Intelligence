import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-agrola-forest text-white hover:bg-agrola-forest-light shadow-xs",
  secondary:
    "bg-white text-agrola-ink border border-agrola-border hover:bg-[#F2F5F0] hover:border-[#CBD3CB] shadow-subtle",
  ghost: "text-agrola-forest hover:bg-agrola-canvas",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
};

/** Shared button: one source of truth for the cockpit's button styling. */
export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-lg",
        "transition-all duration-200 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agrola-forest/40",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    />
  );
}
