import type { Config } from 'tailwindcss';

/**
 * REBRANDING: change the `brand` scale below to your company colors.
 * Everything in the UI derives from these tokens.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce6fd',
          200: '#c0d2fc',
          300: '#94b4f9',
          400: '#618cf4',
          500: '#3d64ee',
          600: '#2745e2',
          700: '#1f33cf',
          800: '#202ba8',
          900: '#1f2a85',
          950: '#171c51'
        }
      }
    }
  },
  plugins: []
};

export default config;
