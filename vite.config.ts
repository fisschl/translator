import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import VueRouter from "vue-router/vite";

export default defineConfig({
  base: "/translator/",
  plugins: [
    VueRouter({
      exclude: ["**/utils/**", "**/components/**", "**/assets/**"],
    }),
    vue(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    transformer: "lightningcss",
    lightningcss: {
      cssModules: {
        pure: true,
      },
    },
  },
  server: {
    proxy: {
      "/chat/completions": {
        target: "https://bronya.world",
      },
    },
  },
});
