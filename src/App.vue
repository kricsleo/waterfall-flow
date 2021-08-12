<template>
  <div id="app">
    <div class="opt">
      <button @click="reload">reload</button>
      <button @click="loadMore">loadMore</button>
    </div>
    <div class="content">
      <KWaterfall class="waterfall" :cols="4" :list="list" :item="item" />
      <KWaterfall class="waterfall" :cols="4" :list="list" :item="itemTitle" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-property-decorator";
import KWaterfall from "./components/KWaterfall/index.vue";
import Item from "./components/Item.vue";
import ItemTitle from "./components/ItemTitle.vue";
import { loadItems } from "./utils/mock";

export default Vue.extend({
  components: {
    KWaterfall
  },
  data() {
    return {
      item: Item,
      itemTitle: ItemTitle,
      list: []
    };
  },
  mounted() {
    this.loadMore();
  },
  methods: {
    reload() {
      this.list = [];
      this.$nextTick(() => this.loadMore());
    },
    async loadMore() {
      const newItems = await loadItems();
      console.log("this.list", this.list.length);
      this.list = [...this.list, ...newItems].map((t, i) => ({
        ...t,
        title: `${i}-${t.title}`
      }));
    }
  }
});
</script>

<style lang="scss">
body {
  background-color: #f5f5f5;
  .opt {
    position: fixed;
    top: 20px;
    right: 20px;
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
