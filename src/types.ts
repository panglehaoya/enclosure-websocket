export type OnOpenType = ((this: WebSocket, ev: Event) => any) | null;

export type OnMessageType = ((this: WebSocket, ev: MessageEvent) => any) | null;

export type OnCloseType = ((this: WebSocket, ev: CloseEvent) => any) | null;

export type MemberSendStr =
  | "addOutParties"
  | "callParties"
  | "endCallParties"
  | "removeOutParties"
  | "partyMute"
  | "partyUnMute"
  | "promoteQAParty"
  | "removeQAParty"
  | "modifyPartyRole"
  | "modifyPartyInfo";

export type MeetingControlSendStr =
  | "startQA"
  | "endQA"
  | "endMeeting"
  | "confMute"
  | "confUnMute"
  | "confSuperMute"
  | "startRecord"
  | "endRecord"
  | "closeConnection"
  | "addBlackListParties";

export type MeetingAuthSendStr = "getMeetingInfo" | "getMeetingMember" | "getPasscodeCfg";

export interface SendMessageType {
  req: MemberSendStr | MeetingControlSendStr | MeetingAuthSendStr;
}

export interface SortParamType {
  data: Record<string, any>;
  key: string;
  order: "ascend" | "descend";
  type: "string" | "number";
}

export interface MemberInfoType {
  partyNumber: string;
  partyName: string;
  companyName: string;
  deptName: string;
  exists: boolean;
  roleType: 1 | 4;
  callStatus: 0 | 1 | 2;
  disconnectReason: 0 | 1 | 2 | 3 | 4 | 9;
  muteStatus: 0 | 1;
  qaStatus: 0 | 1 | 2;
  handPosition: number;
  handTime: number;
}

export interface MeetingInfo {
  title?: string;
  startDateTime?: string;
  duration?: number;
  accessNumber?: string;
  hostPasscode?: string;
  guestPasscode?: string;
  hostStatus?: 0 | 1 | 2;
  meetStatus?: 0 | 1 | 2;
  musicLineStatus?: 0 | 1 | 2;
  muteType?: 0 | 1 | 2;
  recordingStatus?: 1 | 2;
  lastActiveTime?: number;
  qaStatus?: 0 | 2;
  parties?: Array<MemberInfoType>;
}

export interface StoreType {
  isConnectedWS: boolean;
  meetingInfo: MeetingInfo;
  memberList: Array<MemberInfoType>;
  memberOfNotList: Array<MemberInfoType>;
}

export type ReactionStr = "isConnectedWS" | "meetingInfo" | "memberList" | "memberOfNotList" | "qaStatus";
