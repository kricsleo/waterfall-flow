import { VNode } from "vue/types/umd";

/** waterfall direction */
export enum ENUM_DIRECTION {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

/** check param type */
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
  obj: unknown,
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
  ? unknown[]
  : T extends "RegExp"
  ? RegExp
  : T extends "Error"
  ? Error
  : T extends "Promise"
  ? Promise<unknown>
  : T extends "Object"
  ? Object
  : unknown {
  const typeStr = Object.prototype.toString.call(obj);
  const sourceType = typeStr.slice(8, typeStr.length - 1);
  return sourceType === type;
}

/** generate array in specified length */
export function getArray<T>(length: number, factory?: T): Array<T extends (index?: number) => infer U ? U : T> {
  const arr = Array(Math.max(length, 0)).fill(undefined);
  return factory !== undefined
    ? arr.map((t, i) => (checkType(factory, "Function") ? factory(i) : factory))
    : arr;
}

/** attach element(s) to fragment */
export function attachElsToFragment(
  els: HTMLElement | HTMLElement[],
  fragment?: DocumentFragment
): DocumentFragment {
  const frag = fragment || document.createDocumentFragment();
  if (checkType(els, "Array")) {
    els.forEach(el => el && frag.appendChild(el));
  } else {
    els && frag.appendChild(els);
  }
  return frag;
}

/** find the index of the smallest item */
export function findSmallestIdx(arr: number[]): number {
  let idx = 0;
  arr.forEach((t, i) => t < arr[idx] && (idx = i));
  return idx;
}

/** measure element(s) */
export function measureEls(Els: HTMLElement[], direction?: ENUM_DIRECTION): number[];
export function measureEls(Els: HTMLElement, direction?: ENUM_DIRECTION): number;
export function measureEls(els: HTMLElement | HTMLElement[], direction = ENUM_DIRECTION.vertical): number | number[] {
  const measure = (el: HTMLElement): number =>
    el?.getBoundingClientRect?.()[direction === ENUM_DIRECTION.vertical ? 'height' : 'width'] || 0;
  return checkType(els, 'Array') ? els.map(t => measure(t)) : measure(els);
}

/** layout elements */
export function layoutEls(els: HTMLElement[], targets: HTMLElement[], bases?: number[]): void {
  if(!els?.length || !targets?.length) {
    return;
  }
  const notInsertedEls = els.filter(t => !document.body.contains(t));
  notInsertedEls.length && targets[0].appendChild(attachElsToFragment(notInsertedEls));
  const measurements = measureEls(els);
  const targetBases = bases || (attachElsToFragment(els) && measureEls(targets));
  const groups = els.reduce((all, cur, idx) => {
    const smallestIdx = findSmallestIdx(targetBases);
    targetBases[smallestIdx] += measurements[idx];
    all[smallestIdx].push(cur);
    return all;
  }, getArray(targets.length, () => [] as HTMLElement[]));
  groups.forEach((t, idx) => targets[idx].appendChild(attachElsToFragment(t)));
}

/** diff children to find the part which will be re-layout, using conservative strategy */
export function diffChildren(children: VNode[] = [], prevChildren: VNode[] = []): VNode[] {
  const prevLength = prevChildren.length;
  if(!prevLength || prevLength > children.length) {
    return children;
  }
  let startIdx = 0;
  while (prevChildren[startIdx] && prevChildren[startIdx].elm === children[startIdx].elm) {
    startIdx += 1;
  }
  return startIdx === prevLength ? children.slice(startIdx) : children;
  // let splitIdx = 0;
  // const length = children.length;
  // children.some((t, i) => {
  //   const prevChild = prevChildren[i];
  //   if(!prevChild || t.elm !== prevChild.elm) {
  //     splitIdx = i;
  //     return true;
  //   } else if(i === length - 1 && t.elm === prevChild.elm) {
  //     splitIdx = length;
  //     return true;
  //   }
  //   return false;
  // });
  // return children.slice(splitIdx, length);
}
