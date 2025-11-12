import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard - Visão Geral de Equipamentos',
  description: 'Estatísticas completas e visão geral do estoque de equipamentos',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  return <DashboardClient />;
}
