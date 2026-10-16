import React from "react";
import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "critical" | "neutral" | "accent";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#EAEFEA] text-agrola-forest border border-[#D5E0D5]",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
    critical: "bg-rose-50 text-rose-800 border border-rose-200/80",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    accent: "bg-agrola-lime-light text-agrola-forest border border-agrola-lime/60",
  };

  const sizeStyles = {
    sm: "text-[10.5px] px-2 py-0.5 font-medium tracking-wide",
    md: "text-xs px-2.5 py-1 font-semibold",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
