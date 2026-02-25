import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
      },
      colors: {
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Sacred Warmth custom colors
        burgundy: {
          50: "#fdf2f4",
          100: "#fce7ea",
          200: "#f9d0d8",
          300: "#f4a9b8",
          400: "#ed7a93",
          500: "#e04d6f",
          600: "#cc2d54",
          700: "#ab2145",
          800: "#8f1e3d",
          900: "#7a1d38",
          950: "#430b1a",
        },
        sage: {
          50: "#f4f9f4",
          100: "#e6f2e6",
          200: "#cee5cf",
          300: "#a6d0a8",
          400: "#78b47c",
          500: "#529657",
          600: "#3f7a44",
          700: "#346138",
          800: "#2d4f30",
          900: "#264129",
          950: "#112313",
        },
        ivory: {
          50: "#fdfcfa",
          100: "#faf8f3",
          200: "#f5f1e8",
          300: "#ede6d6",
          400: "#e2d5be",
          500: "#d4c2a4",
          600: "#c3aa84",
          700: "#ad926a",
          800: "#8f785a",
          900: "#76634c",
          950: "#3f3327",
        },
        walnut: {
          50: "#f9f6f3",
          100: "#f1ebe3",
          200: "#e2d5c6",
          300: "#cfb9a2",
          400: "#ba987c",
          500: "#ab8163",
          600: "#9e7157",
          700: "#835c49",
          800: "#6b4c3f",
          900: "#583f35",
          950: "#2f201b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'warm': '0 4px 14px 0 rgba(127, 29, 56, 0.08)',
        'warm-lg': '0 10px 25px -3px rgba(127, 29, 56, 0.12)',
        'inner-warm': 'inset 0 2px 4px 0 rgba(127, 29, 56, 0.04)',
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
