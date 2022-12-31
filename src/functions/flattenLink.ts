/**
 *
 * @param link
 */
export function flattenLink(link: string): string {
    const rawlink = link;
    const linky = rawlink.replace(/^https?:\/\//i, "");
    const linky2 = linky.split(".").slice(-2).join(".");
    const linky3 = linky2.split("/")[0];
    return linky3;
  }