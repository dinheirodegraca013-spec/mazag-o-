# Mazagão Gás - Central de Comando

Sistema operacional de alta performance para distribuição de gás em Guarujá.

## 🚀 Como configurar o Banco de Dados (Supabase)

Para que os pedidos parem de "sumir", você deve configurar o esquema no seu banco de dados:

1. **Acesse o Dashboard do Supabase.**
2. Vá em **SQL Editor** > **New Query**.
3. Copie o conteúdo do arquivo `supabase/schema.sql` deste projeto e cole lá.
4. Clique em **Run**.

## 🔐 Acesso Administrativo

1. **Crie o Usuário:** Vá em Authentication > Users > Add User.
2. **Atribua a Role de Admin:** No SQL Editor, execute:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'seu-email@mazagao.com';
   ```
3. **Login:** Use essas credenciais em `/admin/login`.

## 🛠️ Variáveis de Ambiente (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
GOOGLE_GENAI_API_KEY=sua_chave_gemini
```

© 2026 Mazagão Gás - Energia em Movimento.