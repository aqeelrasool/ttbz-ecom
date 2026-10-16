import React, { useState, useEffect } from "react";
import {
  Package,
  FolderTree,
  Database,
  Settings,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  ExternalLink,
  Search,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import ProductFormModal from "./ProductFormModal";
import {
  saveCategory,
  deleteCategory,
  saveProduct,
  deleteProduct,
  saveSettings,
  testSupabaseConnection,
  syncLocalToSupabase,
  resetToDefaults,
} from "../../services/db";

export default function AdminDashboard({
  categories = [],
  products = [],
  settings,
  onRefreshData,
  onExitAdmin,
}) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("ttbz_admin_logged_in") === "true";
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Tabs: 'products' | 'categories' | 'database' | 'settings'
  const [activeTab, setActiveTab] = useState("products");

  // Product modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");

  // Category modal / edit state
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  // Database settings state
  const [supabaseUrl, setSupabaseUrl] = useState(settings?.supabaseUrl || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings?.supabaseAnonKey || "");
  const [dbTestResult, setDbTestResult] = useState(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Store settings form state
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsappNumber || "923256393722");
  const [announcement, setAnnouncement] = useState(settings?.announcement || "");
  const [currency, setCurrency] = useState(settings?.currency || "PKR");
  const [newAdminUser, setNewAdminUser] = useState(settings?.adminUsername || "admin");
  const [newAdminPass, setNewAdminPass] = useState(settings?.adminPassword || "admin123");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    const correctUser = settings?.adminUsername || "admin";
    const correctPass = settings?.adminPassword || "admin123";

    if (loginUsername === correctUser && loginPassword === correctPass) {
      setIsAuthenticated(true);
      sessionStorage.setItem("ttbz_admin_logged_in", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid admin credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ttbz_admin_logged_in");
    setIsAuthenticated(false);
  };

  // Products Handlers
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    await saveProduct(productData);
    setIsProductModalOpen(false);
    onRefreshData();
  };

  const handleDeleteProduct = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteProduct(id);
      onRefreshData();
    }
  };

  // Category Handlers
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const payload = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: categoryName.trim(),
      slug: categoryName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: categoryDesc.trim(),
      displayOrder: editingCategory?.displayOrder || categories.length + 1,
    };

    await saveCategory(payload);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDesc("");
    onRefreshData();
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Delete category "${name}"? Products linked to this category will not be deleted.`)) {
      await deleteCategory(id);
      onRefreshData();
    }
  };

  // Database Connection test
  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setDbTestResult({ success: false, message: "Please provide both Supabase URL and Anon Key." });
      return;
    }
    setIsTestingDb(true);
    setDbTestResult(null);
    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setDbTestResult(result);
    setIsTestingDb(false);
  };

  const handleSaveDbSettings = async () => {
    await saveSettings({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
    });
    alert("Database credentials saved! Connecting to Supabase.");
    onRefreshData();
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await syncLocalToSupabase();
      alert(`Success! Synced ${res.count} products and categories to your Supabase PostgreSQL database.`);
      onRefreshData();
    } catch (err) {
      alert("Sync failed: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    const sql = `-- Tiny Threads By Zirwa Database Schema
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL, description TEXT, display_order INT DEFAULT 0);
CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, images JSONB DEFAULT '[]'::jsonb, is_featured BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS product_categories (product_id TEXT REFERENCES products(id) ON DELETE CASCADE, category_id TEXT REFERENCES categories(id) ON DELETE CASCADE, PRIMARY KEY (product_id, category_id));
CREATE TABLE IF NOT EXISTS product_sizes (id SERIAL PRIMARY KEY, product_id TEXT REFERENCES products(id) ON DELETE CASCADE, size VARCHAR(100) NOT NULL, price NUMERIC(10, 2) NOT NULL, in_stock BOOLEAN DEFAULT true, display_order INT DEFAULT 0);
CREATE TABLE IF NOT EXISTS store_settings (key VARCHAR(100) PRIMARY KEY, value TEXT NOT NULL);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Public read product_sizes" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Public read store_settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Public write categories" ON categories FOR ALL USING (true);
CREATE POLICY "Public write products" ON products FOR ALL USING (true);
CREATE POLICY "Public write product_categories" ON product_categories FOR ALL USING (true);
CREATE POLICY "Public write product_sizes" ON product_sizes FOR ALL USING (true);
CREATE POLICY "Public write store_settings" ON store_settings FOR ALL USING (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    await saveSettings({
      whatsappNumber: whatsappNumber.trim(),
      announcement: announcement.trim(),
      currency: currency.trim(),
      adminUsername: newAdminUser.trim(),
      adminPassword: newAdminPass.trim(),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
    onRefreshData();
  };

  const handleExportBackup = () => {
    const data = {
      categories,
      products,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ttbz_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCategory =
      productCategoryFilter === "all" ||
      (p.categoryIds && p.categoryIds.includes(productCategoryFilter));
    return matchesSearch && matchesCategory;
  });

  // ----------------------------------------------------------------------
  // LOGIN SCREEN (URL-Only Protected Gate)
  // ----------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAF7F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "32px 28px",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--border-subtle)",
            textAlign: "center",
          }}
        >
          <img
            src="/ttbz-logo.png"
            alt="Tiny Threads By Zirwa"
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              margin: "0 auto 16px",
              backgroundColor: "#FAF7F2",
              padding: "4px",
              border: "1.5px solid var(--teal-300)",
            }}
          />

          <h2 className="font-serif" style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
            Admin Portal
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "24px" }}>
            Tiny Threads By Zirwa • Private Management Access
          </p>

          {loginError && (
            <div
              style={{
                backgroundColor: "#fde8e8",
                color: "#c81e1e",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "0.8rem",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <AlertCircle size={15} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "left" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                Username
              </label>
              <input
                type="text"
                placeholder="admin"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ textAlign: "left" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: "10px",
                padding: "12px",
                backgroundColor: "var(--teal-700)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
            >
              Sign In to Admin
            </button>
          </form>

          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
            <button
              onClick={onExitAdmin}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--teal-600)",
                fontSize: "0.8rem",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              ← Back to Storefront
            </button>
            <div style={{ fontSize: "0.72rem", color: "var(--text-light)", marginTop: "8px" }}>
              Default credentials: <code style={{ backgroundColor: "#f5f5f5", padding: "1px 4px", borderRadius: "3px" }}>admin / admin123</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // ----------------------------------------------------------------------
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF7F2", display: "flex", flexDirection: "column" }}>
      {/* Admin Top Header */}
      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "12px 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/ttbz-logo.png"
              alt="Logo"
              style={{ width: "36px", height: "36px", borderRadius: "50%", padding: "2px", border: "1px solid var(--teal-300)" }}
            />
            <div>
              <span className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--teal-900)" }}>
                Tiny Threads Admin
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--gold-primary)", fontWeight: 700, marginLeft: "8px" }}>
                EST. 2024
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={onExitAdmin}
              title="View Customer Storefront"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--teal-300)",
                backgroundColor: "var(--teal-50)",
                color: "var(--teal-900)",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <ExternalLink size={14} />
              <span>Customer Storefront</span>
            </button>

            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                border: "1px solid #fbd5d5",
                backgroundColor: "#fff5f5",
                color: "#c81e1e",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "8px", marginTop: "14px", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", overflowX: "auto" }}>
          <button
            onClick={() => setActiveTab("products")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: activeTab === "products" ? "var(--teal-700)" : "transparent",
              color: activeTab === "products" ? "#ffffff" : "var(--text-main)",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Package size={16} />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: activeTab === "categories" ? "var(--teal-700)" : "transparent",
              color: activeTab === "categories" ? "#ffffff" : "var(--text-main)",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <FolderTree size={16} />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("database")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: activeTab === "database" ? "var(--teal-700)" : "transparent",
              color: activeTab === "database" ? "#ffffff" : "var(--text-main)",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Database size={16} />
            <span>Free DB & Storage Setup</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: activeTab === "settings" ? "var(--teal-700)" : "transparent",
              color: activeTab === "settings" ? "#ffffff" : "var(--text-main)",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Settings size={16} />
            <span>Store Settings & Password</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main style={{ flexGrow: 1, padding: "24px 16px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
        {/* ========================================================= */}
        {/* TAB 1: PRODUCTS MANAGER */}
        {/* ========================================================= */}
        {activeTab === "products" && (
          <div>
            {/* Action Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
              <div>
                <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--teal-900)" }}>
                  Products Catalog
                </h2>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Create handcrafted items, configure size-specific prices, and link across multiple categories
                </p>
              </div>

              <button
                onClick={handleOpenCreateProduct}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 18px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--teal-700)",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <Plus size={16} />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "16px",
                backgroundColor: "#ffffff",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ flex: "1 1 240px", position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                <input
                  type="text"
                  placeholder="Search products by title or description..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "36px", fontSize: "0.85rem" }}
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="input-field"
                style={{ width: "auto", minWidth: "160px", fontSize: "0.85rem" }}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid / Cards */}
            {filteredProducts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  backgroundColor: "#ffffff",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--border-subtle)",
                }}
              >
                <Package size={36} color="var(--teal-400)" style={{ margin: "0 auto 10px" }} />
                <h4 style={{ color: "var(--teal-900)", marginBottom: "4px" }}>No products found</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "14px" }}>
                  Try adjusting your search filter or add your first handcrafted product.
                </p>
                <button
                  onClick={handleOpenCreateProduct}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--teal-700)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Create Product
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {filteredProducts.map((prod) => {
                  const sizes = prod.sizes || [];
                  const matchedCats = categories.filter((c) => (prod.categoryIds || []).includes(c.id));

                  return (
                    <div
                      key={prod.id}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div>
                        {/* Image + Quick Info */}
                        <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                          <img
                            src={prod.images?.[0] || "/ttbz-logo.png"}
                            alt={prod.title}
                            style={{
                              width: "70px",
                              height: "70px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              backgroundColor: "#FAF7F2",
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              e.currentTarget.src = "/ttbz-logo.png";
                            }}
                          />
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                              {prod.isFeatured && (
                                <span className="badge-pill badge-gold" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                                  Featured
                                </span>
                              )}
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  color: prod.isActive !== false ? "#1e7e34" : "#999",
                                  fontWeight: 700,
                                }}
                              >
                                {prod.isActive !== false ? "● Active" : "○ Draft/Hidden"}
                              </span>
                            </div>
                            <h4
                              className="font-serif"
                              style={{
                                fontSize: "1.05rem",
                                fontWeight: 700,
                                color: "var(--teal-900)",
                                lineHeight: 1.25,
                              }}
                            >
                              {prod.title}
                            </h4>
                          </div>
                        </div>

                        {/* Multiple Categories tags */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                          {matchedCats.map((c) => (
                            <span
                              key={c.id}
                              style={{
                                fontSize: "0.68rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: "var(--teal-50)",
                                color: "var(--teal-800)",
                                fontWeight: 600,
                              }}
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>

                        {/* Sizes & Pricing Matrix summary */}
                        <div style={{ backgroundColor: "#faf8f5", padding: "8px 10px", borderRadius: "6px", marginBottom: "12px" }}>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, marginBottom: "4px" }}>
                            SIZES & PRICING ({sizes.length} SIZES):
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {sizes.map((s, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: "0.72rem",
                                  backgroundColor: "#ffffff",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  border: "1px solid var(--border-subtle)",
                                  color: "var(--text-main)",
                                }}
                              >
                                <strong>{s.size}:</strong> {settings?.currency || "PKR"} {Number(s.price).toLocaleString()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            backgroundColor: "var(--teal-50)",
                            border: "1px solid var(--teal-300)",
                            color: "var(--teal-900)",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.title)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            backgroundColor: "#fff5f5",
                            border: "1px solid #fbd5d5",
                            color: "#c81e1e",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CATEGORIES MANAGER */}
        {/* ========================================================= */}
        {activeTab === "categories" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {/* Create / Edit Category Form */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
                height: "fit-content",
              }}
            >
              <h3 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Products can be linked to multiple categories simultaneously.
              </p>

              <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eid Handcrafted Collection"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description for category..."
                    value={categoryDesc}
                    onChange={(e) => setCategoryDesc(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    type="submit"
                    style={{
                      flexGrow: 1,
                      padding: "10px",
                      borderRadius: "6px",
                      backgroundColor: "var(--teal-700)",
                      color: "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {editingCategory ? "Update Category" : "Create Category"}
                  </button>

                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryName("");
                        setCategoryDesc("");
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-subtle)",
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Existing Categories List */}
            <div>
              <h3 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "12px" }}>
                Active Categories ({categories.length})
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {categories.map((cat) => {
                  const linkedCount = products.filter((p) => (p.categoryIds || []).includes(cat.id)).length;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "14px 16px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--teal-900)" }}>
                            {cat.name}
                          </span>
                          <span className="badge-pill badge-mint" style={{ fontSize: "0.68rem" }}>
                            {linkedCount} {linkedCount === 1 ? "Product" : "Products"}
                          </span>
                        </div>
                        {cat.description && (
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {cat.description}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryName(cat.name);
                            setCategoryDesc(cat.description || "");
                          }}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "4px",
                            backgroundColor: "var(--teal-50)",
                            border: "1px solid var(--teal-300)",
                            cursor: "pointer",
                          }}
                        >
                          <Edit2 size={13} color="var(--teal-800)" />
                        </button>

                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "4px",
                            backgroundColor: "#fff5f5",
                            border: "1px solid #fbd5d5",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} color="#c81e1e" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FREE DATABASE & STORAGE SETUP */}
        {/* ========================================================= */}
        {activeTab === "database" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Guide Card */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <Database size={24} color="var(--teal-600)" />
                <h3 className="font-serif" style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--teal-900)" }}>
                  100% Free PostgreSQL & Image Storage (Supabase / Neon)
                </h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "16px" }}>
                Your store currently runs in <strong>High-Performance Browser Cache & Local Storage</strong>, allowing you to edit products and orders immediately. To connect a permanent online database for 100% free with <strong>NO backend code required</strong>, follow these 3 steps:
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "14px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ backgroundColor: "#FAF7F2", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--teal-900)", marginBottom: "4px" }}>
                    1. Create Free Supabase Project
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: "var(--teal-600)", fontWeight: 700 }}>supabase.com</a> and create a free project (Free forever, includes 500MB DB & 1GB image storage).
                  </p>
                </div>

                <div style={{ backgroundColor: "#FAF7F2", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--teal-900)", marginBottom: "4px" }}>
                    2. Run SQL Schema
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Click the <strong>Copy SQL Schema</strong> button below, open your Supabase SQL Editor, paste and click Run!
                  </p>
                </div>

                <div style={{ backgroundColor: "#FAF7F2", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--teal-900)", marginBottom: "4px" }}>
                    3. Paste Project URL & Key
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    In Project Settings &gt; API, copy the <strong>Project URL</strong> and <strong>anon public key</strong>, and paste them in the form below.
                  </p>
                </div>
              </div>

              {/* Database Credentials Form */}
              <div style={{ backgroundColor: "var(--teal-50)", padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--teal-200)", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "12px" }}>
                  Supabase / Online PostgreSQL Credentials
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                      Project URL (e.g. https://xyz.supabase.co)
                    </label>
                    <input
                      type="text"
                      placeholder="https://your-project-id.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                      Anon Public Key (safe to use in frontend client)
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {dbTestResult && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      marginBottom: "14px",
                      fontSize: "0.82rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: dbTestResult.success ? "#e8f5e9" : "#ffebee",
                      color: dbTestResult.success ? "#1e7e34" : "#c62828",
                    }}
                  >
                    {dbTestResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{dbTestResult.message}</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingDb}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      backgroundColor: "#ffffff",
                      border: "1px solid var(--teal-500)",
                      color: "var(--teal-900)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {isTestingDb ? "Testing..." : "Test Connection"}
                  </button>

                  <button
                    onClick={handleSaveDbSettings}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "6px",
                      backgroundColor: "var(--teal-700)",
                      color: "#ffffff",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Save Credentials
                  </button>

                  <button
                    onClick={handleSyncToSupabase}
                    disabled={isSyncing}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      backgroundColor: "var(--teal-800)",
                      color: "#ffffff",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <RefreshCw size={14} className={isSyncing ? "spin" : ""} />
                    <span>{isSyncing ? "Syncing..." : "Sync Local Data to Supabase"}</span>
                  </button>
                </div>
              </div>

              {/* Copy SQL Schema button */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={handleCopySql}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#FAF7F2",
                    border: "1.5px solid var(--teal-500)",
                    color: "var(--teal-900)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Copy size={16} />
                  <span>{copiedSql ? "✓ Copied to Clipboard!" : "Copy SQL Schema (schema.sql)"}</span>
                </button>

                <button
                  onClick={handleExportBackup}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Download size={15} />
                  <span>Export JSON Backup</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Reset all products and categories to sample boutique designs?")) {
                      resetToDefaults();
                      onRefreshData();
                      alert("Reset to initial sample designs!");
                    }
                  }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Reset to Factory Demo Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: STORE SETTINGS & PASSWORD */}
        {/* ========================================================= */}
        {activeTab === "settings" && (
          <div
            style={{
              maxWidth: "600px",
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 className="font-serif" style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
              Store Settings & Admin Password
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              Configure your WhatsApp order recipient and single-admin credentials.
            </p>

            {settingsSaved && (
              <div
                style={{
                  backgroundColor: "#e8f5e9",
                  color: "#1e7e34",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckCircle size={16} />
                <span>Settings saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveStoreSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                  WhatsApp Phone Number for Orders *
                </label>
                <input
                  type="text"
                  placeholder="923256393722"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="input-field"
                  required
                />
                <span style={{ fontSize: "0.72rem", color: "var(--text-light)" }}>
                  Orders placed via "Click here to place order on whatsapp" will be sent to this number.
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                  Currency Symbol
                </label>
                <input
                  type="text"
                  placeholder="PKR"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                  Top Announcement Banner
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free Delivery on orders over PKR 5,000"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "10px" }}>
                  Admin Login Credentials
                </h4>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 180px" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                      Admin Username
                    </label>
                    <input
                      type="text"
                      value={newAdminUser}
                      onChange={(e) => setNewAdminUser(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div style={{ flex: "1 1 180px" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "4px" }}>
                      Admin Password
                    </label>
                    <input
                      type="password"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--teal-700)",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Settings & Credentials
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => setIsProductModalOpen(false)}
          currency={settings?.currency || "PKR"}
        />
      )}
    </div>
  );
}
