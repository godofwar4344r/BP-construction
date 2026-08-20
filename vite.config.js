import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths, so the built site works both at a domain root
  // (example.com) and from a subfolder (example.com/axiom/) without a
  // rebuild. Frame paths in main.js are built off import.meta.env.BASE_URL
  // for the same reason.
  base: './',
});
