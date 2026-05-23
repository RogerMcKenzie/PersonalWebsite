"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "quiet";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-[0_14px_30px_-18px_rgba(17,24,39,0.65)] hover:bg-accent-hover",
  secondary:
    "border border-border bg-paper/85 text-foreground hover:border-foreground/25 hover:bg-paper",
  quiet: "text-warm hover:text-warm-hover",
};

export function AnimatedAnchor({
  children,
  className,
  variant = "primary",
  showArrow = false,
  ...props
}: HTMLMotionProps<"a"> & {
  children: ReactNode;
  variant?: Variant;
  showArrow?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isQuiet = variant === "quiet";

  return (
    <motion.a
      whileHover={reduceMotion ? undefined : { y: isQuiet ? 0 : -2 }}
      whileTap={reduceMotion ? undefined : { scale: isQuiet ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={cn(
        "group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-warm",
        isQuiet ? "px-0 py-1" : "px-5 py-3",
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <ArrowRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      )}
    </motion.a>
  );
}
