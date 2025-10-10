/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: 'var(--color-navy)',
        'teal-dark': 'var(--color-teal-dark)',
        'teal-light': 'var(--color-teal-light)',
        'orange-dark': 'var(--color-orange-dark)',
        'orange-light': 'var(--color-orange-light)',
        gold: 'var(--color-gold)',
        cream: 'var(--color-cream)',
      },
      spacing: {
        'phi-xs': 'var(--spacing-phi-xs)',
        'phi-sm': 'var(--spacing-phi-sm)',
        'phi-md': 'var(--spacing-phi-md)',
        'phi-lg': 'var(--spacing-phi-lg)',
        'phi-xl': 'var(--spacing-phi-xl)',
      },
      fontFamily: {
        sans: 'var(--font-family-sans)',
        display: 'var(--font-family-display)',
      },
      animation: {
        'harmonic-pulse': 'harmonic-pulse var(--timing-tesla-1x) ease-in-out infinite',
        'harmonic-spin': 'harmonic-spin var(--timing-tesla-4x) linear infinite',
        'harmonic-bounce': 'harmonic-bounce var(--timing-tesla-2x) ease-in-out infinite',
      },
      keyframes: {
        'harmonic-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'harmonic-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'harmonic-bounce': {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
           },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
    },
  },
  plugins: [],
}