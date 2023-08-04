import { type Config } from "tailwindcss";

import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', ...defaultTheme.fontFamily.sans],
      },
    }
  },
  plugins: [],
} satisfies Config;