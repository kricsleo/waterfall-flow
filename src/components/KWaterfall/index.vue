<script lang="ts">
import Vue, { PropType, VNode, VNodeComponentOptions } from 'vue';
import { diffChildren, getArray, layoutEls } from './helpers';

const compName = 'k-waterfall';
const laneClass = `${compName}__lane`;
const laneNodeType = 'div';

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
    const toLayoutItems = diffChildren(this.children, this.prevChildren).map(t => t.elm);
    toLayoutItems.length && this.layout(toLayoutItems);
  },
  methods: {
    getLanes(): HTMLElement[] {
      return this.$refs[laneClass] || [];
    },
    getItems(): HTMLElement[] {
      return (this.children || []).map(t => t.elm);
    },
    layout(items?: HTMLElement[]) {
      const lanes = this.getLanes();
      layoutEls(items || this.getItems(), lanes, getArray(lanes.length, 0));
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
