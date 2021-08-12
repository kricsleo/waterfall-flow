import { Vue } from "vue/types/vue";

export interface IItem {
  id: string;
  [x: string]: any;
}

export interface IColumn {
  height: number;
}

export interface IPoolItem {
  data: IItem;
  vm?: Vue;
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

/** 生成初始默认columns */
export function getDefaultColumns(cols: number): IColumn[] {
  return new Array(cols).fill(null).map(() => ({ height: 0 }));
}

/** list 数据diff， 每项的key与视图强关联，key 不同则意味着可能渲染出不同高度 item */
export function diffSea(
  sea: IPoolItem[] = [],
  list: IItem[] = [],
  key = "id"
): {
  clear: boolean;
  pool: IPoolItem[];
} {
  const pool = list.map(data => ({ data }));
  if (!sea.length || sea.length > list.length) {
    return {
      clear: true,
      pool
    };
  }
  // 为了性能不做深比较，只判断key(使用时确保key变化则意味着视图变化)是否一致
  let splitIdx = 0;
  while (sea[splitIdx] && sea[splitIdx].data[key] === list[splitIdx][key]) {
    splitIdx += 1;
  }
  return splitIdx === sea.length
    ? {
        clear: false,
        pool: pool.slice(splitIdx)
      }
    : {
        clear: true,
        pool
      };
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

/** 创建并插入占位元素 */
export function createHolderNode(targetNode: Element): HTMLDivElement {
  if (!targetNode) {
    return;
  }
  const holderNode = document.createElement("div");
  holderNode.style.height = 0;
  holderNode.style.overflow = "auto";
  targetNode.appendChild(holderNode);
  return holderNode;
}

/** 高度排版 */
export function arrange(columns: IColumn[], pool: IPoolItem[]): void {
  const heights = columns.map(t => t.height);
  const findShortestIdx = (arr: number[]) => {
    let idx = 0;
    arr.forEach((t, i) => t < arr[idx] && (idx = i));
    return idx;
  };
  pool.forEach(t => {
    const shortestIdx = findShortestIdx(heights);
    heights[shortestIdx] += t.height || 0;
    t.columnIdx = shortestIdx;
  });
}
