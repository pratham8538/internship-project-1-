/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#C5A880',
        'primary-hover': '#B2946C',
        'on-primary': '#0F0E0C',
        secondary: '#A0815E',
        background: '#0B0B0C',
        'on-background': '#F4F4F6',
        surface: '#121214',
        'surface-container': '#18181C',
        'surface-container-low': '#0E0E10',
        'surface-container-high': '#232329',
        'surface-container-highest': '#2D2D35',
        'on-surface': '#F4F4F6',
        'on-surface-variant': '#A1A1AA',
        outline: '#3F3F46',
        'outline-variant': '#27272A',
        cream: '#E5DCD0',
        gold: '#D4AF37',
        espresso: '#0B0B0C',
        'espresso-dark': '#070708',
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
