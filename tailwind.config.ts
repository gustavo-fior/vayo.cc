import { type Config } from "tailwindcss";

import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      animation: {
        shake: "shake 0.62s cubic-bezier(.36,.07,.19,.97) both",
        overlayShow: "overlayShow 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        contentShow: "contentShow 50ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        shake: {
          "10%, 90%": {
            transform: "translate3d(-1px, 0, 0)",
          },
          "20%, 80%": {
            transform: "translate3d(1px, 0, 0)",
          },
          "30%, 50%, 70%": {
            transform: "translate3d(-2px, 0, 0)",
          },
          "40%, 60%": {
            transform: "translate3d(2px, 0, 0)",
          },
        },
        overlayShow: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        contentShow: {
          from: {
            opacity: "0",
            transform: "translate(-50%, -45%) scale(0.96)",
          },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
} satisfies Config;
