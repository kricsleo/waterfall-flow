<template>
  <div ref='k-waterfall' class='k-waterfall' v-bind="$attrs" v-on="$listeners">
    <div
      v-for='(column, idx) in columns'
      ref='k-waterfall__column'
      :key='idx'
      class='k-waterfall__column'
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import {
  attachNodesToFragment,
  arrange,
  IPoolItem,
  getDefaultColumns,
  diffSea,
  IItem,
  checkType
} from './utils';

/**
 * 手动直接挂载dom节点到容器节点中来做子节点高度计算，
 * 计算高度之后进行排版找到每个子节点应该归属的列，
 * 排版完成之后将子节点手动移动到列中
 */
export default Vue.extend({
  name: 'k-waterfall',
  inheritAttrs: false,
  props: {
    list: {
      type: Array as PropType<IItem[]>,
      required: true,
      validator: (list: IItem[]) => {
        list.forEach(
          t => t.key === undefined && console.warn('missing prop [key], this may cause unnecessary render',t)
        );
        return true;
      },
      default: () => [] as PropType<IItem[]>
    },
    cols: {
      type: Number,
      required: false,
      validator: (v: number) =>{
        if(v < 1) {
          console.warn('cols must be larger than 1', v);
          return false;
        }
        return true;
      },
      default: 2
    },
    item: {
      type: [Object, Function],
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      columns: getDefaultColumns(this.cols),
      pool: [] as IPoolItem[],
      sea: [] as IPoolItem[],
      isMounted: false
    };
  },
  watch: {
    cols() {
      this.columns = getDefaultColumns(this.cols);
      this.$nextTick(() => this.rearrangeAll());
    },
    item() {
      this.reset();
      this.$nextTick(() => {
        this.pool = this.list.map(t => ({ data: t}));
        this.mountPool();
      });
    },
    list() {
      // diff 新旧数据，避免历史数据的重复排版
      const { clear, pool } = diffSea(this.sea, this.list);
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
    // 创建子节点实例，但是不自动挂载到页面上
    createPoolItems() {
      const ItemCos: VueConstructor = checkType(this.item, 'Function')
        ? this.item
        : Vue.extend(this.item);
      console.log('this.pool', this.pool)
      this.pool.forEach(t => (t.vm = new ItemCos({ propsData: { item: t.data } }).$mount()));
    },
    // 挂载子节点到隐藏容器中来提前计算出子节点高度
    moveItemsToHolderColumn(items: IPoolItem[]) {
      const holderColumn = (this.$refs['k-waterfall__column'] as HTMLDivElement[])[0]
      const frag = attachNodesToFragment(items.map(t => t.vm.$el));
      holderColumn.appendChild(frag);
    },
    // 移动子节点到列中
    moveItemsToColumns(items: IPoolItem[]) {
      items.forEach(t => t.height = (t.vm.$el as HTMLElement)?.offsetHeight);
      // 高度排版找到每个子节点归属的列
      const groups = arrange(this.columns, items);
      const columnNodes = this.$refs['k-waterfall__column'] as HTMLDivElement[];
      groups.forEach((t, i) =>
        columnNodes[i].appendChild(attachNodesToFragment(t.map(k => k.vm.$el)))
      );
    },
    mountPool() {
      if (!this.pool.length) {
        return;
      }
      // 计算当前每个column的高度
      this.$refs['k-waterfall__column'].forEach(
        (t: HTMLDivElement, idx) => (this.columns[idx].height = t.offsetHeight)
      );
      this.createPoolItems();
      this.moveItemsToHolderColumn(this.pool);
      this.moveItemsToColumns(this.pool);
      // 记录已排版数据，并清空鱼池
      this.sea.push(...this.pool);
      this.pool = [];
    },
    // 重置所有数据
    reset() {
      this.columns = getDefaultColumns(this.cols);
      this.pool = [];
      this.sea.forEach(t => {
        t.vm.$destroy();
        t.vm.$el?.parentNode.removeChild(t.vm.$el);
      });
      this.sea = [];
    },
    // 所有子节点重新排布
    rearrangeAll() {
      this.moveItemsToHolderColumn(this.sea);
      this.moveItemsToColumns(this.sea);
    },
  }
});
</script>

<style scoped lang='scss'>
.k-waterfall {
  display: flex;
  align-items: flex-start;
  &__column {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
