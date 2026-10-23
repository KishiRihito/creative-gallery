import type { Document } from "@contentful/rich-text-types";

import type { TypeAnimationPost } from "@/app/types/contentful";
import { markdownToRichText } from "@/app/utils/richText";

type AnimationPostEntry = TypeAnimationPost<"WITHOUT_UNRESOLVABLE_LINKS">;

// Contentfulのフィールド型から導出する(コンテンツモデル変更時は型の再生成のみで追従する)
export type ContentItem = {
  id: AnimationPostEntry["sys"]["id"];
  title: AnimationPostEntry["fields"]["title"];
  thumbnail?: string;
  // ContentfulではMarkdown(Long text)で入力し、表示用にリッチテキストへ変換して保持する
  description?: Document;
  embedUrl?: AnimationPostEntry["fields"]["embedUrl"];
};

export const toContentItem = async (entry: AnimationPostEntry): Promise<ContentItem> => ({
  id: entry.sys.id,
  title: entry.fields.title,
  thumbnail: entry.fields.thumb?.fields.file?.url,
  description: entry.fields.description ? await markdownToRichText(entry.fields.description) : undefined,
  embedUrl: entry.fields.embedUrl,
});
