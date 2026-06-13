/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          // Primary brand color
          DEFAULT: "#2e7d8a",
          50: "#f0f7f8",
          100: "#d6e9ec",
          200: "#aed3d9",
          300: "#7fb6bf",
          400: "#5197a3",
          500: "#2e7d8a",
          600: "#286b76",
          700: "#235761",
          800: "#1f474f",
          900: "#1b3a41",
        },
      },
      fontFamily: {
        sans: ['Ubuntu', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
