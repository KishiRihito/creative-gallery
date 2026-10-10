import type { TypeAnimationPost } from "@/app/types/contentful";

type AnimationPostEntry = TypeAnimationPost<"WITHOUT_UNRESOLVABLE_LINKS">;

// Contentfulのフィールド型から導出する(コンテンツモデル変更時は型の再生成のみで追従する)
export type ContentItem = {
  id: AnimationPostEntry["sys"]["id"];
  title: AnimationPostEntry["fields"]["title"];
  thumbnail?: string;
  description?: AnimationPostEntry["fields"]["description"];
  embedUrl?: AnimationPostEntry["fields"]["embedUrl"];
};

export const toContentItem = (entry: AnimationPostEntry): ContentItem => ({
  id: entry.sys.id,
  title: entry.fields.title,
  thumbnail: entry.fields.thumb?.fields.file?.url,
  description: entry.fields.description,
  embedUrl: entry.fields.embedUrl,
});
