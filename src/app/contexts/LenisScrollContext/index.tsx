'use client';

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from '../LenisContext';

export const LenisScrollProvider = () => {
  const { setLenis } = useLenis();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Lenisのインスタンスをコンテキストに保存
    setLenis(lenis);

    // Lenisのスクロールイベントに合わせて全てのScrollTriggerインスタンスをアップデート
    lenis.on('scroll', ScrollTrigger.update);

    // LenisのrafメソッドをGSAP tickerに追加 
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000); // tickerのタイムスタンプの単位は秒なので、ミリ秒に変換
    });

    // レンダリング時にラグが発生した際のアニメーション調整機能を無効化
    gsap.ticker.lagSmoothing(0);

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy()
    };
  }, [setLenis]);

  return null;
};
