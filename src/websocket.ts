import WSEvent from "./event";

const eventBus = new WSEvent();

class EnclosureWebSocket {
  private wsInstance: WebSocket | undefined;
  private sendEvent = "";
  private heartbeatTimer: any;
  private isActiveClose: boolean;
  private reConnectTimes: number;
  private reConnectTimer: any;

  public url;
  public reLinkTimes;
  public heartbeatText: string;

  constructor(url: string, reLinkTimes = 5, heartbeatText = "ping") {
    this.url = url;
    this.reLinkTimes = reLinkTimes;
    this.heartbeatText = heartbeatText;
    this.isActiveClose = false;
    this.reConnectTimes = 0;
  }

  init() {
    if (!this.wsInstance) {
      this.wsInstance = new WebSocket(this.url);
    }
    this.wsInstance.onopen = () => this.onOpen();
    this.wsInstance.onmessage = (res: MessageEvent) => this.onMessage(res);
    this.wsInstance.onclose = (e: CloseEvent) => this.onClose(e);
  }

  private onOpen() {
    eventBus.emit("ws-open");
  }

  private onMessage(res: MessageEvent) {
    if (res.data === this.heartbeatText) {
      console.log(res.data);
    } else {
      const result = JSON.parse(res.data);
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = this.heartbeatCheck();
      eventBus.emit(this.sendEvent, result);
    }
  }

  private onClose(e: CloseEvent) {
    if (this.isActiveClose) return;
    clearInterval(this.heartbeatTimer);
    delete this.wsInstance;
    this.reConnectTimes += 1;
    this.reConnectTimer = setTimeout(() => {
      if (this.reConnectTimes < this.reLinkTimes) {
        this.init();
      } else {
        clearTimeout(this.reConnectTimes);
      }
    }, 1000);
  }

  private heartbeatCheck() {
    return setInterval(() => {
      this.wsInstance?.send("ping");
    }, 10000);
  }

  sendMsg(event: string, data: Record<string, any>) {
    return new Promise((resolve) => {
      this.wsInstance?.send(JSON.stringify({ event, data }));
      this.sendEvent = event;
      eventBus.on(this.sendEvent, (res) => {
        resolve(res);
      });
    });
  }

  closeWS() {
    return new Promise((resolve) => {
      this.isActiveClose = true;
      this.wsInstance?.close();
      eventBus.clear();
      resolve("close");
    });
  }
}

export { EnclosureWebSocket, eventBus };
