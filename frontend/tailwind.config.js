/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        "neon-purple": "#a855f7",
        "neon-blue": "#3b82f6",
        "neon-green": "#22c55e",
        "neon-red": "#ef4444",
        "dark-bg": "#0f172a",
        "dark-card": "#1e293b",
      },
      boxShadow: {
        "neon-purple": "0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)",
        "neon-blue": "0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)", 
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

