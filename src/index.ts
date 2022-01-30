import store from "./store";
import { reaction } from "mobx";
import mitt from "mitt";
import {
  MeetingAuthSendStr,
  MeetingControlSendStr,
  MemberSendStr,
  OnOpenType,
  OnCloseType,
  OnMessageType,
  SendMessageType,
  MemberInfoType,
} from "@/types";

const emitter = mitt();

class PhoneWebSocket {
  private wsInstance: undefined | WebSocket;

  private reqMessage: undefined | MeetingAuthSendStr | MeetingControlSendStr | MemberSendStr | "ping";

  private heartbeatTimer: undefined | number;

  private timer: undefined | number;

  public url: string;

  public reConnectTimes: number;

  constructor(url: string, reConnectTimes?: number) {
    this.url = url;
    this.reConnectTimes = reConnectTimes || 5;
  }

  init() {
    const wsUrlReg = /^wss?/i;
    if (wsUrlReg.test(this.url)) {
      throw new Error("websocket url should be starts with ws or wss!");
    }

    if (!this.wsInstance) {
      this.wsInstance = new WebSocket(this.url);
    }

    this.wsInstance.onopen = () => PhoneWebSocket.onOpen();
    this.wsInstance.onclose = () => PhoneWebSocket.onClose();
    this.wsInstance.onmessage = (res: MessageEvent) => this.onMessage(res);
  }

  private static onOpen(): OnOpenType {
    store.setConnectedWS(true);
    console.log("ws open");
    return null;
  }

  private static onClose(): OnCloseType {
    console.log("on close");

    return null;
  }

  private onMessage(res: MessageEvent): OnMessageType {
    const data = res.data;
    if (data === "pang") {
      console.log(data);
    } else {
      const parseData = JSON.parse(data);
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = this.heartbeatCheck();
      this.handleResData(data);
    }
    return null;
  }

  private handleResData(data: any) {
    const { msgType, tag = "" } = data;
    if (msgType === "ServerPushMsg-Meeting") {
      console.log("ServerPushMsg-Meeting --->");
      console.log(data);
      console.log("<--- ServerPushMsg-Meeting");
      store.setMeetingInfo(data);
    } else if (msgType === "ServerPushMsg-Party") {
      console.log("ServerPushMsg-Party --->");
      console.log(data);
      console.log("<--- ServerPushMsg-Party");
      this.handleMemberData(data.data);
    }
  }

  private handleMemberData(data: MemberInfoType) {}

  private heartbeatCheck() {
    return setInterval(() => {
      this.wsInstance?.send("ping");
    }, 100);
  }

  sendMessage(reqMessage: SendMessageType, data?: Record<string, any>) {
    clearInterval(this.heartbeatTimer);
    this.reqMessage = reqMessage.req;
    const dataTag = { tag: `tab_${this.reqMessage}_${Date.now()}` };
    let sendMessage = "";
    if (data) {
      sendMessage = JSON.stringify(Object.assign(reqMessage, data, dataTag));
    } else {
      sendMessage = JSON.stringify(Object.assign(reqMessage, data, dataTag));
    }

    return new Promise((resolve, reject) => {
      this.wsInstance?.send(sendMessage);
      emitter.on(this.reqMessage as any, (res: any) => {
        if (res.errorCode === 0) {
          resolve(res);
        } else {
          const errorCode = res.errorCode;
          if (errorCode === 1009 || errorCode === 1011 || errorCode === 1012) {
            // location.hash = '#/'
            sessionStorage.removeItem("MeetingControl-Web-HostCode");
            sessionStorage.removeItem("MeetingControl-Web-Token");
            delete this.wsInstance;
          }
          reject(res);
        }
      });
    });
  }

  reactive(str: string, cb: () => any) {
    reaction(
      () => store.isConnectedWS,
      (newVal) => cb()
    );
  }
}

export default PhoneWebSocket;
