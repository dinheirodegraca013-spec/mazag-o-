# Mazagão Gás - Central de Comando

Sistema operacional de alta performance para distribuição de gás em Guarujá.

## 🚀 Como resolver o erro de GIT e Push

Se você receber o erro `rejected (fetch first)` ou o bloqueio de `Push Protection`, execute estes comandos exatamente nesta ordem para limpar o histórico e subir a versão segura:

```bash
# 1. Adicione o repositório remoto (caso não tenha adicionado)
git remote add origin https://github.com/dinheirodegraca013-spec/mazag-o-.git

# 2. Force a adição de todos os arquivos limpos
git add .

# 3. Crie um novo commit de correção
git commit -m "fix: hardened supabase infrastructure and removed secrets"

# 4. Envie para o GitHub forçando a limpeza do histórico contaminado
git push -u origin main --force
```

## 🔐 Configuração do Supabase

Configure estas variáveis no seu painel da Vercel ou `.env.local` para que o sistema funcione:

```env
NEXT_PUBLIC_SUPABASE_URL=https://henajghdqbaorbacthbg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

© 2026 Mazagão Gás - Energia em Movimento.
