import { defineConfig } from 'tailwindcss';

export default defineConfig({
  content: [
    './src/**/*.{html,ts}', // scan all HTML and TS files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});
