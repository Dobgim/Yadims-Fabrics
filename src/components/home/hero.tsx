"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";

import { siteConfig } from "@/config/site";
import { storeStats } from "@/data/company";
import { brand, shopPhotos } from "@/data/images";
import { Button } from "@/components/ui/button";

/**
 * Three stacked layers, painted back to front:
 *
 *   1. the vector drape  — 4KB, guarantees the hero is never a flat colour
 *   2. photographed silk — the real texture, tinted green by the scrims
 *   3. shop photography  — the owner's own shelves, once supplied
 *
 * Each is optional above the first, so the hero looks finished at every stage.
 */
const BACKDROP = brand.backdrop;
const FABRIC = brand.heroFabric;
const PHOTO = shopPhotos.laceShelves;

/**
 * The entrance is CSS-driven (see `globals.css`) rather than JavaScript-driven.
 * A JS entrance writes `opacity: 0` into the server HTML, so a script that
 * fails to load leaves the hero permanently blank. Framer Motion is used here
 * only for scroll parallax, which degrades to "no parallax" if JS never runs.
 */
const delay = (seconds: number) => ({ animationDelay: `${seconds}s` });

export function Hero() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const [photoLoaded, setPhotoLoaded] = React.useState(false);

  const bgY = useTransform(scrollYProgress, [0, 0.4], ["0%", reduceMotion ? "0%" : "14%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.4], [1, reduceMotion ? 1 : 1.14]);
  const copyY = useTransform(scrollYProgress, [0, 0.32], ["0%", reduceMotion ? "0%" : "-18%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.28], [1, reduceMotion ? 1 : 0]);

  return (
    <section className="relative isolate flex min-h-[min(100svh,54rem)] items-center justify-center overflow-hidden bg-brand-900 text-white">
      {/* ------------------------------------------------- Backdrop */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 -z-20">
        {/* 1 — vector drape, paints instantly from CSS */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BACKDROP})` }}
          aria-hidden
        />

        {/*
          2 — photographed silk. `next/image` with `priority` so it is
          preloaded and served as AVIF; the white original is tinted to house
          green by the scrims below rather than by a filter, which keeps the
          highlights on each fold crest intact.
        */}
        <Image
          src={FABRIC}
          alt=""
          aria-hidden
          fill
          priority
          quality={72}
          sizes="100vw"
          className="object-cover"
        />

        {/*
          Green tint, multiplied rather than overlaid. Multiply darkens toward
          the tint where the cloth is shadowed and leaves the crest highlights
          bright, so white silk reads as green silk instead of as a flat wash.
        */}
        <div className="absolute inset-0 bg-brand-700 mix-blend-multiply" aria-hidden />
        <div className="absolute inset-0 bg-brand-900/35" aria-hidden />

        {/*
          3 — the owner's own shelves, if supplied. A plain <img>: routing a
          not-yet-uploaded file through the optimiser answers 400 and fills the
          console with noise, whereas a native <img> fails silently.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHOTO}
          alt=""
          aria-hidden
          onLoad={() => setPhotoLoaded(true)}
          onError={() => setPhotoLoaded(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-luxe ${
            photoLoaded ? "opacity-45" : "opacity-0"
          }`}
        />
      </motion.div>

      {/*
        Scrims. Lighter than they would otherwise need to be, because the
        multiply layer above already carries the colour — these only buy
        contrast for the copy, so the folds stay legible behind it.
      */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-900/70 via-brand-900/40 to-brand-900/90"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(4,35,21,0.35)_12%,rgba(4,35,21,0.78)_100%)]"
        aria-hidden
      />

      {/* Slow drifting gold threads, purely atmospheric */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {[
          { top: "18%", duration: "19s", delay: "0s" },
          { top: "46%", duration: "25s", delay: "3s" },
          { top: "74%", duration: "22s", delay: "6s" },
        ].map((thread) => (
          <span
            key={thread.top}
            style={{
              top: thread.top,
              animationDuration: thread.duration,
              animationDelay: thread.delay,
            }}
            className="thread-drift absolute left-0 h-px w-[45%] bg-gradient-to-r from-transparent via-gold-400/70 to-transparent"
          />
        ))}
      </div>

      {/* -------------------------------------------------- Content */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="container flex flex-col items-center py-28 text-center md:py-32"
      >
        <p className="hero-rise flex items-center gap-4 text-eyebrow font-medium uppercase text-gold-400">
          <span className="h-px w-8 bg-gold-400/70 sm:w-12" aria-hidden />
          Yaoundé, since 2026
          <span className="h-px w-8 bg-gold-400/70 sm:w-12" aria-hidden />
        </p>

        <h1 className="mt-8 text-display-xl text-white">
          <span className="hero-line block" style={delay(0.1)}>
            The Art of
          </span>
          <span className="hero-line block italic text-gold-300" style={delay(0.26)}>
            Fine Fabrics
          </span>
        </h1>

        {/* Gold rule draws outward from the centre */}
        <span
          className="hero-rule mt-10 block h-px w-32 origin-center bg-gradient-to-r from-transparent via-gold-400 to-transparent"
          style={delay(0.55)}
          aria-hidden
        />

        <p
          className="hero-rise mt-9 max-w-2xl text-balance text-lg leading-relaxed text-white/75"
          style={delay(0.62)}
        >
          Lace, silk, wax print and velvet — sourced directly from the mills and artisan houses
          that make them, and sold by someone who has sewn with every one.
        </p>

        <div
          className="hero-rise mt-12 flex flex-wrap items-center justify-center gap-4"
          style={delay(0.76)}
        >
          <Button asChild size="lg" variant="gold">
            <Link href="/shop">
              Shop the collection <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="glass">
            <Link href="/collections">
              Explore collections <ArrowUpRight />
            </Link>
          </Button>
        </div>

        {/* Stats cascade in last */}
        <dl className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-x-8 gap-y-9 border-t border-white/15 pt-10 sm:grid-cols-4">
          {storeStats.map((stat, i) => (
            <div key={stat.label} className="hero-rise" style={delay(0.95 + i * 0.11)}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-3xl text-gold-300 md:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-1.5 block text-xs uppercase tracking-[0.16em] text-white/55">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>

      {/* --------------------------------------------- Scroll cue */}
      <motion.div style={{ opacity: copyOpacity }} className="absolute inset-x-0 bottom-7">
        <div className="hero-rise flex flex-col items-center gap-3" style={delay(1.5)}>
          <span className="text-[0.6rem] uppercase tracking-[0.24em] text-white/40">
            {siteConfig.contact.address.line1}
          </span>
          <ChevronDown className="h-4 w-4 animate-bounce text-gold-400/70" aria-hidden />
        </div>
      </motion.div>
    </section>
  );
}
