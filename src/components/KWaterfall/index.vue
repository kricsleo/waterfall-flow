<template>
  <div ref="k-waterfall" class="k-waterfall">
    <div
      v-for="(column, idx) in columns"
      ref="k-waterfall__column"
      :key="idx"
      class="k-waterfall__column"
    />
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import {
  attachNodesToFragment,
  arrange,
  IPoolItem,
  IColumn,
  getDefaultColumns,
  diffSea,
  IItem,
  checkType,
  createHolderNode
} from "./utils";

// TODO: 验证各种边界情况
// 不支持nuxt-link？
export default Vue.extend({
  name: "k-waterfall",
  props: {
    list: {
      type: Array,
      required: true,
      default: () => []
    },
    cols: {
      type: Number,
      required: false,
      default: 2
    },
    item: {
      type: [Object, Function],
      required: true,
      default: () => ({})
    }
  },
  data(): {
    columns: IColumn[];
    pool: IPoolItem[];
    sea: IPoolItem[];
    isMounted: boolean;
  } {
    return {
      columns: getDefaultColumns(this.cols),
      pool: [],
      sea: [],
      isMounted: false
    };
  },
  watch: {
    cols() {
      this.reset();
    },
    item() {
      this.reset();
    },
    list() {
      // diff 新旧数据，避免历史数据的重复排版
      const { clear, pool } = diffSea(this.sea, this.list as IItem[]);
      clear && (this.pool.length || this.sea.length) && this.reset();
      this.pool = pool;
      this.isMounted && this.mountPool();
    }
  },
  mounted() {
    this.isMounted = true;
    this.mountPool();
  },
  methods: {
    mountPool() {
      // 手动直接挂载dom节点方式渲染所有子节点到一个视觉不可见的容器节点中来做子节点高度计算，
      // 计算高度之后进行排版找到每个子节点应该归属的列
      // 排版完成之后将子节点手动移动到列中
      // 最后使用Vue的$mount(el)来触发子节点完整的生命周期，保证子节点工作正常
      if (!this.pool.length) {
        return;
      }

      // 计算当前每个column的高度
      const columnNodes = this.$refs["k-waterfall__column"] as HTMLDivElement[];
      columnNodes.forEach(
        (t, idx) => (this.columns[idx].height = t.offsetHeight)
      );

      // 创建子节点实例，但是不自动挂载到页面上
      const ItemCos: VueConstructor = checkType(this.item, "Function")
        ? this.item
        : Vue.extend(this.item);
      console.log("--- to $mount() pool", this.pool.length);
      this.pool.forEach(
        t => (t.vm = new ItemCos({ propsData: { item: t.data } }).$mount())
      );
      console.log("--- $mount() pool end");

      // 手动挂载子节点到隐藏容器中来提前计算出子节点高度
      const frag = attachNodesToFragment(
        this.pool.map(t => t.vm.$el as Element)
      );
      const holderNode = createHolderNode(columnNodes[0]);
      holderNode.appendChild(frag);
      this.pool.forEach(t => {
        t.height = t.vm.$el?.offsetHeight;
      });

      // 高度排版找到每个子节点归属的列
      arrange(this.columns, this.pool);

      // 移动子节点到列中，并使用vue的$mount触发子节点完整的生命周期
      console.log("--- to $mount(el) pool", this.pool.length);
      this.pool.forEach(t => {
        columnNodes[t.columnIdx].appendChild(t.vm.$el as Element);
      });
      console.log("--- pool $mount(el) end");

      // 记录已排版数据，并销毁隐藏容器 & 清空鱼池
      holderNode.parentNode.removeChild(holderNode);
      this.sea.push(...this.pool);
      this.pool = [];
    },
    reset() {
      this.columns = getDefaultColumns(this.cols);
      this.pool = [];
      // 销毁所有已排版的子节点
      console.log("--- to $destroy() sea", this.sea.length);
      this.sea.forEach(t => {
        t.vm.$destroy();
        t.vm?.$el?.remove();
      });
      console.log("--- sea $destroy() end");
      this.sea = [];
    }
  }
});
</script>

<style scoped lang="scss">
.k-waterfall {
  display: flex;
  align-items: flex-start;
  &__column {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
  }

  &__holder {
    height: 0;
    overflow: auto;
  }
}
</style>
