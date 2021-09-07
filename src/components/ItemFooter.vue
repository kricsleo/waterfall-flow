<template>
  <div class="item-footer">
    <div class="item-footer__user">
      <img class="item-footer__avatar" :src="item.avatar" />
      <p class="item-footer__username">{{item.username}}</p>
    </div>
    <p class="item-footer__title">{{ item.title }}</p>
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
    // console.log('item this.$router', this.$router);
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
    limitLog(msg: string) {
      console.log(msg);
    }
  }
});
</script>

<style scoped lang="scss">
.item-footer {
  border-radius: 4px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 2%), 0 4px 8px rgb(0 0 0 / 2%);
  background-color: #fff;
  font-size: 0;
  overflow: hidden;
  padding: 10px;
  margin: 0 10px;
  & + & {
    margin-top: 10px;
  }
  &__user {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  &__username {
    flex-grow: 1;
    margin-left: 5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 13px;
    color: #8d8d8d;
  }
  &__avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  &__title {
    font-size: 14px;
    line-height: 16px;
    font-weight: 700;
    color: #333;
  }
}
</style>
