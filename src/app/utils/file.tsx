// "//"で始まるContentful画像パスを"https://"に変換する
export function convertToHttpsUrl(url: string): string {
  if (url.startsWith("//")) {
    return "https:" + url;
  }
  return url;
}
