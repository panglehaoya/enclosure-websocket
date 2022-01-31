import { Toast } from "vant";
import store from "@/store/index";
import { tokenField } from "@/config/config";
import createWS from "@/utils/websocket";
import { closeConnection } from "@/api/meetingMonitorApi/meetingControl/meetingControl";
import moment from "moment";
import {
  AcceptStatus,
  AcceptStatusStr,
  DD_263MEETING_GLOBALACCESSNUMBER,
  DD_263MEETING_HOSTINFO,
  IAttendeeListProps,
  ITransTimeToSplit,
  MeetingStatus,
  DD_263MEETING_DDMOBILETYPE,
  EAccountStatus,
  ICheckAccountStatus,
} from "@/types/types";
import axios from "axios";
import { tagEmits } from "element-plus";
import { getDeviceType } from "@/utils/ddApi";
import { checkAccountStatus } from "@/api/commonApi/userApi";
import i18n from "@/i18n";

/**
 * get location params
 * @param params
 */
export const getLocationParams = (params: string): string => {
  const locationParams: { [key: string]: any } = {};
  location.search
    .slice(1)
    .split("&")
    .forEach((item) => {
      locationParams[item.split("=")[0]] = item.split("=")[1];
    });

  return locationParams[params];
};

/**
 * get week day
 * @param weekDay
 */
export const getWeekDay = (weekDay: number): string => {
  const week = {
    0: i18n.global.t("message.SundayAbridge"),
    1: i18n.global.t("message.MondayAbridge"),
    2: i18n.global.t("message.TuesdayAbridge"),
    3: i18n.global.t("message.WednesdayAbridge"),
    4: i18n.global.t("message.ThursdayAbridge"),
    5: i18n.global.t("message.FridayAbridge"),
    6: i18n.global.t("message.SaturdayAbridge"),
  };

  return week[weekDay];
};

/**
 * get time sharp
 * @param time
 */
export const getTimeSharp = (time: string, date?: string) => {
  const hour = parseInt(time.split(":")[0]);
  const minute = parseInt(time.split(":")[1]);
  const language = getLanguage();
  const formatStr = language === "zh" ? "MM[月]DD[日]" : "MM-DD";
  const type = getDDMobileTypeFromLocal();
  const sharpFormatStr = type === "iPhone" ? "YYYY/MM/DD" : "YYYY-MM-DD";
  let momentDate: string | Date = "";

  if (date) {
    momentDate = new Date(date);
  } else {
    momentDate = new Date();
  }
  const _moment = moment(momentDate);
  const sharp = { sharpDate: "", sharpTime: "", sharpStr: "" };
  if (minute === 0) {
    sharp.sharpDate = _moment.format(formatStr) + " " + getWeekDay(_moment.weekday());
    sharp.sharpTime = `${hour}:00`;
    sharp.sharpStr = _moment.format(sharpFormatStr) + " " + `${hour}:00`;
  } else if (minute > 0 && minute <= 30) {
    sharp.sharpDate = _moment.format(formatStr) + " " + getWeekDay(_moment.weekday());
    sharp.sharpTime = `${hour}:30`;
    sharp.sharpStr = _moment.format(sharpFormatStr) + " " + `${hour}:30`;
  } else if (minute > 30 && minute <= 59) {
    const hourAdd = hour + 1;
    if (hourAdd < 24) {
      sharp.sharpDate = _moment.format(formatStr) + " " + getWeekDay(_moment.weekday());
      sharp.sharpTime = `${hour + 1}:00`;
      sharp.sharpStr = _moment.format(sharpFormatStr) + " " + `${hour + 1}:00`;
    } else if (hourAdd >= 24) {
      sharp.sharpDate = _moment.add(1, "hours").format(formatStr) + " " + getWeekDay(_moment.add(1, "hours").weekday());
      sharp.sharpTime = "00:00";
      sharp.sharpStr = _moment.add(1, "hours").format(sharpFormatStr) + " " + "00:00";
    }
  }

  return sharp;
};

/**
 * get confirm time
 * @param time
 */
