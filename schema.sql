-- ========================================================
-- Tiny Threads By Zirwa - E-Commerce Database Schema
-- Compatible with Supabase, Neon DB, and standard PostgreSQL
-- 100% Free Tier Ready
-- ========================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fabric_tag TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Migration helper if table already exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_tag TEXT;


-- 3. PRODUCT_CATEGORIES (Many-to-Many junction table)
-- Allows a single product to belong to multiple categories
CREATE TABLE IF NOT EXISTS product_categories (
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- 4. PRODUCT_SIZES (Sizes with custom pricing per size)
CREATE TABLE IF NOT EXISTS product_sizes (
    id SERIAL PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0
);

-- 5. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- --------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for customers)
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read product_categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Public read product_sizes" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Public read store_settings" ON store_settings FOR SELECT USING (true);

-- Allow full access for authenticated admin or anon key (customizable)
CREATE POLICY "Admin write categories" ON categories FOR ALL USING (true);
CREATE POLICY "Admin write products" ON products FOR ALL USING (true);
CREATE POLICY "Admin write product_categories" ON product_categories FOR ALL USING (true);
CREATE POLICY "Admin write product_sizes" ON product_sizes FOR ALL USING (true);
CREATE POLICY "Admin write store_settings" ON store_settings FOR ALL USING (true);

-- --------------------------------------------------------
-- INITIAL DEFAULT SETTINGS
-- --------------------------------------------------------
INSERT INTO store_settings (key, value) VALUES
    ('whatsapp_number', '923256393722'),
    ('store_name', 'Tiny Threads By Zirwa'),
    ('currency', 'PKR'),
    ('announcement', '🌸 At least 30% payment is required to place the order because these dresses are made custom for you on order')
ON CONFLICT (key) DO NOTHING;

-- --------------------------------------------------------
-- 6. IMAGE GALLERY + STORAGE BUCKET (safe to re-run)
-- If you already ran the schema above, you only need to run this block.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_images (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    path TEXT,
    name TEXT,
    seq BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read gallery_images" ON gallery_images;
DROP POLICY IF EXISTS "Admin write gallery_images" ON gallery_images;
CREATE POLICY "Public read gallery_images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Admin write gallery_images" ON gallery_images FOR ALL USING (true);

-- Public storage bucket for product photos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete product-images" ON storage.objects;
CREATE POLICY "Public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public upload product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Public delete product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
