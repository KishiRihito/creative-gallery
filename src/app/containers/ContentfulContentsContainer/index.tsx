'use client';

import { useState, useEffect } from 'react';
import { createClient } from 'contentful';

import { GalleryList } from "@/app/components/GalleryList";
import { GalleryItem } from "@/app/components/GalleryItem";

interface ContentItem {
  id: string;
  title: string;
  thumbnail?: string;
  description?: string;
  embedUrl?: string;
}

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
        const entries = await client.getEntries({
          content_type: 'animationPost',
        });

        const fetchedContents = entries.items.map((item: any) => ({
          id: item.sys.id,
          title: item.fields.title,
          thumbnail: item.fields.thumb?.fields?.file?.url,
          description: item.fields.description,
          embedUrl: item.fields.embedUrl
        }));

        setContents(fetchedContents);
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
