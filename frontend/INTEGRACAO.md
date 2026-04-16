# Integração Frontend - TechRent

## 📋 O que foi adicionado

Este frontend foi refatorado com componentes profissionais reutilizáveis e contextos para melhor organização do código.

### Estrutura de Arquivos

```
src/
├── contexts/
│   ├── AuthContext.jsx       # Gerenciamento de autenticação
│   └── ToastContext.jsx      # Sistema de notificações
├── lib/
│   └── api.js                # Cliente HTTP centralizado
├── components/
│   └── ui/
│       ├── Badge.jsx         # Badges semânticas
│       ├── Form.jsx          # Componentes de formulário
│       ├── Modal.jsx         # Modais
│       └── Card.jsx          # Cards e stats
├── app/
│   ├── layout.jsx            # Layout com providers
│   ├── page.jsx              # Dashboard principal
│   └── globals.css           # Estilos globais
```

## 🚀 Como usar

### 1. Instalar dependências
```bash
cd frontend
npm install
```

### 2. Configurar variáveis de ambiente
O arquivo `.env.local` já está configurado com:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Se sua API está em outra porta, atualize este arquivo.

### 3. Rodar o servidor
```bash
npm run dev
```

Acesse em `http://localhost:3000`

## 📦 Componentes Disponíveis

### Form Components
```jsx
import { Input, Textarea, Select, Button, Label, FormGroup } from "@/components/ui/Form";

<FormGroup label="Email" error={error}>
  <Input type="email" placeholder="seu@email.com" />
</FormGroup>

<Button variant="default" size="lg">Enviar</Button>
```

### Badge
```jsx
import { Badge } from "@/components/ui/Badge";

<Badge status="pendente">Pendente</Badge>
<Badge status="ativo">Ativo</Badge>
<Badge status="finalizado">Finalizado</Badge>
```

### Modal
```jsx
import { Modal, ModalWithFooter } from "@/components/ui/Modal";

<Modal isOpen={open} onClose={() => setOpen(false)} title="Título">
  Conteúdo
</Modal>

<ModalWithFooter
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Título"
  footer={<Button>Salvar</Button>}
>
  Conteúdo
</ModalWithFooter>
```

### Card Components
```jsx
import { Card, CardHeader, CardTitle, CardContent, StatsCard, PageHeader, EmptyState } from "@/components/ui/Card";

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>

<StatsCard title="Métrica" value={42} />

<PageHeader title="Página" description="Descrição" action={<Button>Ação</Button>} />

<EmptyState title="Vazio" description="Nenhum resultado" />
```

## 🔐 Autenticação

O sistema usa JWT com localStorage:

```jsx
import { useAuth } from "@/contexts/AuthContext";

export function MeuComponente() {
  const { user, token, login, logout, isAuthenticated } = useAuth();
  
  return (
    <>
      {isAuthenticated ? (
        <p>Bem-vindo, {user.nome}</p>
      ) : (
        <p>Não autenticado</p>
      )}
    </>
  );
}
```

## 🔔 Notificações

Use o contexto de Toast para mostrar mensagens:

```jsx
import { useToast } from "@/contexts/ToastContext";

export function MeuComponente() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  
  const handleClick = async () => {
    try {
      // fazer algo
      showSuccess("Operação realizada com sucesso!");
    } catch (error) {
      showError(error.message);
    }
  };
  
  return <button onClick={handleClick}>Clique aqui</button>;
}
```

## 🔌 API Client

Use o cliente HTTP centralizado:

```jsx
import { chamadosAPI, equipamentosAPI, authAPI } from "@/lib/api";

// Listar chamados
const chamados = await chamadosAPI.getAll();

// Criar chamado
await chamadosAPI.create({
  titulo: "Problema",
  descricao: "Descrição",
  equipamento_id: 1,
  prioridade: "alta"
});

// Atualizar status
await chamadosAPI.updateStatus(1, "finalizado");

// Login
const { token, usuario } = await authAPI.login("email@example.com", "senha");
```

## 🎨 Design System

O projeto usa Tailwind CSS 4 com um design minimalista corporativo:

- **Cores:** Branco, Cinza, Azul
- **Bordas:** Sutis com `border-white/40`
- **Sombras:** `shadow-sm` com `backdrop-blur`
- **Transições:** Suaves com `transition`

## 📝 Notas Importantes

1. **Next.js 16:** O projeto usa App Router (não Pages Router)
2. **"use client":** Componentes que usam hooks precisam da diretiva `"use client"`
3. **Variáveis de Ambiente:** Prefixe com `NEXT_PUBLIC_` para usar no cliente
4. **API URL:** Configurável em `.env.local`

## 🐛 Troubleshooting

### Erro de CORS
Se receber erro de CORS, verifique:
1. A API está rodando em `http://localhost:8080`
2. A API tem CORS habilitado
3. A URL em `.env.local` está correta

### Token não funciona
1. Verifique se o token está sendo salvo em localStorage
2. Confirme que a API retorna `{ token, usuario }` no login
3. Teste a requisição com o token no header: `Authorization: Bearer {token}`

### Componentes não aparecem
1. Verifique se está importando corretamente de `@/components/ui/`
2. Confirme que o `@` alias está configurado em `jsconfig.json`
3. Reinicie o servidor com `npm run dev`

## 📚 Referências

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Desenvolvido com ❤️ para TechRent**
