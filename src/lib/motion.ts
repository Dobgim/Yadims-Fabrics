import type { Transition, Variants } from "framer-motion";

/** Shared easing — matches the `ease-luxe` Tailwind timing function. */
export const luxeEase = [0.22, 1, 0.36, 1] as const;

export const luxeTransition: Transition = { duration: 0.7, ease: luxeEase };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: luxeTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: luxeEase } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: luxeTransition },
};

/**
 * Horizontal offsets are kept to 16px deliberately.
 *
 * A `Reveal` sits inside `.container`, whose padding is 20px at the smallest
 * breakpoint. Any offset larger than that pushes the element past the viewport
 * edge while it waits to animate, which grows `scrollWidth` and gives the whole
 * page a horizontal scrollbar. 16px stays inside the gutter at every width.
 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: luxeTransition },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: luxeTransition },
};

/** Parent variant that cascades children. */
export function stagger(delayChildren = 0.05, staggerChildren = 0.09): Variants {
  return {
    hidden: {},
    show: { transition: { delayChildren, staggerChildren } },
  };
}

/**
 * Reveal used for editorial imagery.
 *
 * This deliberately animates only opacity and transform.
 *
 * It used to animate `clip-path`, from `inset(100% 0% 0% 0%)` to `inset(0 …)`,
 * and it never ran: the browser normalises the computed value to three
 * components (`inset(100% 0% 0%)`), which does not match the four-component
 * string in the variant, so the animation was skipped and the element stayed
 * clipped to nothing. Every image using it was invisible on the live site —
 * the collection features and all six service photographs.
 *
 * Opacity and transform are interpolated numerically and cannot fail this way,
 * which is why every other variant in this file has always worked. The rule for
 * anything added here: if a visitor would lose real content when the animation
 * does not run, do not animate that property.
 */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.1, ease: luxeEase },
  },
};

/** Standard viewport config: animate once, slightly before fully in view. */
export const inView = { once: true, amount: 0.25, margin: "0px 0px -80px 0px" } as const;
