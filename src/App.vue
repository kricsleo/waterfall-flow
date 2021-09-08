<template>
  <div id="app">
    <div class="opt">
      cols:
      <input type="range" placeholder="cols" :min="1" :max="8" :value="cols" @input="cols = Number($event.target.value)" /> {{cols}}
      <br />
      page size:
      <input type="range" placeholder="cols" :min="1" :max="10" :value="size" @input="size = Number($event.target.value)" /> {{size}}
      <br />
      waitting mode:
      <input type="checkbox" :checked="asyncMode === 'none'" @input="asyncMode = 'none'" /> none
      <input type="checkbox" :checked="asyncMode === 'batch'" @input="asyncMode = 'batch'" /> batch
      <input type="checkbox" :checked="asyncMode === 'oneByOne'" @input="asyncMode = 'oneByOne'" /> one by one
      <br />
      hook:
      <input type="checkbox" :checked="usingHook" @input="usingHook = $event.target.checked" />
      <br />
      <button @click="reload">reload</button>
      <button @click="loadMore">load more</button>
      <button @click="reverseComp">toggle render component</button>
      <button @click="shuffle">shuffle</button>
    </div>
    <div class="content">
      <KWaterfall :cols="cols">
          <component v-for="item in list" :is="items[0]" :key="item.key" :item="item" />
        </KWaterfall>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import KWaterfall from "./components/KWaterfall/index.vue";
import ItemPure from "./components/Item.vue";
import ItemFooter from "./components/ItemFooter.vue";
import { loadItems } from "./utils/mock";
import { loadImg } from "./utils";

export default Vue.extend({
  components: {
    KWaterfall,
    ItemPure,
    ItemFooter
  },
  data() {
    return {
      items: ['ItemFooter', 'ItemPure'],
      list: [],
      cols: 4,
      size: 10,
      asyncMode: 'none',
      usingHook: false
    };
  },
  mounted() {
    this.loadMore();
  },
  methods: {
    async reload() {
      const list = await loadItems(this.size);
      this.list = this.prefixTitleForDebug(list);
    },
    loadMore() {
      switch(this.asyncMode) {
        case 'none': return this.loadMoreSync();
        case 'oneByOne': return this.loadMoreAsyncOneByOne();
        case 'batch': return this.loadMoreAsyncBatch();
        default: return;
      }
    },
    // 非等待方式
    async loadMoreSync() {
      const newItems = await loadItems(this.size);
      this.list = this.prefixTitleForDebug([...this.list, ...newItems]);
    },
    // 逐个等待图片加载拿到宽度来使得组件再mount时即为最终布局
    async loadMoreAsyncOneByOne() {
      let newItems = await loadItems(this.size);
      const waitPrevs = (i, cb) => {
        if(newItems.slice(0, i - 1).some(t => t.imgWidth === undefined)) {
          setTimeout(() => waitPrevs(i, cb), 20);
        } else {
          cb();
        }
      };
      const pushItem = item => {
        this.list = this.prefixTitleForDebug([...this.list, item]);
      };
      newItems.forEach((t, i) =>
        loadImg(t.url).then(k => {
          t.imgWidth = k.width;
          t.imgHeight = k.height;
        }).catch(() => {
          t.imgWidth = 0;
          t.imgHeight = 0;
        }).finally(() => waitPrevs(i, () => pushItem(t)))
      );
    },
    // 批量等待图片加载拿到宽度来使得组件再mount时即为最终布局
    async loadMoreAsyncBatch() {
      let newItems = await loadItems(this.size);
      newItems = await Promise.all(newItems.map(
        t => loadImg(t.url).then(k => ({ ...t, imgWidth: k.width, imgHeight: k.height })).catch(() => t))
      )
      this.list = this.prefixTitleForDebug([...this.list, ...newItems]);
    },
    prefixTitleForDebug(list) {
      return list.map((t, idx) => t.title.includes('_') ? t : ({
        ...t,
        title: `${idx}_${t.title}`
      }));
    },
    reverseComp() {
      this.items.reverse();
    },
    shuffle() {
      this.list.reverse();
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
  background-color: #2d323a;
  .opt {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px;
    border-radius: 8px;
    background-color: rgba(133, 178, 119, 0.8);
    z-index: 2;
    button + button {
      margin-left: 5px;
    }
  }
}
.item-move {
  transition: all 300ms ease-in-out;
}
</style>
