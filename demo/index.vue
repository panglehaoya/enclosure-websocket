<template>
  <div>
    {{ msg }}
    <button @click="handleClick">点击</button>
    <button @click="handleClose">关闭</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { EnclosureWebSocket, eventBus } from "../src/index";

export default Vue.extend({
  name: "Index",
  data() {
    return {
      msg: "index",
    };
  },
  mounted() {
    const ws = new EnclosureWebSocket("ws://localhost:5000");
    eventBus.on("ws-open", this.handleWSOpen);
    ws.init();
    this.ws = ws;
  },
  methods: {
    handleWSOpen() {
      this.ws.sendMsg("text", { name: "name" }).then((res) => {
        console.log("handle res", res);
      });
    },
    handleClick() {
      this.ws.sendMsg("other", { other: "other" }).then((res) => {
        console.log("handle other", res);
      });
    },
    handleClose() {
      this.ws.closeWS().then((res) => {
        console.log("close ws", res);
      });
    },
  },
});
</script>
