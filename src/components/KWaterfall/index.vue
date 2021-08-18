<template>
  <div ref='k-waterfall' class='k-waterfall' v-bind="$attrs" v-on="$listeners">
    <div
      v-for='(t, idx) in Array(cols).fill(null)'
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
  diffSea,
  IItem,
  checkType,
  getArray,
  ENUM_HOOK,
  ENUM_DIRECTION
} from './utils';

/**
 * 手动直接挂载dom节点到容器节点中来做子节点高度计算，
 * 计算高度之后进行排版找到每个子节点应该归属的列，
 * 排版完成之后将子节点手动移动到列中
 */
export default Vue.extend({
  name: 'k-waterfall',
  inheritAttrs: false,
  provide() {
    return {'k-waterfall': this};
  },
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
    },
    propKey: {
      type: String,
      required: false,
      default: 'key'
    },
    propInject: {
      type: String,
      required: false,
      default: 'item'
    },
    hookBeforeItemArrange: {
      type: Function,
      required: false
    },
    hookAfterItemArrange: {
      type: Function,
      required: false
    }
  },
  data() {
    return {
      pool: [] as IPoolItem[],
      sea: [] as IPoolItem[],
      lastPool: [] as IPoolItem[],
      isMounted: false
    };
  },
  watch: {
    cols() {
      this.$nextTick(() => this.rearrangeAll());
    },
    item() {
      this.destroyAll();
      this.$nextTick(() => {
        this.pool = this.list.map(t => ({ data: t }));
        this.mountPool();
      });
    },
    list() {
      // diff 新旧数据，避免历史数据的重复排版
      const { clear, pool } = diffSea(this.sea, this.list, this.propKey);
      clear && (this.pool.length || this.sea.length) && this.destroyAll();
      this.pool = pool;
      this.isMounted && this.mountPool();
    }
  },
  mounted() {
    this.isMounted = true;
    this.mountPool();
  },
  beforeDestroy() {
    this.destroyAll();
  },
  methods: {
    // 批量创建子节点实例，但是不自动挂载到页面上
    createPoolItems() {
      const ItemCos: VueConstructor = checkType(this.item, 'Function')
        ? this.item
        : Vue.extend(this.item);
      this.pool.forEach(t => (t.vm = new ItemCos({ propsData: { [this.propInject]: t.data } }).$mount()));
    },
    // 批量挂载子节点到第一列中来在 mounted 阶段计算出子节点高度
    moveItemsToHolderColumn(items: IPoolItem[]) {
      const columnIdx = 0;
      const holderColumn = this.getColumns()[columnIdx];
      // 已经处于指定列的元素不进行移动
      const frag = attachNodesToFragment(items.filter(t => t.columnIdx !== columnIdx).map(t => t.vm.$el));
      holderColumn.appendChild(frag);
      items.forEach(t => t.height = this.measureElement(t.vm.$el));
    },
    // 批量移动子节点到归属列中
    moveItemsToColumns(items: IPoolItem[], measurements: number[]) {
      const groups = arrange(items, measurements);
      const columnNodes = this.getColumns();
      groups.forEach((t, i) =>
        columnNodes[i].appendChild(attachNodesToFragment(t.map(k => {
          // 记录子节点被分配的列的索引值，后续重排时便于性能优化
          k.columnIdx = i;
          return k.vm.$el;
        })))
      );
      this.hook(items, ENUM_HOOK.hookAfterItemArrange);
    },
    // 批量排版鱼池中的新数据
    mountPool() {
      if (!this.pool.length) {
        return;
      }
      const measurements = this.getColumns().map(t => this.measureElement(t));
      this.createPoolItems();
      this.hook(this.pool, ENUM_HOOK.hookBeforeItemArrange);
      this.moveItemsToHolderColumn(this.pool);
      this.moveItemsToColumns(this.pool, measurements);
      // 记录已排版数据，并清空鱼池
      this.lastPool = [...this.pool];
      this.sea.push(...this.pool);
      this.pool = [];
    },
    // 全部重排
    rearrangeAll() {
      this.hook(this.sea, ENUM_HOOK.hookBeforeItemArrange);
      this.moveItemsToHolderColumn(this.sea);
      this.moveItemsToColumns(this.sea, getArray(this.cols, 0));
    },
    // 重排最后一次的鱼池
    rearrangeLastPool() {
      this.lastPool.forEach(t => t.height = this.measureElement(t.vm.$el));
      this.hook(this.lastPool, ENUM_HOOK.hookBeforeItemArrange);
      attachNodesToFragment(this.lastPool.map(t => t.vm.$el));
      this.moveItemsToColumns(this.lastPool, this.getColumns().map(t => this.measureElement(t)));
    },
    // 重置所有数据
    destroyAll() {
      this.pool = [];
      this.lastPool = [];
      this.sea.forEach(t => {
        t.vm.$destroy();
        t.vm.$el?.parentNode.removeChild(t.vm.$el);
      });
      this.sea = [];
    },
    getColumns(): HTMLDivElement[] {
      return this.$refs['k-waterfall__column'] || [];
    },
    hook(items: IPoolItem[], hook: ENUM_HOOK) {
      items.forEach(t => this[hook]?.(t));
    },
    measureElement(el: HTMLElement, direction: ENUM_DIRECTION = ENUM_DIRECTION.vertical): number {
      return el ? el[direction === ENUM_DIRECTION.vertical ? 'offsetHeight' : 'offsetWidth'] : 0;
    }
  }
});
</script>

<style scoped lang='scss'>
.k-waterfall {
  display: flex;
  align-items: flex-start;
  &__column {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
  }
}
</style>
