import React, { useState, useEffect } from "react";
import { MessageCircle, X, Share2, Check, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import { generateWhatsAppOrderUrl, fireOrderConfetti } from "../utils/whatsapp";

export default function ProductModal({
  product,
  categories = [],
  settings,
  onClose,
  onOpenPayment,
  currency = "PKR",
}) {
  if (!product) return null;

  // Selected size default to first available size
  const sizes = product.sizes || [];
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customNotes, setCustomNotes] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedSize = sizes[selectedSizeIndex] || sizes[0] || { size: "Standard", price: 0 };
  const currentPrice = Number(selectedSize?.price || 0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle WhatsApp Order Button
  const handlePlaceOrderWhatsApp = () => {
    fireOrderConfetti();
    const url = generateWhatsAppOrderUrl({
      phone: settings?.whatsappNumber || "923256393722",
      product,
      selectedSize,
      customNotes,
      currency,
    });
    window.open(url, "_blank");
  };

  // Copy or Share link
  const handleShare = async () => {
    const productUrl = `${window.location.origin}${window.location.pathname}#product-${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} from Tiny Threads By Zirwa!`,
          url: productUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      // ignore
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : ["/ttbz-logo.png"];
  const matchedCategories = (categories || []).filter((c) =>
    (product.categoryIds || []).includes(c.id)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Sticky Modal Header with Close & Share */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            position: "sticky",
            top: 0,
            backgroundColor: "#ffffff",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="badge-pill badge-mint">
              <Sparkles size={11} /> Handcrafted
            </span>
            {matchedCategories.slice(0, 2).map((c) => (
              <span key={c.id} className="badge-pill badge-blush">
                {c.name}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleShare}
              title="Share or Copy Product Link"
              style={{
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--teal-800)",
              }}
            >
              {copiedLink ? <Check size={16} color="var(--teal-600)" /> : <Share2 size={16} />}
            </button>

            <button
              onClick={onClose}
              title="Close"
              style={{
                background: "var(--teal-50)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--teal-900)",
                fontWeight: 700,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body - 2 Columns on Desktop, Stacked on Mobile */}
        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            flexGrow: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Images */}
          <div>
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "95%",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                backgroundColor: "#FAF7F2",
                marginBottom: "10px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.title}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  backgroundColor: "#FAF7F2",
                }}
                onError={(e) => {
                  e.currentTarget.src = "/ttbz-logo.png";
                }}
              />
            </div>

            {/* Multiple Image Thumbnails */}
            {images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                }}
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: activeImageIndex === idx ? "2px solid var(--teal-600)" : "1px solid var(--border-subtle)",
                      padding: "2px",
                      background: "#ffffff",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Dynamic Price, Size Matrix, Description */}
          <div>
            {/* Title and Active Price Display */}
            <div style={{ marginBottom: "14px" }}>
              <h2
                className="font-serif"
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "var(--teal-900)",
                  lineHeight: 1.25,
                  marginBottom: "8px",
                }}
              >
                {product.title}
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "var(--teal-50)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--teal-200)",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                    Selected Size ({selectedSize?.size || "Standard"})
                  </span>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--teal-900)" }}>
                    {currency} {currentPrice.toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: selectedSize?.inStock !== false ? "#1e7e34" : "#d9534f",
                    backgroundColor: selectedSize?.inStock !== false ? "#e8f5e9" : "#fbe9e7",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  {selectedSize?.inStock !== false ? "✓ Available to Stitch/Ship" : "Made on Order"}
                </div>
              </div>
            </div>

            {/* SIZES SELECTOR WITH INDIVIDUAL PRICING */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--teal-900)",
                  marginBottom: "6px",
                }}
              >
                Choose Size & View Price:
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(125px, 1fr))",
                  gap: "6px",
                }}
              >
                {sizes.map((s, idx) => {
                  const isSelected = selectedSizeIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      className={`size-pill ${isSelected ? "selected" : ""}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        textAlign: "left",
                        padding: "7px 10px",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                        {s.size}
                      </span>
                      <span
                        style={{
                          fontSize: "0.74rem",
                          color: isSelected ? "var(--teal-700)" : "var(--text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        {currency} {Number(s.price).toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom measurements / notes (Optional for customer) */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: "4px",
                }}
              >
                Custom size / notes (optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Baby is 9 months, need for Eid"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="input-field"
                style={{ fontSize: "0.82rem", padding: "8px 12px" }}
              />
            </div>

            {/* Product Description */}
            {product.description && (
              <div style={{ marginBottom: "14px" }}>
                <h4
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--teal-900)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "4px",
                  }}
                >
                  Product Details & Care
                </h4>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                  }}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Boutique Trust Signals */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                padding: "10px",
                backgroundColor: "#FAF7F2",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--teal-300)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={16} color="var(--teal-600)" />
                <div style={{ fontSize: "0.72rem", color: "var(--teal-900)", fontWeight: 600 }}>
                  100% Baby-Safe Pure Cotton
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <HeartHandshake size={16} color="var(--teal-600)" />
                <div style={{ fontSize: "0.72rem", color: "var(--teal-900)", fontWeight: 600 }}>
                  Custom Tailored Fit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STICKY BOTTOM BAR: "Click here to place order on whatsapp" */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "#ffffff",
            padding: "12px 20px 14px",
            borderTop: "1px solid var(--border-subtle)",
            boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
            zIndex: 10,
          }}
        >
          {/* 30% Advance Notice Box */}
          <div
            style={{
              backgroundColor: "#FFF8E1",
              border: "1px solid #FFE082",
              borderRadius: "8px",
              padding: "7px 12px",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <div style={{ fontSize: "0.74rem", color: "#8D6E14", fontWeight: 700, lineHeight: 1.3 }}>
              ⚠️ At least 30% payment is required to place order (Custom made on order)
            </div>
            {onOpenPayment && (
              <button
                type="button"
                onClick={onOpenPayment}
                style={{
                  background: "#ffffff",
                  border: "1px solid #FFE082",
                  color: "#8D6E14",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  padding: "4px 8px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                View Accounts 💳
              </button>
            )}
          </div>

          <button
            onClick={handlePlaceOrderWhatsApp}
            className="btn-whatsapp"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontSize: "0.98rem",
              padding: "14px 20px",
            }}
          >
            <MessageCircle size={22} color="#ffffff" />
            <span>Click here to place order on whatsapp</span>
          </button>
          <div
            style={{
              textAlign: "center",
              fontSize: "0.72rem",
              color: "var(--text-light)",
              marginTop: "6px",
            }}
          >
            Sends chosen size ({selectedSize?.size}) & direct link to WhatsApp: +{settings?.whatsappNumber || "92 325 6393722"}
          </div>
        </div>
      </div>
    </div>
  );
}
