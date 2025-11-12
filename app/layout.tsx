import type { Metadata, Viewport } from 'next';
import './globals.css';
import './index.css';
import './styles/app-layout.css';
import Providers from './components/Providers';

// Metadata global da aplicação
export const metadata: Metadata = {
  title: 'Controle de Estoque - GTS',
  description: 'Sistema completo de controle e gerenciamento de estoque de equipamentos',
  keywords: ['estoque', 'equipamentos', 'controle', 'gerenciamento'],
  authors: [{ name: 'GTS Sistemas' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Controle de Estoque - GTS',
    description: 'Sistema completo de controle e gerenciamento de estoque de equipamentos',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
  },
};

// Export separado para viewport, conforme Next.js App Router
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ff7a00" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GTSnet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/gtsnet-logo.png" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                  .then(reg => console.log('Service Worker registrado:', reg.scope))
                  .catch(err => console.log('Erro ao registrar Service Worker:', err));
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
