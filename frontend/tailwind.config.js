/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // We define a custom 'gold' if you need it
        gold: "#FFD700",
      },
    },
  },
  plugins: [
    require("daisyui"), // <--- Make sure this is here
  ],
  daisyui: {
    themes: ["black"], // Forces dark mode
  },
};
