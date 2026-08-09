/**
 * Storefront copy that is not stored in the database.
 *
 * There is no bundled gallery here any more. Gallery photographs are uploaded
 * through the dashboard and read from Supabase, so the site only ever shows
 * pictures the shop actually took.
 */

export const galleryCategories = [
  "All",
  "Store",
  "Fabric Displays",
  "New Stock",
  "Events",
  "Customer Showcase",
] as const;

/* ------------------------------------------------------------------ */
/* FAQs                                                                */
/* ------------------------------------------------------------------ */

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    title: "Ordering",
    items: [
      {
        q: "How is fabric measured and sold?",
        a: "By the yard (0.91m) as a default, cut in continuous lengths. If you prefer metres, say so — we cut to either. Wax prints are sold as a full six-yard piece unless you ask us otherwise, because cutting into a piece breaks the pattern.",
      },
      {
        q: "Can I order a swatch before committing?",
        a: "Yes, and we would rather you did. Swatches are 10cm × 10cm and cost 1,500 XAF for up to five, refunded against any order over 20,000 XAF. Photographs cannot show you weight, hand or how a colour behaves under your light.",
      },
      {
        q: "Do you hold stock while I decide?",
        a: "We hold a cut length for 72 hours at no charge. For dye-lot reservations on larger orders we ask for a 30% deposit, and we will hold for up to twelve weeks.",
      },
      {
        q: "What is the minimum order?",
        a: "One yard for most fabrics. A small number of premium bolts carry a two-yard minimum, and that is stated on the product page. Wholesale pricing begins at 50 metres.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        q: "Where do you deliver?",
        a: "Across Cameroon, and internationally by courier. Yaoundé is usually same-day, Douala next-day, and other regions two to four working days. International delivery is quoted per consignment.",
      },
      {
        q: "How much is delivery?",
        a: "Free within Yaoundé on orders over 50,000 XAF. Otherwise 2,500 XAF within Yaoundé, 4,500 XAF elsewhere in Cameroon. International is quoted at checkout or by WhatsApp.",
      },
      {
        q: "Can I collect from the shop?",
        a: "Yes, and there is no charge. Choose collection at checkout and we will message you when your cut is ready — usually within two hours during opening times.",
      },
    ],
  },
  {
    title: "Fabric & Care",
    items: [
      {
        q: "Will the colour I see on screen match the fabric?",
        a: "Close, but never exact — screens vary considerably. This is precisely what the swatch service is for, especially for bridal whites and anything being matched across several garments.",
      },
      {
        q: "Do you guarantee dye lots match?",
        a: "Within a single reserved lot, yes. Across separate purchases made weeks apart, no — and no honest shop would claim otherwise. Tell us up front if pieces need to match and we will reserve from one lot.",
      },
      {
        q: "How should I store fabric before sewing?",
        a: "Rolled rather than folded, in cotton rather than plastic, somewhere shaded and ventilated. In coastal humidity, plastic storage is the single most common cause of ruined silk.",
      },
    ],
  },
  {
    title: "Returns & Trade",
    items: [
      {
        q: "Can I return cut fabric?",
        a: "Cut lengths cannot be returned unless faulty, because we cannot resell them — this is standard across the trade. Faults must be reported within seven days and we replace from the same lot or refund in full.",
      },
      {
        q: "Do you offer wholesale accounts?",
        a: "Yes. Wholesale pricing starts at 50 metres, with further tiers at 200 and 500 metres. Trade accounts get first access to new arrivals and 30-day terms after three settled orders.",
      },
      {
        q: "Can you source something you do not stock?",
        a: "Frequently. Send a photograph and a description of what the fabric needs to do, and we will tell you honestly whether we can find it, roughly what it will cost, and how long it will take.",
      },
    ],
  },
];
