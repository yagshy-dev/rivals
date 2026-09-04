import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://781jh2vf-8000.euw.devtunnels.ms/",
        changeOrigin: true,
      },
    },
  },
});
