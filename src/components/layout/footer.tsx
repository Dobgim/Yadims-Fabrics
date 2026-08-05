import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

import { footerNav, siteConfig } from "@/config/site";
import { Wordmark } from "@/components/layout/wordmark";
import { NewsletterForm } from "@/components/shared/newsletter-form";

const columns = [
  { heading: "Shop", links: footerNav.shop },
  { heading: "The House", links: footerNav.house },
  { heading: "Customer Care", links: footerNav.care },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-brand-700 text-white/80">
      <div className="container grid gap-14 py-20 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-10">
        <div className="space-y-6">
          <Wordmark tone="light" showTagline />
          <p className="max-w-xs text-sm leading-relaxed text-white/65">
            A family-owned house of fine textiles in Yaoundé. Carefully chosen cloth, honest
            numbers on every bolt, and the same person on the other end of the phone.
          </p>

          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
              <span>
                {siteConfig.contact.address.line1}
                <br />
                {siteConfig.contact.address.line2}, {siteConfig.contact.address.country}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="h-4 w-4 shrink-0 text-gold-400" aria-hidden />
              <a href={siteConfig.contact.phoneHref} className="link-underline">
                {siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="h-4 w-4 shrink-0 text-gold-400" aria-hidden />
              <a href={`mailto:${siteConfig.contact.email}`} className="link-underline">
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>

          <div className="flex gap-3">
            <SocialLink href={siteConfig.social.instagram} label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialLink>
            <SocialLink href={siteConfig.social.facebook} label="Facebook">
              <Facebook className="h-4 w-4" />
            </SocialLink>
          </div>
        </div>

        {columns.map((column) => (
          <nav key={column.heading} aria-label={column.heading} className="space-y-5">
            <h2 className="text-eyebrow font-medium uppercase text-gold-400">{column.heading}</h2>
            <ul className="space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-white/70 hover:text-white">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
          <div className="space-y-3">
            <h2 className="font-display text-2xl text-white md:text-3xl">
              New arrivals, before the shelf
            </h2>
            <p className="max-w-md text-sm text-white/65">
              One email a month when new bolts land. No noise, and one click to leave.
            </p>
          </div>
          <NewsletterForm source="footer" tone="dark" />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-7 text-xs text-white/50 sm:flex-row">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gold-400" aria-hidden />
            {siteConfig.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/80 transition-all duration-500 ease-luxe hover:border-gold-400 hover:bg-gold-400 hover:text-brand-900"
    >
      {children}
    </a>
  );
}
