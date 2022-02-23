import Vue from "vue";
import Vuex from "vuex";
import phone from "./phoneStore";
Vue.use(Vuex);

const phoneModule = phone as any;

export const store = new Vuex.Store({
  modules: { phoneModule },
});
