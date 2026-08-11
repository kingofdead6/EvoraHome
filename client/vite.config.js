import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // The audience is on mid-range Android over mobile data, so the initial
    // payload matters more than the number of requests. Vendors are split so
    // that a React or Framer upgrade does not invalidate the app chunk, and
    // vice versa.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
            return 'vendor-motion';
          }
          if (id.includes('lucide-react')) return 'vendor-icons';
          // animejs and lenis are only reachable from lazily loaded code, so
          // let Rollup keep them with their importers instead of hoisting them
          // into a shared chunk the entry has to wait for.
          if (id.includes('animejs') || id.includes('lenis')) return undefined;
          return 'vendor';
        },
      },
    },
    // Warn earlier than the default so a regression is visible in CI output.
    chunkSizeWarningLimit: 250,
  },
});
