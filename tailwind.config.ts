import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  plugins: [typography, forms, daisyui],
  daisyui: {
    themes: ["bumblebee", "cupcake", "retro", "garden", "lofi", "lemonade", "coffee", "sunset"]
  },
  theme: {
    fontFamily: {
      sans: ['Gabarito', 'sans'],
      mono : ['IBM Plex Mono', 'sans-serif'],
    }
  }
} satisfies Config;
