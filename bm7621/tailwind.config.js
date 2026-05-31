/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f5fb', 100: '#ddeaf6', 200: '#b9d4ed', 300: '#87b5de',
          400: '#5090ca', 500: '#2c6fad', 600: '#245d92', 700: '#1d4d79',
          800: '#193f63', 900: '#163452', 950: '#0f2238',
        },
        teal: {
          50: '#e6f7f5', 100: '#cceee9', 200: '#99ded4', 300: '#66cdbe',
          400: '#33bda9', 500: '#1a9e8c', 600: '#167f70',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.05)',
        'card-lg': '0 4px 16px rgba(0,0,0,0.10)',
      },
      borderOpacity: { 8: '0.08' },
    },
  },
  plugins: [],
}
