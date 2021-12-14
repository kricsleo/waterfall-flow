<script lang="ts">
import Vue, { VNode } from 'vue';
import { diffChildren, ENUM_DIRECTION, getArray, layoutEls, measureEls, MIN_MEASUREMENT } from './helpers';

const compName = 'waterfall-flow';
const compLaneClass = `${compName}__lane`;

export default Vue.extend({
  name: compName,
  inheritAttrs: false,
  props: {
    cols: {
      type: Number,
      required: false,
      default: 2
    },
    log: Boolean,
    laneClass: String,
    deviation: {
      type: Number,
      required: false,
      default: 0.4
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
      return this.$refs[compLaneClass] || [];
    },
    layout(force?: boolean) {
      const { isColsChanged, deviation, children, prevChildren, log } = this;
      log && console.time('layout costs:');
      const els = (force || isColsChanged ? children : diffChildren(children, prevChildren))
        .map(t => t.elm as HTMLElement);
      const lanes = this.getLanes();
      const isLayoutAll = els.length === children.length;
      els.length && this.checkContainer();
      layoutEls(els, lanes, { bases: isLayoutAll ? getArray(lanes.length, 0) : null, deviation });
      log && console.timeEnd('layout costs:');
    },
    checkContainer() {
      const measurement = measureEls(this.$refs[compName] as HTMLElement, ENUM_DIRECTION.horizontal);
      if(measurement > MIN_MEASUREMENT) {
        return true;
      } else {
        console.error(`[${compName}]: Container's width can't be '0' due to 'display:none' or other reason, please check your layout! And Fallback layout is used.`);
        return false;
      }
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
      { class: compName, ref: compName },
      getArray(cols, idx => h(
        'div',
        { class: [compLaneClass, this.laneClass], ref: compLaneClass, refInFor: true },
        idx === 0 ? this.children : null
      ))
    );
  }
});
</script>

<style scoped lang='scss'>
.waterfall-flow {
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
