"use client";

import { useEffect, useRef } from 'react';

import style from './dialog.module.scss';
import { useLenis } from '@/app/contexts/LenisContext';

interface DialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  content: {
    id: string;
    title: string;
    thumbnail?: string;
    description?: string;
    embedUrl?: string;
  }
}

export const Dialog = ({ isOpen, setIsOpen, onClose, content }: React.PropsWithChildren<DialogProps>) => {
  const { lenis } = useLenis();
  // モーダル外をクリックした時の処理
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current &&
        !(ref.current as HTMLElement).contains(e.target as Node)
      ) {
        setIsOpen(false);
        // モーダルを閉じる時にスクロールを再開
        if (lenis) {
          lenis.start();
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [lenis, setIsOpen]);

  // 背面のスクロールを禁止
  useEffect(() => {
    if (!lenis) return;
    
    if (isOpen) {
      // モーダルを開く時にスクロールを停止
      lenis.stop();
    } else {
      // モーダルを閉じる時にスクロールを再開
      lenis.start();
    }
    
    return () => {
      // コンポーネントのアンマウント時にスクロールを再開
      if (lenis) lenis.start();
    };
  }, [isOpen, lenis]);

  return (
    <>
    { isOpen && (
      <div className={style['dialog-overlay']} >
        <div className={style['dialog-container']}>
          <div className={style['dialog-content']}>
            <h2 className={style['dialog-title']}>{content.title}</h2>
            {/* {content.thumbnail && (
              <div className={style['dialog-thumb']}>
                <img src={content.thumbnail} alt={content.title} />
              </div>
            )} */}
            {content.embedUrl && (
              <div className={style['dialog-iframe']}>
                <iframe
                  src={content.embedUrl}
                  title={content.title}
                  allowFullScreen
                  sandbox='allow-same-origin allow-scripts'
                ></iframe>
              </div>
            )}
            {content.description && (
              <p className={style['dialog-description']}>{content.description}</p>
            )}

            <button
              className={style['dialog-closeBtn']}
              onClick={() => {
                setIsOpen(false);
                // モーダルを閉じる時にスクロールを再開
                if (lenis) lenis.start();
                if (onClose) onClose();
              }}
              aria-label="閉じる"
            >
              <span></span><span></span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
