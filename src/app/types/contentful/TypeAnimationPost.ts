// `npm run contentful:types` で Contentful のコンテンツモデルから再生成される(cf-content-types-generator の出力形式)
import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeAnimationPostFields {
  title: EntryFieldTypes.Symbol;
  thumb?: EntryFieldTypes.AssetLink;
  description?: EntryFieldTypes.Text;
  embedUrl?: EntryFieldTypes.Symbol;
}

export type TypeAnimationPostSkeleton = EntrySkeletonType<TypeAnimationPostFields, "animationPost">;
export type TypeAnimationPost<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeAnimationPostSkeleton, Modifiers, Locales>;
