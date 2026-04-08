import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            50: '#e8edf5',
            100: '#c5d0e5',
            200: '#9eb1d3',
            300: '#7792c1',
            400: '#5a7ab3',
            500: '#3d63a5',
            600: '#2f4f8a',
            700: '#1e3a5f',
            800: '#0f2137',
            900: '#0c1929',
          },
          teal: {
            50: '#e6f7f7',
            100: '#b3e8e8',
            200: '#80d9d9',
            300: '#4dcaca',
            400: '#26bfbf',
            500: '#0ea5a5',
            600: '#0d9488',
            700: '#0b7a6f',
            800: '#086157',
            900: '#054840',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
