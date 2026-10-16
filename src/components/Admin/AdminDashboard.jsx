import React, { useState } from "react";
import {
  Package, FolderTree, Database, Settings, Plus, Edit2, Trash2, LogOut, ExternalLink, Search,
  CheckCircle, AlertCircle, Copy, Download, RefreshCw, Images,
} from "lucide-react";
import ProductFormModal from "./ProductFormModal";
import GalleryPicker from "./GalleryPicker";
import {
  saveCategory, deleteCategory, saveProduct, deleteProduct, saveSettings,
  testSupabaseConnection, syncLocalToSupabase, resetToDefaults,
} from "../../services/db";
import schemaSql from "../../../schema.sql?raw";

const lbl = { display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: 4 };
const card = { backgroundColor: "#fff", padding: 20, borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" };
const heading = { fontSize: "1.3rem", fontWeight: 700, color: "var(--teal-900)" };

export default function AdminDashboard({ categories = [], products = [], settings, onRefreshData, onExitAdmin }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("ttbz_admin_logged_in") === "true");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // 'products' | 'categories' | 'gallery' | 'database' | 'settings'
  const [activeTab, setActiveTab] = useState("products");

  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");

  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  const [supabaseUrl, setSupabaseUrl] = useState(settings?.supabaseUrl || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings?.supabaseAnonKey || "");
  const [dbTestResult, setDbTestResult] = useState(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsappNumber || "923256393722");
  const [announcement, setAnnouncement] = useState(settings?.announcement || "");
  const [currency, setCurrency] = useState(settings?.currency || "PKR");
  const [newAdminUser, setNewAdminUser] = useState(settings?.adminUsername || "admin");
  const [newAdminPass, setNewAdminPass] = useState(settings?.adminPassword || "admin123");
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUsername === (settings?.adminUsername || "admin") && loginPassword === (settings?.adminPassword || "admin123")) {
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

  // Products
  const openProductModal = (prod = null) => { setEditingProduct(prod); setIsProductModalOpen(true); };
  const handleSaveProduct = async (productData) => {
    try {
      await saveProduct(productData);
      setIsProductModalOpen(false);
      onRefreshData();
    } catch (err) {
      alert(
        err?.name === "QuotaExceededError"
          ? "Browser storage is full. Connect your free Supabase database (Free DB tab) so photos are stored online."
          : "Could not save product: " + (err?.message || err)
      );
    }
  };
  const handleDeleteProduct = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteProduct(id);
      onRefreshData();
    }
  };

  // Categories
  const resetCategoryForm = () => { setEditingCategory(null); setCategoryName(""); setCategoryDesc(""); };
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    await saveCategory({
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: categoryName.trim(),
      slug: categoryName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: categoryDesc.trim(),
      displayOrder: editingCategory?.displayOrder || categories.length + 1,
    });
    resetCategoryForm();
    onRefreshData();
  };
  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Delete category "${name}"? Products linked to it will not be deleted.`)) {
      await deleteCategory(id);
      onRefreshData();
    }
  };

  // Database
  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) return setDbTestResult({ success: false, message: "Please provide both Supabase URL and Anon Key." });
    setIsTestingDb(true);
    setDbTestResult(null);
    setDbTestResult(await testSupabaseConnection(supabaseUrl, supabaseAnonKey));
    setIsTestingDb(false);
  };
  const handleSaveDbSettings = async () => {
    await saveSettings({ supabaseUrl: supabaseUrl.trim(), supabaseAnonKey: supabaseAnonKey.trim() });
    alert("Database credentials saved! Connecting to Supabase.");
    onRefreshData();
  };
  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await syncLocalToSupabase();
      alert(`Success! Synced ${res.count} products and categories to Supabase.`);
      onRefreshData();
    } catch (err) {
      alert("Sync failed: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleCopySql = () => {
    navigator.clipboard?.writeText(schemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };
  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify({ categories, products, settings, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ttbz_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    await saveSettings({
      whatsappNumber: whatsappNumber.trim(), announcement: announcement.trim(), currency: currency.trim(),
      adminUsername: newAdminUser.trim(), adminPassword: newAdminPass.trim(),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
    onRefreshData();
  };

  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
    const matchesCategory = productCategoryFilter === "all" || (p.categoryIds && p.categoryIds.includes(productCategoryFilter));
    return matchesSearch && matchesCategory;
  });

  // ---------------------------------------------------------------- Login
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ ...card, maxWidth: 400, width: "100%", padding: "32px 24px", boxShadow: "var(--shadow-lg)", textAlign: "center" }}>
          <img src="/ttbz-logo.png" alt="Tiny Threads By Zirwa" style={{ width: 68, height: 68, borderRadius: "50%", margin: "0 auto 16px", backgroundColor: "#FAF7F2", padding: 4, border: "1.5px solid var(--teal-300)" }} />
          <h1 className="font-serif" style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: 4 }}>Admin Portal</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 24 }}>Tiny Threads By Zirwa • Private access</p>

          {loginError && (
            <div style={{ backgroundColor: "#fde8e8", color: "#c81e1e", padding: "8px 12px", borderRadius: 6, fontSize: "0.8rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, textAlign: "left" }}>
              <AlertCircle size={15} /> <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
            <div>
              <label style={lbl} htmlFor="al-user">Username</label>
              <input id="al-user" type="text" autoComplete="username" autoCapitalize="none" placeholder="admin" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label style={lbl} htmlFor="al-pass">Password</label>
              <input id="al-pass" type="password" autoComplete="current-password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ minHeight: 46, marginTop: 6 }}>Sign In to Admin</button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
            <button type="button" onClick={onExitAdmin} style={{ background: "transparent", border: 0, color: "var(--teal-600)", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline", minHeight: 36 }}>
              ← Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "products", icon: Package, text: `Products (${products.length})` },
    { id: "categories", icon: FolderTree, text: `Categories (${categories.length})` },
    { id: "gallery", icon: Images, text: "Image Gallery" },
    { id: "database", icon: Database, text: "Free DB Setup" },
    { id: "settings", icon: Settings, text: "Settings" },
  ];

  // ------------------------------------------------------------ Dashboard
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF7F2", display: "flex", flexDirection: "column" }}>
      <header className="admin-bar">
        <div className="row-wrap" style={{ justifyContent: "space-between", flexWrap: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <img src="/ttbz-logo.png" alt="" style={{ width: 36, height: 36, borderRadius: "50%", padding: 2, border: "1px solid var(--teal-300)", flexShrink: 0 }} />
            <span className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--teal-900)", whiteSpace: "nowrap" }}>Tiny Threads Admin</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button type="button" className="pill-btn pill-teal" onClick={onExitAdmin} aria-label="View storefront" style={{ height: 38 }}>
              <ExternalLink size={15} /> <span className="label">Storefront</span>
            </button>
            <button type="button" className="pill-btn" onClick={handleLogout} aria-label="Sign out" style={{ height: 38, border: "1px solid #fbd5d5", background: "#fff5f5", color: "#c81e1e" }}>
              <LogOut size={15} /> <span className="label">Sign out</span>
            </button>
          </div>
        </div>

        <div className="admin-tabs" role="tablist">
          {tabs.map(({ id, icon: Icon, text }) => (
            <button key={id} type="button" role="tab" aria-selected={activeTab === id} className={`admin-tab ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>
              <Icon size={16} /> <span>{text}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="admin-main">
        {/* ------------------------------ PRODUCTS ------------------------------ */}
        {activeTab === "products" && (
          <div>
            <div className="row-wrap" style={{ justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 className="font-serif" style={heading}>Products Catalog</h2>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Size-specific prices & multiple categories</p>
              </div>
              <button type="button" className="btn btn-primary btn-block-sm" onClick={() => openProductModal()}>
                <Plus size={16} /> Add New Product
              </button>
            </div>

            <div className="row-wrap" style={{ ...card, padding: 12, marginBottom: 16, boxShadow: "none" }}>
              <div style={{ flex: "1 1 220px", position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                <input type="search" placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="input-field" style={{ paddingLeft: 36 }} aria-label="Search products" />
              </div>
              <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)} className="input-field" style={{ flex: "1 1 160px", width: "auto" }} aria-label="Filter by category">
                <option value="all">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{ ...card, textAlign: "center", padding: 40, borderStyle: "dashed" }}>
                <Package size={36} color="var(--teal-400)" style={{ margin: "0 auto 10px", display: "block" }} />
                <h3 style={{ color: "var(--teal-900)", marginBottom: 4 }}>No products found</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 14 }}>Adjust the filter or add your first product.</p>
                <button type="button" className="btn btn-primary" onClick={() => openProductModal()}>Create Product</button>
              </div>
            ) : (
              <div className="admin-grid">
                {filteredProducts.map((prod) => {
                  const sz = prod.sizes || [];
                  const cats = categories.filter((c) => (prod.categoryIds || []).includes(c.id));
                  return (
                    <div key={prod.id} style={{ ...card, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                          <img src={prod.images?.[0] || "/ttbz-logo.png"} alt={prod.title} style={{ width: 70, height: 70, borderRadius: 8, objectFit: "cover", backgroundColor: "#FAF7F2", flexShrink: 0 }} onError={(e) => { e.currentTarget.src = "/ttbz-logo.png"; }} />
                          <div style={{ minWidth: 0 }}>
                            <div className="row-wrap" style={{ gap: 6, marginBottom: 4 }}>
                              {prod.isFeatured && <span className="badge-pill badge-gold" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>Featured</span>}
                              <span style={{ fontSize: "0.68rem", color: prod.isActive !== false ? "#1e7e34" : "#999", fontWeight: 700 }}>{prod.isActive !== false ? "● Active" : "○ Hidden"}</span>
                              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{(prod.images || []).length} photo(s)</span>
                            </div>
                            <h3 className="font-serif" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--teal-900)", lineHeight: 1.25 }}>{prod.title}</h3>
                          </div>
                        </div>
                        <div className="row-wrap" style={{ gap: 4, marginBottom: 10 }}>
                          {cats.map((c) => <span key={c.id} className="chip chip-teal">{c.name}</span>)}
                        </div>
                        <div style={{ backgroundColor: "#faf8f5", padding: "8px 10px", borderRadius: 6, marginBottom: 12 }}>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, marginBottom: 4 }}>SIZES & PRICING ({sz.length})</div>
                          <div className="row-wrap" style={{ gap: 4 }}>
                            {sz.map((s, i) => (
                              <span key={i} style={{ fontSize: "0.72rem", background: "#fff", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--border-subtle)" }}>
                                <strong>{s.size}:</strong> {settings?.currency || "PKR"} {Number(s.price).toLocaleString()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--border-subtle)", paddingTop: 10 }}>
                        <button type="button" className="btn btn-outline" style={{ minHeight: 38, padding: "6px 14px" }} onClick={() => openProductModal(prod)}><Edit2 size={13} /> Edit</button>
                        <button type="button" className="btn" style={{ minHeight: 38, padding: "6px 14px", background: "#fff5f5", border: "1px solid #fbd5d5", color: "#c81e1e" }} onClick={() => handleDeleteProduct(prod.id, prod.title)}><Trash2 size={13} /> Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------ CATEGORIES ----------------------------- */}
        {activeTab === "categories" && (
          <div className="admin-two">
            <div style={{ ...card, height: "fit-content" }}>
              <h2 className="font-serif" style={{ ...heading, marginBottom: 4 }}>{editingCategory ? "Edit Category" : "Add New Category"}</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 16 }}>A product can belong to several categories.</p>
              <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={lbl} htmlFor="cat-name">Category Name *</label>
                  <input id="cat-name" type="text" placeholder="e.g. Eid Collection" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={lbl} htmlFor="cat-desc">Description</label>
                  <input id="cat-desc" type="text" placeholder="Short description…" value={categoryDesc} onChange={(e) => setCategoryDesc(e.target.value)} className="input-field" />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingCategory ? "Update Category" : "Create Category"}</button>
                  {editingCategory && <button type="button" className="btn btn-ghost" onClick={resetCategoryForm}>Cancel</button>}
                </div>
              </form>
            </div>

            <div>
              <h2 className="font-serif" style={{ ...heading, marginBottom: 12 }}>Active Categories ({categories.length})</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {categories.map((cat) => {
                  const n = products.filter((p) => (p.categoryIds || []).includes(cat.id)).length;
                  return (
                    <div key={cat.id} style={{ ...card, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div className="row-wrap" style={{ gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--teal-900)" }}>{cat.name}</span>
                          <span className="badge-pill badge-mint" style={{ fontSize: "0.68rem" }}>{n} {n === 1 ? "Product" : "Products"}</span>
                        </div>
                        {cat.description && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{cat.description}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button type="button" aria-label={`Edit ${cat.name}`} className="icon-btn" style={{ borderRadius: 6, background: "var(--teal-50)", borderColor: "var(--teal-300)" }} onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); setCategoryDesc(cat.description || ""); }}><Edit2 size={14} /></button>
                        <button type="button" aria-label={`Delete ${cat.name}`} className="icon-btn" style={{ borderRadius: 6, background: "#fff5f5", borderColor: "#fbd5d5", color: "#c81e1e" }} onClick={() => handleDeleteCategory(cat.id, cat.name)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------- GALLERY ------------------------------ */}
        {activeTab === "gallery" && (
          <div style={card}>
            <h2 className="font-serif" style={{ ...heading, marginBottom: 4 }}>Image Gallery</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
              Upload many photos at once. They stay in upload order (#1, #2, …) and can be picked when creating a product.
            </p>
            <GalleryPicker mode="manage" />
          </div>
        )}

        {/* ------------------------------- DATABASE ------------------------------ */}
        {activeTab === "database" && (
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Database size={24} color="var(--teal-600)" style={{ flexShrink: 0 }} />
              <h2 className="font-serif" style={heading}>Free Online Database & Image Storage</h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Until a database is connected, data is kept only in <strong>this browser</strong> (customers will not see it). Connect a free Supabase project (no backend code) to publish products and photos for everyone:
            </p>

            <div className="admin-grid" style={{ marginBottom: 20 }}>
              {[
                ["1. Create a free project", <>Sign up at <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: "var(--teal-600)", fontWeight: 700 }}>supabase.com</a> and create a project.</>],
                ["2. Run the SQL", "Tap “Copy SQL Schema”, open Supabase → SQL Editor, paste and Run. This also creates the photo bucket."],
                ["3. Paste URL & key", "Project Settings → API: copy the Project URL and anon public key into the form below."],
              ].map(([t, d]) => (
                <div key={t} style={{ backgroundColor: "#FAF7F2", padding: 14, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--teal-900)", marginBottom: 4 }}>{t}</div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{d}</p>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: "var(--teal-50)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--teal-200)", marginBottom: 20 }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: 12 }}>Supabase credentials</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={lbl} htmlFor="db-url">Project URL</label>
                  <input id="db-url" type="url" placeholder="https://your-project-id.supabase.co" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label style={lbl} htmlFor="db-key">Anon public key</label>
                  <input id="db-key" type="password" placeholder="eyJhbGciOi…" value={supabaseAnonKey} onChange={(e) => setSupabaseAnonKey(e.target.value)} className="input-field" />
                </div>
              </div>

              {dbTestResult && (
                <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 14, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 8, backgroundColor: dbTestResult.success ? "#e8f5e9" : "#ffebee", color: dbTestResult.success ? "#1e7e34" : "#c62828" }}>
                  {dbTestResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />} <span>{dbTestResult.message}</span>
                </div>
              )}

              <div className="row-wrap">
                <button type="button" className="btn btn-outline" onClick={handleTestConnection} disabled={isTestingDb}>{isTestingDb ? "Testing…" : "Test Connection"}</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveDbSettings}>Save Credentials</button>
                <button type="button" className="btn btn-primary" style={{ background: "var(--teal-800)" }} onClick={handleSyncToSupabase} disabled={isSyncing}>
                  <RefreshCw size={14} className={isSyncing ? "spin" : ""} /> {isSyncing ? "Syncing…" : "Sync Local Data to Supabase"}
                </button>
              </div>
            </div>

            <div className="row-wrap">
              <button type="button" className="btn btn-outline" onClick={handleCopySql}><Copy size={16} /> {copiedSql ? "✓ Copied!" : "Copy SQL Schema"}</button>
              <button type="button" className="btn btn-ghost" onClick={handleExportBackup}><Download size={15} /> Export JSON Backup</button>
              <button type="button" className="btn btn-ghost" style={{ color: "var(--text-muted)" }} onClick={() => { if (window.confirm("Reset all products and categories to the sample designs?")) { resetToDefaults(); onRefreshData(); } }}>Reset to Demo Data</button>
            </div>
          </div>
        )}

        {/* ------------------------------- SETTINGS ------------------------------ */}
        {activeTab === "settings" && (
          <div style={{ ...card, maxWidth: 600 }}>
            <h2 className="font-serif" style={{ ...heading, marginBottom: 4 }}>Store Settings & Admin Password</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 20 }}>WhatsApp order number and the single admin login.</p>

            {settingsSaved && (
              <div style={{ backgroundColor: "#e8f5e9", color: "#1e7e34", padding: "10px 14px", borderRadius: 6, fontSize: "0.85rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={16} /> <span>Settings saved!</span>
              </div>
            )}

            <form onSubmit={handleSaveStoreSettings} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lbl} htmlFor="st-wa">WhatsApp number for orders *</label>
                <input id="st-wa" type="tel" inputMode="tel" placeholder="923256393722" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="input-field" required />
                <span style={{ fontSize: "0.72rem", color: "var(--text-light)" }}>Orders from “Click here to place order on whatsapp” go to this number.</span>
              </div>
              <div>
                <label style={lbl} htmlFor="st-cur">Currency</label>
                <input id="st-cur" type="text" placeholder="PKR" value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={lbl} htmlFor="st-ann">Top announcement banner</label>
                <input id="st-ann" type="text" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className="input-field" />
              </div>
              <div style={{ paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: 10 }}>Admin login</h3>
                <div className="row-wrap" style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: "1 1 180px" }}>
                    <label style={lbl} htmlFor="st-user">Username</label>
                    <input id="st-user" type="text" autoCapitalize="none" value={newAdminUser} onChange={(e) => setNewAdminUser(e.target.value)} className="input-field" required />
                  </div>
                  <div style={{ flex: "1 1 180px" }}>
                    <label style={lbl} htmlFor="st-pass">Password</label>
                    <input id="st-pass" type="password" autoComplete="new-password" value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} className="input-field" required />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ minHeight: 46 }}>Save Settings & Credentials</button>
            </form>
          </div>
        )}
      </main>

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
