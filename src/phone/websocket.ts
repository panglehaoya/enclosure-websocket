import mitt from "mitt";
import { store } from "@/store";
import { SET_IS_CONNECTED_WS } from "@/store/phoneStore";

export type SendMessageType =
  | "getMeetingInfo"
  | "getMeetingMember"
  | "getPasscodeCfg"
  | "startQA"
  | "endQA";

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
    console.log("用于测试");
  }

  sendMsg(message: SendMessageType, data: Record<string, any>) {
    console.log(message, data);
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
