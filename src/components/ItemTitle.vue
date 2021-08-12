<template>
  <div class="item">
    <p class="item__title">{{ item.title }}</p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { IItem } from "./KWaterfall/utils";

export default Vue.extend({
  props: {
    item: {
      type: Object as PropType<IItem>,
      required: true,
      default: () => ({})
    }
  },
  beforeCreate() {
    // this.limitLog("beforeCreate");
    // console.log("beforeCreate", this);
  },
  created() {
    this.limitLog("created");
  },
  beforeMount() {
    this.limitLog("beforeMount");
  },
  mounted() {
    this.limitLog("mounted");
  },
  beforeUpdate() {
    this.limitLog("beforeUpdate");
  },
  updated() {
    this.limitLog("updated");
  },
  beforeDestroy() {
    this.limitLog("beforeDestroy");
  },
  destroyed() {
    this.limitLog("destroyed");
  },
  methods: {
    limitLog(msg: any) {
      console.log(msg);
    }
  }
});
</script>

<style scoped lang="scss">
.item {
  border-radius: 4px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 2%), 0 4px 8px rgb(0 0 0 / 2%);
  background-color: #fff;
  font-size: 0;
  overflow: hidden;
  & + & {
    margin-top: 10px;
  }
  &__img {
    width: 100%;
    height: auto;
  }
  &__title {
    margin: 0;
    padding: 10px 8px;
    font-size: 14px;
    line-height: 16px;
    font-weight: 700;
    color: #020403;
  }
}
</style>
