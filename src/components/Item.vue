<template>
  <div class="item">
    <div class="item__img-wrapper" :style="{ paddingTop: `${imgRatio * 100}%` }">
      <img :class="['item__img', { 'item__img--absolute': imgRatio }]" :src="item.url" />
    </div>
    <p class="item__title">{{ item.title }}</p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { IItemData } from "../utils/mock";

export default Vue.extend({
  props: {
    item: {
      type: Object as PropType<IItemData>,
      required: true,
      default: () => ({})
    }
  },
  computed: {
    imgRatio(): number {
      const { imgWidth, imgHeight } = this.item;
      return imgWidth && imgHeight ? imgHeight / imgWidth : 0;
    }
  },
  beforeCreate() {
    console.log("beforeCreate");
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
  &__img-wrapper {
    position: relative;
    background-color: #85b277;
  }
  &__img {
    width: 100%;
    height: auto;
    &--absolute {
      position: absolute;
      top: 0;
      left: 0;
    }
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
