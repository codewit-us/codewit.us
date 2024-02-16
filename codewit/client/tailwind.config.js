const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000', // Black
        'alternate-background': '#271a13', // Chocolate brown
        foreground: '#40312a', // Medium brown
        'foreground-outline': '#271a13', // Chocolate brown
        highlight: '#f8eedf', // Khaki yellow
        accent: '#3da2b4', // Blue-ish teal
      },
      fontFamily: {
        logo: ['Capriola', 'sans-serif'],
        copy: ['Georgia', 'serif'],
        code: ['Menlo', 'Consolas', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
