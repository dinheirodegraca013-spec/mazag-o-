# Mazagão Gás - Central de Comando

Sistema operacional de alta performance para distribuição de gás em Guarujá, integrando logística em tempo real e Inteligência Artificial Generativa.

## 🚀 Como começar (Deploy e Configuração)

Para que o sistema funcione corretamente, você deve configurar as variáveis de ambiente no seu painel da Vercel ou no arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=seu_projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_secreta_service_role
```

### 🔐 Acesso Administrativo

Para acessar o painel de controle da operação:

1. **URL:** `/admin/login`
2. **Credenciais Iniciais:**
   - Crie um usuário no seu painel do **Supabase Auth**.
   - No SQL Editor do Supabase, execute: 
     `UPDATE public.users SET role = 'admin' WHERE email = 'seu-email@exemplo.com';`

### 🛠️ Tecnologias
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, ShadCN UI.
- **IA:** Genkit + Gemini 2.5 Flash.
- **Backend:** Supabase (PostgreSQL, Auth & Realtime).

© 2026 Mazagão Gás - Energia em Movimento.
