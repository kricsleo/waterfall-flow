<script lang="ts">
import Vue, { VNode } from 'vue';
import { diffChildren, getArray, layoutEls } from './helpers';

const compName = 'k-waterfall';
const laneClass = `${compName}__lane`;

export default Vue.extend({
  name: compName,
  inheritAttrs: false,
  props: {
    cols: {
      type: Number,
      required: false,
      default: 2
    }
  },
  mounted() {
    this.layout();
  },
  updated() {
    this.layout();
  },
  methods: {
    getLanes(): HTMLElement[] {
      return this.$refs[laneClass] || [];
    },
    layout(force = false) {
      console.time('layout costs:');
      const els = (force || this.isColsChanged ? this.children : diffChildren(this.children, this.prevChildren))
        .map(t => t.elm as HTMLElement);
      const lanes = this.getLanes();
      const isLayoutAll = els.length === this.children.length;
      layoutEls(els, lanes, isLayoutAll ? getArray(lanes.length, 0) : null);
      console.timeEnd('layout costs:');
    }
  },
  render(h): VNode {
    const { $scopedSlots, cols } = this;
    this.prevChildren = this.children;
    this.children = $scopedSlots.default?.() || [];
    this.isColsChanged = this.prevCols !== cols;
    this.prevCols = cols;

    return h(
      'div',
      { class: compName },
      getArray(cols, idx => h(
        'div',
        { class: laneClass, ref: laneClass, refInFor: true },
        idx === 0 ? this.children : null
      ))
    );
  }
});
</script>

<style scoped lang='scss'>
.k-waterfall {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  &__lane {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
    width: 0;
  }
}
</style>
