'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isAnimationCompleted: boolean;
  setAnimationCompleted: (completed: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimationCompleted, setAnimationCompleted] = useState(false);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setIsLoading, 
      isAnimationCompleted, 
      setAnimationCompleted 
    }}>
      {children}
    </LoadingContext.Provider>
  );
};
