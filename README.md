# Mazagão Gás - Central de Comando

Sistema operacional de alta performance para distribuição de gás em Guarujá.

## 🚀 Como resolver o erro de GIT e Push

Se você receber o erro `fatal: 'origin' does not appear to be a git repository`, execute estes comandos no terminal:

```bash
# 1. Adicione o repositório remoto
git remote add origin https://github.com/dinheirodegraca013-spec/mazag-o-.git

# 2. Se houver segredos no histórico, limpe o último commit
git reset --soft HEAD~1

# 3. Adicione as mudanças limpas
git add .
git commit -m "fix: hardened supabase infrastructure and removed secrets"

# 4. Envie para o GitHub
git push -u origin main --force
```

## 🔐 Configuração do Supabase

Configure estas variáveis no seu painel da Vercel ou `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://henajghdqbaorbacthbg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_secreta_service_role
```

© 2026 Mazagão Gás - Energia em Movimento.
