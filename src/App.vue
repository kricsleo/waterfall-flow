<template>
  <div id="app">
    <div class="opt">
      cols:{{cols}}
      <input type="range" placeholder="cols" :min="1" :max="8" :value="cols" @input="cols = Number($event.target.value)" />
      waitting for img
      <input type="checkbox" :checked="async" @input="async = $event.target.checked" />
      <br />
      <button @click="reload">reload</button>
      <button @click="loadMore">loadMore</button>
      <button @click="reverseComp">change render component</button>
    </div>
    <div class="content">
      <KWaterfall class="waterfall" :cols="cols" :list="list" :item="items[0]" />
      <KWaterfall class="waterfall" :cols="cols" :list="list" :item="items[1]" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import KWaterfall from "./components/KWaterfall/index.vue";
import Item from "./components/Item.vue";
import ItemTitle from "./components/ItemTitle.vue";
import { loadItems } from "./utils/mock";
import { loadImg } from "./utils";

export default Vue.extend({
  components: {
    KWaterfall
  },
  data() {
    return {
      items: [Item, ItemTitle],
      list: [],
      cols: 4,
      async: true
    };
  },
  mounted() {
    this.loadMore();
  },
  methods: {
    reload() {
      this.list = [];
      this.loadMore()
    },
    loadMore() {
      this.async ? this.loadMoreAsync() : this.loadMoreSync();
    },
    // 非等待方式
    async loadMoreSync() {
      const newItems = await loadItems();
      this.list = [...this.list, ...newItems].map((t, i) => ({
        ...t,
        title: `${i}-${t.title}`
      }));
    },
    // 先等待图片加载拿到宽度来使得组件再mount时即为最终布局
    async loadMoreAsync() {
      let newItems = await loadItems();
      newItems = await Promise.all(newItems.map(
        t => loadImg(t.url).then(k => ({ ...t, imgWidth: k.width, imgHeight: k.height })).catch(() => t))
      )
      this.list = [...this.list, ...newItems].map((t, i) => ({
        ...t,
        title: `${i}-${t.title}`
      }));
    },
    reverseComp() {
      this.items.reverse();
    }
  }
});
</script>

<style lang="scss">
body {
  * {
    margin: 0;
    padding: 0;
  }
  background-color: #f5f5f5;
  .opt {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px;
    border-radius: 8px;
    background-color: rgba(133, 178, 119, 1);
    z-index: 2;
    button + button {
      margin-left: 5px;
    }
  }
  .content {
    display: flex;
    justify-content: space-between;
  }
  .waterfall {
    width: 45%;
    padding: 20px;
  }
}
.k-waterfall__column {
  & + & {
    margin-left: 10px;
  }
}
</style>
