import type { Metadata, Viewport } from 'next';
import './globals.css';
import './index.css';
import './styles/app-layout.css';
import Providers from './components/Providers';
import BackToMenuButton from './components/BackToMenuButton';

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
    icon: '/favicon.ico',
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
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <BackToMenuButton />
        </Providers>
      </body>
    </html>
  );
}
