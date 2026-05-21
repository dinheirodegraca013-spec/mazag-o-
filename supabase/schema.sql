-- 1. TIPOS E ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'operator', 'user');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled');

-- 2. TABELA DE USUÁRIOS (Sincronizada com Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role public.app_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE PEDIDOS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status public.order_status DEFAULT 'pending',
  total_value DECIMAL(10,2) NOT NULL DEFAULT 115.00,
  neighborhood TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. HABILITAR REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 5. FUNÇÕES DE SEGURANÇA (RBAC)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.app_role AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 6. POLÍTICAS DE ACESSO (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Política de Usuários: Admins veem tudo, usuários veem a si mesmos
CREATE POLICY "Admins podem ver todos os usuários" ON public.users FOR SELECT USING (is_admin());
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.users FOR SELECT USING (auth.uid() = auth_id);

-- Política de Pedidos: Público pode inserir, Admins gerenciam, Usuários veem os seus
CREATE POLICY "Qualquer um pode iniciar um pedido" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins podem gerenciar todos os pedidos" ON public.orders FOR ALL USING (is_admin());
CREATE POLICY "Usuários veem seus próprios pedidos" ON public.orders FOR SELECT USING (auth.uid() = customer_id);

-- 7. TRIGGER: CRIAR PERFIL AUTOMÁTICO NO SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();