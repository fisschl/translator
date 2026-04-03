import ui from "@nuxt/ui/vue-plugin";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "@/assets/main.css";

const app = createApp(App).use(router).use(ui);

app.mount("#app");
