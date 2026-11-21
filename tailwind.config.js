/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
        teal: {
          50: '#F0FDFA',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        aqi: {
          good: '#0D9488', // Teal
          moderate: '#D97706', // Amber
          sensitive: '#EA580C', // Orange
          unhealthy: '#DC2626', // Red
          veryUnhealthy: '#7C3AED', // Violet
          hazardous: '#881337', // Maroon
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
