/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  screens: {
    'xs': '480px',
  
  },
  width: {
    '420': '420px',
    '465': '465px',
  },
  extend: {
    colors: {
      'primary-500': '#877EFF',
      'primary-600': '#5D5FEF',
      'secondary-500': '#FFB620',
      'off-white': '#D0DFFF',
      'red': '#FF5A5A',
      'dark-1': '#000000',
      'dark-2': '#09090A',
      'dark-3': '#101012',
      'dark-4': '#1F1F22',
      'light-1': '#FFFFFF',
      'light-2': '#EFEFEF',
      'light-3': '#7878A3',
      'light-4': '#5C5C7B',
    },
  },
  keyframes: {
    "accordion-down": {
      from: { height: 0 },
      to: { height: "var(--radix-accordion-content-height)" },
    },
    "accordion-up": {
      from: { height: "var(--radix-accordion-content-height)" },
      to: { height: 0 },
    },
  },
  animation: {
    "accordion-down": "accordion-down 0.2s ease-out",
    "accordion-up": "accordion-up 0.2s ease-out",
  },
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui"),
    require("rippleui"),
  ],
};
