import { productImages as P, sceneImages as S, shopPhotos } from "@/data/images";
import type { BlogPostRow, GalleryItemRow } from "@/types/database";

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

type GallerySeed = [string, string, string, GalleryItemRow["category"], GalleryItemRow["aspect"]];

/** The owner's own photographs lead the gallery once they are supplied. */
const realSeeds: GallerySeed[] = [
  [shopPhotos.boltWall, "The Shelves", "Cottons, crepes and metallic jacquards, sorted by hand every Monday morning.", "Store", "portrait"],
  [shopPhotos.laceShelves, "The Lace Corner", "Sequin, beaded and embroidered lace — where every bridal decision actually gets made.", "Fabric Displays", "portrait"],
  [shopPhotos.mannequin, "Draped and Measured", "Black embroidered lace on the stand, tape alongside. A photograph cannot tell you how it falls.", "Customer Showcase", "portrait"],
  [shopPhotos.displayWall, "Front of House", "Packaged lengths held for collection, against the full display wall.", "Store", "portrait"],
];

const stockSeeds: GallerySeed[] = [
  [S.shop2, "The Bolt Wall", "Floor to ceiling, sorted by weight rather than colour.", "Store", "portrait"],
  [S.shelfSilk, "Silk Shelf", "Charmeuse and duchess satin, folded on the bias.", "Fabric Displays", "portrait"],
  [S.laceTable, "The Lace Table", "Where every bridal decision actually gets made.", "Fabric Displays", "landscape"],
  [S.cottonRolls, "Cotton Rolls", "Solid cottons and poplins in forty shades.", "New Stock", "portrait"],
  [P.velvetEmerald, "Velvet Corner", "Silk-blend velvet in the house green.", "Fabric Displays", "square"],
  [P.wax1, "Wax, Worn", "A six-yard piece, cut and sewn by a customer.", "Customer Showcase", "portrait"],
  [S.tailor1, "At the Machine", "The part nobody photographs and everybody feels.", "Events", "landscape"],
  [S.tailor2, "Finishing", "A hem pressed before it leaves the counter.", "Customer Showcase", "portrait"],
  [S.sequinDetail, "Sequin, Under Light", "Matte sequin on a stretch mesh ground.", "New Stock", "square"],
  [S.shop3, "Opening Up", "The shop at eight in the morning.", "Events", "landscape"],
];

export const galleryItems: GalleryItemRow[] = [...realSeeds, ...stockSeeds].map(
  ([image_url, title, caption, category, aspect], i) => ({
    id: `gal-${i + 1}`,
    title,
    caption,
    image_url,
    category,
    aspect,
    position: i,
    is_published: true,
    created_at: new Date(Date.UTC(2025, 2, 1 + i)).toISOString(),
  }),
);

export const galleryCategories = [
  "All",
  "Store",
  "Fabric Displays",
  "New Stock",
  "Events",
  "Customer Showcase",
] as const;

/* ------------------------------------------------------------------ */
/* Journal                                                             */
/* ------------------------------------------------------------------ */

