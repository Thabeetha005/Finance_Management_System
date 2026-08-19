/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#106354', // Sophisticated Premium Emerald
          hover: '#0a4b41',
          light: '#e6f3f0',
        },
        brandEmerald: {
          DEFAULT: '#106354',
          hover: '#0a4b41',
          light: '#e6f3f0',
          dark: '#083730',
        },
        gold: {
          DEFAULT: '#D4AF37', // Premium Financial Gold Accent
          hover: '#B89628',
          light: '#FDF8E7',
          dark: '#997A15',
        },
        copper: {
          DEFAULT: '#887333', // Premium Metallic Copper Accent
          hover: '#73602a',
          light: '#f9f6ef',
          dark: '#5C4D20',
        },
        brandBlack: {
          DEFAULT: '#000000',
          soft: '#121212',
          muted: '#2D2D2D',
        },
        brandWhite: {
          DEFAULT: '#FFFFFF',
          off: '#F8F9FA',
          ivory: '#FAF9F6',
        },
        success: '#106354',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
