import WaterfallFlow from './index.vue'

// @ts-ignore
WaterfallFlow.install = function (Vue) {
  Vue.component(WaterfallFlow.name, WaterfallFlow)
}

export default WaterfallFlow