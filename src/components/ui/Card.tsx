import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

/** Standard cockpit surface: white, hairline border, soft tinted shadow. */
export function Card({
  className,
  padding = "md",
  interactive = false,
  ...rest
}: CardProps) {
  const pad = { none: "", sm: "p-4", md: "p-5", lg: "p-6" }[padding];
  return (
    <div
      className={clsx(
        "bg-white rounded-xl border border-agrola-border shadow-subtle",
        pad,
        interactive && "lift hover:shadow-card cursor-pointer",
        className
      )}
      {...rest}
    />
  );
}
