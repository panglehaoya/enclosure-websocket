## 安装

```bash
yarn add enclosure-websocket
```

## 在vue中使用

```vue

<script>
import { EnclosureWebSocket, eventBus } from "enclosure-websocket";

export default {
  data() {
    return {
      ws: new EnclosureWebSocket('ws://', 5, 'ping')
    }
  },
  mounted() {
    eventBus.on('ws-open', this.handleWSOpen)
    this.ws.init()
  },
  methods: {
    handleWSOpen() {
      // do something  
    }
  }
}
</script>

```

## 发送websocket消息

```js

ws.sendMsg('mute', data)
  .then(res => {
   // 消息返回后进行处理  	
  })
  .catch(e => {
    
  })

```
