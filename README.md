# Mazagão Gás - Central de Comando

Sistema operacional de alta performance para distribuição de gás em Guarujá.

## 🚀 Como acessar o Admin (Central de Comando)

A senha não está no código por segurança. Você deve criar seu próprio acesso:

1. **Crie o Usuário:** Vá no console do Supabase > Authentication > Users e crie um usuário (ex: `admin@mazagao.com`).
2. **Atribua a Role:** No SQL Editor do Supabase, execute:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'seu-email-criado@mazagao.com';
   ```
3. **Login:** Use essas credenciais em `/admin/login`.

## 🛠️ Resolução de Erros de Git

Se o seu `push` for rejeitado por segredos no histórico, use esta sequência:

```bash
# 1. Remova o commit contaminado (mantendo os arquivos)
git reset --soft HEAD~1

# 2. Adicione os arquivos limpos
git add .

# 3. Novo commit seguro
git commit -m "fix: hardened infrastructure and removed secrets"

# 4. Envie forçando a limpeza do histórico no GitHub
git push -u origin main --force
```

## 🔐 Configuração Obrigatória (Vercel/.env)

```env
NEXT_PUBLIC_SUPABASE_URL=https://henajghdqbaorbacthbg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

© 2026 Mazagão Gás - Energia em Movimento.