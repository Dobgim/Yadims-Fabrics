"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

import { siteConfig } from "@/config/site";
import { luxeEase } from "@/lib/motion";
import { whatsappLink } from "@/lib/utils";

export function WhatsAppFab() {
  const [expanded, setExpanded] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  // Hold the button back until the visitor has engaged with the page.
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const href = whatsappLink(
    siteConfig.contact.whatsapp,
    "Hello YADIMS — I have a question about a fabric.",
  );

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ duration: 0.45, ease: luxeEase }}
          className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8"
        >
          <AnimatePresence>
            {expanded ? (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: luxeEase }}
                className="max-w-[16rem] rounded-3xl bg-card p-5 shadow-lift"
              >
                <p className="font-display text-lg">Need a recommendation?</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Send a photograph of what you are making and we will suggest two or three fabrics
                  — usually the same day.
                </p>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  <MessageCircle className="h-4 w-4" /> Open WhatsApp
                </a>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? "Close WhatsApp panel" : "Chat with us on WhatsApp"}
            className="grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-white shadow-lift transition-transform duration-500 ease-luxe hover:scale-105"
          >
            {expanded ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
