'use client';

import styles from "./page.module.scss";
import { ContentfulContentsContainer } from "@/app/containers/ContentfulContentsContainer/index";
import { LenisScrollProvider } from "@/app/contexts/LenisScrollContext";
import { Loading } from '@/app/components/Loading';
import { LoadingProvider } from "@/app/contexts/LoadingContext";
import { LenisProvider } from "@/app/contexts/LenisContext";

export default function Home() {
  return (
    <>
      <LenisProvider>
        <LenisScrollProvider />
        <LoadingProvider>
          <Loading />
          <div className={styles.page}>
            <main className={styles.container}>
              <ContentfulContentsContainer />
            </main>
          </div>
        </LoadingProvider>
      </LenisProvider>
    </>
  );
}
