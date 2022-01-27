<template>
  <div>app</div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
// import phoneWebsocket from "@/store/phone";
export default defineComponent({
  name: "App",
  setup() {
    onMounted(() => {
      console.log("mounted");
    });
  },
});
</script>
