import { makeAutoObservable } from "mobx";
import type { StoreType, MeetingInfo, MemberInfoType } from "@/types";

const state: StoreType = {
  isConnectedWS: false,
  meetingInfo: {},
  memberList: [],
  memberOfNotList: [],
};

const store = makeAutoObservable({
  ...state,
  setConnectedWS(state: boolean) {
    this.isConnectedWS = state;
  },
  setMeetingInfo(info: MeetingInfo) {
    state.meetingInfo = info;
  },
  setMemberList(member: MemberInfoType) {
    this.memberList.push(member);
  },
  setMemberOfNotList(memberOfNot: MemberInfoType) {
    this.memberOfNotList.push(memberOfNot);
  },
});

export default store;
