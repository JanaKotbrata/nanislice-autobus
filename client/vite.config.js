import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import Config from "../shared/config/config.json";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: Config.SERVER_URI,
        changeOrigin: true,
        secure: false,
        withCredentials: true,
      },
    },
  },
});
