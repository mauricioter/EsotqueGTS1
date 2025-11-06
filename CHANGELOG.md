# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2025-11-06

### ✨ Adicionado
- Sistema de autenticação com NextAuth.js
- Login com credenciais (email/senha)
- Login com Google OAuth (opcional)
- Sistema de aprovação de usuários por administradores
- Três níveis de permissão: Admin, Operador e Visualizador
- CRUD completo de equipamentos
- Dashboard com métricas e estatísticas
- Busca e filtros avançados
- Tema claro/escuro com alternância
- Interface responsiva
- Validação de CPF
- Formatação automática de MAC address
- API RESTful documentada
- Middleware de segurança
- Headers de segurança configurados
- Arquivo `.env.example` para configuração
- README completo com instruções
- Documentação de API (API.md)
- Biblioteca de utilitários (lib/utils.ts)
- Biblioteca de segurança (lib/security.ts)
- Constantes centralizadas (lib/constants.ts)
- Suporte a SQLite para desenvolvimento
- Prisma ORM configurado
- TypeScript em todo o projeto
- ESLint configurado
- Tailwind CSS integrado

### 🔧 Corrigido
- Corrigido `tsconfig.json` para usar `jsx: "preserve"` (Next.js)
- Adicionado `@types/bcryptjs` às dependências
- Corrigido params async em rotas dinâmicas (Next.js 15+)
- Adicionada validação de autenticação em rotas de API
- Adicionada validação de permissões em operações CRUD
- Melhorado tratamento de erros em toda a aplicação
- Corrigido exibição do botão Google OAuth quando não configurado
- Melhorado .gitignore para excluir arquivos de banco de dados

### 🔒 Segurança
- Senhas hasheadas com bcryptjs (10 salt rounds)
- Tokens JWT via NextAuth.js
- Validação de permissões em todas as rotas de escrita
- Validação de CPF com dígito verificador
- Validação de email com regex
- Proteção CSRF habilitada
- Headers de segurança (X-Frame-Options, CSP, etc)
- Sanitização de inputs
- Rate limiting preparado (para implementação futura)

### 📚 Documentação
- README completo com instruções de instalação
- Documentação de API com exemplos
- Comentários em código
- Estrutura do projeto documentada
- Variáveis de ambiente documentadas
- Guia de troubleshooting

### 🎨 Interface
- Design moderno e limpo
- Componentes reutilizáveis
- Animações suaves
- Feedback visual para ações
- Estados de loading e erro
- Mensagens de sucesso e erro
- Sidebar flutuante para navegação
- Menu de usuário com informações da sessão
- Badges de status coloridos
- Botão de voltar ao menu
- Toggle de tema

### 🗃️ Banco de Dados
- Schema Prisma definido
- Migrations configuradas
- Modelos: User, Equipamento, Account, Session, VerificationToken
- Índices otimizados
- Constraints de unicidade
- Enums para status e roles

### ⚙️ Configuração
- Next.js 16 com App Router
- React 19
- TypeScript 5
- Prisma 6
- NextAuth 4
- Tailwind CSS 4
- Axios configurado
- Variáveis de ambiente
- Scripts NPM úteis

### 📦 Dependências
- next: 16.0.1
- react: 19.2.0
- @prisma/client: 6.19.0
- next-auth: 4.24.13
- bcryptjs: 3.0.3
- axios: 1.13.1
- googleapis: 164.1.0
- TypeScript e tipos

### 🚀 Deploy
- Pronto para deploy na Vercel
- Documentação de deploy incluída
- Sugestão de migração para PostgreSQL em produção

---

## [Unreleased]

### 🔮 Planejado
- [ ] Rate limiting em APIs
- [ ] Logs de auditoria
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Importação em lote de equipamentos
- [ ] Notificações por email
- [ ] Histórico de alterações de equipamentos
- [ ] Upload de imagens de equipamentos
- [ ] QR Code para equipamentos
- [ ] API de integração webhooks
- [ ] Testes automatizados (Jest, Cypress)
- [ ] CI/CD pipeline
- [ ] Docker containerização
- [ ] Backup automático
- [ ] Multi-tenancy
- [ ] Internacionalização (i18n)

---

**Legenda:**
- ✨ Adicionado: Novas funcionalidades
- 🔧 Corrigido: Correções de bugs
- 🔒 Segurança: Melhorias de segurança
- 📚 Documentação: Melhorias na documentação
- 🎨 Interface: Melhorias visuais
- 🗃️ Banco de Dados: Mudanças no banco
- ⚙️ Configuração: Mudanças de configuração
- 📦 Dependências: Atualizações de pacotes
- 🚀 Deploy: Melhorias de deploy
- 🔮 Planejado: Funcionalidades futuras
