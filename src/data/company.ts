import { productImages as P, sceneImages as S } from "@/data/images";

export const services = [
  {
    slug: "fabric-sales",
    title: "Fabric Sales",
    icon: "Scissors",
    summary: "Cut-length retail across every category we stock, from one yard upward.",
    detail:
      "The heart of the shop. Every bolt on the wall, cut to any length you need, with someone on hand who has actually sewn with the fabric you are holding. We publish weight, width and fibre content on every product because those three numbers decide whether a fabric can do what your design asks of it.",
    points: [
      "One-yard minimum on almost everything",
      "Continuous cuts — no joins mid-length",
      "Weight, width and fibre content published for every bolt",
      "Swatch service before you commit",
    ],
    image: S.shop1,
  },
  {
    slug: "wholesale-supply",
    title: "Wholesale Supply",
    icon: "Warehouse",
    summary: "Trade pricing for ateliers, uniform contracts and retail resellers.",
    detail:
      "Wholesale pricing begins at 50 metres, with further tiers at 200 and 500. Trade accounts see new arrivals before they reach the shop floor and move to 30-day terms after three settled orders. Bring us a spec sheet and we will quote against it — including the yardage arithmetic.",
    points: [
      "Tiered pricing from 50 / 200 / 500 metres",
      "Single dye lot guaranteed in writing",
      "30-day terms after three settled orders",
      "First look at incoming stock",
    ],
    image: S.cottonRolls,
  },
  {
    slug: "bulk-orders",
    title: "Bulk & Aso-Ebi Orders",
    icon: "Layers",
    summary: "Matched dye lots held and cut for weddings, parties and group events.",
    detail:
      "Tell us the headcount and the date. We reserve a single dye lot, hold it against a deposit for up to twelve weeks, cut every piece to a consistent length, label them by guest name if you want that, and deliver the whole consignment together. It costs nothing above the fabric price.",
    points: [
      "Single-lot reservation held up to 12 weeks",
      "Consistent cut lengths, optionally name-labelled",
      "One consolidated delivery across Yaoundé",
      "No surcharge for the coordination",
    ],
    image: S.waxModel,
  },
  {
    slug: "fashion-consultation",
    title: "Fashion Consultation",
    icon: "Sparkles",
    summary: "Sit down with your sketch and work out what the garment actually needs.",
    detail:
      "A forty-five minute appointment, in shop or over video, with the sketch or reference image in front of us. We work backwards from the silhouette to the fabric — weight first, then hand, then colour. Free for orders above 100,000 XAF, otherwise 10,000 XAF, credited against whatever you buy.",
    points: [
      "45 minutes, in shop or by video call",
      "Silhouette-first, not swatch-first",
      "Yardage calculated against your pattern layout",
      "Fee credited against your order",
    ],
    image: S.laceTable,
  },
  {
    slug: "fabric-recommendations",
    title: "Fabric Recommendations",
    icon: "MessageCircleQuestion",
    summary: "Send a photograph on WhatsApp and get a straight answer the same day.",
    detail:
      "Send us a reference image, tell us what you are making and what your budget is, and we will come back with two or three honest options — including, quite often, the advice that a cheaper fabric is the better choice for what you are building. Same-day during opening hours.",
    points: [
      "Same-day WhatsApp response in opening hours",
      "Two or three options, with the trade-offs stated",
      "Honest about when the cheaper bolt is the right one",
      "Swatches posted anywhere in Cameroon",
    ],
    image: P.chiffonBlue,
  },
  {
    slug: "special-orders",
    title: "Special Orders & Sourcing",
    icon: "Globe",
    summary: "If we do not stock it, we will tell you honestly whether we can find it.",
    detail:
      "We buy directly from mills and artisan houses in Italy, France, India, Ghana and China. Send a photograph and a description of what the fabric must do, and we will tell you whether it is findable, roughly what it will cost landed, and how long it will take. Typically four to eight weeks.",
    points: [
      "Mills and artisan houses in five countries",
      "Landed-cost estimate before you commit",
      "Typical lead time four to eight weeks",
      "We say no when the answer is no",
    ],
    image: P.brocadeGold,
  },
] as const;

export const whyChooseUs = [
  {
    icon: "BadgeCheck",
    title: "Sourced, not resold",
    body: "We buy directly from mills and artisan houses we have visited. No middlemen, which is why our premium fabrics are priced below imported equivalents.",
  },
  {
    icon: "Ruler",
    title: "Numbers on every bolt",
    body: "Weight, width, fibre content and origin published for everything we sell. If a shop will not tell you the GSM, ask yourself why.",
  },
  {
    icon: "Handshake",
    title: "Advice before the sale",
    body: "We will talk you out of the expensive bolt when the cheaper one is right for your design. A gown that disappoints at the fitting costs us far more than one sale.",
  },
  {
    icon: "Truck",
    title: "Delivered across Cameroon",
    body: "Same-day in Yaoundé, next-day in Douala, two to four days nationwide, and international courier for the diaspora.",
  },
] as const;

/**
 * The house opened in 2026, so this reads as a founding story rather than a
 * decade of history. Add an entry each time something real happens — do not
 * pad it with milestones that have not occurred.
 */
export const timeline = [
  {
    year: "Early 2026",
    title: "The decision",
    body: "Too many trips to buy cloth that turned out to be nothing like the photograph. We decided a shop could be run the other way round — numbers published, origin named, nothing oversold.",
  },
  {
    year: "2026",
    title: "The unit at Tam-Tam",
    body: "We took the space opposite Bali Hotel, built the shelving, and filled it a bolt at a time rather than all at once.",
  },
  {
    year: "2026",
    title: "Direct from the mills",
    body: "Relationships opened with mills and artisan houses in Italy, France, India, Ghana and China. Buying direct is what keeps our premium cloth below imported equivalents.",
  },
  {
    year: "Today",
    title: "Yadims online",
    body: "The full shelf, photographed honestly and shipped nationwide — with the same person on the other end of the WhatsApp message.",
  },
] as const;

export const coreValues = [
  {
    title: "Honesty about cloth",
    body: "We publish the numbers, we name the origin, and we tell you when a fabric will not do what you want it to. A sale made on a false promise costs us the next ten.",
  },
  {
    title: "Craft over volume",
    body: "We are a family business with no interest in becoming a warehouse. We would rather stock four hundred fabrics we can speak about than four thousand we cannot.",
  },
  {
    title: "Relationships that outlast a transaction",
    body: "We would rather someone came back in ten years than spent more today. Every decision in this shop is made on that timescale.",
  },
  {
    title: "Fair to the makers",
    body: "Our artisan adire and kente come from cooperatives we buy from directly and pay promptly. Fine cloth should not depend on somebody being underpaid for it.",
  },
] as const;

/**
 * Every figure here is verifiable from the shop's own policies — the minimum
 * order and delivery window are set in `src/lib/pricing.ts` and the shipping
 * policy. Do not add a claim that cannot be pointed at.
 */
export const storeStats = [
  { value: "2026", label: "Established" },
  { value: "5", label: "Countries sourced" },
  { value: "1 yd", label: "Minimum order" },
  { value: "Same-day", label: "Yaoundé delivery" },
] as const;

export const instagramGrid = [
  S.shop1,
  P.velvetEmerald,
  S.waxModel,
  P.sequinGold,
  S.laceTable,
  P.silkTeal,
] as const;
