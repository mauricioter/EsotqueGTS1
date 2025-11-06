# 🚀 Guia de Deploy na Vercel

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Repositório no GitHub com o código
3. Banco de dados PostgreSQL (recomendado: Vercel Postgres ou Neon)

## 📋 Passo a Passo

### 1. Preparar o Banco de Dados

#### Opção A: Vercel Postgres (Recomendado)
```bash
# Será configurado automaticamente na Vercel
```

#### Opção B: Neon (Gratuito)
1. Acesse https://neon.tech
2. Crie uma conta e um projeto
3. Copie a `DATABASE_URL` fornecida

### 2. Atualizar schema.prisma para PostgreSQL

Edite `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Mudou de sqlite
  url      = env("DATABASE_URL")
}
```

### 3. Fazer Commit das Mudanças

```bash
git add .
git commit -m "Preparado para deploy na Vercel"
git push origin main
```

### 4. Deploy na Vercel

#### Via Website:

1. Acesse https://vercel.com
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:

**Variáveis Obrigatórias:**

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
AUTH_SECRET=your-secret-key-here-32-chars-min
NEXTAUTH_URL=https://your-app.vercel.app
```

**Gerar AUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Variáveis Opcionais (Google OAuth):**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
```

5. Clique em "Deploy"

#### Via CLI:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

### 5. Executar Migrations no Banco

Após o deploy, execute as migrations:

```bash
# Via Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Ou no dashboard da Vercel, adicione um script de build:
# Em Settings > General > Build Command:
npm run build && npx prisma migrate deploy
```

### 6. Verificar Deploy

1. Acesse a URL fornecida pela Vercel
2. Registre o primeiro usuário (será ADMIN automaticamente)
3. Teste o sistema

## ⚙️ Configurações Adicionais

### Domínio Customizado

1. Em "Settings" > "Domains"
2. Adicione seu domínio
3. Configure DNS conforme instruções

### Variáveis de Ambiente

Para adicionar/editar variáveis após o deploy:

1. Vá em "Settings" > "Environment Variables"
2. Adicione ou edite as variáveis
3. Redeploy o projeto

### Logs e Monitoramento

- Acesse "Deployments" para ver logs
- "Analytics" para métricas de uso
- "Speed Insights" para performance

## 🔧 Troubleshooting

### Erro: "Module not found"
```bash
# Limpe cache e reinstale
rm -rf node_modules .next
npm install
npm run build
```

### Erro: "Database connection failed"
- Verifique se `DATABASE_URL` está correta
- Teste conexão localmente primeiro
- Verifique firewall do banco de dados

### Erro: "Auth callback error"
- Verifique se `NEXTAUTH_URL` está correto
- Deve ser a URL completa do seu app na Vercel
- Ex: `https://seu-app.vercel.app`

### Build falha com erro de TypeScript
```bash
# Teste build local primeiro
npm run build

# Se passar, force rebuild na Vercel
vercel --force
```

## 📊 Banco de Dados de Produção

### Usando Vercel Postgres

1. No dashboard, vá em "Storage"
2. Crie um "Postgres Database"
3. Conecte ao seu projeto
4. A `DATABASE_URL` será adicionada automaticamente

### Migrations

Sempre execute migrations após mudanças no schema:

```bash
# Criar migration
npx prisma migrate dev --name nome_da_migration

# Deploy migration em produção
vercel env pull .env.production
npx prisma migrate deploy
```

### Seed Inicial (Opcional)

Crie `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seus dados iniciais aqui
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Execute:
```bash
npx prisma db seed
```

## 🔒 Segurança em Produção

✅ **Checklist:**

- [ ] `AUTH_SECRET` é forte e único
- [ ] `DATABASE_URL` está em variável de ambiente
- [ ] HTTPS está habilitado (automático na Vercel)
- [ ] CORS está configurado corretamente
- [ ] Variáveis sensíveis não estão no código
- [ ] `.env` está no `.gitignore`

## 📈 Performance

### Otimizações Automáticas da Vercel:

- ✅ Edge Network (CDN global)
- ✅ Image Optimization
- ✅ Automatic HTTPS
- ✅ Serverless Functions
- ✅ Static Site Generation

### Monitoramento:

```bash
# Ver analytics
vercel analytics

# Ver logs em tempo real
vercel logs
```

## 🆘 Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Next.js: https://nextjs.org/docs
- Documentação Prisma: https://www.prisma.io/docs

---

**Dica:** Sempre teste o build localmente antes de fazer deploy:

```bash
npm run build
npm run start
```

Se funcionar localmente, funcionará na Vercel! 🚀
