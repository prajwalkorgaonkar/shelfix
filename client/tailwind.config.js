/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode using 'class' strategy
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // blue-500
        secondary: '#64748b', // slate-500
        darkBg: '#0f172a', // slate-900
        darkCard: '#1e293b', // slate-800
      }
    },
  },
  plugins: [],
}
