# 📦 Sistema de Controle de Estoque GTSThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



Sistema completo de controle e gerenciamento de estoque de equipamentos com autenticação, controle de permissões e interface moderna.## Getting Started



## 🚀 TecnologiasFirst, run the development server:



- **Next.js 16** (App Router)```bash

- **React 19**npm run dev

- **TypeScript**# or

- **Prisma ORM** (SQLite)yarn dev

- **NextAuth.js** (Autenticação)# or

- **Tailwind CSS**pnpm dev

- **Axios**# or

bun dev

## 📋 Funcionalidades```



- ✅ Autenticação com credenciais e Google OAuthOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- ✅ Sistema de permissões (Admin, Operador, Visualizador)

- ✅ Aprovação de usuários por administradoresYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- ✅ Cadastro, edição e exclusão de equipamentos

- ✅ Busca e filtros avançadosThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- ✅ Dashboard com métricas

- ✅ Tema claro/escuro## Usar Google Sheets como banco de dados

- ✅ Interface responsiva

Você pode usar uma planilha do Google Sheets como fonte de dados para os equipamentos.

## 🔧 Instalação

1. Crie uma planilha com a aba chamada `Equipamentos` e o cabeçalho nas colunas A–H:

### 1. Clone o repositório   - A: `id`

   - B: `nome`

```bash   - C: `serial`

git clone <url-do-repositorio>   - D: `mac`

cd my-app   - E: `destino`

```   - F: `status`

   - G: `dataEntrada`

### 2. Instale as dependências   - H: `dataSaida`



```bash2. No Google Cloud Console, crie um projeto e ative a **Google Sheets API**.

npm install

```3. Crie uma **Conta de Serviço** e compartilhe a planilha com o e-mail da conta de serviço (Editor).



### 3. Configure as variáveis de ambiente4. Adicione as variáveis no `.env.local`:



Copie o arquivo `.env.example` para `.env`:```

GOOGLE_SHEETS_SPREADSHEET_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

```bashGOOGLE_SHEETS_CLIENT_EMAIL=service-account@seu-projeto.iam.gserviceaccount.com

cp .env.example .envGOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABCDEF...\n-----END PRIVATE KEY-----\n"

```GOOGLE_SHEETS_SHEET_NAME=Equipamentos

```

Edite o arquivo `.env` e configure:

Observação: mantenha as quebras de linha do `PRIVATE_KEY` usando `\n` no arquivo; o código converte para linhas reais.

```env

# Database (SQLite - já configurado)5. Instale a biblioteca:

DATABASE_URL="file:./dev.db"

```

# NextAuth - MUDE ESTE SECRET EM PRODUÇÃO!npm install googleapis

AUTH_SECRET="sua-chave-secreta-aqui-minimo-32-caracteres"```

NEXTAUTH_URL="http://localhost:3000"

Os endpoints em `app/api/equipamentos` (GET/POST) e `app/api/equipamentos/[id]` (PUT/DELETE) já estão implementados para operar com a planilha.

# Google OAuth (opcional - deixe em branco se não usar)

GOOGLE_CLIENT_ID=""## Login com Google (NextAuth)

GOOGLE_CLIENT_SECRET=""

Implementei login com conta Google usando `next-auth`.

# API

NEXT_PUBLIC_API_URL="/api"### Variáveis de Ambiente

```

Adicione ao `.env.local`:

**⚠️ IMPORTANTE:** Gere um `AUTH_SECRET` forte para produção:

```bash```

openssl rand -base64 32GOOGLE_CLIENT_ID=seu_client_id

```GOOGLE_CLIENT_SECRET=seu_client_secret

AUTH_SECRET=um_segredo_aleatorio_seguro

### 4. Configure o banco de dadosNEXTAUTH_URL=http://localhost:3002

```

Execute as migrations do Prisma:

### Configuração do OAuth

```bash

npx prisma generate1. No Google Cloud Console, crie uma credencial OAuth (tipo Web).

npx prisma migrate dev2. Em Authorized redirect URIs, inclua:

```   - `http://localhost:3002/api/auth/callback/google`

3. Copie `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` para o `.env.local`.

### 5. Inicie o servidor de desenvolvimento4. Gere um `AUTH_SECRET` (ex.: `openssl rand -base64 32`).



```bash### Fluxo

npm run dev

```- Página de login em `/login` com botão “Entrar com Google”.

