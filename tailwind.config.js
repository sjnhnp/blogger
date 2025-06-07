/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [
      require('@tailwindcss/typography'), // 用於美化 Markdown 輸出樣式
    ],
  }
  