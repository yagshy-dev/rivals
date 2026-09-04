/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // UX-003 (revised 2026-09-04): Apple/macOS-inspired aesthetic — smooth, generous rounded
    // corners. Tailwind's default borderRadius scale already gives us this (rounded-2xl for
    // cards/panels, rounded-full/rounded-lg for buttons), so no override is needed here — the
    // previous near-zero "sharp corner" override has been removed.
    extend: {
      colors: {
        // UX-005: vivid/neon status accents against the dark theme (UX-001/UX-006:
        // #0a0a0b page background, #121214 card/surface background).
        approved: {
          DEFAULT: "#22ff88",
          fg: "#052e16",
        },
        rejected: {
          DEFAULT: "#dc143c",
          fg: "#ffffff",
        },
        pending: {
          DEFAULT: "#ffd60a",
          fg: "#1c1400",
        },
      },
    },
  },
  plugins: [],
};
