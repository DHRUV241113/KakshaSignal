/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        curriculum: {
          class6: '#0284c7', // Sky blue
          class7: '#d97706', // Amber
          class8: '#7c3aed', // Purple
          danger: '#ef4444', // Red for gaps
          mastered: '#10b981', // Emerald for mastered
        }
      }
    },
  },
  plugins: [],
}
