import { Toast, Notify } from "vant";
import store from "@/store/index";
import { wsConfig } from "@/config/config";
import eventBus from "@/utils/eventBus";
import {
  showErrorMsg,
  sortMember,
  sortQAStatusMember,
  sortMemberOfNotData,
  dateFormat,
  getHostInfo,
  getToken,
  getTokenField,
  getHashQuery,
} from "@/utils/util";
import { getMeetingMonitorUrl } from "@/api/commonApi/meetingApi";
import { DD_263MEETING_HOSTCODE, IGetMeetingMonitorUrl } from "@/types/types";
import i18n from "@/i18n";

class CreateWebSocket {
  public protocol: string;
  public url: string;
  public timer: any;
  public reConnectTimes: number;
  public reqMessage: string;
  public notifyInstance: any;
  public heartbeatTimer: any;
  public isError: boolean;
  public wsInstance: any;
  public globalErrorCode: number;

  constructor(config) {
    const { protocol, url } = config;
    this.protocol = protocol;
    this.url = url;
    this.timer = null;
    this.reConnectTimes = 0;
    this.reqMessage = "";
    this.notifyInstance = "";
    this.heartbeatTimer = null;
    this.isError = false;
    this.globalErrorCode = 0;
  }

  async init() {
    this.listenBeforeunload();
    let wsUrl = "";
    try {
      let hostCode = getHashQuery("hostCode");

      if (!hostCode) {
        hostCode = sessionStorage.getItem(DD_263MEETING_HOSTCODE) as string;
      }
      const data: IGetMeetingMonitorUrl = {
        cid: getHostInfo().cid,
        passcode: hostCode,
      };
      console.log("get url data", data);
      const res: any = await getMeetingMonitorUrl(data);
      wsUrl = res.data;
      console.log("res url", res);
    } catch (e) {
      console.error("get url error", e);
    } finally {
      console.log("finally get url", wsUrl);
      store.commit("monitor/changeIsActiveClose", false);
      if (!this.wsInstance) {
        // for reConnect
        // this.wsInstance = new WebSocket(wsUrl || 'ws://meetingroomtest.263.net/MeetingRoom/ws/349667023/token')
        this.wsInstance = new WebSocket(wsUrl || "ws://meetingroomtest.263.net/MeetingRoom/ws/349667023/");
      }
      this.wsInstance.onopen = () => this.onOpen();
      this.wsInstance.onmessage = (res) => this.onMessage(res);
      this.wsInstance.onclose = (event) => this.onClose(event);
      this.wsInstance.onerror = () => this.onError();
    }
    // const hostCode = getHashQuery('hostCode')
    // const token = await getToken(getTokenField())
    // const baseConfig = `/${hostCode}/${token}`
    // store.commit('monitor/changeIsActiveClose', false)
    // const wsUrl = `${this.protocol}://${this.url}${baseConfig}`
    // if (!this.wsInstance) {
    //   this.wsInstance = new WebSocket(wsUrl)
    // }
    // this.wsInstance.onopen = () => this.onOpen()
    // this.wsInstance.onmessage = (res) => this.onMessage(res)
    // this.wsInstance.onclose = (event) => this.onClose(event)
    // this.wsInstance.onerror = () => this.onError()

    return this.wsInstance;
  }

  onOpen() {
    // this.sendMsg('handle error when connect ws error', null)
    eventBus.emit("connectedWS", true);
    store.commit("monitor/changeWSState", true);
    this.setState(false);
    console.log("ws opened");
    Toast.clear();
    window.addEventListener("offline", this.listenOffline.bind(this));
  }

