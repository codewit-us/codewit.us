/* v8 ignore next 98 */
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const flowbite = require('flowbite-react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    // Add shared library components to content
    join(__dirname, '../lib/shared/components/**/*.{ts,tsx}'),
    flowbite.content(),
    ...createGlobPatternsForDependencies(__dirname),
    './src/**/*.{js,jsx,ts,tsx}',
    '../../node_modules/flowbite-react/lib/**/*.js',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
    },
    scale: {
      102: '1.02',
    },
    extend: {
      colors: {
        background: {
          100: '#cccccc',
          200: '#999999',
          300: '#666666',
          400: '#333333',
          500: '#000000',
        }, // Black
        'alternate-background': {
          100: '#d4d1d0',
          200: '#a9a3a1',
          300: '#7d7671',
          400: '#524842',
          500: '#271a13',
          600: '#1f150f',
          700: '#17100b',
          800: '#100a08',
          900: '#080504',
        }, // Chocolate Brown
        foreground: {
          100: '#d9d6d4',
          200: '#b3adaa',
          300: '#8c837f',
          400: '#665a55',
          500: '#40312a',
          600: '#332722',
          700: '#261d19',
          800: '#1a1411',
          900: '#0d0a08',
        }, // Medium Brown
        'foreground-outline': {
          100: '#d4d1d0',
          200: '#a9a3a1',
          300: '#7d7671',
          400: '#524842',
          500: '#271a13',
          600: '#1f150f',
          700: '#17100b',
          800: '#100a08',
          900: '#080504',
        }, // Chocolate Brown
        highlight: {
          100: '#fefcf9',
          200: '#fcf8f2',
          300: '#fbf5ec',
          400: '#f9f1e5',
          500: '#f8eedf',
          600: '#c6beb2',
          700: '#958f86',
          800: '#635f59',
          900: '#32302d',
        }, // Khaki Yellow
        accent: {
          100: '#d8ecf0',
          200: '#b1dae1',
          300: '#8bc7d2',
          400: '#64b5c3',
          500: '#3da2b4',
          600: '#318290',
          700: '#25616c',
          800: '#184148',
          900: '#0c2024',
        }, // Blue-ish Teal
      },
      fontFamily: {
        logo: ['Capriola', 'sans-serif'],
        copy: ['Georgia', 'serif'],
        code: ['Menlo', 'Consolas', 'Courier New', 'monospace'],
      },
      height: {
        'container-full': 'calc(100% - 49px)',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    flowbite.plugin(),
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        // light: {
        //   ...require('daisyui/src/theming/themes')['light'],
        //   primary: '#3da2b4',
        //   secondary: '#271a13',
        //   accent: '#f8eedf',
        //   neutral: '#40312a',
        //   'base-100': '#ffffff',
        // },
        daisyui: {
          themes: ['coffee'],
        },
      },
    ],
  },
};
