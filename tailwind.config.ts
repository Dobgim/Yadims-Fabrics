import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem", "2xl": "2.5rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        brand: {
          50: "#EAF5EF",
          100: "#CDE8D9",
          200: "#9BD1B4",
          300: "#63B78C",
          400: "#2E9265",
          500: "#0E6B43",
          600: "#0B5A38",
          700: "#084B2A",
          800: "#063720",
          900: "#042315",
        },
        gold: {
          50: "#FBF6E6",
          100: "#F4E9C1",
          200: "#E9D48C",
          300: "#DEC260",
          400: "#D4AF37",
          500: "#B9962A",
          600: "#957520",
          700: "#6E5617",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": [
          "clamp(3rem, 8vw, 6.5rem)",
          { lineHeight: "0.95", letterSpacing: "-0.03em" },
        ],
        "display-lg": [
          "clamp(2.5rem, 5.5vw, 4.5rem)",
          { lineHeight: "1.02", letterSpacing: "-0.025em" },
        ],
        "display-md": [
          "clamp(2rem, 4vw, 3.25rem)",
          { lineHeight: "1.08", letterSpacing: "-0.02em" },
        ],
        "display-sm": [
          "clamp(1.5rem, 2.6vw, 2.25rem)",
          { lineHeight: "1.15", letterSpacing: "-0.015em" },
        ],
        eyebrow: ["0.72rem", { lineHeight: "1.2", letterSpacing: "0.22em" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(4, 35, 21, 0.04), 0 8px 24px -12px rgba(4, 35, 21, 0.12)",
        lift: "0 2px 4px rgba(4, 35, 21, 0.04), 0 24px 48px -20px rgba(4, 35, 21, 0.22)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.35), 0 16px 40px -20px rgba(4,35,21,0.35)",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.25s ease-out",
        "accordion-up": "accordion-up 0.25s ease-out",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
