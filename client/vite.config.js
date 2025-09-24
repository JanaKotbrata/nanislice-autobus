import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import commonjs from "vite-plugin-commonjs";
import Config from "../shared/config/config.json";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    commonjs({
      // eslint-disable-next-line no-undef
      include: [path.resolve(__dirname, "../shared/validation/game-rules.js")],
    }),
    tailwindcss(),
  ],
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
