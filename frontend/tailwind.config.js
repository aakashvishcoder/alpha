module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Bodoni Moda"', 'Didot', 'Georgia', 'serif'],
      },
      colors: {
        dark: '#0f0c08',
        card: '#1a1612',
        neonBlue: '#00f7ff',
        cream: '#f5f3e7',
        gray: {
          850: '#1a1612',
        },
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 247, 255, 0.5)'
      },
    },
  },
  plugins: [],
};