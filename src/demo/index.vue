<template>
  <div>
    {{ msg }}
    <ul></ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Index",
  data() {
    return {
      msg: "index",
    };
  },
  mounted() {
    console.log("mounted");
  },
});
</script>
