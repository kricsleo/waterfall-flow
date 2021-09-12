<template>
  <div id="app">
    <div class="opt">
      cols:
      <input type="range" :min="1" :max="10" v-model="cols" /> {{cols}}
      <br />
      page size:
      <input type="range" :min="1" :max="10" v-model="size" /> {{size}}
      <br />
      component type:
      <input type="radio" id="sync" name="compType" :checked="comps[0] === 'SyncItem'" @change="reverseComp" /> <label for="none">sync</label>&nbsp;
      <input type="radio" id="async" name="compType" :checked="comps[0] === 'AsyncItem'" @change="reverseComp" /> <label for="flow">async</label>&nbsp;
      <br />
      waitting mode:
      <input type="radio" id="none" name="asyncMode" :checked="asyncMode === 'none'" @change="asyncMode = 'none'" /> <label for="none">none</label>&nbsp;
      <input type="radio" id="flow" name="asyncMode" :checked="asyncMode === 'flow'" @change="asyncMode = 'flow'" /> <label for="flow">flow</label>&nbsp;
      <input type="radio" id="batch" name="asyncMode" :checked="asyncMode === 'batch'" @change="asyncMode = 'batch'" /> <label for="batch">batch</label>
      <br />
      <button @click="reload">reload</button>
      <button @click="loadMore">load more</button>
      <button @click="reverse">reverse</button>
      <button @click="layout">layout</button>
    </div>
    <div class="content">
      <waterfall-flow class="waterfall" ref="waterfall" :cols="Number(cols)">
        <transition name="waterfall-item" appear v-for="item in list" :key="item.key">
          <component class="waterfall-item" :is="comps[0]" :item="item" :key="item.key" />
        </transition>
      </waterfall-flow>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import WaterfallFlow from "./components/WaterfallFlow/index.vue";
import AsyncItem from "./components/Item.vue";
import SyncItem from "./components/ItemFooter.vue";
import { loadItems } from "./utils/mock";
import { loadImg } from "./utils";

export default Vue.extend({
  components: {
    WaterfallFlow,
    AsyncItem,
    SyncItem
  },
  data() {
    return {
      list: [],
      cols: 4,
      size: 10,
      asyncMode: 'none',
      comps: ['SyncItem', 'AsyncItem']
    };
  },
  mounted() {
    this.loadMore();
  },
  methods: {
    async reload() {
      this.list = [];
      this.loadMore();
    },
    loadMore() {
      switch(this.asyncMode) {
        case 'none': return this.loadMoreSync();
        case 'flow': return this.loadMoreAsyncFlow();
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
    async loadMoreAsyncFlow() {
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
      this.comps.reverse();
    },
    reverse() {
      this.list.reverse();
    },
    layout() {
      this.$refs.waterfall.layout(true);
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
.waterfall-item {
  &-enter-active {
    transition: all 300ms ease-out;
  }
  &-enter {
    opacity: 0.3;
    transform: translateY(10px);
  }
  &-leave-active {
    display: none;
  }
}
</style>
