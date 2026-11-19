/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
    }
    return `var(${variableName})`;
  };
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      colors: {
        paper: withOpacity('--color-paper'),
        "paper-card": withOpacity('--color-paper-card'),
        "paper-2": withOpacity('--color-paper-2'),
        "paper-3": withOpacity('--color-paper-3'),
        ink: withOpacity('--color-ink'),
        "ink-2": withOpacity('--color-ink-2'),
        "ink-muted": withOpacity('--color-ink-muted'),
        accent: withOpacity('--color-accent'),
        "accent-ink": withOpacity('--color-accent-ink'),
        "accent-hi": withOpacity('--color-accent-hi'),
        "accent-deep": withOpacity('--color-accent-deep'),
        "accent-soft": withOpacity('--color-accent-soft'),
        "accent-yellow": withOpacity('--color-accent-yellow'), /* Dusk Periwinkle */
        "accent-orange": withOpacity('--color-accent-orange'), /* Dusk Apricot */
        "accent-cyan": withOpacity('--color-accent-cyan'),
        "accent-green": withOpacity('--color-accent-green'),
        "accent-red": withOpacity('--color-accent-red'),
        rule: withOpacity('--color-rule'),
        periwinkle: withOpacity('--color-accent'),
        apricot: withOpacity('--color-accent-2'),
        dusk: withOpacity('--color-dusk'),
        glass: withOpacity('--glass'),
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
