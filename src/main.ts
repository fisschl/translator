import "./assets/main.css";
import ui from "@nuxt/ui/vue-plugin";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import App from "./App.vue";

const { BASE_URL } = import.meta.env;

export const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
});

const app = createApp(App).use(router).use(ui);

app.mount("#app");
