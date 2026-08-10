export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
}

const UPDATED = "2026-01-15";

export const legalDocuments: Record<string, LegalDocument> = {
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    eyebrow: "Your data",
    summary:
      "What we collect, why we collect it, and what we will never do with it. Written to be read rather than to be defensible.",
    updated: UPDATED,
    sections: [
      {
        heading: "What we collect",
        body: [
          "When you enquire about a fabric or place an order — over WhatsApp, by phone or in the shop — we collect your name, telephone number and, for delivery, your address. We need these to quote, cut, confirm and deliver, and we do not ask for anything beyond them.",
          "The shop does not offer customer accounts, so there is no password of yours for us to store. If you subscribe to the newsletter, we store your email address and the page you subscribed from.",
          "We collect basic, aggregated analytics about how the site is used: which pages are visited and roughly where visitors are. This is not tied to your name or your orders.",
        ],
      },
      {
        heading: "What we do with it",
        body: [
          "We use your contact details to confirm your order, ask questions about the cut, and arrange delivery. We use your address to deliver. That is the whole of it.",
          "We use your email for marketing only if you have explicitly opted in. Every marketing email carries a one-click unsubscribe, and unsubscribing takes effect immediately.",
        ],
      },
      {
        heading: "What we never do",
        body: [
          "We do not sell your data. We do not rent it, trade it, or share it with advertisers or data brokers. There is no circumstance in which we would.",
          "We do not store card details. Payment is taken on delivery, by mobile money, or by bank transfer — this site never handles a card number.",
        ],
      },
      {
        heading: "Who else sees it",
        body: [
          "Our hosting and database provider stores the data on our behalf under a data processing agreement. Couriers receive only the name, address and phone number needed to make the delivery.",
          "We disclose data to authorities only where we are legally required to, and only the specific records required.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Order records are kept for seven years, because tax law requires it. Account data is kept until you ask us to delete it. Newsletter subscriptions are kept until you unsubscribe.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask us for a copy of everything we hold about you, ask us to correct it, or ask us to delete it. Write to hello@yadimsfabrics.com and we will respond within thirty days.",
          "Ask us to delete your details and we will, except for the order records that tax law requires us to keep."
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We use a session cookie to keep the shop owner signed in to the dashboard, and local storage to remember the fabrics you have saved on your own device. Neither is shared with anyone.",
          "We do not use advertising cookies or third-party trackers.",
        ],
      },
    ],
  },

  "shipping-policy": {
    slug: "shipping-policy",
    title: "Shipping Policy",
    eyebrow: "Getting it to you",
    summary:
      "Where we deliver, what it costs, how long it takes, and what happens when something goes wrong on the way.",
    updated: UPDATED,
    sections: [
      {
        heading: "Where we deliver",
        body: [
          "We deliver anywhere in Cameroon and internationally by courier. Yaoundé is usually same working day, Douala the next. Other regions of Cameroon take two to four working days.",
          "International delivery is quoted per consignment because the cost depends heavily on weight and destination. Ask us on WhatsApp before ordering and we will give you a figure.",
        ],
      },
      {
        heading: "What it costs",
        body: [
          "Delivery within Yaoundé is same-day; elsewhere in Cameroon two to four days. Any delivery charge depends on where you are and how much you are taking, and is confirmed when you enquire.",
          "Collection from the shop is always free. Tell us you would like to collect when you enquire, and we will message you when your cut is ready — usually within two hours during opening times.",
        ],
      },
      {
        heading: "When we cut",
        body: [
          "We confirm every order by WhatsApp before cutting. This is deliberate: it is the last chance to change a colour or a length, and once a bolt is cut it cannot be uncut.",
          "Orders confirmed before 14:00 on a working day are usually cut and dispatched the same day.",
        ],
      },
      {
        heading: "Tracking",
        body: [
          "You will receive a courier reference by WhatsApp once your consignment is collected. For deliveries inside Yaoundé we usually just tell you the window, because it is faster than any tracking page.",
        ],
      },
      {
        heading: "If something goes wrong",
        body: [
          "If a consignment is delayed beyond the stated window, tell us and we will chase the courier ourselves rather than asking you to.",
          "If a consignment is lost, we replace the fabric from the same dye lot where we still have it, or refund in full where we do not. We do not ask you to pursue the courier.",
        ],
      },
    ],
  },

  "return-policy": {
    slug: "return-policy",
    title: "Return Policy",
    eyebrow: "If it is not right",
    summary:
      "Cut fabric is a special case, and pretending otherwise would not be honest. Here is exactly where we stand.",
    updated: UPDATED,
    sections: [
      {
        heading: "Cut lengths",
        body: [
          "Cut lengths cannot be returned unless they are faulty. This is standard across the fabric trade, and the reason is simple: once a bolt is cut to your length, we cannot sell that piece to anyone else.",
          "This is precisely why we offer a swatch service, publish weight and width on every listing, and confirm every order by WhatsApp before cutting. Use all three — they exist to prevent this situation.",
        ],
      },
      {
        heading: "Faulty fabric",
        body: [
          "If a fabric arrives with a flaw — a weaving fault, a printing error, a stain, damage in transit — tell us within seven days of delivery.",
          "Send a photograph of the fault with the fabric laid flat. We replace from the same dye lot where we still have it, or refund in full where we do not. We pay the return postage.",
        ],
      },
      {
        heading: "Wrong item",
        body: [
          "If we send you the wrong fabric or the wrong length, that is entirely our error. Tell us and we will collect it and send the correct one at our cost, usually within two working days.",
        ],
      },
      {
        heading: "Uncut items",
        body: [
          "Full uncut pieces — a complete six-yard wax print, for example — may be returned within fourteen days provided the packaging is unopened and the piece is in resaleable condition. Return postage is yours unless the item was faulty.",
        ],
      },
      {
        heading: "Colour",
        body: [
          "Screens vary, and a colour that looked right online may not look right in your hand. This is not a fault, and it is not covered by returns.",
          "Order a swatch first whenever colour matters. There is a small charge for a set, refunded against your order — we confirm it when you enquire.",
        ],
      },
      {
        heading: "How to start a return",
        body: [
          "Message us on WhatsApp or email orders@yadimsfabrics.com with your order reference and a photograph. We aim to resolve every return within five working days.",
        ],
      },
    ],
  },

  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    eyebrow: "The agreement",
    summary:
      "The terms on which we sell. Short, in plain language, and containing nothing we would be embarrassed to say across the counter.",
    updated: UPDATED,
    sections: [
      {
        heading: "Who we are",
        body: [
          "YADIMS Fabrics & Seams is a family-owned textile retailer and wholesaler trading from Tam-Tam, opposite Bali Hotel, Yaoundé, Cameroon. These terms apply to every order placed through this website.",
        ],
      },
      {
        heading: "Orders",
        body: [
          "Placing an order through this site is an offer to buy, not a completed contract. The contract forms when we confirm your order by WhatsApp or email.",
          "We may decline an order where stock has sold out, where a price has been listed in error, or where we cannot deliver to the address given. If we decline, you are charged nothing.",
        ],
      },
      {
        heading: "Prices",
        body: [
          "Prices are not published on the website. Each is agreed with you over WhatsApp, by phone or in the shop before you commit — usually below what you would pay to import the same cloth yourself. Any delivery charge is confirmed at the same time.",
          "We reserve the right to change prices, but never after an order has been confirmed. If a listed price is obviously wrong, we will tell you before we cut rather than silently charging the higher amount.",
        ],
      },
      {
        heading: "Payment",
        body: [
          "We accept cash on delivery within Yaoundé and Douala, mobile money, and bank transfer. This site never handles card details.",
          "For wholesale orders we may ask for a deposit before reserving a dye lot. Deposits are refundable up to two weeks before the reserved cutting date.",
        ],
      },
      {
        heading: "Description of goods",
        body: [
          "We describe every fabric as accurately as we can, including weight, width, fibre content and origin. Photographs are taken in natural light and are not colour-corrected to flatter.",
          "Natural and artisan fabrics vary. Slight irregularity in hand-dyed adire or hand-beaded lace is a characteristic of the process, not a defect.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "The text, photography and design of this site belong to YADIMS Fabrics & Seams. You may not reproduce them commercially without permission.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "Our liability for any order is limited to the value of that order. We are not liable for consequential loss — a missed event, a cancelled commission — arising from a delayed or faulty delivery.",
          "Nothing in these terms limits liability that cannot lawfully be limited.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of the Republic of Cameroon, and disputes fall to the courts of Yaoundé.",
        ],
      },
    ],
  },
};

export const legalSlugs = Object.keys(legalDocuments);
