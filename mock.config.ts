import { fileURLToPath, URL } from "node:url";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    nitro({
      preset: "node-server",
      serverDir: "./mock/server",
      renderer: false,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5174,
  },
});
