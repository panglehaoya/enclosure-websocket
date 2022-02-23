import Vue from "vue";
import Index from "./index.vue";
import { store } from "../src/store";

new Vue({ store, render: (h) => h(Index) }).$mount("#app");
