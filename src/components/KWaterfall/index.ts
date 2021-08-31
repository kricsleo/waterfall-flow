import KWaterfall from './index.vue'

// @ts-ignore
KWaterfall.install = function (Vue) {
  Vue.component(KWaterfall.name, KWaterfall)
}

export default KWaterfall