# Waterfall component for Vue 2

<p align="center">
  <a href="https://stackblitz.com/edit/vue2-vue-cli-dcukzb" target="_blank">
    <img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" />
  </a>
</p>

<p align="center">
  <img src="screenshot/preview.gif" />
</p>

## Features

- Support Vue 2
- Support dynamic and unlimited columns
- Support different kinds of children within the same waterfall
- Auto layout without specifying width or height of children
- Using natural document flow which is more reliable than the most common `absolute` layout

## Getting Started

### Install

```bash
# npm install @kricsleo/waterfall-flow
yarn add @kricsleo/waterfall-flow
```

### Import Style
```typescript
// style goes here, I provide the minium style (very few) to make it work,
// you can DIY the style yourself.
import '@kricsleo/waterfall-flow/dist/WaterfallFlow.css';
```

### Usage
```vue
<waterfall-flow>
  <your-comp v-for="item in list" :key="item.key" />
</waterfall-flow>

<waterfall-flow :cols="2">
  <your-comp-a />
  <your-comp-b />
  <your-comp-c />
  ...
</waterfall-flow>
```

## API

| Option    | Type   | Required | Default | Description                 |
|-----------|--------|----------|---------|-----------------------------|
| cols      | number | false    | 2       | Number of columns.          |
| deviation | number | false    | 1       | Deviation in pixel.         |
| laneClass | string | false    | -       | Class name for each column. |

## Escape Pod

In case you want to rearrange all items yourself, you can call `layout(true)` by the waterfall-flow instance, like `this.$refs.waterfall.layout(true)`, then all items will be re-layout.
