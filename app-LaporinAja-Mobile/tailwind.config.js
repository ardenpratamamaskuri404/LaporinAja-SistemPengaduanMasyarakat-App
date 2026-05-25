/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7f0',
          100: '#d4ead4',
          200: '#a8d5a8',
          300: '#7cc07c',
          400: '#5aab5a',
          500: '#4a8c4a',
          600: '#3d7a3d',
          700: '#2d5f2d',
          800: '#1e451e',
          900: '#0f2b0f',
        },
        accent: {
          50: '#fef9e7',
          100: '#fdf2c5',
          200: '#fce58a',
          300: '#fbd84f',
          400: '#f9cb14',
          500: '#e0b40d',
          600: '#b8930a',
          700: '#906f08',
          800: '#684c05',
          900: '#402a03',
        },
      },
    },
  },
  plugins: [],
};
