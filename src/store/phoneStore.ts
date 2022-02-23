export const SET_IS_CONNECTED_WS = "SET_IS_CONNECTED_WS";

export interface IPhone {
  namespaced: boolean;
  state: () => IMeetingState;
  getters: IMeetingGetters;
  mutations?: Record<string, any>;
}

export interface IMeetingState {
  readonly isConnectedWS: boolean;
  readonly isActiveClose: boolean;
  meetingInfo: {
    title: string;
    startDateTime: string;
    duration: number;
    accessNumber: string;
    hostPasscode: string;
    guestPasscode: string;
    /**
     * 主持人在会状态 0 未呼通 1 呼叫中 2 已呼通
     */
    hostStatus: 0 | 1 | 2;
    /**
     * 会议状态 0 未发起或已结束 1 发起中 2 正在召开
     */
    meetStatus: 0 | 1 | 2;
    /**
     * 音乐线状态 0 未互通或已结束 1 呼叫中 2 已呼通
     */
    musicLineStatus: 0 | 1 | 2;
    /**
     * 禁言类型 0 未禁言 1 全部禁言 2 超级禁言
     */
    muteType: 0 | 1 | 2;
    /**
     * 录音状态 0 未开始或已结束 1 正在录音
     */
    recordingStatus: 0 | 1;
    lastActiveTime?: number;
  };
  memberAll: { member: []; memberOfNot: [] };
}

export interface IMeetingGetters {
  isStartMeeting?: (state: IMeetingState) => boolean;
  isRecordingAllowed?: (state: IMeetingState) => boolean;
  isMultipleHost?: (state: IMeetingState) => boolean;
  isAllMute?: (state: IMeetingState) => boolean;
  isSuperMute?: (state: IMeetingState) => boolean;
  isRecording?: (state: IMeetingState) => boolean;
  isStartQA?: (state: IMeetingState) => boolean;
  isHostInMeeting?: (state: IMeetingState) => boolean;
}

const phone: IPhone = {
  namespaced: true,
  state: () => ({
    isConnectedWS: false,
    isActiveClose: false,
    meetingInfo: {
      title: "",
      startDateTime: "",
      duration: 0,
      accessNumber: "",
      hostPasscode: "",
      guestPasscode: "",
      hostStatus: 0,
      meetStatus: 0,
      musicLineStatus: 0,
      muteType: 0,
      recordingStatus: 0,
      lastActiveTime: 0,
    },
    memberAll: { member: [], memberOfNot: [] },
  }),
  getters: {},
  mutations: {
    [SET_IS_CONNECTED_WS](state: IMeetingState, wsState: boolean) {
      console.log(wsState);
    },
  },
};

export default phone;
