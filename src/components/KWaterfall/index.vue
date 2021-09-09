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
  watch: {
    cols() {
      this.isColsChanged = true;
    }
  },
  mounted() {
    this.layout(true);
  },
  updated() {
    this.layout(this.isColsChanged);
    this.isColsChanged = false;
  },
  methods: {
    getLanes(): HTMLElement[] {
      return this.$refs[laneClass] || [];
    },
    layout(force = false) {
      const els = (force ? this.children : diffChildren(this.children, this.prevChildren))
        .map(t => t.elm as HTMLElement);
      const lanes = this.getLanes();
      const isLayoutAll = els.length === this.children.length;
      layoutEls(els, lanes, isLayoutAll ? getArray(lanes.length, 0) : null);
    }
  },
  render(h): VNode {
    const { $scopedSlots, cols } = this;
    this.prevChildren = this.children;
    this.children = ($scopedSlots.default?.() || [])
      .filter(t => t.tag && t.key && String(t.key).indexOf('__vlist') !== 0);

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
