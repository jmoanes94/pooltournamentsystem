/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#0d3b2c',
          dark: '#06261c',
          light: '#145a42',
        },
        neon: {
          green: '#39ff14',
          cyan: '#00f5ff',
          gold: '#ffd60a',
          magenta: '#ff00aa',
        },
      },
      fontFamily: {
        display: ['"Clash Display"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(57, 255, 20, 0.35)',
        'neon-cyan': '0 0 24px rgba(0, 245, 255, 0.35)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.85', filter: 'brightness(1.15)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        slideIn: 'slideIn 0.35s ease-out forwards',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