export const blogPosts: BlogPostRow[] = [
  {
    id: "post-1",
    title: "How to Choose Lace for a Wedding Gown",
    slug: "how-to-choose-lace-for-a-wedding-gown",
    excerpt:
      "Corded, chantilly, guipure — the differences are structural, not decorative, and they decide what your gown can actually do.",
    content: `Most people choose lace with their eyes. That is understandable, and it is also the reason so many gowns fight their fabric all the way to the altar.

## Start with the silhouette, not the swatch

A lace has a weight, a ground and an edge finish, and those three properties decide what silhouettes are open to you. Ask what the gown needs to do before you ask what the lace looks like.

**Corded lace** — such as an Alençon — has a raised cotton cord tracing every motif. That cord gives the fabric enough body to hold a soft A-line without heavy interfacing, and it stops cut edges from fraying, which is why corded lace appliqués so well onto tulle.

**Chantilly** is finer, flatter and considerably more fluid. It has almost no structural opinion of its own, so it takes the shape of whatever sits beneath it. Perfect over a bias-cut column. Unhappy in a ballgown, where it will simply collapse.

**Guipure** has no net ground at all — the motifs are joined directly to one another. It is the stiffest of the three, cuts into clean shapes, and is the correct answer for sculpted necklines and bold cut-out work.

## The scallop is a design decision

A double-scalloped lace gives you two finished edges. Used well, a hem needs no additional trim, no facing and no horsehair — the lace finishes itself. Used carelessly, you cut straight through both scallops and pay for a border you then throw away.

Plan your pattern layout against the border before you buy the yardage. It routinely changes the quantity by a full metre in either direction.

## Match the lace to the light

Beaded laces behave very differently under daylight, tungsten and camera flash. A champagne beading that looks warm and antique in the shop can read distinctly grey under a photographer's strobe.

Take a swatch. Photograph it on a phone, with flash, against the skin of the person who will wear it. Ten seconds of work has saved more gowns than any amount of expertise.

## What to ask for at the counter

Bring the sketch, the measurements, and the silhouette. Any shop worth buying from would rather talk through the design than sell you the most expensive bolt on the wall — and a good one will tell you when a cheaper lace is the better answer.`,
    cover_image_url: S.laceTable,
    category: "Bridal",
    tags: ["lace", "bridal", "buying guide"],
    author_name: "Yadims Editorial",
    author_avatar_url: null,
    read_minutes: 6,
    status: "published",
    published_at: "2025-11-18T08:00:00Z",
    created_at: "2025-11-18T08:00:00Z",
    updated_at: "2025-11-18T08:00:00Z",
  },
  {
    id: "post-2",
    title: "Reading a Fabric Label: GSM, Momme and Width",
    slug: "reading-a-fabric-label-gsm-momme-width",
    excerpt:
      "Three numbers tell you more about a fabric than any photograph. Here is what each one actually means for your cut.",
    content: `Every bolt in our shop carries three numbers. Learn to read them and you will buy better fabric, in the right quantity, the first time.

## GSM — grams per square metre

GSM is weight, and weight is drape. It is the single most useful number on the label.

- **Under 60 gsm** — sheers. Chiffon, organza, fine tulle. They float; they cannot support themselves.
- **80–150 gsm** — blouse and dress weight. Enough body for a soft gather, not enough for structure.
- **150–250 gsm** — the workhorse range. Most satins, most jacquards, most linens for tailoring.
- **Over 250 gsm** — structural. Mikado, bouclé, coating. These stand away from the body.

A photograph cannot show you GSM. This is exactly why we publish it on every product page.

## Momme — silk only

Momme (mm) measures silk weight specifically. Higher momme is denser and more opaque.

- **6–8mm** — habotai lining, scarves.
- **12–16mm** — everyday silk, shirts, soft dresses.
- **19–22mm** — the sweet spot for charmeuse. Fluid, opaque, expensive-looking.
- **25mm and above** — heavy silk. Rare, costly, magnificent.

If a silk is sold without a momme figure, ask. Its absence usually means the answer is low.

## Width — the number that decides your yardage

Width is where money is quietly won and lost. A 300cm-wide tulle and a 115cm-wide adire are not remotely comparable at the same price per yard.

A rough rule: at 115cm you need roughly a third more length than at 150cm for the same garment. For anything cut on the bias, more again.

Always tell us the width you are planning against before you commit to a quantity. We would rather spend five minutes on the arithmetic than have you return with a metre too little — after we have cut into the bolt.`,
    cover_image_url: S.cottonRolls,
    category: "Fabric Care",
    tags: ["gsm", "momme", "guide"],
    author_name: "Yadims Editorial",
    author_avatar_url: null,
    read_minutes: 5,
    status: "published",
    published_at: "2025-10-02T08:00:00Z",
    created_at: "2025-10-02T08:00:00Z",
    updated_at: "2025-10-02T08:00:00Z",
  },
  {
    id: "post-3",
    title: "Planning Aso-Ebi Without the Panic",
    slug: "planning-aso-ebi-without-the-panic",
    excerpt:
      "Forty guests, one dye lot, three months. A practical timeline from a shop that has run this a hundred times.",
    content: `Aso-ebi goes wrong in one of two ways: too late, or too little. Both are avoidable.

## Three months out — choose the cloth, reserve the lot

The critical word is **dye lot**. Two pieces of the same wax print, printed in different runs, will not match under photographic light. They will look close in the shop and obviously different in the pictures.

Come to us with an approximate headcount and we will reserve a single lot. A deposit holds it; you can adjust the final quantity later.

## Two months out — confirm the headcount, add ten percent

Somebody's sister is coming. Somebody's aunt was always coming and nobody wrote it down. Order ten percent above your confirmed count.

Surplus cloth from a matched lot is genuinely useful — head-ties, a clutch, a child's outfit. Missing cloth from a closed lot cannot be bought at any price.

## Six weeks out — distribute, and give tailors a deadline

Hand out the cloth with a written sewing deadline two weeks before the event, not two days. Tailors are working on several parties at once during season.

## Two weeks out — the group fitting

Get everyone into their outfit once, together. Small differences in interpretation show up instantly in a group and are trivially fixable at two weeks.

## What we do for you

We hold matched lots, cut to a consistent length, mark each piece with the guest's name where you want that, and will deliver in one consignment across Yaoundé. Ask for the aso-ebi service by name when you call — it costs nothing extra.`,
    cover_image_url: P.wax1,
    category: "Traditional",
    tags: ["aso-ebi", "wax print", "planning"],
    author_name: "Yadims Editorial",
    author_avatar_url: null,
    read_minutes: 4,
    status: "published",
    published_at: "2025-09-14T08:00:00Z",
    created_at: "2025-09-14T08:00:00Z",
    updated_at: "2025-09-14T08:00:00Z",
  },
  {
    id: "post-4",
    title: "Caring for Silk in a Humid Climate",
    slug: "caring-for-silk-in-a-humid-climate",
    excerpt:
      "Most silk care advice is written for temperate storage. Here is what actually works in coastal humidity.",
    content: `Silk is a protein fibre. In a humid coastal climate it is dealing with moisture, mildew and insects — three problems most care labels never mention.

## Never store silk in plastic

A garment bag made of plastic traps moisture against the fibre and holds it there. Within a season you get yellowing along the folds; within two you get mildew.

Use cotton garment bags. If you only have plastic, cut ventilation holes.

## Roll, do not fold

Folded silk develops permanent creases along the fold line, and in humidity those creases weaken the fibre. Roll lengths around a cardboard tube with acid-free tissue between the layers.

For finished garments, hang on a padded hanger with the weight supported at the shoulder.

## Deodorant and perfume are the real enemies

Aluminium salts in antiperspirant permanently yellow silk, and they do it slowly enough that you will not notice until it is unfixable. Perfume alcohol does the same to dye.

Dress first, scent afterwards, and let both dry completely before the fabric touches skin.

## Air after every wear

Even one wearing puts body moisture into the fibre. Hang the garment somewhere shaded and moving for a few hours before it goes back into storage. This single habit does more than any cleaning product.

## When something goes wrong

Do not attempt a water spot yourself — you will set a ring. Take it to a cleaner who handles silk specifically and tell them what caused the mark. We keep a list of two in Yaoundé we trust; ask and we will share it.`,
    cover_image_url: P.silkTeal,
    category: "Fabric Care",
    tags: ["silk", "care", "storage"],
    author_name: "Yadims Editorial",
    author_avatar_url: null,
    read_minutes: 4,
    status: "published",
    published_at: "2025-08-22T08:00:00Z",
    created_at: "2025-08-22T08:00:00Z",
    updated_at: "2025-08-22T08:00:00Z",
  },
  {
    id: "post-5",
    title: "Velvet, and the Direction Everyone Forgets",
    slug: "velvet-and-the-direction-everyone-forgets",
    excerpt:
      "Cut two velvet panels facing opposite ways and you have made a two-tone garment. Here is how to avoid it.",
    content: `Velvet has a nap — a pile that lies in one direction. Run your hand along it one way and it is smooth; the other way it resists. That resistance is the entire problem.

## Why direction changes the colour

Light entering a pile lying away from the viewer scatters and reads darker and richer. Lying toward the viewer, it reflects and reads lighter. The same bolt gives you two visibly different colours.

Cut every pattern piece with the nap running the same way. Mark the direction with tailor's chalk on every single piece before you lift it off the table.

## Which way should the nap run?

Conventionally: **nap running up** (smooth when stroked downward) for the deepest, richest colour. This is the choice for evening.

**Nap running down** gives a lighter, more lustrous surface, and it wears slightly better because dust does not settle into the pile as readily.

Either is correct. Being inconsistent is not.

## Pressing — the part that ruins garments

Never put an iron plate on velvet pile. It crushes permanently and there is no recovery.

Steam only, from the reverse, with the garment hanging. If you must press a seam, use a needle board or a folded piece of the same velvet, pile to pile.

## Sewing notes

Velvet creeps. Two layers will walk against each other and your seam will finish out of alignment. Pin far more heavily than feels reasonable, use a walking foot if you have one, and sew in the direction of the nap.

Our silk-blend velvet is the most forgiving of these in a coastal climate — the viscose pile recovers well from packing, and it does not hold heat the way a synthetic pile does.`,
    cover_image_url: P.velvetEmerald,
    category: "Technique",
    tags: ["velvet", "sewing", "technique"],
    author_name: "Yadims Editorial",
    author_avatar_url: null,
    read_minutes: 5,
    status: "published",
    published_at: "2025-07-30T08:00:00Z",
    created_at: "2025-07-30T08:00:00Z",
    updated_at: "2025-07-30T08:00:00Z",
  },
  {
    id: "post-6",
    title: "What Bulk Buyers Should Ask Before Ordering",
    slug: "what-bulk-buyers-should-ask-before-ordering",
    excerpt:
      "Six questions that separate a smooth wholesale order from an expensive lesson.",
    content: `We supply tailoring houses, uniform contracts and designers working to a season. The orders that go well tend to start with the same questions.

## 1. Is this a single dye lot?

For anything above about twenty metres, insist on it in writing. Colour drift between lots is real, small, and utterly obvious once garments hang side by side.

## 2. What is the actual usable width?

Stated width often includes selvedge that you cannot use. Ask for the usable width — the figure your cutting plan depends on.

## 3. What is the repeat?

For prints and jacquards, the pattern repeat determines waste. A 64cm repeat on a garment that needs matching at the side seam can add fifteen percent to yardage. Better to know at quotation than at cutting.

## 4. What is the reorder window?

Ask how long the mill will hold the colourway. Some are seasonal and gone in ninety days; some run for years. This decides whether you can safely reorder mid-season.

## 5. What is the shrinkage?

Ask for a wash test result, or run one yourself on a half-metre. Three percent on a 200-metre contract is six metres of garments that no longer fit the spec.

## 6. What happens if a roll is faulty?

Establish this before, not after. Our policy is straightforward: report within seven days of delivery, and we replace from the same lot or credit in full.

## Talk to us directly

Wholesale pricing at YADIMS starts at 50 metres and improves at 200 and 500. Bring the spec sheet and we will quote against it — including the yardage arithmetic, which we would rather do twice than have you do once.`,
    cover_image_url: S.shop3,
    category: "Wholesale",
    tags: ["wholesale", "bulk", "trade"],
    author_name: "Yadims Editorial",
    author_avatar_url: null,
    read_minutes: 5,
    status: "published",
    published_at: "2025-06-11T08:00:00Z",
    created_at: "2025-06-11T08:00:00Z",
    updated_at: "2025-06-11T08:00:00Z",
  },
];

