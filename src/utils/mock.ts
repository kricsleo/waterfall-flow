import { wait } from "./index";

export interface IItem {
  url: string;
  title: string;
  id: string;
}

export async function loadItems(count = 10): Promise<IItem[]> {
  await wait(1000);
  const items: IItem[] = new Array(count).fill(null).map(() => {
    const id = String(Math.random() + Date.now());
    const url = `https://source.unsplash.com/random/${Math.floor(
      Math.random() * 600 + 300
    )}x${Math.floor(Math.random() * 600 + 300)}`;
    const title = new Array(Math.floor(Math.random() * 30 + 1))
      .fill("十八号当铺")
      .join("");
    return { url, title, id };
  });
  return items;
}
