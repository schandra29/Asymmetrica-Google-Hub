/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Asymmetrica brand colors (extracted from logo)
        'asymmetrica': {
          teal: '#00CED1',
          orange: '#FF8C42',
          navy: '#1B2A4A',
          gold: '#FFD700',
          cream: '#FFF8E7',
        },
        // Three-regime colors (from Asymmetrica Protocol)
        'regime': {
          exploration: '#FFD700',  // Gold
          optimization: '#6366F1', // Indigo
          stabilization: '#48BB78', // Green
        },
      },
      spacing: {
        // PHI-based spacing scale (Golden Ratio)
        'phi-xs': '0.382rem',   // 6.112px
        'phi-sm': '0.618rem',   // 9.888px
        'phi-md': '1rem',       // 16px
        'phi-lg': '1.618rem',   // 25.888px
        'phi-xl': '2.618rem',   // 41.888px
        'phi-2xl': '4.236rem',  // 67.776px
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        // Tesla 4.909 Hz harmonic animations
        'harmonic-pulse': 'pulse 203.7ms ease-in-out infinite',
        'harmonic-spin': 'spin 814.8ms linear infinite',
        'harmonic-bounce': 'bounce 407.4ms ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
