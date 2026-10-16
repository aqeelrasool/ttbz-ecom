import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import CategoryBar from "./components/CategoryBar";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import PaymentModal from "./components/PaymentModal";
import Footer from "./components/Footer";
import AdminDashboard from "./components/Admin/AdminDashboard";
import { getCategories, getProducts, getStoredSettings } from "./services/db";
import { MessageCircle, Sparkles, Filter, Heart, ArrowRight, Building2 } from "lucide-react";
import { formatWhatsAppNumber } from "./utils/whatsapp";

export default function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(getStoredSettings());
  const [isLoading, setIsLoading] = useState(true);

  // Routing state
  const [isAdminView, setIsAdminView] = useState(() => {
    return (
      window.location.pathname === "/admin" ||
      window.location.hash === "#admin" ||
      window.location.search.includes("view=admin")
    );
  });

  // Customer Storefront State
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(() => {
    return (
      window.location.hash === "#payment" ||
      window.location.hash === "#accounts" ||
      window.location.pathname === "/payment"
    );
  });

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
      setCategories(cats || []);
      setProducts(prods || []);
      setSettings(getStoredSettings());
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to hash / URL routing
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash;
      const isAdm =
        window.location.pathname === "/admin" ||
        hash === "#admin" ||
        window.location.search.includes("view=admin");
      setIsAdminView(isAdm);

      if (hash === "#payment" || hash === "#accounts" || window.location.pathname === "/payment") {
        setIsPaymentModalOpen(true);
      }

      // Deep link to product modal: #product-xxx
      if (hash.startsWith("#product-")) {
        const prodId = hash.replace("#product-", "");
        const match = products.find((p) => p.id === prodId);
        if (match) {
          setSelectedProduct(match);
        }
      }
    };

    window.addEventListener("hashchange", handleUrlChange);
    window.addEventListener("popstate", handleUrlChange);

    // Initial check on mount once products are loaded
    if (products.length > 0) {
      handleUrlChange();
    }

    return () => {
      window.removeEventListener("hashchange", handleUrlChange);
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [products]);

  // Navigate to admin
  const handleExitAdmin = () => {
    window.history.pushState(null, "", "/");
    window.location.hash = "";
    setIsAdminView(false);
  };

  // Product Counts per category
  const productCounts = useMemo(() => {
    const counts = {};
    categories.forEach((cat) => {
      counts[cat.id] = products.filter(
        (p) => p.isActive !== false && (p.categoryIds || []).includes(cat.id)
      ).length;
    });
    return counts;
  }, [categories, products]);

  // Filtered products for customer
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.isActive === false) return false;

      // Category filter (many-to-many check)
      const matchesCategory =
        selectedCategoryId === "all" ||
        (p.categoryIds && p.categoryIds.includes(selectedCategoryId));

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sizes && p.sizes.some((s) => s.size.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Handle open product modal
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    window.location.hash = `product-${product.id}`;
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
    if (window.location.hash.startsWith("#product-")) {
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  // If Admin URL is active, render Admin Dashboard
  if (isAdminView) {
    return (
      <AdminDashboard
        categories={categories}
        products={products}
        settings={settings}
        onRefreshData={loadData}
        onExitAdmin={handleExitAdmin}
      />
    );
  }

  const phone = formatWhatsAppNumber(settings?.whatsappNumber);

  // ----------------------------------------------------------------------
  // PUBLIC CUSTOMER STOREFRONT (Zero Admin links, 100% Mobile Optimized)
  // ----------------------------------------------------------------------
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-cream)" }}>
      {/* Header */}
      <Navbar
        settings={settings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
      />

      {/* Hero Boutique Banner */}
      <section
        style={{
          background: "linear-gradient(180deg, #F5F1EB 0%, #FAF7F2 100%)",
          padding: "28px 16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          {/* Brand Tagline */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "var(--teal-100)",
              color: "var(--teal-800)",
              padding: "4px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.76rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            <Sparkles size={12} color="var(--gold-primary)" />
            <span>Handcrafted Baby & Kids Couture</span>
          </div>

          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
              fontWeight: 700,
              color: "var(--teal-900)",
              lineHeight: 1.15,
              marginBottom: "10px",
              letterSpacing: "0.02em",
            }}
          >
            Tiny Threads By Zirwa
          </h1>

          <p
            style={{
              fontSize: "clamp(0.86rem, 2.5vw, 1rem)",
              color: "var(--text-muted)",
              maxWidth: "540px",
              margin: "0 auto 16px",
              lineHeight: 1.5,
            }}
          >
            Heirloom frocks, fine smocking, and delicate hand embroidery. Browse our collection, choose your size, and <strong>order instantly on WhatsApp</strong>.
          </p>

          {/* Quick WhatsApp order badge & Bank Details */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent("Hello! I would like to inquire about your handcrafted baby dresses.")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                border: "1.5px solid var(--teal-400)",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--teal-800)",
                textDecoration: "none",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <MessageCircle size={16} color="var(--whatsapp-green)" />
              <span>WhatsApp Direct: +{settings?.whatsappNumber || "92 325 6393722"}</span>
            </a>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#FFF8E1",
                border: "1.5px solid #FFE082",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#8D6E14",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Building2 size={15} color="#8D6E14" />
              <span>Bank & Wallet Accounts (30% Advance)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Horizontal Filter Bar */}
      <CategoryBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(id) => {
          setSelectedCategoryId(id);
          setSearchQuery("");
        }}
        productCounts={productCounts}
        totalProductsCount={products.filter((p) => p.isActive !== false).length}
      />

      {/* Main Products Grid Section */}
      <main className="container" style={{ flexGrow: 1, paddingTop: "24px", paddingBottom: "40px" }}>
        {/* Results summary bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <div style={{ fontSize: "0.86rem", color: "var(--text-muted)", fontWeight: 600 }}>
            {selectedCategoryId === "all" ? (
              <span>Showing all <strong>{filteredProducts.length}</strong> handcrafted designs</span>
            ) : (
              <span>
                Category: <strong>{categories.find((c) => c.id === selectedCategoryId)?.name}</strong> ({filteredProducts.length})
              </span>
            )}
            {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          </div>

          {(selectedCategoryId !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategoryId("all");
                setSearchQuery("");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--teal-600)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ display: "inline-block", width: "36px", height: "36px", border: "3px solid var(--teal-200)", borderTopColor: "var(--teal-700)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ marginTop: "14px", fontSize: "0.85rem", color: "var(--text-muted)" }}>Loading handcrafted collection...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty Search or Filter State */
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
              backgroundColor: "#ffffff",
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--border-subtle)",
            }}
          >
            <Sparkles size={36} color="var(--teal-400)" style={{ margin: "0 auto 12px" }} />
            <h3 className="font-serif" style={{ fontSize: "1.3rem", color: "var(--teal-900)", marginBottom: "6px" }}>
              No dresses match your search
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 18px" }}>
              We also create bespoke customized designs! Contact us directly on WhatsApp with your design preference or child's age.
            </p>
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent("Hello Tiny Threads! I am looking for a custom baby dress.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ display: "inline-flex", width: "auto", padding: "10px 22px", fontSize: "0.88rem" }}
            >
              <MessageCircle size={18} />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        ) : (
          /* Grid of Products (Mobile 2-columns / Desktop 3-4 columns) */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
                onSelect={handleSelectProduct}
                currency={settings?.currency || "PKR"}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Action Button for Instant Mobile Tap */}
      <a
        href={`https://wa.me/${phone}?text=${encodeURIComponent("Hello Tiny Threads By Zirwa! I would like to inquire about placing an order.")}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        style={{
          position: "fixed",
          bottom: "22px",
          right: "20px",
          backgroundColor: "#25D366",
          color: "#ffffff",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(37, 211, 102, 0.45)",
          zIndex: 90,
          transition: "transform 0.2s ease",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
      >
        <MessageCircle size={30} color="#ffffff" />
      </a>

      {/* Product Detail Modal with WhatsApp Order Button */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          settings={settings}
          onClose={handleCloseProductModal}
          onOpenPayment={() => setIsPaymentModalOpen(true)}
          currency={settings?.currency || "PKR"}
        />
      )}

      {/* Official Bank & Payment Accounts Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          if (window.location.hash === "#payment" || window.location.hash === "#accounts") {
            window.history.pushState(null, "", window.location.pathname);
          }
        }}
        settings={settings}
      />

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
      />
    </div>
  );
}
