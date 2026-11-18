/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        "paper-card": "var(--color-paper-card)",
        "paper-2": "var(--color-paper-2)",
        "paper-3": "var(--color-paper-3)",
        ink: "var(--color-ink)",
        "ink-2": "var(--color-ink-2)",
        "ink-muted": "var(--color-ink-muted)",
        "accent-yellow": "var(--color-accent-yellow)", /* Dusk Periwinkle */
        "accent-orange": "var(--color-accent-orange)", /* Dusk Apricot */
        "accent-cyan": "var(--color-accent-cyan)",
        "accent-green": "var(--color-accent-green)",
        "accent-red": "var(--color-accent-red)",
        rule: "var(--color-rule)",
        periwinkle: "var(--color-accent)",
        apricot: "var(--color-accent-2)",
        dusk: "var(--color-dusk)",
        glass: "var(--glass)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        inner: "var(--radius-inner)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        glass: "var(--glass-hi), var(--shadow-card)",
        neo: "var(--shadow-neo)",
        "neo-sm": "var(--shadow-neo-sm)",
        "neo-lg": "var(--shadow-neo-lg)",
      },
    },
  },
  plugins: [],
}
