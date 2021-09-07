<script lang="ts">
import Vue, { PropType, VNode } from 'vue';
import { getArray, layoutEls } from './helpers';

const compName = 'k-waterfall';
const laneClass = `${compName}__lane`;
const laneNodeType = 'div';

export default Vue.extend({
  name: compName,
  inheritAttrs: false,
  props: {
    list: {
      type: Array as PropType<unknown[]>,
      required: true,
      default: () => []
    },
    cols: {
      type: Number,
      required: false,
      default: 2
    },
    transitionProps: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  render(h): VNode {
    const { $scopedSlots, list, cols, transitionProps } = this;
    const layoutItems: HTMLElement[] = [];
    let toProcessCount = 0;
    const laneCommonProps = { class: laneClass, ref: laneClass, refInFor: true };

    const getLanes = (): HTMLElement[] => (this.$refs[laneClass] || []).map(t => t.$el || t);

    const holderLane = h(
      'transition-group',
      {
        key: 'holderLane',
        ...laneCommonProps,
        props: { css: false, appear: true, tag: laneNodeType, ...transitionProps },
        on: {
          // record elements to be layout
          beforeEnter: () => toProcessCount++,
          // batch layout in the end
          enter: (el) => {
            layoutItems.push(el);
            layoutItems.length === toProcessCount && layoutEls(layoutItems, getLanes())
          }
        }
    }, list.map((item, index) =>  $scopedSlots.default({item, index})));

    return h(
      'div',
      // let the 'cols' be the default key,
      // so that all items will be regenerated when 'cols' changes
      { class: compName, key: cols },
      [holderLane, ...getArray(cols - 1, idx => h(laneNodeType, { key: idx, ...laneCommonProps }))]
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
