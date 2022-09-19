<template>
  <section class="card">
    <img class="cover" :src="item.img" :height="`${randamHeight}px`" />
    <div class="copyright">
      <img :src="item.avatar" class="avatar" />
      <span class="author">{{item.author}}</span>
    </div>
  </section>
</template>

<script lang="ts">
  import Vue, { PropType } from 'vue';

  export default Vue.extend({
    props: {
      item: Object as PropType<{
        img: string
        avatar: string
        author: string
      }>
    },
    data() {
      return {
        randamHeight: Math.floor(20 + Math.random() * 100)
      }
    }
  });
</script>

<style scoped>
.card {
  border-radius: 4px;
  background: #eee;
  overflow: hidden;
}
.card + .card {
  margin-top: 15px;
}
.cover {
  width: 100%;
  object-fit: cover;
}
.copyright {
  display: flex;
  align-items: center;
  padding: 5px;
}
.avatar {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}
.author {
  margin-left: 5px;
  color: #16162e;
}
</style>