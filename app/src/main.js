import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import api from "./api";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/en";

dayjs.locale("en");
dayjs.extend(customParseFormat);

window.api = api;

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.config.globalProperties.$filters = {
  formatDate(value) {
    return dayjs(value).format("MMM DD");
  },
};

app.mount("#app");
