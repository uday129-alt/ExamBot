/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090a0f',
        panelBg: 'rgba(17, 19, 28, 0.75)',
        accentPurple: '#7c3aed',
        accentPink: '#db2777',
        borderGray: 'rgba(255, 255, 255, 0.08)',
        textLight: '#f3f4f6',
        textMuted: '#9ca3af'
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
