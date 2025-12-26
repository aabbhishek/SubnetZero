/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.08)',
          dark: 'rgba(0, 0, 0, 0.4)',
        },
      },
      backdropBlur: {
        glass: '20px',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
