import { fileURLToPath, URL } from "node:url";
import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import VueRouter from "vue-router/vite";

export default defineConfig({
  base: "/translator/",
  plugins: [
    VueRouter({
      exclude: ["**/utils/**", "**/components/**", "**/assets/**"],
      extensions: [".vue"],
    }),
    vue(),
    ui(),
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
