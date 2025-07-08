/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        //  (≈ 160 px, 192 px, 320 px)
        '10xl': '10rem',
        '12xl': '12rem',
        '20xl': '20rem',
      },
    },
  },
  plugins: [],
};
