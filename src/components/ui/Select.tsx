import React from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string;
}

/** Styled native select with the cockpit chevron affordance. */
export function Select({
  className,
  wrapperClassName,
  children,
  ...rest
}: SelectProps) {
  return (
    <div className={clsx("relative inline-block", wrapperClassName)}>
      <select
        className={clsx(
          "appearance-none bg-agrola-canvas hover:bg-[#EAEFEA] text-agrola-ink font-medium text-xs rounded-lg pl-3 pr-8 py-2 border border-agrola-border cursor-pointer transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-agrola-forest/40",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-agrola-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
