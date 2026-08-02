/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#071427',
          light: '#0E1F3A',
          lighter: '#152A4A',
        },
        purple: {
          DEFAULT: '#5B3DF5',
          light: '#7C63F8',
          dark: '#4527D6',
        },
        cyan: {
          DEFAULT: '#00D9FF',
          light: '#5EE9FF',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '18px',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(7, 20, 39, 0.35)',
        glow: '0 0 40px rgba(91, 61, 245, 0.35)',
        'glow-cyan': '0 0 40px rgba(0, 217, 255, 0.25)',
      },
      backgroundImage: {
        'grid-glow': 'radial-gradient(circle at 20% 20%, rgba(91,61,245,0.20), transparent 40%), radial-gradient(circle at 80% 0%, rgba(0,217,255,0.15), transparent 40%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
      },
    },
  },
  plugins: [],
}
