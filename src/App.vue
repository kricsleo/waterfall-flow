<template>
  <Gallary />
</template>

<script lang="ts">
import Vue from "vue";
import Gallary from "./example/gallary/Gallary.vue";

export default Vue.extend({
  components: {
    Gallary
  },
});
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}
body {
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Segoe UI,Arial,Roboto,'PingFang SC',miui,'Hiragino Sans GB','Microsoft Yahei',sans-serif;
  background-color: #2d323a;
}
</style>
