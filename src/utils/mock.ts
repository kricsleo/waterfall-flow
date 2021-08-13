import { getArray } from "@/components/KWaterfall/utils";
import { wait } from "./index";

export interface IItemData {
  url: string;
  title: string;
  key: string;
  imgWidth?: number;
  imgHeight?: number;
}

export async function loadItems(count = 10): Promise<IItemData[]> {
  await wait(500);
  const items: IItemData[] = getArray(count, () => {
    const key = String(Math.random() + Date.now());
    const url = `https://source.unsplash.com/random/${Math.floor(
      Math.random() * 600 + 300
    )}x${Math.floor(Math.random() * 600 + 300)}`;
    const title = getArray(
      Math.floor(Math.random() * 30 + 1),
      "十八号当铺"
    ).join("");
    return { url, title, key };
  });
  return items;
}
