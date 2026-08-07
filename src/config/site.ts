import { publicEnv } from "@/lib/env";

export const siteConfig = {
  name: "YADIMS Fabrics & Seams",
  shortName: "YADIMS",
  tagline: "The Art of Fine Fabrics",
  description:
    "YADIMS Fabrics & Seams is a family-owned house of fine textiles — luxury lace, bridal silks, traditional weaves and premium evening fabrics, sourced with care and sold by the yard.",
  url: publicEnv.NEXT_PUBLIC_SITE_URL,
  locale: "en_GB",
  currency: "XAF",
  contact: {
    email: "hello@yadimsfabrics.com",
    salesEmail: "orders@yadimsfabrics.com",
    phone: "+237 677 69 39 01",
    phoneHref: "tel:+237677693901",
    whatsapp: publicEnv.NEXT_PUBLIC_WHATSAPP_NUMBER,
    address: {
      line1: "Tam-Tam, Opposite Bali Hotel",
      line2: "Yaoundé, Centre",
      country: "Cameroon",
      city: "Yaoundé",
      region: "Centre",
    },
    mapQuery: "Bali Hotel, Tam-Tam, Yaounde, Cameroon",
    hours: [
      { day: "Monday – Friday", time: "8:00 — 18:30" },
      { day: "Saturday", time: "8:00 — 19:00" },
      { day: "Sunday", time: "Closed" },
    ],
  },
  social: {
    instagram: "https://instagram.com/yadimsfabrics",
    facebook: "https://facebook.com/yadimsfabrics",
    tiktok: "https://tiktok.com/@yadimsfabrics",
  },
} as const;

export const mainNav = [
  { title: "Shop", href: "/shop" },
  { title: "Collections", href: "/collections" },
  { title: "Gallery", href: "/gallery" },
  { title: "Services", href: "/services" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
] as const;

export const footerNav = {
  shop: [
    { title: "All Fabrics", href: "/shop" },
    { title: "New Arrivals", href: "/collections/new-arrivals" },
    { title: "Stone & Beaded Lace", href: "/collections/stone-lace" },
    { title: "Wedding Collection", href: "/collections/wedding" },
    { title: "Wishlist", href: "/wishlist" },
  ],
  house: [
    { title: "Our Story", href: "/about" },
    { title: "Services", href: "/services" },
    { title: "Gallery", href: "/gallery" },
      { title: "Contact", href: "/contact" },
  ],
  care: [
    { title: "FAQs", href: "/faqs" },
    { title: "Shipping Policy", href: "/shipping-policy" },
    { title: "Return Policy", href: "/return-policy" },
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms & Conditions", href: "/terms" },
  ],
} as const;

export const adminNav = [
  { title: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { title: "Analytics", href: "/admin/analytics", icon: "TrendingUp" },
  { title: "Products", href: "/admin/products", icon: "Package" },
  { title: "Categories", href: "/admin/categories", icon: "Tags" },
  { title: "Collections", href: "/admin/collections", icon: "Layers" },
  { title: "Orders", href: "/admin/orders", icon: "ShoppingBag" },
  { title: "Customers", href: "/admin/customers", icon: "Users" },
  { title: "Gallery", href: "/admin/gallery", icon: "Images" },
  { title: "Messages", href: "/admin/messages", icon: "MessageSquare" },
  { title: "Newsletter", href: "/admin/newsletter", icon: "Mail" },
  { title: "Media Library", href: "/admin/media", icon: "FolderOpen" },
  { title: "Settings", href: "/admin/settings", icon: "Settings" },
] as const;
