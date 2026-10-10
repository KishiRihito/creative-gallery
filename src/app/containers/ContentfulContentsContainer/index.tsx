'use client';

import { useState, useEffect } from 'react';
import { createClient } from 'contentful';

import { GalleryList } from "@/app/components/GalleryList";
import { GalleryItem } from "@/app/components/GalleryItem";
import { toContentItem, type ContentItem } from "@/app/types/content";
import type { TypeAnimationPostSkeleton } from "@/app/types/contentful";

// クライアントサイドでContentfulクライアントを作成
const getClient = () => {
  return createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
  });
};

export const ContentfulContentsContainer = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const client = getClient();
        const entries = await client.withoutUnresolvableLinks.getEntries<TypeAnimationPostSkeleton>({
          content_type: 'animationPost',
        });

        setContents(entries.items.map(toContentItem));
      } catch (error) {
        console.error('Error fetching contents:', error);
      }
    };

    fetchContents();
  }, []);

  return (
    <GalleryList>
      {contents.map((content) => (
        <GalleryItem key={content.id} content={content} />
      ))}
    </GalleryList>
  );
};
