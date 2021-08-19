# k-waterfall

`vue`瀑布流组件，支持不定高元素及未知高度的自动排布。

实现原理:

1. 使用传入的`item`组件属性批量手动构造生成每个子节点实例(会给每个子节点注入属性名为`item`的数据, 该数据就是`list`数据中每一项);
2. 移动实例的`$el`dom节点到第一列dom节点中批量测量高度;
3. 按照各列高度差最小的原则对每个实例进行排版算法找到实例应该被放置到的列;
4. 再次移动实例的`$el`dom节点到前一步排版后找到的归属列中,排版完成

当`cols`列数变化的时候不会重新生成子节点, 只会重新进行排版移动节点到变更后的列中

当`list`数据变化时会根据`key`做diff, 找到本次新插入的数据, 对新数据生成子节点然后进行排版;如果diff判断本次不是新增数据行为, 那么会对已生成的子节点全部销毁, 按照新数据全量重新生成并排版

当`item`组件本身变化时会销毁所有子节点, 使用新的组件重新生成所有子节点并排版

## api

|  属性名   | 类型  | 默认值 | 说明 |
|  ----  | ----  |  ----  |  ----  |
| cols | number | 2 | 列数 |
| list | Array<{<br/>  key: any;  <br />  [x: string]: any;<br/>}> | [] | 列表型数据<br />(数据最好包含key字段作为唯一索引, 在list更新的时候默认会根据key来做diff,减少不必要的重渲染; 在没有key的情况下每次更新list都会重渲染所有元素, 性能下降) |
| item | object \| VueConstructor | {} | 待渲染组件<br />(vue文件导出的对象或者vue.extend导出的vue构造函数) |

出于「Let's have fun!」的目的, 计划加入更多的hook, 可以切入瀑布流工作的各个阶段, 目前已经提供有如下(更新进度请查看`ENUM_HOOK`枚举值)

- `hookBeforeItemArrange`: 元素即将被排版时触发
- `hookAfterItemArrange`:元素排版完成后触发

## usage

```vue
// 你的组件
import Item from "./Item.vue";

<k-waterfall cols="4" :list="list" :item="Item" />
```

## demo

启动项目后可以查看本地demo


```bash
npm install
npm run server
# visit http://localhost:8080/
```

<img src="./screenshot/demo.gif" />

### 对于一种比较常见的场景

组件中包含由图片撑开的高度(或者更通用的说应该是`mounted`阶段之后有其他异步更改自己高度的行为，比如组件里面有个倒计时3s后把自己的高度改成1000px，听起来似乎很「纳尼」是吧，但是你无法排除使用组件的人会碰到千奇百怪的产品需求), 随着图片的加载完成组件高度会发生变化, 由于瀑布流是在组件`mounted`之后立即测量高度, 所以对于`mounted`之后如果组件的高度还会发生变化, 那么可能导致的情况就是初始排版是好的, 但是随着图片的加载撑开高度, 发现各列的高度差并不是最小了, 比如说"一柱擎天", 虽然在下一次插入新的数据时排版算法会尽量弥补各列的高度差, 但是同样新插入的组件高度也会异步变化, 导致下一次仍有可能出现"贫富差距"

### 如何解决?

瀑布流组件本身虽然提供了`rearrangeLastPoll`(重排最后一次批量插入的元素)和`rearrangeAll`(重排所有元素)的功能, 但是如果我们在组件异步更改了自己的高度以后进行重排, 那么用户看的情况可能是一个本来已经排布在第一列中的卡片突然飞到了第三列中来弥补高度差, 这时候用户的心理可能和看[哈利·波特](https://zh.wikipedia.org/wiki/%E5%93%88%E5%88%A9%C2%B7%E6%B3%A2%E7%89%B9)中魁地奇空中飞秋比赛一样, 卡片飞来飞去的, 这种体验比本身可能出现的各列高度差不是最小要更加糟糕, 所以并不建议异步重排（除非你为了炫技要给用户看看「洗牌」般的特效）

既然重排是不好的, 我们的目标还是要保证一个元素出现在哪一列就稳定的停留在那一列中, 那么取舍之后我们可以考虑延迟把组件渲染到屏幕上, 比如说在请求完数据之后不要立即扔给瀑布流渲染, 而是接着去请求数据中的图片的宽高信息(这里以加载图片为例, 如果是其他的异步更改高度的行为, 可以用别的方式让你的组件在渲染时就可以保证高度的稳定性), 组件中按照宽高信息使用占位元素把高度占据好, 保证不会因为一些异步行为而使得自己的高度来回变化, 用户的感觉是加载变慢了,但是加载出来的东西是很稳定的. 这个列子可以查看demo中的`waitting for img`选项, 选中时就会预加载图片获取宽高占位, 你也许不要等待所有图片的高度都获取完毕再渲染，可以获取到一个就渲染一个，这却取决于你是希望等待较久但是可以一次展示完毕还是希望少等待让元素像斗地主发牌一样一个接一个的出现；在demo中取消选中时就会不等待图片直接同步排布子节点
