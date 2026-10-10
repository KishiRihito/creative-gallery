import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeAnimationPostFields {
    title: EntryFieldTypes.Symbol;
    thumb?: EntryFieldTypes.AssetLink;
    embedUrl?: EntryFieldTypes.Symbol;
    description?: EntryFieldTypes.Text;
}

export type TypeAnimationPostSkeleton = EntrySkeletonType<TypeAnimationPostFields, "animationPost">;
export type TypeAnimationPost<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeAnimationPostSkeleton, Modifiers, Locales>;
