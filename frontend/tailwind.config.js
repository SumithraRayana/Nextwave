/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nxt: {
          blue: "#1E40AF",
          dark: "#0F172A",
          card: "#1E293B",
          accent: "#3B82F6",
          cyan: "#06B6D4",
          emerald: "#10B981",
          gold: "#F59E0B",
          purple: "#8B5CF6"
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
