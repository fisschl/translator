import { fileURLToPath, URL } from "node:url";
import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";
import VueRouter from "vue-router/vite";

export default defineConfig(({ mode }) => {
  const { VITE_SERVER_PROXY_TARGET } = loadEnv(mode, fileURLToPath(new URL("./", import.meta.url)));
  return {
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
        "/api/chat": {
          target: VITE_SERVER_PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },
  };
});
