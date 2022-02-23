import mitt from "mitt";
import { store } from "@/store";
import { SET_IS_CONNECTED_WS } from "@/store/phoneStore";

const eventBus = mitt();

export class PhoneWebSocket {
  private wsInstance: WebSocket | undefined;
  public url;
  public reConnectTimes;

  constructor(url: string, reConnectTimes: number) {
    this.url = url;
    this.reConnectTimes = reConnectTimes;
  }

  init() {
    if (!this.wsInstance) {
      this.wsInstance = new WebSocket(this.url);
    }

    this.wsInstance.onopen = () => this.onOpen();
    this.wsInstance.onmessage = (message) => this.onMessage(message);
    this.wsInstance.onclose = () => this.onClose();
  }

  private onOpen() {
    console.log("open");
    store.commit(`phoneModule/${SET_IS_CONNECTED_WS}`, true);
    eventBus.emit("open");
  }

  private onMessage(message: MessageEvent) {
    console.log(message);
  }

  private onClose() {
    console.log("close");
  }
}
