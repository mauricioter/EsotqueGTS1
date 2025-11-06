# 📚 Documentação das APIs

Este documento descreve todas as rotas de API disponíveis no sistema.

## 🔐 Autenticação

### POST `/api/auth/[...nextauth]`
Rotas do NextAuth.js para autenticação.

**Suporte:**
- `POST /api/auth/callback/credentials` - Login com email/senha
- `POST /api/auth/callback/google` - Login com Google OAuth (se configurado)
- `GET /api/auth/session` - Obter sessão atual
- `POST /api/auth/signout` - Logout

### POST `/api/register`
Registra um novo usuário.

**Body:**
```json
{
  "nomeCompleto": "João Silva",
  "email": "joao@example.com",
  "cpf": "123.456.789-00",
  "numero": "123",
  "password": "senha123"
}
```

**Validações:**
- Nome completo: mínimo 3 caracteres
- Email: formato válido
- CPF: validação completa do dígito verificador
- Senha: mínimo 6 caracteres, deve conter letras e números
- Email e CPF devem ser únicos

**Resposta Sucesso (200):**
```json
{
  "id": "clxxx...",
  "role": "VIEWER",
  "status": "PENDING"
}
```

**Nota:** O primeiro usuário registrado é automaticamente ADMIN e APPROVED.

---

## 👥 Gerenciamento de Usuários

### POST `/api/admin/usuarios/approve`
Aprova um usuário pendente (apenas ADMIN).

**Headers:**
- Requer autenticação (sessão NextAuth)

**Permissões:** ADMIN

**Body:**
```json
{
  "userId": "clxxx...",
  "role": "OPERATOR"
}
```

**Roles disponíveis:**
- `ADMIN` - Acesso total
- `OPERATOR` - Cadastrar, editar e excluir equipamentos
- `VIEWER` - Apenas visualização

**Resposta (200):**
```json
{
  "id": "clxxx...",
  "status": "APPROVED",
  "role": "OPERATOR"
}
```

---

## 📦 Equipamentos

### GET `/api/equipamentos`
Lista todos os equipamentos.

**Query Params:** Nenhum

**Resposta (200):**
```json
[
  {
    "id": "clxxx...",
    "nome": "Roteador TP-Link",
    "descricao": "Dual Band AC1200",
    "serial": "SN123456",
    "mac": "AA:BB:CC:DD:EE:FF",
    "status": "DISPONIVEL",
    "dataEntrada": "2025-11-06T10:00:00.000Z",
    "dataSaida": null,
    "destino": null,
    "createdAt": "2025-11-06T10:00:00.000Z",
    "updatedAt": "2025-11-06T10:00:00.000Z"
  }
]
```

**Status possíveis:**
- `DISPONIVEL` - Disponível no estoque
- `EM_USO` - Em uso interno
- `EMPRESTADO` - Emprestado
- `MANUTENCAO` - Em manutenção
- `SAIDA` - Deu saída permanente

### POST `/api/equipamentos`
Cria um novo equipamento.

**Headers:**
- Requer autenticação (sessão NextAuth)

**Permissões:** ADMIN ou OPERATOR

**Body:**
```json
{
  "nome": "Roteador TP-Link",
  "descricao": "Dual Band AC1200",
  "serial": "SN123456",
  "mac": "AA:BB:CC:DD:EE:FF",
  "status": "DISPONIVEL",
  "destino": null,
  "dataEntrada": "2025-11-06T10:00:00.000Z"
}
```

**Campos obrigatórios:**
- `nome`
- `status`

**Resposta (201):**
```json
{
  "id": "clxxx...",
  "nome": "Roteador TP-Link",
  ...
}
```

**Erros:**
- `400` - Validação falhou
- `401` - Não autenticado
- `403` - Sem permissão

### GET `/api/equipamentos/[id]`
Busca um equipamento específico.

**Params:**
- `id` - ID do equipamento (cuid)

**Resposta (200):**
```json
{
  "id": "clxxx...",
  "nome": "Roteador TP-Link",
  ...
}
```

**Erros:**
- `404` - Equipamento não encontrado

### PUT `/api/equipamentos/[id]`
Atualiza um equipamento.

**Headers:**
- Requer autenticação (sessão NextAuth)

**Permissões:** ADMIN ou OPERATOR

**Params:**
- `id` - ID do equipamento

**Body:** (parcial)
```json
{
  "status": "SAIDA",
  "destino": "Filial São Paulo",
  "dataSaida": "2025-11-06T14:00:00.000Z"
}
```

**Resposta (200):**
```json
{
  "id": "clxxx...",
  "nome": "Roteador TP-Link",
  "status": "SAIDA",
  ...
}
```

**Erros:**
- `400` - Validação falhou
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Equipamento não encontrado

### DELETE `/api/equipamentos/[id]`
Exclui um equipamento.

**Headers:**
- Requer autenticação (sessão NextAuth)

**Permissões:** ADMIN ou OPERATOR

**Params:**
- `id` - ID do equipamento

**Resposta (200):**
```json
{
  "message": "Equipamento excluído com sucesso"
}
```

**Erros:**
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Equipamento não encontrado

---

## 🔒 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Validação falhou |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email duplicado) |
| 500 | Internal Server Error - Erro no servidor |

---

## 📝 Exemplos de Uso

### Exemplo: Cadastrar Equipamento

```javascript
const response = await fetch('/api/equipamentos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nome: 'Switch 24 Portas',
    descricao: 'Gigabit Ethernet',
    serial: 'SW987654',
    status: 'DISPONIVEL'
  })
});

const data = await response.json();
console.log(data);
```

### Exemplo: Registrar Saída

```javascript
const equipamentoId = 'clxxx...';

const response = await fetch(`/api/equipamentos/${equipamentoId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'SAIDA',
    destino: 'Cliente XYZ',
    dataSaida: new Date().toISOString()
  })
});

const data = await response.json();
console.log(data);
```

### Exemplo: Buscar Todos os Equipamentos

```javascript
const response = await fetch('/api/equipamentos');
const equipamentos = await response.json();

console.log(`Total: ${equipamentos.length}`);
equipamentos.forEach(eq => {
  console.log(`${eq.nome} - ${eq.status}`);
});
```

---

## 🛡️ Segurança

- Todas as rotas de escrita (POST, PUT, DELETE) requerem autenticação
- Rotas administrativas requerem role ADMIN
- Rotas de equipamentos (escrita) requerem role ADMIN ou OPERATOR
- Tokens JWT são utilizados via NextAuth.js
- Senhas são hasheadas com bcryptjs (salt rounds: 10)
- CSRF protection está habilitado

---

**Última atualização:** Novembro 2025