  sendMsg(reqMessage, data) {
    clearInterval(this.heartbeatTimer);
    this.reqMessage = typeof reqMessage === "object" ? reqMessage.req : reqMessage;
    let sendMessage = {};
    if (reqMessage === "ping") {
      sendMessage = reqMessage;
    } else {
      if (data) {
        const dataTagObj = { tag: `tag_${this.reqMessage}_${dateFormat("YYYY-mm-dd HH:MM:SS", new Date())}` };
        sendMessage = JSON.stringify(Object.assign(reqMessage, data, dataTagObj));
      } else {
        const tagObj = { tag: `tag_${this.reqMessage}_${dateFormat("YYYY-mm-dd HH:MM:SS", new Date())}` };
        sendMessage = JSON.stringify(Object.assign(reqMessage, tagObj));
      }
    }

    return new Promise((resolve, reject) => {
      this.wsInstance.send(sendMessage);
      eventBus.on(this.reqMessage, (res: any) => {
        if (res.errorCode === 0) {
          resolve(res);
        } else {
          const errorCode = res.errorCode;
          showErrorMsg(errorCode);
          // this.isError = true
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

  onMessage(res) {
    const data = res.data;
    if (data === "pang") {
      console.log(data);
    } else {
      const parseData = JSON.parse(data);
      this.globalErrorCode = parseData.errorCode;
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = this.heartbeatCheck();
      this.handleResData(parseData);
    }
  }

  onClose(event) {
    console.log("websocket close");
    console.log((store.state as any).monitor.isActiveClose, this.isError, "isActiveClose error");
    if ((store.state as any).monitor.isActiveClose || this.isError) return;
    clearInterval(this.heartbeatTimer);
    if (this.globalErrorCode === 1011) {
      showErrorMsg(this.globalErrorCode);
      return;
    }
    if (!this.notifyInstance) {
      this.notifyInstance = Notify({
        type: "danger",
        message: i18n.global.t("message.connectFail"),
        duration: 2000,
      });
    }
    this.reConnect();
  }

  onError() {
    clearInterval(this.heartbeatTimer);
    console.log("websocket error");
    this.reConnect();
  }

  reConnect() {
    store.commit("monitor/changeWSState", false);
    delete this.wsInstance;
    this.reConnectTimes += 1;
    console.log(this.reConnectTimes, "reConnectTimes");
    Toast({
      message: i18n.global.t("message.reConnect"),
      type: "loading",
      forbidClick: false,
      loadingType: "spinner",
      duration: 0,
      className: "selfReconnectToast",
    });
    this.timer = setTimeout(() => {
      if (this.reConnectTimes < 5) {
        this.init();
      } else {
        clearTimeout(this.timer);
        this.setState(true);
        Notify({ message: "已达到最大重连次数请手动刷新页面", type: "danger" });
      }
    }, 1000);
  }

  setState(isShowOverlay) {
    // store.commit('monitor/changeOverlay', isShowOverlay)
    this.notifyInstance = "";
    Toast.clear();
    this.reConnectTimes = 0;
  }

  heartbeatCheck() {
    return setInterval(() => {
      this.wsInstance.send("ping");
    }, 10000);
  }

  activeClose() {
    if (!this.wsInstance) return;
    store.commit("monitor/changeIsActiveClose", true);
    store.commit("monitor/changeWSState", false);
    this.wsInstance.close();
    this.wsInstance = null;
    clearInterval(this.heartbeatTimer);
  }

  handleResData(res) {
    const { msgType, tag = "" } = res;
    if (msgType === "ServerPushMsg-Meeting") {
      console.log("ServerPushMsg-Meeting --->");
      console.log(res);
      console.log("<--- ServerPushMsg-Meeting");
      store.commit("monitor/setMeetingInfo", Object.assign((store.state as any).monitor.meetingInfo, res.data));
    } else if (msgType === "ServerPushMsg-Party") {
      console.log("ServerPushMsg-Party --->");
      console.log(res);
      console.log("<--- ServerPushMsg-Party");
      const memberAllData = this.handlePushMemberAllData(res.data);
      this.handlePushMemberData(memberAllData);
      this.handlePushMemberOfNotData(memberAllData);
    } else if (msgType === "ServerPushMsg-Talking") {
      console.log("ServerPushMsg-Talking");
    } else {
      if (this.reqMessage === "getPasscodeCfg") {
        if (tag.includes("getPasscodeCfg")) {
          eventBus.emit(this.reqMessage, res);
        }
      } else {
        eventBus.emit(this.reqMessage, res);
      }
    }
  }

  handlePushMemberAllData(data) {
    const memberAllData = [...(store.state as any).monitor.memberAllData];
    const { partyNumber, exists } = data;
    const findIndex = memberAllData.findIndex((item) => item.partyNumber === partyNumber);
    if (findIndex === -1) {
      if (exists === -1) {
        store.commit("monitor/setMeetingAllData", { type: "", data: memberAllData });
      } else {
        memberAllData.push(data);
        store.commit("monitor/setMeetingAllData", { type: "", data: memberAllData });
      }
    } else {
      const spliceMember = memberAllData.splice(findIndex, 1);
      console.log("splice member", spliceMember);
      if (exists === -1) {
        console.log("exists not found", memberAllData);
        store.commit("monitor/setMeetingAllData", { type: "", data: memberAllData });
      } else {
        memberAllData.push(Object.assign(spliceMember[0], data));
        console.log("memeber all data1", memberAllData);
        store.commit("monitor/setMeetingAllData", { type: "", data: memberAllData });
      }
    }
    return memberAllData;
  }

  handlePushMemberData(data) {
    const memberData = data.filter((item) => item.callStatus === 2);
    const storeSortKey = (store.state as any).monitor.sortKey || "lastJoinTime";
    const type = storeSortKey === "lastJoinTime" ? "number" : "string";
    const sortObj = {
      data: memberData,
      key: storeSortKey,
      order: "ascend",
      type,
    };
    const isStartQA = store.getters["monitor/isStartQA"];
    console.log(isStartQA, "isStartQA");
    if (isStartQA) {
      sortQAStatusMember();
    } else {
      sortMember(sortObj);
    }
  }

  handlePushMemberOfNotData(data) {
    const memberOfNotData = data.filter((item) => item.callStatus !== 2);
    console.log("member of not data", memberOfNotData);
    sortMemberOfNotData({ data: memberOfNotData, order: "descend" });
  }

  listenOffline() {
    // delete this.wsInstance
    // console.log('listen offline and init ws')
    // Toast({
    //   message: '正在重连\n请稍候....',
    //   type: 'loading',
    //   forbidClick: false,
    //   loadingType: 'spinner',
    //   duration: 0,
    //   className: 'selfVanToast'
    // })
    // this.reConnect()
    console.log("off line");
  }

  listenBeforeunload() {
    window.addEventListener("beforeunload", () => {
      window.removeEventListener("offline", this.listenOffline.bind(this));
    });
  }
}

export default new CreateWebSocket(wsConfig);
