import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mobile - GTSnet Estoque',
  description: 'Interface mobile para técnicos de campo',
  manifest: '/manifest.json',
  themeColor: '#ff7a00',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GTSnet Mobile'
  }
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
