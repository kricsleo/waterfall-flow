# waterfall-flow

`vue`瀑布流组件，支持不定高及未知高度元素的自动排布。

瀑布流基本形式和要求:

1. 多列;
2. 子项按数据顺序稳定排布在各列中;
3. 子项在各列尽可能均匀分布,即最高列与最低列之间高度差最小;

## usage

```bash
# npm install @kricsleo/waterfall-flow
yarn add @kricsleo/waterfall-flow
```

```typescript
// style goes here, I provide the minium style (very few) to make it work,
// you are likely to DIY the style yourself.
import '@kricsleo/waterfall-flow/dist/WaterfallFlow.css';
```

```vue
<waterfall-flow :cols="2">
  <your-comp v-for="item in list" :key="item.key" />
</waterfall-flow>

<waterfall-flow :cols="2">
  <comp-a />
  <comp-b />
  <comp-c />
  ...
</waterfall-flow>
```

## api

| 属性名 | 类型   | 默认值 | 说明 |
| ------ | ------ | ------ | ---- |
| cols   | number | 2      | 列数 |

默认会根据`cols`和子元素的变化进行自动的diff和重排, 如果在某些特殊场景下你想要手动触发重排, 也为你提供了逃生舱, 直接调用实例上的`layout(true)`方法, 例如`this.$refs.waterfall.layout(true)`, 这将会对所有元素进行一次强制重排.

## demo

启动项目后可以查看本地demo


```bash
npm install
npm run server
# visit http://localhost:8080/
```

<img src="./screenshot/demo.gif" />

## Q&A



### 对于一种比较常见的场景

组件中包含由图片撑开的高度(或者更通用的说应该是`mounted`阶段之后有其他异步更改自己高度的行为，比如组件里面有个倒计时3s后把自己的高度改成1000px，听起来似乎很「纳尼」是吧，但是你无法排除使用组件的人会碰到千奇百怪的产品需求), 随着图片的加载完成组件高度会发生变化, 由于瀑布流是在组件`mounted`之后立即测量高度, 所以对于`mounted`之后如果组件的高度还会发生变化, 那么可能导致的情况就是初始排版是好的, 但是随着图片的加载撑开高度, 发现各列的高度差并不是最小了, 比如说"一柱擎天", 虽然在下一次插入新的数据时排版算法会尽量弥补各列的高度差, 但是同样新插入的组件高度也会异步变化, 导致下一次仍有可能出现"贫富差距"

### 如何解决?

当我们在组件异步更改了自己的高度以后进行瀑布流的重排(比如你可以给瀑布流组件一个新的`key`来触发组件的重新渲染或者调用实例上的`layout(true)`来强制重排), 那么用户看的情况可能是一个本来已经排布在第一列中的卡片突然飞到了第三列中来弥补高度差, 这时候用户的心理可能和看[哈利·波特](https://zh.wikipedia.org/wiki/%E5%93%88%E5%88%A9%C2%B7%E6%B3%A2%E7%89%B9)中魁地奇空中飞秋比赛一样, 卡片飞来飞去的, 这种体验比本身可能出现的各列高度差不是最小要更加糟糕, 所以并不建议异步重排（除非你为了炫技要给用户看看「洗牌」般的特效）

既然重排是不好的, 我们的目标还是要保证一个元素出现在哪一列就稳定的停留在那一列中, 那么取舍之后我们可以考虑延迟把组件渲染到屏幕上, 比如说在请求完数据之后不要立即扔给瀑布流渲染, 而是接着去请求数据中的图片的宽高信息(这里以加载图片为例, 如果是其他的异步更改高度的行为, 可以用别的方式让你的组件在渲染时就可以保证高度的稳定性), 组件中按照宽高信息使用占位元素把高度占据好, 保证不会因为一些异步行为而使得自己的高度来回变化, 用户的感觉是加载变慢了,但是加载出来的东西是很稳定的. 这个列子可以查看demo中的`waitting mode`的实现, 选中时就会预加载图片获取宽高占位, 你也许不要等待所有图片的高度都获取完毕再渲染，可以获取到一个就渲染一个，这却取决于你是希望等待较久但是可以一次展示完毕还是希望少等待让元素像斗地主发牌一样一个接一个的出现；在demo中取消选中时就会不等待图片直接同步排布子节点

在项目中附上的demo只是给你提供的几种解决组件高度异步改变的思路, 也许你会有自己更好的想法或者基础这个底层瀑布流组件封装出针对一些特定场景的瀑布流组件, 比如一个针对图文混排的瀑布流或者whatever.
