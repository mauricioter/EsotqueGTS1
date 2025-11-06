"use client";

import dynamic from 'next/dynamic';

// Importação dinâmica do componente principal apenas no cliente
const AppComponent = dynamic(() => import('./main'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#666',
    }}>
      Carregando aplicação...
    </div>
  ),
});

export default function AppPageClient() {
  return <AppComponent />;
}