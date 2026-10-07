-- ecommerce_schema.sql

-- Database creation (Run this manually if needed: CREATE DATABASE ecommerce_db;)

-- Users table (E-commerce specific - Perfil B2B)
CREATE TABLE IF NOT EXISTS ecommerce_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Datos Generales
    razon_social VARCHAR(150),
    tipo_cliente VARCHAR(50),
    direccion_legal TEXT,
    localidad VARCHAR(100),
    codigo_postal VARCHAR(50),
    ciudad VARCHAR(100),
    country_id INTEGER, -- FK to countries
    phone VARCHAR(50), -- Teléfono General
    fecha_limite_facturacion DATE,
    web VARCHAR(255),
    
    -- Datos de Envío y Fiscal (Ship To)
    report_to_country_id INTEGER, -- FK to countries
    vendedor VARCHAR(100),
    direccion_entrega TEXT,
    localidad_entrega VARCHAR(100),
    codigo_postal_entrega VARCHAR(50),
    ciudad_entrega VARCHAR(100),
    pais_entrega_id INTEGER, -- FK to countries
    tipo_iva VARCHAR(50),
    numero_nit VARCHAR(100),
    
    -- Contactos (Compras)
    nombre_compras VARCHAR(100),
    telefono_compras VARCHAR(50),
    email_compras VARCHAR(150),
    
    -- Contactos (Pagos)
    nombre_pagos VARCHAR(100),
    telefono_pagos VARCHAR(50),
    email_pagos VARCHAR(150),
    
    -- Contactos (Administración)
    nombre_admin VARCHAR(100),
    telefono_admin VARCHAR(50),
    email_admin VARCHAR(150),
    
    -- Mails de Referencia
    email_factura_electronica VARCHAR(150),
    email_contacto_compras VARCHAR(150),
    email_cotizaciones_automaticas VARCHAR(150),
    
    -- Compatibility legacy fields
    address TEXT,
    company VARCHAR(150),
    cuenta_corriente_habilitada BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Countries table
CREATE TABLE IF NOT EXISTS ecommerce_countries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    nationalization_cost DECIMAL(10, 2) DEFAULT 0,
    discount_rate DECIMAL(5, 2) DEFAULT 0
);

-- Establish FK for users country
ALTER TABLE ecommerce_users ADD CONSTRAINT fk_user_country FOREIGN KEY (country_id) REFERENCES ecommerce_countries(id) ON DELETE SET NULL;

-- Products table
CREATE TABLE IF NOT EXISTS ecommerce_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100) DEFAULT 'General',
    subcategory VARCHAR(100),
    sku VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    promotional_price DECIMAL(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    weight VARCHAR(50),
    depth VARCHAR(50),
    width VARCHAR(50),
    height VARCHAR(50),
    image_url VARCHAR(255),
    secondary_images JSONB,
    highlights TEXT,
    warranty VARCHAR(150) DEFAULT '12 Meses con RMA y Soporte DACAS',
    datasheet_url VARCHAR(255),
    condition VARCHAR(100) DEFAULT 'Nuevo Sellado',
    related_ids JSONB,
    related_skus JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Stock per Country
CREATE TABLE IF NOT EXISTS ecommerce_product_stock (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES ecommerce_products(id) ON DELETE CASCADE,
    country_id INTEGER REFERENCES ecommerce_countries(id) ON DELETE CASCADE,
    stock INTEGER NOT NULL DEFAULT 0,
    UNIQUE(product_id, country_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS ecommerce_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES ecommerce_users(id),
    country_id INTEGER REFERENCES ecommerce_countries(id),
    total DECIMAL(10, 2) NOT NULL,
    tax_applied DECIMAL(10, 2) DEFAULT 0,
    shipping_applied DECIMAL(10, 2) DEFAULT 0,
    nationalization_applied DECIMAL(10, 2) DEFAULT 0,
    discount_applied DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE IF NOT EXISTS ecommerce_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES ecommerce_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES ecommerce_products(id),
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- Insert some dummy products
INSERT INTO ecommerce_products (name, description, price, stock, image_url) VALUES 
('Ticket Básico - Conferencia Tech 2026', 'Acceso general a los 3 días de la conferencia.', 150.00, 100, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'),
('Ticket VIP - Conferencia Tech 2026', 'Acceso general + Meet & Greet con speakers + Almuerzo incluido.', 350.00, 20, 'https://images.unsplash.com/photo-1492539438225-2178229c92cc?q=80&w=2121&auto=format&fit=crop'),
('T-Shirt Oficial Evento', 'Camiseta de algodón 100% con el logo del evento.', 25.00, 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop')
ON CONFLICT DO NOTHING;

-- Dynamic Pricing Rules Engine Table
CREATE TABLE IF NOT EXISTS ecommerce_pricing_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,          
    rule_type VARCHAR(50) NOT NULL,      -- 'discount', 'tax', 'shipping', 'nationalization'
    value_type VARCHAR(50) NOT NULL,     -- 'percentage', 'fixed'
    value NUMERIC(10,2) NOT NULL,        
    
    -- Condiciones (si es NULL, aplica a todos)
    product_id INTEGER REFERENCES ecommerce_products(id) ON DELETE CASCADE,
    country_id INTEGER REFERENCES ecommerce_countries(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES ecommerce_users(id) ON DELETE CASCADE,
    
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
