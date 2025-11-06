# 🚀 Guia de Deploy do PWA Mobile

## Opções de Deploy

### ✅ **Opção 1: Vercel (Recomendado - Grátis)**

1. **Commit e Push do código:**
```bash
git add .
git commit -m "feat: PWA mobile completo com instalações"
git push origin main
```

2. **No Vercel Dashboard:**
   - Já está conectado ao repositório
   - Deploy automático será feito
   - Aguarde build completar

3. **Configurar variáveis de ambiente:**
   - `DATABASE_URL` → Já configurado
   - `NEXTAUTH_SECRET` → Já configurado
   - `NEXTAUTH_URL` → Atualizar para URL de produção

4. **Acessar no celular:**
```
https://seu-app.vercel.app/mobile
```

5. **Instalar PWA:**
   - Banner automático aparecerá
   - Ou menu → "Instalar aplicativo"

---

### ✅ **Opção 2: Expo (Para App Nativo)**

Se quiser um **APK para baixar da Google Play** ou **App Store**:

```bash
# Converter PWA em app nativo
npx @capacitor/cli init
npx cap add android
npx cap add ios
npx cap sync
```

Mas isso é mais complexo e não necessário agora.

---

## 📦 Gerar APK (Opcional)

### **Usando Trusted Web Activity (TWA):**

1. **Instalar Bubblewrap:**
```bash
npm install -g @bubblewrap/cli
```

2. **Inicializar projeto:**
```bash
bubblewrap init --manifest=https://seu-app.vercel.app/manifest.json
```

3. **Build APK:**
```bash
bubblewrap build
```

4. **APK gerado em:**
```
app-release-signed.apk
```

5. **Distribuir:**
   - Google Play Console
   - Ou enviar APK direto (requires unknown sources)

---

## 🌐 Deploy para Produção

### **Checklist:**

- [ ] Fazer push do código para GitHub
- [ ] Vercel fará deploy automático
- [ ] Testar em https://seu-app.vercel.app/mobile
- [ ] Confirmar manifest.json acessível
- [ ] Confirmar service worker registrado
- [ ] Testar instalação no celular
- [ ] Testar funcionalidade offline
- [ ] Migrar uploads para Cloudinary/S3 (produção)

### **URLs importantes após deploy:**

```
App Web: https://seu-app.vercel.app
Mobile: https://seu-app.vercel.app/mobile
Manifest: https://seu-app.vercel.app/manifest.json
Service Worker: https://seu-app.vercel.app/service-worker.js
```

---

## 📱 Compartilhar com Técnicos

### **Método 1: Link Direto**
Envie por WhatsApp/Email:
```
Baixe o app GTSnet:
https://seu-app.vercel.app/mobile

Instruções:
1. Abra o link no celular
2. Clique em "Instalar App GTSnet"
3. Pronto! Ícone na tela inicial
```

### **Método 2: QR Code**
Gere um QR Code apontando para:
```
https://seu-app.vercel.app/mobile
```

Ferramentas:
- https://qr-code-generator.com
- https://www.qrcode-monkey.com

### **Método 3: WhatsApp Business**
Envie mensagem padrão:
```
📱 Novo App GTSnet - Instalação de Equipamentos

Olá! Agora você pode usar nosso app mobile:

🔗 Link: https://seu-app.vercel.app/mobile

Como instalar:
1️⃣ Abra o link no celular
2️⃣ Toque em "Instalar App"
3️⃣ Pronto! Use offline

Dúvidas? Responda esta mensagem.
```

---

## 🔒 Storage de Fotos (Produção)

Atualmente as fotos vão para `/public/uploads` (temporário).

### **Migrar para Cloudinary (Recomendado):**

1. **Criar conta grátis:**
   - https://cloudinary.com

2. **Instalar SDK:**
```bash
npm install cloudinary
```

3. **Criar API route melhorada:**
```typescript
// app/api/mobile/upload/route.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  
  const result = await cloudinary.uploader.upload(
    `data:${file.type};base64,${base64}`,
    { folder: 'gtsnet-instalacoes' }
  );
  
  return Response.json({ 
    success: true, 
    url: result.secure_url 
  });
}
```

4. **Adicionar variáveis no Vercel:**
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

---

## 📊 Monitorar Instalações

### **Google Analytics (Opcional):**

```bash
npm install @next/third-parties
```

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

---

## ✅ Tudo Pronto!

Depois do deploy no Vercel, o app estará disponível para instalação em qualquer celular com internet!

**Não precisa de Google Play ou App Store!** 

É um PWA que funciona direto no navegador e pode ser instalado na tela inicial.
