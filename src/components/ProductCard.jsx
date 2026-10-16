import React from "react";
import { MessageCircle, Sparkles } from "lucide-react";

export default function ProductCard({ product, categories = [], onSelect, currency = "PKR" }) {
  const sizes = product.sizes || [];
  const prices = sizes.map((s) => Number(s.price)).filter((p) => !isNaN(p) && p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const isRange = minPrice !== maxPrice && maxPrice > 0;

  const primaryImage = product.images?.[0] || "/ttbz-logo.png";
  const matched = categories.filter((c) => (product.categoryIds || []).includes(c.id));

  return (
    <article className="boutique-card pcard" onClick={() => onSelect(product)}>
      <div className="pcard-media">
        <img
          src={primaryImage}
          alt={product.title}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = "/ttbz-logo.png"; e.currentTarget.style.objectFit = "contain"; }}
        />
        <div className="pcard-badges">
          {product.isFeatured && <span className="badge-pill badge-gold"><Sparkles size={11} /> Featured</span>}
          {matched[0] && <span className="badge-pill badge-mint pcard-catbadge">{matched[0].name}</span>}
        </div>
      </div>

      <div className="pcard-body">
        <div>
          {matched.length > 1 && (
            <div className="pcard-chips">
              {matched.slice(1, 3).map((c) => <span key={c.id} className="chip chip-teal">{c.name}</span>)}
            </div>
          )}
          <h3 className="font-serif pcard-title">{product.title}</h3>

          {sizes.length > 0 && (
            <>
              <div className="pcard-chips sizes-desktop" style={{ marginBottom: 0 }}>
                {sizes.slice(0, 4).map((s, i) => <span key={i} className="chip">{s.size}</span>)}
                {sizes.length > 4 && <span className="chip" style={{ color: "var(--text-light)" }}>+{sizes.length - 4} more</span>}
              </div>
              <span className="sizes-mobile">{sizes.length} size{sizes.length > 1 ? "s" : ""} available</span>
            </>
          )}
        </div>

        <div>
          <span className="pcard-price-label">{isRange ? "Starting from" : "Price"}</span>
          <div>
            <span className="pcard-price">{currency} {minPrice.toLocaleString()}</span>
            {isRange && <span className="price-max">- {currency} {maxPrice.toLocaleString()}</span>}
          </div>
          <button type="button" className="pcard-cta" onClick={(e) => { e.stopPropagation(); onSelect(product); }}>
            <MessageCircle size={15} color="var(--whatsapp-green)" />
            <span className="cta-long">Select Size & Order</span>
            <span className="cta-short">Choose Size</span>
          </button>
        </div>
      </div>
    </article>
  );
}
