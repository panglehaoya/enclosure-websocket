import Vue from "vue";
import Index from "./index.vue";
import { store } from "../store/index";

new Vue({ store, render: (h) => h(Index) }).$mount("#app");
