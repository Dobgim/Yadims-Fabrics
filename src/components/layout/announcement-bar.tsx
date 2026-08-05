const messages = [
  "Free delivery within Yaoundé on orders over 50,000 XAF",
  "Swatch service — five samples, refunded against your order",
  "Matched dye lots held for aso-ebi parties",
  "Wholesale pricing from 50 metres",
];

/**
 * Infinite marquee. The list is rendered twice and translated by exactly -50%,
 * which makes the loop seamless at any viewport width.
 */
export function AnnouncementBar() {
  return (
    <div className="overflow-hidden border-b border-brand-800/40 bg-brand-700 py-2.5 text-white">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap pl-12 hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex gap-12" aria-hidden={copy === 1}>
            {messages.map((message) => (
              <li
                key={message}
                className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.2em] text-white/80"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-gold-400" aria-hidden />
                {message}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
