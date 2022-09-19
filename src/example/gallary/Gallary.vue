<template>
  <main>
    <section class="panel">
      <div class="slider-wrapper">
        <p>Select columns: {{cols}}</p>
        <input class="slider" type="range" v-model="cols" min="1" max="10">
      </div>
      <button class="btn" @click="load" :disabled="loading">{{loading ? 'Loading' : 'Load'}}</button>
      <button class="btn" @click="reset" :disabled="loading">{{loading ? 'Loading' : 'Reset'}}</button>
    </section>
    <WaterfallFlow :cols="Number(cols)" laneClass="lane">
      <Card v-for="item in list" :key="item.img" :item="item" />
    </WaterfallFlow>
  </main>
</template>

<script lang="ts">
  import Vue from 'vue';
  import WaterfallFlow from '../../WaterfallFlow';
  import Card from './Card.vue'

  export default Vue.extend({
    components: {
      WaterfallFlow,
      Card
    },
    data() {
      return {
        cols: 4,
        list: [],
        page: 2,
        loading: false
      }
    },
    methods: {
      async load() {
        this.list = [...this.list, ...(await this.fetchList())]
      },
      async reset() {
        this.page = 2;
        this.list = await this.fetchList()
      },
      async fetchList() {
        this.page++
        this.loading = true
        // thanks `ssyer.com` for providing data
        const data = await fetch('https://www.ssyer.com/apis/20001', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cateId: 1,
            order: 2,
            recommendType: 1,
            page: {showCount: 10, currentPage: this.page},
          })
        }).then(res => res.json())
        this.loading = false
        const list = data.data.map(t => ({
          author: t.authorName,
          avatar: t.authorHeader,
          img: t.thumbUrl
        }))
        return list;
      }
    },
    mounted() {
      this.load()
    }
  });
</script>

<style>
.panel {
  padding: 20px;
  background-color: lightblue;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  position: sticky;
  top: 0;
}

.slider-wrapper {
  text-align: center;
}

.slider {
  appearance: none;
  vertical-align: middle;
  width: 500px;
  height: 5px;
  border-radius: 25px;
  color: #161616;
  background-color: #161616;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  border-radius: 20px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  background: #fff;
}

.btn {
  box-sizing: inherit;
  display: flex;
  overflow: hidden;
  margin: 10px;
  padding: 12px 12px;
  cursor: pointer;
  user-select: none;
  transition: all 150ms linear;
  text-align: center;
  white-space: nowrap;
  text-decoration: none !important;
  text-transform: capitalize;
  border: 0 none;
  border-radius: 999rem;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  appearance: none;
  justify-content: center;
  align-items: center;
  flex: 0 0 160px;
  color: #FFFFFF;
  background: #161616;
}

.lane + .lane {
  margin-left: 15px;
}
</style>