- Middleware protege rotas e redireciona não autenticados.

Acesse: [http://localhost:3000](http://localhost:3000)- Botão “Sair” no header encerra a sessão e retorna ao `/login`.



## 👥 Primeiro Acesso## Learn More



1. Acesse `/register` para criar sua contaTo learn more about Next.js, take a look at the following resources:

2. O **primeiro usuário** cadastrado se torna **ADMIN automaticamente**

3. Usuários seguintes ficam **PENDING** até aprovação- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

4. Admins podem aprovar usuários em `/admin`- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



## 🔑 Níveis de PermissãoYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



| Permissão | Descrição |## Deploy on Vercel

|-----------|-----------|

| **ADMIN** | Acesso total + aprovação de usuários |The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

| **OPERATOR** | Cadastrar, editar e excluir equipamentos |

| **VIEWER** | Apenas visualizar equipamentos |Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## 📁 Estrutura do Projeto

```
my-app/
├── app/
│   ├── api/              # Rotas de API
│   │   ├── auth/         # Autenticação NextAuth
│   │   ├── equipamentos/ # CRUD equipamentos
│   │   ├── register/     # Registro de usuários
│   │   └── admin/        # Rotas administrativas
│   ├── components/       # Componentes React
│   ├── services/         # Serviços (API, Sheets, etc)
│   ├── dashboard/        # Página de dashboard
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   ├── admin/            # Página de administração
│   └── usuarios/         # Página de usuários
├── prisma/
│   ├── schema.prisma     # Schema do banco de dados
│   └── migrations/       # Migrações
├── lib/
│   └── prisma.ts         # Cliente Prisma
└── public/               # Arquivos estáticos
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm run start

# Lint
npm run lint

# JSON Server (mock API - opcional)
npm run dev:api

# Prisma Studio (visualizar banco)
npx prisma studio

# Gerar cliente Prisma
npx prisma generate

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Reset do banco de dados
npx prisma migrate reset
```

## 🗃️ Banco de Dados

### Modelos Principais

#### User
```prisma
- id: String (cuid)
- name: String
- email: String (unique)
- cpf: String (unique, opcional)
- numero: String (opcional)
- passwordHash: String (opcional)
- role: ADMIN | OPERATOR | VIEWER
- status: PENDING | APPROVED
```

#### Equipamento
```prisma
- id: String (cuid)
- nome: String
- descricao: String (opcional)
- serial: String (unique, opcional)
- mac: String (unique, opcional)
- status: DISPONIVEL | EM_USO | EMPRESTADO | MANUTENCAO | SAIDA
- dataEntrada: DateTime
- dataSaida: DateTime (opcional)
- destino: String (opcional)
```

## 🔒 Segurança

- Senhas hasheadas com bcryptjs
- Tokens JWT via NextAuth
- Validação de permissões em todas as rotas de API
- Validação de CPF e email no registro
- Proteção contra CSRF
- Headers de segurança configurados

## 🎨 Temas

O sistema possui tema claro e escuro com suporte a `prefers-color-scheme`.
O botão de alternância está no canto superior direito.

## 📱 Responsividade

Interface totalmente responsiva, otimizada para:
- Desktop (1920px+)
- Laptop (1366px+)
- Tablet (768px+)
- Mobile (320px+)

## 🐛 Debug

### Problemas Comuns

**Erro de conexão com banco:**
```bash
npx prisma generate
npx prisma migrate dev
```

**Erro de autenticação:**
- Verifique se `AUTH_SECRET` está configurado no `.env`
- Limpe os cookies do navegador

**Erro de build:**
```bash
rm -rf .next
npm run build
```

## 📝 Variáveis de Ambiente Necessárias

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ | URL do banco SQLite |
| `AUTH_SECRET` | ✅ | Secret para NextAuth |
| `NEXTAUTH_URL` | ✅ | URL da aplicação |
| `GOOGLE_CLIENT_ID` | ❌ | OAuth Google (opcional) |
| `GOOGLE_CLIENT_SECRET` | ❌ | OAuth Google (opcional) |

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

**⚠️ Nota:** SQLite não é ideal para produção. Considere migrar para PostgreSQL:

```prisma
// Altere em schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 📄 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Desenvolvido por

GTS Sistemas

---

**Versão:** 0.1.0  
**Última atualização:** Novembro 2025
