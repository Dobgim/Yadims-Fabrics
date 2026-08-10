import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

/**
 * Content Security Policy.
 *
 * Deliberately not nonce-based. A nonce forces every page to dynamic rendering,
 * which would disable this site's ISR and CDN caching and raise hosting cost —
 * and because framer-motion writes inline `style` attributes, `style-src` would
 * still need `'unsafe-inline'` regardless. So the tradeoff buys little here,
 * where the one XSS sink (JSON-LD) is already escaped at the source.
 *
 * What this policy does buy, at zero rendering cost:
 *   - script-src 'self'  blocks injected EXTERNAL scripts (`<script src=evil>`).
 *   - connect-src        limits where a script could exfiltrate data to — only
 *                        this origin and the project's own Supabase host.
 *   - frame-ancestors    stops the site being framed (clickjacking); stronger
 *                        than the X-Frame-Options below, which is kept for old
 *                        browsers that do not read CSP.
 *   - object-src 'none'  no plugins. base-uri 'self' blocks <base> injection.
 *   - form-action 'self' forms can only post back here — every form on the site
 *                        posts to a same-origin Server Action.
 *
 * `'unsafe-inline'` on script/style is the residual gap: inline injection is
 * still allowed. It is unavoidable without nonces (framer-motion, Tailwind
 * arbitrary values) and is mitigated by escaping the only sink that writes
 * markup. `'unsafe-eval'` is dev-only — React uses eval for error overlays in
 * development, never in production.
 */
const connectSrc = ["'self'", supabaseHost && `https://${supabaseHost}`, supabaseHost && `wss://${supabaseHost}`]
  .filter(Boolean)
  .join(" ");

const imgSrc = ["'self'", "data:", "blob:", supabaseHost && `https://${supabaseHost}`]
  .filter(Boolean)
  .join(" ");

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src ${imgSrc}`,
  `font-src 'self'`,
  `connect-src ${connectSrc}`,
  // Google Maps place embed on the Contact page.
  `frame-src https://www.google.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  // Only in production — on http://localhost this would try to upgrade
  // same-origin dev assets to https and fail.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // House SVGs (logo, mark, photo placeholder) are authored in this repo,
    // never uploaded. The CSP and attachment disposition below keep an SVG
    // from being rendered as an active document if one ever slipped through.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost }] : []),
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
