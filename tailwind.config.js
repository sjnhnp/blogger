// ========================================================================
//                         tailwind.config.js (MODIFIED)
// ========================================================================
/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          // 將 Inter 設為預設無襯線字體
          sans: ['Inter', ...fontFamily.sans],
          // 新增 Lora 作為襯線字體，用於標題
          serif: ['Lora', ...fontFamily.serif],
        },
        colors: {
          // 自訂顏色，打造優雅風格
          'brand-blue': '#3B82F6',
          'brand-dark': '#111827',
          'brand-gray': '#6B7280',
          'brand-light-gray': '#F3F4F6',
        }
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  };