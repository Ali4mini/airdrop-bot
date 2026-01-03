/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom colors for your brand if needed
        gold: "#FFD700",
      },
    },
  },
  // Add daisyUI
  plugins: [require("daisyui")],
  // Config daisyUI
  daisyui: {
    themes: ["black", "dark", "cyberpunk"], // We will use 'black' as default
  },
};
