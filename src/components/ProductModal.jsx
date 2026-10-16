import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  X,
  Share2,
  Check,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { generateWhatsAppOrderUrl, fireOrderConfetti } from "../utils/whatsapp";
import useBodyScrollLock from "../utils/useBodyScrollLock";
import ImageZoomViewer from "./ImageZoomViewer";

export default function ProductModal({
  product,
  categories = [],
  settings,
  onClose,
  onOpenPayment,
  currency = "PKR",
}) {
  useBodyScrollLock(true);

  const sizes = product?.sizes || [];
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customNotes, setCustomNotes] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedSize = sizes[selectedSizeIndex] || sizes[0] || { size: "Standard", price: 0 };
  const currentPrice = Number(selectedSize?.price || 0);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!product) return null;

  const images = product.images?.length ? product.images : ["/ttbz-logo.png"];
  const matchedCategories = categories.filter((c) => (product.categoryIds || []).includes(c.id));
  const fabricBadge = product.fabricTag || product.fabric_tag || null;

  const handlePlaceOrderWhatsApp = () => {
    fireOrderConfetti();
    window.open(
      generateWhatsAppOrderUrl({
        phone: settings?.whatsappNumber || "923256393722",
        product,
        selectedSize,
        customNotes,
        currency,
      }),
      "_blank"
    );
  };

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
        // Fall back to clipboard
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.title}
      >
        <div className="modal-handle" />

        <div className="modal-head">
          <div className="pm-badges">
            <span className="badge-pill badge-mint">
              <Sparkles size={11} /> Handcrafted
            </span>
            {matchedCategories.slice(0, 2).map((c) => (
              <span key={c.id} className="badge-pill badge-blush">
                {c.name}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              className="icon-btn"
              style={{ width: 38, height: 38 }}
              onClick={handleShare}
              aria-label="Share product link"
              title="Share Link"
            >
              {copiedLink ? <Check size={16} color="var(--teal-600)" /> : <Share2 size={16} />}
            </button>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="pm-grid">
            {/* Left: Product Images with Touch Zoom */}
            <div className="pm-image-section">
              <ImageZoomViewer
                images={images}
                activeIndex={activeImageIndex}
                onIndexChange={setActiveImageIndex}
                alt={product.title}
              />

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="thumbs">
                  {images.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={`thumb ${activeImageIndex === idx ? "active" : ""}`}
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Show photo ${idx + 1}`}
                    >
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details, Pricing & Sizing */}
            <div style={{ minWidth: 0 }}>
              <h2
                className="font-serif"
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "var(--teal-900)",
                  lineHeight: 1.25,
                  marginBottom: 10,
                }}
              >
                {product.title}
              </h2>

              {/* Price & Availability card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  backgroundColor: "var(--teal-50)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--teal-200)",
                  marginBottom: 16,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 600,
                    }}
                  >
                    Size: {selectedSize?.size || "Standard"}
                  </span>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--teal-900)" }}>
                    {currency} {currentPrice.toLocaleString()}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    color: selectedSize?.inStock !== false ? "#1e7e34" : "#d9534f",
                    backgroundColor: selectedSize?.inStock !== false ? "#e8f5e9" : "#fbe9e7",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  {selectedSize?.inStock !== false ? "✓ Available" : "Made on order"}
                </span>
              </div>

              {/* Sizing options */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: 8 }}>
                  Choose Size & See Price
                </div>
                <div className="size-grid">
                  {sizes.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      className={`size-pill ${selectedSizeIndex === idx ? "selected" : ""}`}
                      aria-pressed={selectedSizeIndex === idx}
                    >
                      <span className="sz">{s.size}</span>
                      <span className="pr">
                        {currency} {Number(s.price).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom size / notes */}
              <div style={{ marginBottom: 16 }}>
                <label
                  htmlFor="pm-notes"
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  Custom measurements / notes (optional)
                </label>
                <input
                  id="pm-notes"
                  type="text"
                  placeholder="e.g. Baby is 9 months, event is on Sunday"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="input-field"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>

              {/* Description */}
              {product.description && (
                <div style={{ marginBottom: 16 }}>
                  <h4
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "var(--teal-900)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    Craftsmanship & Details
                  </h4>
                  <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Trust Badges - Fabric tag is ONLY rendered if optional fabricTag is defined */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: fabricBadge ? "1fr 1fr" : "1fr",
                  gap: 8,
                  padding: 10,
                  backgroundColor: "#FAF7F2",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--teal-300)",
                }}
              >
                {fabricBadge && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={16} color="var(--teal-600)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "0.72rem", color: "var(--teal-900)", fontWeight: 600 }}>
                      {fabricBadge}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <HeartHandshake size={16} color="var(--teal-600)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "0.72rem", color: "var(--teal-900)", fontWeight: 600 }}>
                    Custom Tailored for your Child
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Advance Payment Note & WhatsApp Order */}
        <div className="modal-foot">
          <div className="advance-note">
            <span>⚠️ 30% advance payment required (custom made on order)</span>
            {onOpenPayment && (
              <button type="button" onClick={onOpenPayment}>
                Accounts 💳
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handlePlaceOrderWhatsApp}
            className="btn-whatsapp btn-wa-lg"
          >
            <MessageCircle size={22} color="#ffffff" />
            <span>Click here to place order on whatsapp</span>
          </button>

          <div
            className="hide-sm"
            style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--text-light)", marginTop: 6 }}
          >
            Sends chosen size ({selectedSize?.size}) & product link to WhatsApp +
            {settings?.whatsappNumber || "92 325 6393722"}
          </div>
        </div>
      </div>
    </div>
  );
}
