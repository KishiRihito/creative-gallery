'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

interface LenisContextType {
  lenis: Lenis | null;
  setLenis: (lenis: Lenis) => void;
}

const LenisContext = createContext<LenisContextType | undefined>(undefined);

export const useLenis = () => {
  const context = useContext(LenisContext);
  if (context === undefined) {
    throw new Error('useLenis must be used within a LenisProvider');
  }
  return context;
};

interface LenisProviderProps {
  children: ReactNode;
}

export const LenisProvider = ({ children }: LenisProviderProps) => {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  return (
    <LenisContext.Provider value={{ lenis, setLenis }}>
      {children}
    </LenisContext.Provider>
  );
};
