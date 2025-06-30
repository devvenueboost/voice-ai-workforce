// examples/basic-demo/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
          'spin': 'spin 1s linear infinite',
        }
      },
    },
    plugins: [],
  }