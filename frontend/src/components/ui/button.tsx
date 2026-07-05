import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
};

export function Button({
  children,
  href,
  variant = "primary",
  className,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2";
  const variantClasses =
    variant === "primary"
      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl"
      : "border border-emerald-200 bg-white/80 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50";

  const classes = cn(baseClasses, variantClasses, className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <button className={classes}>{children}</button>;
}
