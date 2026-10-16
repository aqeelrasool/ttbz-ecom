import React from "react";
import { MessageCircle, Sparkles } from "lucide-react";

export default function ProductCard({ product, categories = [], onSelect, currency = "PKR" }) {
  // Determine lowest price and sizes list
  const sizes = product.sizes || [];
  const prices = sizes.map((s) => Number(s.price)).filter((p) => !isNaN(p) && p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const isPriceRange = minPrice !== maxPrice && maxPrice > 0;

  // Primary image
  const primaryImage =
    (product.images && product.images.length > 0 && product.images[0]) ||
    "/ttbz-logo.png";

  // Category names mapped from IDs
  const matchedCategories = (categories || []).filter((c) =>
    (product.categoryIds || []).includes(c.id)
  );

  return (
    <div
      className="boutique-card"
      onClick={() => onSelect(product)}
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Image Container with Badges */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "100%", // 1:1 Aspect Ratio
          overflow: "hidden",
          backgroundColor: "#FAF7F2",
        }}
      >
        <img
          src={primaryImage}
          alt={product.title}
          loading="lazy"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          onError={(e) => {
            e.currentTarget.src = "/ttbz-logo.png";
            e.currentTarget.style.objectFit = "contain";
          }}
        />

        {/* Badges on top */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            zIndex: 2,
          }}
        >
          {product.isFeatured && (
            <span className="badge-pill badge-gold">
              <Sparkles size={11} /> Featured
            </span>
          )}
          {matchedCategories.length > 0 && (
            <span className="badge-pill badge-mint">
              {matchedCategories[0].name}
            </span>
          )}
        </div>
      </div>

      {/* Product Content */}
      <div
        style={{
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div>
          {/* Multiple categories tags */}
          {matchedCategories.length > 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
              {matchedCategories.slice(1, 3).map((cat) => (
                <span
                  key={cat.id}
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--teal-600)",
                    backgroundColor: "var(--teal-50)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: 600,
                  }}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Product Title */}
          <h3
            className="font-serif"
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "var(--teal-900)",
              marginBottom: "6px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.title}
          </h3>

          {/* Available Sizes Pills */}
          {sizes.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginBottom: "8px",
              }}
            >
              {sizes.slice(0, 4).map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    backgroundColor: "#f5f3ef",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {s.size}
                </span>
              ))}
              {sizes.length > 4 && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 5px",
                    borderRadius: "4px",
                    backgroundColor: "#f5f3ef",
                    color: "var(--text-light)",
                    fontWeight: 600,
                  }}
                >
                  +{sizes.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing and Quick Order CTA */}
        <div>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
              {isPriceRange ? "Starting from" : "Price"}
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "var(--teal-800)",
                }}
              >
                {currency} {minPrice.toLocaleString()}
              </span>
              {isPriceRange && (
                <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>
                  - {currency} {maxPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--teal-50)",
              border: "1.5px solid var(--teal-500)",
              color: "var(--teal-800)",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--teal-700)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--teal-50)";
              e.currentTarget.style.color = "var(--teal-800)";
            }}
          >
            <MessageCircle size={15} color="var(--whatsapp-green)" />
            <span>Select Size & Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
