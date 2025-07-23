/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./stores/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Studio Radaelli Professional Color Palette
        'radaelli': {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          olive: {
            50: '#f7f7f2',
            100: '#e8e8d8',
            200: '#d1d1b8',
            300: '#b3b38f',
            400: '#8f8f6b',
            500: '#6b6b4a',
            600: '#52523a',
            700: '#40402e',
            800: '#333325',
            900: '#2a2a1f',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
        },
      },
      fontFamily: {
        'professional': ['Playfair Display', 'Times New Roman', 'serif'],
        'classical': ['Times New Roman', 'serif'],
      },
      backgroundImage: {
        'classical-gradient': 'linear-gradient(135deg, #f7f7f2 0%, #e8e8d8 50%, #d1d1b8 100%)',
        'radaelli-primary': 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        'radaelli-secondary': 'linear-gradient(135deg, #6b6b4a 0%, #52523a 100%)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-out forwards',
        'slideUp': 'slideUp 0.6s ease-out forwards',
        'messageSlideLeft': 'messageSlideLeft 0.4s ease-out forwards',
        'messageSlideRight': 'messageSlideRight 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        messageSlideLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        messageSlideRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
} 