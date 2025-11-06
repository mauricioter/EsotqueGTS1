# 📱 GTSnet Mobile - PWA para Técnicos de Campo

## 🎯 Visão Geral

Sistema PWA (Progressive Web App) desenvolvido para técnicos de campo da GTSnet realizarem instalações de equipamentos com registro fotográfico, GPS e assinatura digital do cliente.

## ✨ Funcionalidades

### 📋 Listagem de Equipamentos
- Visualização dos equipamentos atribuídos ao técnico logado
- Filtros por status: Todos, Disponível, Em Uso, Instalado
- Informações: nome, serial, localização atual, última instalação
- Interface mobile-first com cards interativos

### 📸 Registro de Instalação
- **Captura de 3 fotos obrigatórias:**
  - Foto do equipamento instalado
  - Foto do número serial
  - Foto do local da instalação
- **GPS automático:** Captura de coordenadas geográficas (latitude/longitude)
- **Endereço:** Campo de texto para endereço completo
- **Assinatura digital:** Canvas touch para assinatura do cliente
- **Dados do cliente:** Nome completo
- **Observações:** Campo opcional para notas adicionais

### 📊 Histórico de Instalações
- Lista de todas instalações realizadas pelo técnico
- Visualização de fotos em modal
- Informações completas: data, cliente, endereço, GPS, observações
- Timeline ordenada por data (mais recente primeiro)

### 🔄 PWA Features
- **Instalável:** Adicionar à tela inicial do celular
- **Offline:** Service Worker com cache de recursos
- **Push Notifications:** Preparado para notificações futuras
- **Background Sync:** Sincronização de fotos em background (planejado)

## 🚀 Rotas Mobile

### `/mobile`
Página principal do técnico
- Lista de equipamentos atribuídos
- Filtros de status
- Navegação rápida

### `/mobile/instalacao/[id]`
Formulário de registro de instalação
- Parâmetro: ID do equipamento
- Captura de fotos via câmera
- Captura de GPS
- Canvas de assinatura
- Upload automático

### `/mobile/instalacoes`
Histórico completo
- Lista todas instalações do técnico
- Modal de detalhes com fotos
- Informações de GPS e cliente

## 📡 APIs Consumidas

### GET `/api/mobile/equipamentos`
Retorna equipamentos do técnico logado
```typescript
Query params:
- status?: string (opcional - filtra por status)

Response:
{
  success: true,
  equipamentos: [{
    id: number,
    nome: string,
    status: string,
    serial?: string,
    localizacaoAtual?: string,
    instalacoes: [{ dataInstalacao, endereco }]
  }],
  total: number
}
```

### POST `/api/mobile/instalacoes`
Registra nova instalação
```typescript
Body:
{
  equipamentoId: number,
  endereco?: string,
  latitude?: number,
  longitude?: number,
  fotoEquipamento: string, // URL após upload
  fotoSerial: string,
  fotoLocal: string,
  assinaturaCliente: string, // base64
  nomeCliente: string,
  observacoes?: string
}

Response:
{
  success: true,
  instalacao: { id, dataInstalacao, ... }
}
```

### GET `/api/mobile/instalacoes`
Lista instalações do técnico
```typescript
Response:
{
  success: true,
  instalacoes: [{
    id: number,
    dataInstalacao: string,
    equipamento: { nome, serial },
    ...
  }],
  total: number
}
```

### POST `/api/mobile/upload`
Upload de foto
```typescript
Body: FormData com file

Response:
{
  success: true,
  url: string // Caminho da foto em /uploads
}
```

## 🎨 Design System

### Cores
- **Primary:** `#ff7a00` (Laranja GTSnet)
- **Primary Dark:** `#cc6200`
- **Primary Light:** `#ff9933`
- **Background:** `#f5f5f5`
- **Cards:** `#ffffff`

### Componentes
- **Mobile Header:** Gradient laranja com logo e nome do técnico
- **Filter Tabs:** Pills com scroll horizontal
- **Equipment Cards:** Cards brancos com shadow e border no hover/active
- **Action Buttons:** Gradient laranja com efeito de scale no active
- **Bottom Navigation:** 4 botões fixos (Início, Histórico, Desktop, Sair)

