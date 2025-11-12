import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Monta providers dinamicamente para evitar erro quando Google não está configurado
const providers: NextAuthOptions['providers'] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

providers.push(
  Credentials({
    name: 'Login',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Senha', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await prisma.user.findUnique({ where: { email: credentials.email } });
      if (!user) return null;
      if (user.status !== 'APPROVED') throw new Error('Aguardando aprovação do administrador');
      if (!user.passwordHash) return null;
      const ok = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, name: user.name, email: user.email } as any;
    },
  })
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutos em segundos
  },
  secret: process.env.AUTH_SECRET,
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      // Anexar papel e status
      if (token?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          (token as any).role = dbUser.role;
          (token as any).status = dbUser.status;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).provider = (token as any).provider;
        (session as any).role = (token as any).role;
        (session as any).status = (token as any).status;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };