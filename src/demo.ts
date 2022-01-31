import PhoneWebSocket from "@/index";
import store from "./store";

const button = document.querySelector("#btn");
button?.addEventListener("click", () => {
  store.setConnectedWS(!store.isConnectedWS);
});

const phone = new PhoneWebSocket("");
phone.reactive("isConnectedWS", (newVal) => handleMeetingInfo(newVal));

function handleMeetingInfo(isConnectedWS: any) {
  console.log(isConnectedWS);
}