export const blogCategories = [
  "All",
  "Bridal",
  "Fabric Care",
  "Traditional",
  "Technique",
  "Wholesale",
] as const;

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

/**
 * ⚠️  PLACEHOLDER COPY — REPLACE BEFORE LAUNCH.
 *
 * These are written examples, not real customers. The shop opened in 2026 and
 * has no review history yet. Publishing invented testimonials as though they
 * were genuine would mislead buyers, so swap each one for a real quote (with
 * permission) as soon as you have it, or delete the section from
 * `src/app/(shop)/page.tsx` until you do.
 */
export const testimonials = [
  {
    id: "t1",
    quote:
      "I have bought lace in three countries. YADIMS is the only shop that asked what the gown needed to do before showing me a single bolt.",
    author: "Adaeze Kounde",
    role: "Bride, Yaoundé",
    rating: 5,
  },
  {
    id: "t2",
    quote:
      "They held a matched dye lot for eleven weeks while my client kept changing the headcount. Forty outfits, and every one photographs identically.",
    author: "Marie-Claire Ngassa",
    role: "Atelier Owner, Douala",
    rating: 5,
  },
  {
    id: "t3",
    quote:
      "The mikado is the real thing — Italian, correctly finished, and priced below what I was paying to import it myself.",
    author: "Serge Mbala",
    role: "Couturier, Atelier Mbala",
    rating: 5,
  },
  {
    id: "t4",
    quote:
      "I called about a 200-metre uniform contract expecting to be brushed off. They ran the shrinkage test themselves and sent me the numbers.",
    author: "Ibrahim Sow",
    role: "Procurement, Hospitality Group",
    rating: 5,
  },
  {
    id: "t5",
    quote:
      "A new shop, so I took one yard to test before committing. The weight on the label was exactly right, which is more than I can say for most of them.",
    author: "Fadimatou Bello",
    role: "Bride, Garoua",
    rating: 5,
  },
  {
    id: "t6",
    quote:
      "They talked me out of the expensive bolt and into the right one. I did not expect that from anybody selling fabric.",
    author: "Grace Etonde",
    role: "Fashion Student",
    rating: 5,
  },
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
