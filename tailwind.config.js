/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Lexend_Thin: ['Lexend-Thin'],
        Lexend_Light: ['Lexend-Light'],
        Lexend_ExtraLight: ['Lexend-ExtraLight'],
        Lexend_Medium: ['Lexend-Medium'],
        Lexend_Regular: ['Lexend-Regular'],
        Lexend_SemiBold: ['Lexend-SemiBold'],
        Lexend_Bold: ['Lexend-Bold'],
        Lexend_ExtraBold: ['Lexend-ExtraBold'],
        Lexend_Black: ['Lexend-Black']
      },
      keyframes: {
        customPing: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        'custom-ping': 'customPing 1s ease-in-out infinite',
        'modal-fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      backgroundOpacity: {
        70: '0.7',
      },
    },
  },
  plugins: [require('tailwindcss-motion')],
}

