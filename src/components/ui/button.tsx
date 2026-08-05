import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-all duration-500 ease-luxe",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "[&_svg]:transition-transform [&_svg]:duration-500 [&_svg]:ease-luxe",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-white shadow-soft hover:bg-brand-600 hover:shadow-lift hover:-translate-y-0.5",
        /** House primary: deep green with a gold hairline that warms on hover. */
        luxe: "bg-brand-700 text-white shadow-soft ring-1 ring-inset ring-gold-400/0 hover:bg-brand-600 hover:ring-gold-400/60 hover:shadow-lift hover:-translate-y-0.5",
        /** Gold call-to-action, used sparingly. */
        gold: "bg-gold-400 text-brand-900 shadow-soft hover:bg-gold-300 hover:shadow-lift hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-brand-700/25 bg-transparent text-brand-700 hover:border-brand-700 hover:bg-brand-500 hover:text-white dark:text-brand-100 dark:hover:text-white",
        /** For use over imagery. */
        glass: "glass text-brand-900 shadow-glass hover:bg-white/90 dark:text-white",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "h-auto p-0 text-brand-600 underline-offset-4 hover:underline dark:text-brand-300",
      },
      size: {
        default: "h-11 rounded-full px-6 text-sm",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-14 rounded-full px-9 text-[0.9375rem]",
        xl: "h-16 rounded-full px-11 text-base",
        icon: "h-11 w-11 rounded-full",
        "icon-sm": "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
