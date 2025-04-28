/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightblue: {
          400: '#ADD8E6',
        },
        darkblue: {
          600: '#00008B',
        },
      },
    },
  },
  plugins: [],
}

