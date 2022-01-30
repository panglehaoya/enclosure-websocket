import PhoneWebSocket from "@/index";
import store from "./store";

const button = document.querySelector("#btn");

button?.addEventListener("click", () => {
  store.setCount(1);
});

const phone = new PhoneWebSocket("");
phone.reactive("count", () => console.log("count++"));
