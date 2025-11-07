import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

// Metadata da página
export const metadata: Metadata = {
  title: 'Controle de Estoque - GTSnet',
  description: 'Sistema de controle de estoque de equipamentos',
};

export default function Home() {
  redirect('/home');
}
