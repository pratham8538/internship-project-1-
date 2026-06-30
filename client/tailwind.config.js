/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#BE1A1A',
        'primary-hover': '#D0311E',
        'on-primary': '#ffffff',
        secondary: '#b51c0c',
        background: '#fff9eb',
        'on-background': '#201c00',
        surface: '#fff9eb',
        'surface-container': '#fcefae',
        'surface-container-low': '#fff4c4',
        'surface-container-high': '#f6e9a9',
        'surface-container-highest': '#f0e3a4',
        'on-surface': '#201c00',
        'on-surface-variant': '#5c403c',
        outline: '#906f6b',
        'outline-variant': '#e5beb9',
        cream: '#F8EBAB',
        gold: '#F7D87F',
        espresso: '#1A0806',
        'espresso-dark': '#1a0f0e',
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1.5rem',
      },
      boxShadow: {
        warm: '0 4px 20px rgba(190,26,26,0.15)',
        glow: '0 4px 14px rgba(190,26,26,0.3)',
      },
    },
  },
  plugins: [],
};
