"use client";

import Image from "next/image";
import { useState, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';

import styles from "./galleryItem.module.scss";
import { convertToHttpsUrl } from "@/app/utils/file";

import { Dialog } from "@/app/components/ui/Dialog";

interface GalleryItemProps {
  content: {
    id: string;
    title: string;
    thumbnail?: string;
    description?: string;
    embedUrl?: string;
  }
}

export const GalleryItem = forwardRef<HTMLLIElement, GalleryItemProps>(({ content }, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const handleClick = async () => {
    setIsOpened(true);
  };

  const body = (typeof window !== 'undefined') ? document.querySelector('body') : null;
  if (!body) return null;

  return (
    <li ref={ref} className={styles['gallery-item']}>
      <button type="button" onClick={handleClick} className={styles['gallery-item-btn']}>
        {content.thumbnail && (
          <Image src={convertToHttpsUrl(content.thumbnail)} alt={content.title} width={400} height={300} />
        )}
        <h2 className={styles['gallery-item-title']}>{content.title}</h2>
        {/* {content.description && (
          <p>{content.description}</p>
        )} */}
      </button>

      {createPortal(
        <Dialog
          isOpen={isOpened}
          setIsOpen={setIsOpened}
          content={content}
        />,
        body,
      )}
    </li>
  );
});
