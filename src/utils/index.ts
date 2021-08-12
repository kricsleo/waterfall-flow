/** wait timeout */
export async function wait(timeout: number): Promise<boolean> {
  return new Promise(rs => setTimeout(rs, timeout));
}
