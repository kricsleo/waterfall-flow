import { getArray } from "@/components/WaterfallFlow/helpers";
import { wait } from "./index";

export interface IItemData {
  url: string;
  title: string;
  username: string;
  avatar: string;
  key: string;
  imgWidth?: number;
  imgHeight?: number;
}

function getRandomImg(min = 300, random = 600): string {
  return `https://source.unsplash.com/random/${Math.floor(
    Math.random() * random + min
  )}x${Math.floor(Math.random() * random + min)}`
}

function getRandomString(min = 1, random = 20) {
  return getArray(
    Math.floor(Math.random() * 30 + 1),
    "十八号当铺"
  ).join("");
}

export async function loadItems(count = 10): Promise<IItemData[]> {
  await wait(100);
  const items: IItemData[] = getArray(count, () => {
    const key = String(Math.random() + Date.now());
    const url = getRandomImg(300, 600);
    const avatar = getRandomImg(50, 50);
    const username = getRandomString(1, 3);
    const title = getRandomString(1, 30);
    return { key, url, title, avatar, username };
  });
  return items;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length-1; i >=0; i--) {
    const randomIndex = Math.floor(Math.random()*(i+1));
    const itemAtIndex = copy[randomIndex];
    copy[randomIndex] = copy[i];
    copy[i] = itemAtIndex;
  }
  return copy;
}