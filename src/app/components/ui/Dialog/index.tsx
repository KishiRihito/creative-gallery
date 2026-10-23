"use client";

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import style from './dialog.module.scss';
import type { ContentItem } from "@/app/types/content";
import { useLenis } from '@/app/contexts/LenisContext';
import { RichText } from '@/app/components/ui/RichText';

interface DialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  content: ContentItem;
}

// TypeScriptのiframe型に未定義のため、スプレッドで付与する
const credentiallessAttr = { credentialless: '' } as React.IframeHTMLAttributes<HTMLIFrameElement>;

export const Dialog = ({ isOpen, setIsOpen, onClose, content }: DialogProps) => {
  const { lenis } = useLenis();
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // 閉じるアニメーションの間はDOMに残す
  const [isMounted, setIsMounted] = useState(isOpen);
  if (isOpen && !isMounted) setIsMounted(true);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [setIsOpen, onClose]);

  // 背面のスクロールを禁止
  useEffect(() => {
    if (!lenis || !isOpen) return;
    lenis.stop();
    return () => lenis.start();
  }, [isOpen, lenis]);

  // Escで閉じる / 開閉時のフォーカス管理
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // 背面を操作・フォーカス不可にし、Tabでモーダル外に出ないようにする
    const background = Array.from(document.body.children).filter(
      (el) => el !== overlayRef.current && !el.hasAttribute('inert'),
    );
    background.forEach((el) => el.setAttribute('inert', ''));

    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // inertのままだとフォーカスを戻せないため、先に解除する
      background.forEach((el) => el.removeAttribute('inert'));
      previouslyFocused?.focus?.();
    };
  }, [isOpen, close]);

  if (!isMounted) return null;

  return (
    <div
      ref={overlayRef}
      className={style['dialog-overlay']}
      data-state={isOpen ? 'open' : 'closed'}
      // 閉じアニメーション中はキーボードでもフォーカスできないようにする
      inert={!isOpen}
      // オーバーレイ自体(=モーダル外)のクリックのみ閉じる
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onAnimationEnd={(e) => {
        // 子要素のアニメーション終了は無視し、閉じアニメ完了時のみアンマウント
        if (e.target === e.currentTarget && !isOpen) setIsMounted(false);
      }}
    >
      <div
        className={style['dialog-container']}
        // コンテナの余白部分のクリックも「モーダル外」として扱う
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          className={style['dialog-content']}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <h2 id={titleId} className={style['dialog-title']}>{content.title}</h2>
          {content.embedUrl && (
            <div className={style['dialog-iframe']}>
              <iframe
                src={content.embedUrl}
                title={content.title}
                allow="cross-origin-isolated"
                // COEP下でもCOEP未設定の外部文書(StackBlitz)を埋め込めるようにする(Chrome 110+)
                {...credentiallessAttr}
                allowFullScreen
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          )}
          {content.description && (
            <RichText document={content.description} className={style['dialog-description']} />
          )}

          <button
            ref={closeBtnRef}
            type="button"
            className={style['dialog-closeBtn']}
            onClick={close}
            aria-label="閉じる"
          >
            <span></span><span></span>
          </button>
        </div>
      </div>
    </div>
  );
};
