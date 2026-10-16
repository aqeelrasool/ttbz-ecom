import { createClient } from "@supabase/supabase-js";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from "../data/initialData";

const STORAGE_KEYS = {
  CATEGORIES: "ttbz_categories",
  PRODUCTS: "ttbz_products",
  SETTINGS: "ttbz_settings",
  AUTH: "ttbz_admin_session",
};

// Global active supabase instance
let supabaseInstance = null;

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const settings = getStoredSettings();
  const url = import.meta.env.VITE_SUPABASE_URL || settings.supabaseUrl;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || settings.supabaseAnonKey;

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
    }
  }
  return null;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

// ----------------------------------------------------------------------
// SETTINGS
// ----------------------------------------------------------------------
export function getStoredSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.announcement && parsed.announcement.includes("Free Delivery")) {
        parsed.announcement = INITIAL_SETTINGS.announcement;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return { ...INITIAL_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error("Error reading settings from localStorage", e);
  }
  return { ...INITIAL_SETTINGS };
}

export async function saveSettings(newSettings) {
  const merged = { ...getStoredSettings(), ...newSettings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
  resetSupabaseClient();
  return merged;
}

// ----------------------------------------------------------------------
// CATEGORIES
// ----------------------------------------------------------------------
export async function getCategories() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          displayOrder: c.display_order,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch categories failed, falling back to local:", err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Local reading error", e);
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  return INITIAL_CATEGORIES;
}

export async function saveCategory(category) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("categories").upsert({
        id: category.id || `cat-${Date.now()}`,
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
        description: category.description || "",
        display_order: category.displayOrder || 0,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Supabase category save error:", err);
    }
  }

  // Also update local storage cache
  const categories = await getCategories();
  const index = categories.findIndex((c) => c.id === category.id);
  let updated;
  if (index >= 0) {
    updated = [...categories];
    updated[index] = { ...category };
  } else {
    updated = [...categories, { ...category, id: category.id || `cat-${Date.now()}` }];
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  return updated;
}

export async function deleteCategory(categoryId) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("categories").delete().eq("id", categoryId);
    } catch (err) {
      console.error("Supabase delete category error:", err);
    }
  }

  const categories = await getCategories();
  const filtered = categories.filter((c) => c.id !== categoryId);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
  return filtered;
}

