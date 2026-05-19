/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0b",
        "background-elevated": "#121214",
        "background-overlay": "#1a1a1c",
        surface: "#121214",
        "surface-hover": "#1c1c1f",
        "surface-active": "#252528",
        primary: {
          DEFAULT: "#9acbff",
          bright: "#6b9fd4",
          muted: "#4a7fb5",
          foreground: "#003355",
        },
        "on-surface": "#e5e2e3",
        "on-surface-variant": "#c1c7d0",
        outline: "#8b919a",
        "outline-variant": "#41474f",
        "outline-subtle": "rgba(255, 255, 255, 0.08)",
        "outline-bright": "rgba(255, 255, 255, 0.15)",
        status: {
          healthy: "#5a8a6a",
          degraded: "#8a7a4a",
          down: "#8a4a4a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-xl": ["40px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg": ["30px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "code-md": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-sm": ["11px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "500" }],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      spacing: {
        gutter: "16px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
      },
      maxWidth: {
        "content": "1600px",
        "narrow": "1200px",
      },
      animation: {
        "pulse-dot": "pulse-dot 2s infinite",
        "pulse-dot-green": "pulse-dot-green 2s infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
      keyframes: {
        "pulse-dot": {
          "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(154, 203, 255, 0.7)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 6px rgba(154, 203, 255, 0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(154, 203, 255, 0)" },
        },
        "pulse-dot-green": {
          "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(74, 222, 128, 0.7)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 6px rgba(74, 222, 128, 0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(74, 222, 128, 0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
};
