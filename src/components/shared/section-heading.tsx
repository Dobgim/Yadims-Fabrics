"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fadeUp, inView, stagger } from "@/lib/motion";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Centred by default; `left` is for headings that sit beside a rail. */
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
  size?: "lg" | "md" | "sm";
  action?: React.ReactNode;
}

const sizeMap = {
  lg: "text-display-md md:text-display-lg",
  md: "text-display-sm md:text-display-md",
  sm: "text-2xl md:text-display-sm",
} as const;

/**
 * Section masthead: eyebrow, title, gold rule, description and an optional
 * action.
 *
 * Centred by default. When centred, the action drops beneath the copy rather
 * than sitting off to one side — a heading centred on the page with a button
 * pushed to the right edge reads as two unrelated things.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  as: Tag = "h2",
  size = "md",
  action,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <motion.div
      variants={stagger()}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className={cn(
        "flex flex-col",
        // Below `md` everything centres regardless, so a heading never sits
        // hard against the left edge on a narrow screen.
        centered ? "items-center text-center" : "items-center text-center md:items-start md:text-left",
        className,
      )}
    >
      <div className={cn("flex w-full flex-col gap-4", centered ? "items-center" : "items-center md:items-start")}>
        {eyebrow ? (
          <motion.span variants={fadeUp} className="eyebrow">
            {eyebrow}
          </motion.span>
        ) : null}

        <motion.div variants={fadeUp} className={cn(centered && "flex justify-center")}>
          <Tag className={cn(sizeMap[size], "max-w-3xl text-balance text-foreground")}>{title}</Tag>
        </motion.div>

        {/* The rule fades both ways when centred, one way when left-aligned */}
        <motion.span
          variants={fadeUp}
          className={cn(centered ? "rule-gold-center" : "rule-gold-center md:rule-gold")}
          aria-hidden
        />

        {description ? (
          <motion.p
            variants={fadeUp}
            className="max-w-xl text-balance text-[1.0625rem] leading-relaxed text-muted-foreground"
          >
            {description}
          </motion.p>
        ) : null}
      </div>

      {action ? (
        <motion.div variants={fadeUp} className={cn("mt-8", centered && "flex justify-center")}>
          {action}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
