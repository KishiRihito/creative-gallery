"use client";

import { ReactNode, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import styles from './galleryList.module.scss';
import { calculateInitialTransform } from '@/app/utils/animation';
import { useLoading } from '@/app/contexts/LoadingContext';

interface GalleryListProps {
  children: ReactNode;
}

export const GalleryList = ({ children }: GalleryListProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const { isLoading } = useLoading();
  
  useGSAP(() => {
    // ローディング中は何もしない
    if (isLoading) return;
    if (!listRef.current) return;
    
    // Set perspective for the container
    gsap.set(listRef.current, { perspective: 1000 });
    
    // Get all gallery items
    const galleryItems = listRef.current.querySelectorAll('li');
    
    if (galleryItems.length === 0) return;

    // Create animation timeline
    const tl = gsap.timeline({
      defaults: {
        ease: 'expo.out',
        duration: 1
      }
    });

    // Animate each gallery item
    tl.fromTo(galleryItems, 
      {
        // Define the starting position based on the pre-calculated values
        x: (_, el) => calculateInitialTransform(el as HTMLElement).x,
        y: (_, el) => calculateInitialTransform(el as HTMLElement).y,
        z: (_, el) => calculateInitialTransform(el as HTMLElement).z,
        rotateX: (_, el) => calculateInitialTransform(el as HTMLElement).rotateX * 0.5,
        rotateY: (_, el) => calculateInitialTransform(el as HTMLElement).rotateY,
        autoAlpha: 0,
        scale: 0.7,
      }, 
      {
        // Animate to original position
        x: 0,
        y: 0,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        autoAlpha: 1,
        scale: 1,
        stagger: {
          amount: 0.36,
          from: 'center',
          grid: 'auto'
        }
      }
    );

  }, [isLoading]);

  return (
    <ul ref={listRef} className={styles['gallery-list']}>
      {children}
    </ul>
  );
};
