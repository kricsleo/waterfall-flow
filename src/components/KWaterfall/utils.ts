import { Vue } from "vue/types/vue";

export interface IItem {
  key: any;
  [x: string]: any;
}

export enum ENUM_HOOK {
  hookBeforeItemArrange = 'hookBeforeItemArrange',
  hookAfterItemArrange = 'hookAfterItemArrange'
}

export enum ENUM_DIRECTION {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

export interface IColumn {
  height: number;
}

export interface IPoolItem {
  data: IItem;
  vm?: Vue & { $el: HTMLDivElement };
  height?: number;
  columnIdx?: number;
}

/** 检查数据类型 */
export function checkType<
  T extends
    | "String"
    | "Number"
    | "Boolean"
    | "Symbol"
    | "Undefined"
    | "Null"
    | "Function"
    | "Date"
    | "Array"
    | "RegExp"
    | "Error"
    | "Promise"
    | "Object"
>(
  obj: any,
  type: T
): obj is T extends "String"
  ? string
  : T extends "Number"
  ? number
  : T extends "Boolean"
  ? boolean
  : T extends "Symbol"
  ? symbol
  : T extends "Undefined"
  ? undefined
  : T extends "Null"
  ? null
  : T extends "Function"
  ? Function
  : T extends "Date"
  ? Date
  : T extends "Array"
  ? any[]
  : T extends "RegExp"
  ? RegExp
  : T extends "Error"
  ? Error
  : T extends "Promise"
  ? Promise<any>
  : T extends "Object"
  ? Object
  : unknown {
  const typeStr = Object.prototype.toString.call(obj);
  const sourceType = typeStr.slice(8, typeStr.length - 1);
  return sourceType === type;
}

/** 生成指定长度数组 */
export function getArray<T>(length: number, factory?: T): Array<T extends (index?: number) => infer U ? U : T> {
  const arr = Array(length).fill(undefined);
  return factory !== undefined
    ? arr.map((t, i) => (checkType(factory, "Function") ? factory(i) : factory))
    : arr;
}

/** list 数据diff， 每项的key与视图强关联，key 不同则意味着可能渲染出不同高度 item */
export function diffSea(
  sea: IPoolItem[] = [],
  list: IItem[] = [],
  key = "key"
): {
  clear: boolean;
  pool: IPoolItem[];
} {
  const pool = list.map(data => ({ data }));
  if (!sea.length || sea.length > list.length) {
    return { clear: true, pool };
  }
  // 为了性能不做深比较，只判断key(使用时确保key变化则意味着视图变化)是否一致
  let splitIdx = 0;
  while (
    sea[splitIdx] &&
    sea[splitIdx].data[key] !== undefined &&
    sea[splitIdx].data[key] === list[splitIdx][key]
  ) {
    splitIdx += 1;
  }
  return splitIdx === sea.length
    ? { clear: false, pool: pool.slice(splitIdx) }
    : { clear: true, pool };
}

/** 插入节点到 fragment 中 */
export function attachNodesToFragment(
  node: Element | Element[],
  fragment?: DocumentFragment
): DocumentFragment {
  const frag = fragment || document.createDocumentFragment();
  if (checkType(node, "Array")) {
    node.forEach(el => frag.appendChild(el));
  } else {
    frag.appendChild(node);
  }
  return frag;
}

/** 高度排版 */
export function arrange(pool: IPoolItem[], measurements: number[]): IPoolItem[][] {
  const findShortestIdx = (arr: number[]) => {
    let idx = 0;
    arr.forEach((t, i) => t < arr[idx] && (idx = i));
    return idx;
  };
  return pool.reduce((all, cur) => {
    const shortestIdx = findShortestIdx(measurements);
    measurements[shortestIdx] += cur.height || 0;
    all[shortestIdx].push(cur);
    return all;
  }, getArray(measurements.length, () => [] as IPoolItem[]));
}