### Responsividade
- Mobile-first (< 480px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

## 📱 Instalação PWA

### Requisitos
1. HTTPS (produção) ou localhost (desenvolvimento)
2. Manifest.json configurado
3. Service Worker registrado
4. Ícones em múltiplos tamanhos

### Como Instalar

#### Android (Chrome/Edge)
1. Acesse `/mobile` no navegador
2. Banner "Instalar App GTSnet" aparecerá
3. Clique em "Instalar"
4. Ou: Menu (⋮) → "Instalar aplicativo"

#### iOS (Safari)
1. Acesse `/mobile` no Safari
2. Toque no ícone de compartilhar (⬆️)
3. Role e selecione "Adicionar à Tela de Início"
4. Confirme

### Arquivos PWA
- `/public/manifest.json` - Configuração do app
- `/public/service-worker.js` - Service Worker
- `/public/offline.html` - Página offline
- `/app/components/InstallPWA.tsx` - Banner de instalação

## 🔐 Autenticação

O sistema mobile usa NextAuth.js:
- Session JWT armazenada em cookies
- Proteção de rotas via `useSession()`
- Redirecionamento automático para `/login` se não autenticado
- Nome do técnico extraído de `session.user.name`

## 📦 Banco de Dados

### Modelo Instalacao
```prisma
model Instalacao {
  id                String      @id @default(cuid())
  equipamentoId     String
  equipamento       Equipamento @relation(...)
  tecnicoId         String
  tecnico           User        @relation(...)
  dataInstalacao    DateTime    @default(now())
  endereco          String?
  latitude          Float?
  longitude         Float?
  fotoEquipamento   String?
  fotoSerial        String?
  fotoLocal         String?
  fotosAdicionais   String[]
  assinaturaCliente String?
  nomeCliente       String?
  observacoes       String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}
```

### Relações
- `Instalacao` → `Equipamento` (many-to-one)
- `Instalacao` → `User` (many-to-one via tecnicoId)
- `Equipamento.instalacoes` (one-to-many)
- `User.instalacoes` (one-to-many)

## 📂 Estrutura de Arquivos

```
app/
  mobile/
    layout.tsx           # Layout com metadata PWA
    page.tsx            # Lista de equipamentos
    mobile.css          # Estilos compartilhados
    instalacao/
      [id]/
        page.tsx        # Formulário de instalação
      instalacao.css    # Estilos do formulário
    instalacoes/
      page.tsx          # Histórico
      historico.css     # Estilos do histórico
  api/
    mobile/
      equipamentos/
        route.ts        # GET equipamentos
      instalacoes/
        route.ts        # POST/GET instalações
      upload/
        route.ts        # POST upload de fotos
  components/
    InstallPWA.tsx      # Banner de instalação
    InstallPWA.css      # Estilos do banner
public/
  manifest.json         # PWA manifest
  service-worker.js     # Service Worker
  offline.html          # Página offline
  uploads/              # Diretório de fotos
```

## 🔧 APIs do Navegador Usadas

### Camera API
```javascript
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.capture = 'environment'; // Câmera traseira
```

### Geolocation API
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
  },
  (error) => { /* handle error */ },
  { enableHighAccuracy: true }
);
```

### Canvas API (Assinatura)
```javascript
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
// Touch events: touchstart, touchmove, touchend
// Mouse events: mousedown, mousemove, mouseup
```

### Service Worker API
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

## 🚧 Próximos Passos

### Melhorias Planejadas
1. **Cloud Storage:** Migrar de local storage para S3/Cloudinary
2. **Background Sync:** Sincronizar fotos quando online
3. **Push Notifications:** Notificar sobre novas atribuições
4. **QR Code Scanner:** Escanear serial de equipamentos
5. **Modo Offline Completo:** IndexedDB para dados offline
6. **Compressão de Imagens:** Reduzir tamanho antes do upload
7. **Múltiplas Fotos Adicionais:** Permitir mais de 3 fotos
8. **Edição de Instalação:** Corrigir dados após envio
9. **Exportar PDF:** Gerar relatório da instalação
10. **Mapa de Instalações:** Visualizar no mapa

### Otimizações
- [ ] Lazy loading de imagens
- [ ] Infinite scroll no histórico
- [ ] Cache de fotos com Service Worker
- [ ] Minificação de assets
- [ ] Code splitting por rota

## 📊 Monitoramento

### Métricas PWA
- **Time to Interactive (TTI):** < 3s
- **First Contentful Paint (FCP):** < 1.5s
- **Cache Hit Rate:** > 80%
- **Install Rate:** Monitorar via analytics

### Logs
```javascript
// Service Worker events
console.log('SW: Install', 'Activate', 'Fetch');

// Upload success
console.log('Foto enviada:', url);

// GPS capture
console.log('GPS capturado:', lat, lng);
```

## 🛠️ Desenvolvimento

### Testar PWA Localmente
```bash
# Rodar servidor dev
npm run dev

# Acessar via mobile na mesma rede
http://10.10.86.27:3000/mobile

# Abrir DevTools → Application
# Verificar Manifest, Service Workers, Cache Storage
```

### Debug Mobile
1. Chrome DevTools → Remote Devices
2. Safari → Develop → iPhone
3. Console logs via `chrome://inspect`

## 📝 Notas Técnicas

- **Photos Storage:** Atualmente em `/public/uploads`, migrar para cloud em produção
- **GPS Accuracy:** `enableHighAccuracy: true` consome mais bateria
- **Signature Canvas:** Touch events devem ter `touch-action: none` para evitar scroll
- **Service Worker:** Atualiza em background, requer reload para nova versão
- **iOS Limitations:** PWA no iOS não suporta Push Notifications completas

## 🔗 Links Úteis

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2025  
**Desenvolvido para:** GTSnet Provedor de Internet
