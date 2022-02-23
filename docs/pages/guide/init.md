## 安装

```bash
yarn add phone-websocket
```

## 初始化

```js
import { PhoneWebSocket } from "phone-websocket";

// 传入地址和重连次数
// 重连次数默认为5
const phone = new PhoneWebSocket('wss://', 5)

// 初始化后通过监听store中的isOpen 进行后续处理
phone.init()
```

## store

在项目中的store文件中

```js
import { phoneStore } from 'phone-websocket'

const store = new Vuex.Store({
  ...,
  modules: {
  	...,
    phoneStore
  }
})
```

在组件中监听store的状态

```vue

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...,
    ...mapGetters('phoneStore', ['isOpen', 'isRecording'])
  },
  
  watch: {
    isOpen(newVal) {
      // 成功连接后的处理
    }
  }
}
</script>

```

## 发送websocket消息

```js

phone.sendMsg('mute', data)
  .then(res => {
   // 消息返回后进行处理  	
  })
  .catch(e => {
    
  })

```
