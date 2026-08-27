/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Times New Roman"', 'Times', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: "#6C3FC5",
          dark: "#5a2fa8",
          light: "#8B5CF6",
        },
        accent: "#00BFA6",
        danger: "#E53935",
        warning: "#FFB300",
        success: "#43A047",
        navy: {
          900: "#0a0f1e",
          800: "#0d1528",
          700: "#111827",
          600: "#1a2235",
          500: "#1e2a3a",
          400: "#243044",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
      },
    },
  },
  plugins: [],
};
