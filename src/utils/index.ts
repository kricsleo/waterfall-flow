/** wait timeout */
export async function wait(timeout: number): Promise<boolean> {
  return new Promise(rs => setTimeout(rs, timeout));
}

/** 加载图片 */
export async function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((rs, rj) => {
    const img = new Image();
    img.onload = () => rs(img);
    img.onerror = e => rj(e);
    img.src = url;
  })
}