export const getConfirmTime = (time: string, date?: string | number) => {
  console.log(time, date, "get confirm time");
  const hour = time.split(":")[0];
  const minute = time.split(":")[1];
  const language = getLanguage();
  const formatStr = language === "zh" ? "MM[月]DD[日]" : "MM-DD";
  const type = getDDMobileTypeFromLocal();
  const sharpFormatStr = type === "iPhone" ? "YYYY/MM/DD" : "YYYY-MM-DD";
  let momentDate: string | Date = "";

  if (date) {
    momentDate = new Date(date);
  } else {
    momentDate = new Date();
  }
  const _moment = moment(momentDate);
  const sharp = { sharpDate: "", sharpTime: "", sharpStr: "" };
  sharp.sharpDate = _moment.format(formatStr) + " " + getWeekDay(_moment.weekday());
  sharp.sharpTime = `${hour}:${minute}`;
  sharp.sharpStr = _moment.format(sharpFormatStr) + " " + `${hour}:${minute}`;

  return sharp;
};

/**
 * showErrorMsg
 * @param errorCode
 */
export const showErrorMsg = (errorCode) => {
  const language = store.state.language;

  const errorObj = {
    1001: "系统异常",
    1002: "请求参数错误",
    1003: "无主持人在会",
    1004: "会议不存在",
    1005: "参会人不存在",
    1006: "错误状态的参会人",
    1007: "错误状态的会议",
    1008: "无录音权限",
    1009: "无权限操作此会议",
    1010: "不支持的产品",
    1011: "密码不在有效期内",
    1012: "参数错误:token不存在",
  };

  if (typeof errorCode === "string") {
    Toast({
      type: "fail",
      message: errorCode,
      className: "selfVanToast",
    });
  } else {
    Toast({
      type: "fail",
      message: errorObj[errorCode],
      className: "selfVanToast",
    });
  }
};

/**
 * showSuccessMessage
 * @param message
 */
export const showSuccessMessage = (message) => {
  if (!message) return;
  console.log("show success message", message);
  return Toast({
    type: "success",
    message,
    className: "selfVanToast",
  });
};

/**
 * sortByKey
 * @param key
 * @param order
 * @param type
 */
export const sortByKey = (sourceData = [], key, order, type) => {
  const stringSort = {
    ascend(item1, item2) {
      return item1.localeCompare(item2);
    },
    descend(item1, item2) {
      return item2.localeCompare(item1);
    },
  };
  const numberSort = {
    ascend(item1, item2) {
      return item1 - item2;
    },
    descend(item1, item2) {
      return item2 - item1;
    },
  };
  if (type === "string") {
    sourceData.sort((item1, item2) => stringSort[order](item1[key], item2[key]));
  } else if (type === "number") {
    sourceData.sort((item1, item2) => numberSort[order](item1[key], item2[key]));
  }
};

/**
 * @param tokenField
 * @returns {string}
 */
