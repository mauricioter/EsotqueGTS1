import type { Metadata } from 'next';
import AppPageClient from './AppPageClient';

// Metadata da página
export const metadata: Metadata = {
  title: 'Controle de Estoque',
  description: 'Sistema de controle de estoque de equipamentos',
};

export default function Home() {
  return <AppPageClient />;
}
