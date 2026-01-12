/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#212b0f',
        accent: {
          green: '#47d21c',
          orange: '#d5995b',
        },
        neutral: {
          tan: '#d6c3ab',
          yellow: '#f2ec37',
        },
      },
      fontFamily: {
        sekuya: ['Sekuya', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
