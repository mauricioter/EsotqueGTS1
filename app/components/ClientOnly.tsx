'use client';

import { useState, useEffect, ReactNode } from 'react';

// Componente que só renderiza seu conteúdo no cliente
export default function ClientOnly({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}