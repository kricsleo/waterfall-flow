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
      <br />
      <button @click="rearrangeLastPool">rearrange last inserted</button>
      <button @click="rearrangeAll">rearrange all</button>
      <br />
      <button @click="reverseComp">toggle render component</button>
    </div>
    <div class="content">
      <KWaterfall
        ref="waterfall"
        class="waterfall"
        :cols="cols"
        :list="list"
        :item="items[0]"
        :hookBeforeItemArrange="usingHook ? hookBeforeItemArrange : null"
        :hookAfterItemArrange="usingHook ? hookAfterItemArrange : null"
        />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import KWaterfall from "./components/KWaterfall/index.vue";
import Item from "./components/Item.vue";
import ItemFooter from "./components/ItemFooter.vue";
import { loadItems } from "./utils/mock";
import { loadImg } from "./utils";
import { IPoolItem } from "./components/KWaterfall/utils";

export default Vue.extend({
  components: {
    KWaterfall
  },
  data() {
    return {
      items: [ItemFooter, Item],
      list: [],
      cols: 4,
      size: 10,
      asyncMode: 'none',
      rearrangeDeps: 0,
      usingHook: false
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
      this.list = [...this.list, ...newItems].map((t, i) => ({
        ...t,
        title: `(${i})${t.title}`
      }));
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
        this.list = [...this.list, item].map((t, i) => ({
          ...t,
          title: `(${i})${t.title}`
        }));
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
      this.list = [...this.list, ...newItems].map((t, i) => ({
        ...t,
        title: `${i}-${t.title}`
      }));
    },
    reverseComp() {
      this.items.reverse();
    },
    rearrangeLastPool() {
      this.$refs.waterfall?.rearrangeLastPool();
    },
    rearrangeAll() {
      this.$refs.waterfall?.rearrangeAll();
    },
    hookBeforeItemArrange(item: IPoolItem) {
      const el = item.vm.$el;
      const { top: prevTop, left: prevLeft } = el.getBoundingClientRect();
      console.log('top', prevTop, prevLeft)
      el.dataset.prevTop = String(prevTop);
      el.dataset.prevLeft = String(prevLeft);
    },
    hookAfterItemArrange(item: IPoolItem) {
      const el = item.vm.$el;
      const { left, top } = el.getBoundingClientRect();
       // Invert
      const deltX = Number(el.dataset.prevLeft) - left;
      const deltY = Number(el.dataset.prevTop) - top;
      const transformStyle = `translate(${deltX}px, ${deltY}px)`;
      el.style.transform = transformStyle;
      el.style.transformOrigin = 'left top';
      console.log('calling', transformStyle)
      requestAnimationFrame(() => {
        el.classList.add('tansition-flip');
        el.style.transform = '';
        el.addEventListener('transitionend', () => {
          el.classList.remove('tansition-flip');
          el.style.transformOrigin = '';
        }, { once: true });
      })
    },

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
}
.tansition-flip {
  transition: transform 1s ease-in-out;
}
.k-waterfall {
  width: 100vw;
  padding: 10px 10px 300px 10px;
  &__column {
    width: 0;
    & + & {
      margin-left: 20px;
    }
  }
}
</style>
