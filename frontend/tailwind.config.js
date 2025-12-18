module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Bodoni Moda"', 'Didot', 'Georgia', 'serif'],
      },
      colors: {
        dark: '#0f0c08',
        card: '#1a1612',
        cream: '#f5f3e7',
        neonBlue: '#00f7ff',
        'neonBlue-light': '#0066ff',
        'dark-bg': '#0f0c08',
        'dark-card': '#1a1612',
        'dark-text': '#f5f3e7',
        'light-bg': '#ffffff',
        'light-card': '#f8f9fa',
        'light-text': '#1a1612',
        gray: {
          850: '#1a1612'
        },
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 247, 255, 0.5)'
      },
    },
  },
  plugins: [],
};