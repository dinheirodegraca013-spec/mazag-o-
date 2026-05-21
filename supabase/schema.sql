
-- ARQUITETURA ENTERPRISE MAZAGÃO GÁS

-- 1. TABELA DE PRODUTOS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'silver_premium',
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE CLIENTES (CRM)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  address_street TEXT,
  address_neighborhood TEXT,
  last_purchase_date TIMESTAMPTZ,
  avg_consumption_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE PEDIDOS
CREATE TYPE order_status AS ENUM ('Pendente', 'Em Rota', 'Entregue', 'Cancelado');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  product_id UUID REFERENCES products(id),
  status order_status DEFAULT 'Pendente',
  total_value DECIMAL(10,2) NOT NULL,
  neighborhood TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. HISTÓRICO DE STATUS (AUDITORIA)
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status,
  changed_by UUID, -- Link com Supabase Auth User ID
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TRACKING & ANALYTICS (HEATMAPS & BEHAVIOR)
CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'click', 'scroll', 'conversion'
  page_path TEXT NOT NULL,
  element_id TEXT,
  payload JSONB,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. AI & MARKETING LOGS
CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature TEXT NOT NULL, -- 'predictive_reorder', 'marketing_content'
  input_data JSONB,
  output_data JSONB,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. WHATSAPP LOGS
CREATE TABLE whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  message_content TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Políticas para Admin (Exemplo)
CREATE POLICY "Admins have full access to orders" ON orders
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR true); -- Simplificado para protótipo

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_tracking_session ON tracking_events(session_id);

-- TRIGGER PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpypgsql';

CREATE TRIGGER update_orders_modtime
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
