import { store } from './store'
import { reaction } from 'mobx'
import mitt from 'mitt'
import {
  MeetingAuthSendStr,
  MeetingControlSendStr,
  MemberSendStr,
  OnOpenType,
  OnCloseType,
  OnMessageType,
  SendMessageType,
  ReactionStr
} from './types'

const emitter = mitt()

export class PhoneWebSocket {
  private wsInstance: undefined | WebSocket;

  private reqMessage:
    | undefined
    | MeetingAuthSendStr
    | MeetingControlSendStr
    | MemberSendStr
    | 'ping'
    | 'getPasscodeCfg';

  private heartbeatTimer: any;

  private timer: any;

  public url: string;

  public reConnectTimes: number;

  constructor (url: string, reConnectTimes?: number) {
    this.url = url
    this.reConnectTimes = reConnectTimes || 5
  }

  init () {
    const wsUrlReg = /^wss?/i
    if (wsUrlReg.test(this.url)) {
      throw new Error('websocket url should be starts with ws or wss!')
    }

    if (!this.wsInstance) {
      this.wsInstance = new WebSocket(this.url)
    }

    this.wsInstance.onopen = () => PhoneWebSocket.onOpen()
    this.wsInstance.onclose = () => this.onClose()
    this.wsInstance.onmessage = (res: MessageEvent) => this.onMessage(res)
  }

  private static onOpen (): OnOpenType {
    store.setConnectedWS(true)
    console.log('ws open')
    return null
  }

  private onClose (): OnCloseType {
    console.log('websocket close')
    this.reConnect()
    return null
  }

  private reConnect () {
    delete this.wsInstance
    this.reConnectTimes += 1
    console.log('re connect times', this.reConnectTimes)
    this.timer = setTimeout(() => {
      if (this.reConnectTimes < 5) {
        this.init()
      } else {
        clearTimeout(this.timer)
      }
    }, 1000)
  }

  private onMessage (res: MessageEvent): OnMessageType {
    const data = res.data
    if (data === 'pang') {
      console.log(data)
    } else {
      const parseData = JSON.parse(data)
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = this.heartbeatCheck()
      this.handleResData(parseData)
    }
    return null
  }

  private handleResData (data: any) {
    const { msgType, tag = '' } = data
    if (msgType === 'ServerPushMsg-Meeting') {
      console.log('ServerPushMsg-Meeting --->')
      console.log(data)
      console.log('<--- ServerPushMsg-Meeting')
      store.setMeetingInfo(data)
    } else if (msgType === 'ServerPushMsg-Party') {
      console.log('ServerPushMsg-Party --->')
      console.log(data)
      console.log('<--- ServerPushMsg-Party')
      const callStatus = data.data.callStatus
      callStatus === 2 ? store.setMemberList(data.data) : store.setMemberOfNotList(data.data)
    } else if (msgType === 'ServerPushMsg-Talking') {
      console.log('ServerPushMsg-Talking')
    } else {
      if (this.reqMessage === 'getPasscodeCfg') {
        if (tag.includes('getPasscodeCfg')) {
          emitter.emit(this.reqMessage, data)
        }
      } else {
        emitter.emit(this.reqMessage as any, data)
      }
    }
  }

  private heartbeatCheck () {
    return setInterval(() => {
      this.wsInstance?.send('ping')
    }, 100)
  }

  sendMessage (reqMessage: SendMessageType, data?: Record<string, any>) {
    clearInterval(this.heartbeatTimer)
    this.reqMessage = reqMessage.req
    const dataTag = { tag: `tab_${this.reqMessage}_${Date.now()}` }
    let sendMessage = ''
    if (data) {
      sendMessage = JSON.stringify(Object.assign(reqMessage, data, dataTag))
    } else {
      sendMessage = JSON.stringify(Object.assign(reqMessage, data, dataTag))
    }

    return new Promise((resolve, reject) => {
      this.wsInstance?.send(sendMessage)
      emitter.on(this.reqMessage as any, (res: any) => {
        if (res.errorCode === 0) {
          resolve(res)
        } else {
          const errorCode = res.errorCode
          if (errorCode === 1009 || errorCode === 1011 || errorCode === 1012) {
            // location.hash = '#/'
            sessionStorage.removeItem('MeetingControl-Web-HostCode')
            sessionStorage.removeItem('MeetingControl-Web-Token')
            delete this.wsInstance
          }
          reject(res)
        }
      })
    })
  }

  reactive (str: ReactionStr, cb: (newVal: any) => any) {
    reaction(
      () => store[str],
      (newVal: any) => cb(newVal)
    )
  }
}
