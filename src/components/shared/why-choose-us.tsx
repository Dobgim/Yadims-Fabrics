"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";

import { fadeUp, inView, stagger } from "@/lib/motion";

interface WhyItem {
  readonly icon: string;
  readonly title: string;
  readonly body: string;
}

/** Resolves a Lucide icon by name, falling back to a neutral mark. */
function Icon({ name, className }: { name: string; className?: string }) {
  const Component = (Icons as unknown as Record<string, Icons.LucideIcon>)[name];
  const Resolved = Component ?? Icons.Sparkles;
  return <Resolved className={className} aria-hidden />;
}

export function WhyChooseUs({ items }: { items: readonly WhyItem[] }) {
  return (
    <motion.ul
      variants={stagger(0, 0.09)}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item) => (
        <motion.li
          key={item.title}
          variants={fadeUp}
          className="group relative overflow-hidden rounded-4xl border border-border/70 bg-card p-8 transition-all duration-500 ease-luxe hover:-translate-y-1 hover:shadow-lift"
        >
          <span
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden
          />

          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-colors duration-500 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-800/60 dark:text-brand-200">
            <Icon name={item.icon} className="h-5 w-5" />
          </span>

          <h3 className="mt-6 font-display text-xl leading-snug">{item.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
        </motion.li>
      ))}
    </motion.ul>
  );
}
