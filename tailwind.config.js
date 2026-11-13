/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#0a5c36',
          hover: '#074729',
          dark: '#084c2c',
          navy: '#0a1d37',
        },
        category: {
          rapat: '#2563eb',
          audiensi: '#16a34a',
          internal: '#64748b',
          program: '#d97706',
          pertemuan: '#dc2626',
          evaluasi: '#7c3aed',
        },
        app: {
          bg: '#f0f5fa',
          mist: '#f4f8fc',
        },
      },
    },
  },
  plugins: [],
};

