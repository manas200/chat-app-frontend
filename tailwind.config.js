/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(217 32% 17%)',
        background: 'hsl(222 84% 5%)',
        foreground: 'hsl(210 40% 98%)',
      },
    },
  },
  plugins: [],
};
