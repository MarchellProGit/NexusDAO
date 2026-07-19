/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // deep dark blue slate
        surface: 'rgba(30, 41, 59, 0.7)', // glassmorphism surface
        primary: '#38bdf8', // neon blue
        accent: '#c084fc', // neon purple
      }
    },
  },
  plugins: [],
}
