"use client";

import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";
import { fadeIn, fadeUp, inView, revealUp, scaleIn, slideInLeft, slideInRight } from "@/lib/motion";

const presets: Record<string, Variants> = {
  up: fadeUp,
  fade: fadeIn,
  scale: scaleIn,
  left: slideInLeft,
  right: slideInRight,
  reveal: revealUp,
};

type MotionDivProps = React.ComponentProps<typeof motion.div>;

interface RevealProps extends Omit<MotionDivProps, "variants" | "initial" | "whileInView"> {
  preset?: keyof typeof presets;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "span";
}

/** Scroll-triggered entrance wrapper. Animates once, honours reduced motion. */
export function Reveal({
  preset = "up",
  delay = 0,
  as = "div",
  className,
  children,
  ...props
}: RevealProps) {
  // Cast keeps the union of motion components from widening into an
  // unrepresentable JSX type.
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      variants={presets[preset]}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      transition={{ delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
