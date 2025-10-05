'use client';

import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import styles from "./loading.module.scss";
import { useLoading } from '@/app/contexts/LoadingContext';


export const Loading = () => {
  const { isLoading, setIsLoading, isAnimationCompleted, setAnimationCompleted } = useLoading();
  
  useGSAP(() => {
    const overlay = document.querySelector(`.${styles['loading-overlay']}`);
    const text = document.querySelector(`.${styles['loading-ttl']}`);
    if (!text) return;

    // Get the filter ID from the element's data attribute
    const filterId = text.getAttribute('data-filter');
    
    // Select the necessary SVG filter elements
    const feBlur = document.querySelector(`#${filterId} feGaussianBlur`);
    const feDisplacementMap = document.querySelector(`#${filterId} feDisplacementMap`);

    // Check if required elements exist
    if (!feBlur || !feDisplacementMap) {
      console.warn(`Filter with ID ${filterId} not found for element`, text);
      return;
    }

    // Object to store the values for blur and displacement
    let primitiveValues = { stdDeviation: 0, scale: 0 };

    // Create the animation timeline
    const animationTimeline = gsap.timeline({
      defaults: {
        duration: 1.5,
        ease: 'expo',
      },
      // On every update, set the appropriate attributes in the SVG filters
      onUpdate: () => {
        feBlur.setAttribute('stdDeviation', primitiveValues.stdDeviation.toString());
        feDisplacementMap.setAttribute('scale', primitiveValues.scale.toString());
      },
      onComplete: () => {
        // アニメーション完了時にローディング状態を解除
        setIsLoading(false);
        setAnimationCompleted(true);
      }
    })
    .to(primitiveValues, {
      startAt: { stdDeviation: 35, scale: 250 },  // Start with a strong blur and high displacement
      stdDeviation: 0,
      scale: 0
    }, 0)
    .to(text, {
      duration: 1.3,
      startAt: {
        opacity: 0,
        scale: 0.8,
        yPercent: 20
      },
      opacity: 1,
      scale: 1,
      yPercent: 0
    }, 0)
    .to(text, {
      duration: 1,
      scale: 1200,
      opacity: 0,
      ease: 'power2.inOut',
    }, '>+0.5')
    .to(overlay, {
      duration: 0.2,
      opacity: 0,
      ease: 'power2.out',
    }, '<+=0.8');
  }, [setIsLoading, setAnimationCompleted]);

  // アニメーション完了後はコンポーネントを表示しない
  if (isAnimationCompleted) return null;
  
  return (
    <>
      <svg className={styles['loading-svg-filter']}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur"></feGaussianBlur>
            <feColorMatrix in="blur" mode="matrix" values="	1 0 0 0 0  
                0 1 0 0 0  
                0 0 1 0 0  
                0 0 0 18 -5" result="goo"></feColorMatrix>
            <feTurbulence type="fractalNoise" baseFrequency="0.07 0.3" numOctaves="1" seed="1" result="noise"></feTurbulence>
            <feDisplacementMap in="goo" in2="noise" scale="0" result="displacement"></feDisplacementMap>
            <feComposite in="SourceGraphic" in2="displacement" operator="atop"></feComposite>
          </filter>
        </defs>
      </svg>
      <div className={styles['loading-overlay']}>
        <h1 className={styles['loading-ttl']} data-filter="goo">Creative Gallery</h1>
      </div>
    </>
  );
}
