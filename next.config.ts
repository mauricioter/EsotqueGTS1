import type { NextConfig } from "next";

// Config reais do Next: mover turbopack para nível raiz
const nextConfig: any = {
  turbopack: {
    root: __dirname,
  },
  // Removido rewrite global de /api para evitar quebrar NextAuth e APIs do App Router.
  // Se você precisar usar json-server, crie rotas específicas (ex.: /mock/:path*) ou
  // habilite via variável de ambiente e NÃO inclua /api/auth, /api/usuarios, /api/equipamentos.
};

export default nextConfig as NextConfig;
