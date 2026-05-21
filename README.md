
# Mazagão Gás - Central de Comando 🚀

Sistema operacional de alta performance para distribuição de gás em Guarujá.

## 🛠️ Configuração Inicial do Banco de Dados

Para que o sistema funcione, você **precisa** rodar o schema no seu Supabase:

1. Acesse o [Dashboard do Supabase](https://supabase.com).
2. Vá em **SQL Editor** > **New Query**.
3. Copie o conteúdo de `supabase/schema.sql` (disponível no projeto) e cole lá.
4. Clique em **Run**.

## 🔐 Acesso Administrativo

1. No Supabase, vá em **Authentication** > **Users** > **Add User**.
2. Crie um usuário (Ex: `admin@mazagao.com`).
3. No **SQL Editor**, execute:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'admin@mazagao.com';
   ```
4. Agora use este e-mail e senha em `/admin/login`.

## 📦 Como subir para o GitHub com segurança

Como o histórico do seu GitHub pode estar travado ou conter segredos antigos, execute estes comandos no terminal:

```bash
# 1. Remova o histórico antigo e comece um novo (OPCIONAL - se o push falhar)
# rm -rf .git
# git init
# git remote add origin https://github.com/dinheirodegraca013-spec/mazag-o-.git

# 2. Adicione e Comite
git add .
git commit -m "feat: central de comando operacional v2.0"

# 3. Push Forçado (Para limpar o histórico remoto)
git push -u origin main --force
```

## ⚠️ Variáveis de Ambiente

As chaves do Supabase já estão no arquivo `.env`. No **Vercel** ou **App Hosting**, você deve adicionar essas mesmas variáveis nas configurações de ambiente do painel.

© 2026 Mazagão Gás - Energia em Movimento.