// ----------------------------------------------------------------------
// PRODUCTS
// ----------------------------------------------------------------------
export async function getProducts() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Fetch products, their categories, and sizes
      const { data: prodData, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!prodErr && prodData && prodData.length > 0) {
        const { data: catLinks } = await supabase.from("product_categories").select("*");
        const { data: sizeData } = await supabase.from("product_sizes").select("*");

        const hydrated = prodData.map((p) => {
          const categoryIds = (catLinks || [])
            .filter((link) => link.product_id === p.id)
            .map((link) => link.category_id);

          const sizes = (sizeData || [])
            .filter((s) => s.product_id === p.id)
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map((s) => ({
              size: s.size,
              price: Number(s.price),
              inStock: s.in_stock ?? true,
            }));

          return {
            id: p.id,
            title: p.title,
            description: p.description,
            fabricTag: p.fabric_tag || p.fabricTag || null,
            images: Array.isArray(p.images) ? p.images : [],
            categoryIds: categoryIds,
            sizes: sizes.length > 0 ? sizes : [{ size: "Standard", price: 0, inStock: true }],
            isFeatured: Boolean(p.is_featured),
            isActive: Boolean(p.is_active),
            created_at: p.created_at,
          };
        });

        return hydrated;
      }
    } catch (err) {
      console.warn("Supabase fetch products error, fallback to local:", err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Local reading error", e);
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

export async function saveProduct(product) {
  const id = product.id || `prod-${Date.now()}`;
  const fullProduct = {
    ...product,
    id,
    created_at: product.created_at || new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // 1. Upsert product
      const { error: pErr } = await supabase.from("products").upsert({
        id,
        title: fullProduct.title,
        description: fullProduct.description,
        fabric_tag: fullProduct.fabricTag || fullProduct.fabric_tag || null,
        images: fullProduct.images || [],
        is_featured: Boolean(fullProduct.isFeatured),
        is_active: fullProduct.isActive !== false,
        updated_at: new Date().toISOString(),
      });
      if (pErr) throw pErr;

      // 2. Refresh categories link (delete old and insert new)
      await supabase.from("product_categories").delete().eq("product_id", id);
      if (fullProduct.categoryIds && fullProduct.categoryIds.length > 0) {
        const catRows = fullProduct.categoryIds.map((cid) => ({
          product_id: id,
          category_id: cid,
        }));
        await supabase.from("product_categories").insert(catRows);
      }

      // 3. Refresh sizes (delete old and insert new)
      await supabase.from("product_sizes").delete().eq("product_id", id);
      if (fullProduct.sizes && fullProduct.sizes.length > 0) {
        const sizeRows = fullProduct.sizes.map((s, idx) => ({
          product_id: id,
          size: s.size,
          price: Number(s.price || 0),
          in_stock: s.inStock !== false,
          display_order: idx,
        }));
        await supabase.from("product_sizes").insert(sizeRows);
      }
    } catch (err) {
      console.error("Supabase product save error:", err);
    }
  }

  // Update local storage
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  let updated;
  if (index >= 0) {
    updated = [...products];
    updated[index] = fullProduct;
  } else {
    updated = [fullProduct, ...products];
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  return updated;
}

export async function deleteProduct(productId) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("products").delete().eq("id", productId);
    } catch (err) {
      console.error("Supabase delete product error:", err);
    }
  }

  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== productId);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  return filtered;
}

// ----------------------------------------------------------------------
// IMAGE UPLOAD (Supabase Storage or Base64 / URL)
// ----------------------------------------------------------------------
export async function uploadProductImage(file) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn("Supabase storage upload failed, converting to local data URL:", err);
    }
  }

  // Fallback: Read as compressed Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// ----------------------------------------------------------------------
// TEST CONNECTION & SYNC
// ----------------------------------------------------------------------
export async function testSupabaseConnection(url, key) {
  try {
    const testClient = createClient(url, key);
    const { data, error } = await testClient.from("categories").select("id").limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: "Connected successfully to Supabase PostgreSQL!" };
  } catch (err) {
    return { success: false, message: err.message || "Failed to connect" };
  }
}

export async function syncLocalToSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const categories = await getCategories();
  const products = await getProducts();

  // 1. Sync categories
  for (const cat of categories) {
    await supabase.from("categories").upsert({
      id: cat.id,
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
      description: cat.description || "",
      display_order: cat.displayOrder || 0,
    });
  }

  // 2. Sync products
  for (const prod of products) {
    await supabase.from("products").upsert({
      id: prod.id,
      title: prod.title,
      description: prod.description,
      images: prod.images || [],
      is_featured: Boolean(prod.isFeatured),
      is_active: prod.isActive !== false,
      updated_at: new Date().toISOString(),
    });

    // categories link
    await supabase.from("product_categories").delete().eq("product_id", prod.id);
    if (prod.categoryIds && prod.categoryIds.length > 0) {
      const rows = prod.categoryIds.map((cid) => ({
        product_id: prod.id,
        category_id: cid,
      }));
      await supabase.from("product_categories").insert(rows);
    }

    // sizes
    await supabase.from("product_sizes").delete().eq("product_id", prod.id);
    if (prod.sizes && prod.sizes.length > 0) {
      const sizeRows = prod.sizes.map((s, idx) => ({
        product_id: prod.id,
        size: s.size,
        price: Number(s.price || 0),
        in_stock: s.inStock !== false,
        display_order: idx,
      }));
      await supabase.from("product_sizes").insert(sizeRows);
    }
  }

  return { success: true, count: products.length };
}

// Reset to factory sample data
export function resetToDefaults() {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
}