export const getToken = async (tokenField) => {
  // return new Promise((resolve, reject) => {
  //   const sessionToken = sessionStorage.getItem('MeetingControl-Web-Token')
  //   if (sessionToken) {
  //     resolve(sessionToken)
  //   } else {
  //     const token = ''
  //     let fetchUrl = ''
  //     const env = process.env.NODE_ENV
  //     if (env === 'development') {
  //       fetchUrl = 'https://meetapitest.263.net/meet/sec/api/getToken'
  //     } else if (env === 'production') {
  //       fetchUrl = 'https://meetapitest.263.net/meet/sec/api/getToken'
  //     }
  //
  //     fetch(fetchUrl, {
  //       method: 'POST',
  //       body: JSON.stringify(getTokenField()),
  //       headers: new Headers({
  //         'Content-Type': 'application/json'
  //       })
  //     })
  //       .then(res => {
  //         resolve(res.json())
  //       })
  //       .catch(e => {
  //         reject(e)
  //       })
  //   }
  // })

  return new Promise((resolve, reject) => {
    const env = process.env.NODE_ENV;
    let fetchUrl = "";
    if (env === "development") {
      fetchUrl = "https://meetapitest.263.net/meet/sec/api/getToken";
    } else if (env === "production") {
      fetchUrl = "https://meetapitest.263.net/meet/sec/api/getToken";
    }
    axios({ method: "POST", url: fetchUrl, data: tokenField })
      .then((res) => {
        console.log(res, "axios token");
        resolve(res.data.data.token);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

/**
 * @param paramsName
 * @returns {string}
 */
export const getHostCode = (paramsName: string) => {
  const str = location.hash.slice(location.hash.indexOf("?") + 1);
  let result = "";
  str.split("&").forEach((item) => {
    if (item.split("=").includes(paramsName)) {
      result = item.split("=")[1];
    }
  });
  sessionStorage.setItem("MeetingControl-Web-HostCode", result);
  return result;
};

/**
 * sortMemberData
 * @param sortObj
 */
export const sortMember = (sortObj) => {
  const { data, key, order, type } = sortObj;
  const hostMember = data.filter((item) => item.roleType === 1);
  let member = data.filter((item) => item.roleType === 4);
  member = setUndefinedOrderData(member, key, type);
  sortByKey(member, key, order, type);
  let sortedData = {};
  sortedData = hostMember.concat(...member);
  store.commit("monitor/monitorMember/setMemberData", { type: "", data: sortedData });
};

/**
 * sortQAStatusMember
 */
export const sortQAStatusMember = () => {
  const allMemberData = [...(store.state as any).monitor.memberAllData];
  const copyMemberData = allMemberData.filter((item) => item.callStatus === 2);
  const hostMember: Array<any> = [];
  let qaMember: Array<any> = [];
  let ordinaryMember: Array<any> = [];
  for (const item of copyMemberData) {
    if (item.roleType === 1) {
      hostMember.push(item);
    } else if (item.qaStatus === 1 || item.qaStatus === 2) {
      qaMember.push(item);
    } else {
      ordinaryMember.push(item);
    }
  }
  const storeSortKey = (store.state as any).monitor.sortKey || "lastJoinTime";
  const type = storeSortKey === "lastJoinTime" ? "number" : "string";
  qaMember = setUndefinedOrderData(qaMember, "handPosition", "number");
  ordinaryMember = setUndefinedOrderData(ordinaryMember, storeSortKey, type);
  sortByKey(qaMember as any, "handPosition", "ascend", "number");
  sortByKey(ordinaryMember as any, storeSortKey, "ascend", type);
  const sortedMember = hostMember.concat(...qaMember, ...ordinaryMember);
  store.commit("monitor/monitorMember/setMemberData", { type: "", data: sortedMember });
};

/**
 * sortMemberOfNotData
 */
export const sortMemberOfNotData = (sortObj) => {
  const { data, order } = sortObj;
  let partyData = data.filter((item) => item.roleType === 4);
  const hostData = data.filter((item) => item.roleType === 1);
  data.forEach((item) => {
    item.sortKey = item.lastLeaveTime ? item.lastLeaveTime : item.lastJoinTime;
  });
  partyData = setUndefinedOrderData(partyData, "sortKey", "number");
  sortByKey(partyData, "sortKey", order, "number");
  const memberOfNotData = hostData.concat(...partyData);
  store.commit("monitor/monitorMemberOfNot/setMemberOfNotData", { type: "", data: memberOfNotData });
};

/**
 * @param fmt
 * @param date
 * @returns {*}
 */
export const dateFormat = (fmt, date) => {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(), // 年
    "m+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "H+": date.getHours().toString(), // 时
    "M+": date.getMinutes().toString(), // 分
    "S+": date.getSeconds().toString(), // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (const k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length === 1 ? opt[k] : opt[k].padStart(ret[1].length, "0"));
    }
  }
  return fmt;
};

/**
 * @param param
 * @returns {*}
 */
export const replacePhone = (param) => {
  let count = 0;
  let startIndex = 0;
  const paramPhone = param;
  while (true) {
    if (paramPhone.indexOf("-", startIndex) >= 0) {
      startIndex = paramPhone.indexOf("-", startIndex) + 1;
      count++;
    } else {
      break;
    }
  }
  if (count === 2) {
    param = param.replace("-", "");
  } else if (count === 1) {
    if (paramPhone.indexOf("-") === 3 || paramPhone.indexOf("-") === 4) {
      param = param.replace("-", "");
    }
  }
  return param;
};

/**
 * @param param
 * @returns {object}
 */
export const phoneCheck = (param: string): { isValid: boolean; type: "notReplace" | "replace" } => {
  const regMobile = /(^0?(12|13|14|15|16|17|18|19)[0-9]{9}$)|(^0?(12|13|14|15|16|17|18|19)[0-9]{9}[-]?\d+$)/;
  const regInterPhone = /^0{2}\d{1,4}\d{6,20}$/;
  const regPhone = /(^0{1}\d{2,4}[-]?\d{6,20}$)|(^0\d{2,4}-?\d+[-]\d+$)|(95040\d+)/;

  if (regMobile.exec(param)) {
    if (param.indexOf("0") === 0) {
      const paramPhone = param.substring(1, param.length);
      console.log(paramPhone);
    }
    return { isValid: true, type: "notReplace" };
  }
  if (regPhone.exec(param)) {
    if (param.indexOf("0086") === 0 || param.indexOf("086") === 0) {
      return { isValid: false, type: "notReplace" };
    }
    return { isValid: true, type: "replace" };
  }

  if (regInterPhone.exec(param)) {
    return { isValid: true, type: "notReplace" };
  }

  return { isValid: false, type: "notReplace" };
};

/**
 * @param type
 * @returns {*}
 */
type controlMessageType = "meetStatus" | "muteType" | "recordingStatus" | "qaStatus";
export const showControlMessage = (type: controlMessageType) => {
  if (!type) return;
  const meetingInfo = (store.state as any).monitor.meetingInfo;
  const controlMessage = {
    meetStatus: {
      0: "会议\n未发起\n或已结束",
      1: "会议\n发起中",
      2: "会议\n正在召开",
    },
    muteType: {
      0: "已解除\n全体静音",
      1: "会议\n全部静音",
      2: "会议\n超级静音",
    },
    recordingStatus: {
      0: "已结束录音",
      1: "正在录音",
    },
    qaStatus: {
      0: "问答结束",
      2: "已开启问答",
    },
  };
  console.log("show control message", type, meetingInfo);
  return showSuccessMessage(controlMessage[type][meetingInfo[type]]);
};

/**
 *
 * @param data
 * @param key
 * @param type
 * @returns {*}
 */
export const setUndefinedOrderData = (data, key, type) => {
  data.forEach((item) => {
    if (!item[key]) {
      item[key] = type === "string" ? "" : 0;
    }
  });
  return data;
};

/**
 * @param newVal
 * @param oldVal
 */
export const watchIsStartMeeting = async (newVal, oldVal) => {
  // const meetStatus = (store.state as any).monitor.meetingInfo.meetStatus
  // if (meetStatus === 0 && !newVal && oldVal) {
  //   try {
  //     const closeConnectionRes = await closeConnection()
  //     createWS.activeClose()
  //     location.hash = '#/meetingMonitor/abnormal/notExist'
  //     console.log(closeConnectionRes)
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }
  console.log("watch is start meeting");
};

/**
 * get hash query
 * @param paramsName
 */
export const getHashQuery = (paramsName: string): string => {
  const str = location.hash.slice(location.hash.indexOf("?") + 1);
  let result = "";
  str.split("&").forEach((item) => {
    if (item.split("=").includes(paramsName)) {
      result = item.split("=")[1];
    }
  });
  return result;
};

export const getTokenField = () => {
  const hashStr = location.hash;
  if (hashStr.includes("customerId") && hashStr.includes("secret")) {
    const customerId = getHashQuery("customerId");
    const secret = getHashQuery("secret");

    return {
      customerId,
      secret,
    };
  } else {
    return tokenField;
  }
};

/**
 * get utc
 */
export const getUTC = (): string => {
  const time = 0 - new Date().getTimezoneOffset() / 60;
  return time > 0 ? `UTC+${time}` : `UTC-${Math.abs(time)}`;
};

/**
 * get language
 */
export const getLanguage = (): "zh" | "en" => {
  let language: "zh" | "en" = "zh";
  const lang = navigator.language;
  if (lang.startsWith("zh")) {
    language = "zh";
  } else {
    language = "en";
  }

  return language;
};

/**
 * getUTC8Time
 * param time: 'YYYY-DD-MM HH:mm' / week: boolean
 * return 'YYYY-DD-MM HH:mm' or 'YYYY-DD-MM HH:mm 星期一'
 */
export const getUTC8Time = (timeStr: string, week = false): string => {
  let finalTime = "";
  let timeOffset = 0;
  const date = timeStr.split(" ")[0].split("-");
  const time = timeStr.split(" ")[1].split(":");
  const year = parseInt(date[0]);
  const month = parseInt(date[1]);
  const day = parseInt(date[2]);
  const hour = parseInt(time[0]);
  const minute = parseInt(time[1]);
  const localeUTC = parseInt(getUTC().slice(3));

  if (localeUTC < 8) {
    timeOffset = 8 - localeUTC;
    finalTime = moment(new Date(year, month, day, hour, minute)).add(timeOffset, "hours").format("YYYY-MM-DD HH:mm");
  } else if (localeUTC > 8) {
    timeOffset = localeUTC - 8;
    finalTime = moment(new Date(year, month, day, hour, minute))
      .subtract(timeOffset, "hours")
      .format("YYYY-MM-DD HH:mm");
  } else if (localeUTC === 8) {
    finalTime = timeStr;
  }
  if (week) {
    const tempWeek = moment(finalTime).format("d");
    finalTime = `${finalTime} ${getWeekDay(parseInt(tempWeek))}`;
  }

  return finalTime;
};

/**
 * get utc time
 * @param time
 */
export const getUTCTime = (time: number) => {
  console.log(time);
};

/**
 * get host info
 */
export const getHostInfo = (): IAttendeeListProps => {
  const hostInfoStr = localStorage.getItem(DD_263MEETING_HOSTINFO);
  let hostInfo = {} as IAttendeeListProps;
  if (hostInfoStr) {
    hostInfo = JSON.parse(hostInfoStr);
  }

  return hostInfo;
};

/**
 * time: 'YYYY-DD-MM HH:mm 星期一'
 */
export const transTimeToSplit = (time: string): ITransTimeToSplit => {
  const splitArray = time.split(" ");
  const timeObj = {} as ITransTimeToSplit;
  const dateSplit = splitArray[0].split("-");
  const timeStr = splitArray[1].split(":");

  timeObj.year = dateSplit[0];
  timeObj.month = dateSplit[1];
  timeObj.day = dateSplit[2];
  timeObj.hour = timeStr[0];
  timeObj.minute = timeStr[1];

  if (splitArray.length === 3) {
    const week = splitArray[2];
    timeObj.week = week;
  }

  return timeObj;
};

/**
 * status 0: 未召开 1: 正在召开 2: 已召开 3: 已过期
 * meetingStats
 */
export const getMeetingStatus = (status: number) => {
  const statusObj = {
    0: "notHeld",
    1: "onGoing",
    2: "held",
    3: "expired",
  };
  const msg = statusObj[status];

  return i18n.global.t(`message.${msg}`);
};

/**
 * time1 < time2
 * get time duration
 */
export const getTimeDuration = (time1: number, time2: number): string => {
  const language = getLanguage();
  let finalStr = "";
  const duration = time2 - time1;
  const days = Math.floor(duration / (24 * 3600 * 1000));
  const leave1 = duration % (24 * 3600 * 1000);
  const hours = Math.floor(leave1 / (3600 * 1000));
  const leave2 = leave1 % (3600 * 1000);
  const minutes = Math.floor(leave2 / (60 * 1000));
  const leave3 = leave2 % (60 * 1000);
  const seconds = Math.round(leave3 / 1000);
  const dateSymbol = language === "zh" ? "天" : "d";
  const hourSymbol = language === "zh" ? "小时" : "h";
  const minutesSymbol = language === "zh" ? "分" : "m";
  const dayStr = days ? `${days}${dateSymbol}` : "";
  const hourStr = hours ? `${hours}${hourSymbol}` : "";
  const minuteStr = minutes ? `${minutes}${minutesSymbol}` : "";

  if (days && !hours && minutes) {
    finalStr = `${dayStr}${hours}${hourSymbol}${minuteStr}`;
  } else {
    finalStr = `${dayStr}${hourStr}${minuteStr}`;
  }

  return finalStr;
};

/**
 * @param isTomorrow
 * @param t
 */
type sharpMType = "yesterday" | "today" | "tomorrow";
export const getSharpMillisecond = (t: 0 | 24, type: sharpMType): number => {
  let time = 0;
  if (type === "tomorrow") {
    time = new Date(
      moment().add(1, "d").get("y"),
      moment().add(1, "d").get("M"),
      moment().add(1, "d").get("D"),
      t,
      0,
      0
    ).getTime();
  } else if (type === "yesterday") {
    time = new Date(
      moment().subtract(1, "d").get("y"),
      moment().subtract(1, "d").get("M"),
      moment().subtract(1, "d").get("D"),
      t,
      0,
      0
    ).getTime();
  } else {
    time = new Date(moment().get("y"), moment().get("M"), moment().get("D"), t, 0, 0).getTime();
  }

  return time;
};

/**
 * @param obj
 */
export const isEmptyObject = (obj) => {
  const keys = Object.keys(obj);
  return keys.length;
};

/**
 * getTimeZoneStr
 */
export const getTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * YYYY-MM-DD HH:MM week to {data: '', time: ''}
 */
export const transTimeToDateObj = (time: string): { date: string; time: string } => {
  const s = transTimeToSplit(time);
  const language = getLanguage();
  let final = { date: "", time: "" };
  if (language === "en") {
    final = { date: `${s.month}-${s.day} ${s.week}`, time: `${s.hour}:${s.minute}` };
  } else if (language === "zh") {
    final = { date: `${s.month}月${s.day}日 ${s.week}`, time: `${s.hour}:${s.minute}` };
  }
  return final;
};

export const getAcceptStatusStr = (status: AcceptStatus): AcceptStatusStr => {
  const accept = {
    0: i18n.global.t("message.refuse"),
    1: i18n.global.t("message.accept"),
    2: i18n.global.t("message.wait"),
    3: i18n.global.t("message.notReplay"),
  };

  return accept[status] as AcceptStatusStr;
};

export const getDDMobileTypeFromLocal = () => {
  return localStorage.getItem(DD_263MEETING_DDMOBILETYPE) || "";
};

export const transTimeStrToIPhone = (time: string) => {
  return time.replace(/-/g, "/");
};

/**
 * isPC
 */
export const isPC = async () => {
  let deviceType: any = "";
  try {
    deviceType = await getDeviceType();
    console.log("deviceType", deviceType);
  } catch (e) {
    console.error(e);
    deviceType = e;
  }
  return deviceType === "pc";
};

/**
 * get check account status
 */
export const getCheckAccountStatusStr = (status) => {
  return EAccountStatus[status];
};

/**
 * checkPasscode
 */
export const checkPasscode = () => {
  return new Promise((resolve, reject) => {
    const orderData: ICheckAccountStatus = {
      corpId: store.state.corpId,
      userId: store.state.hostInfo.userId,
    };

    checkAccountStatus(orderData)
      .then((res: any) => {
        console.log("check passcode", res);
        if (res.status !== 0) {
          // showErrorMsg(getCheckAccountStatusStr(res.status))
          showErrorMsg(i18n.global.t("message.noAuthForStartMeeting"));
          resolve(false);
        } else if (res.status === 0 && res.data.status !== "1") {
          // showErrorMsg(getCheckAccountStatusStr(res.data.status))
          showErrorMsg(i18n.global.t("message.noAuthForStartMeeting"));
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((e) => {
        console.error(e);
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(false);
      });
  });
};
