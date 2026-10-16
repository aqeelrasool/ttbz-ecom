import React from "react";
import { Sparkles } from "lucide-react";

export default function CategoryBar({ categories = [], selectedCategoryId, onSelectCategory, productCounts = {}, totalProductsCount = 0 }) {
  return (
    <nav className="catbar" aria-label="Product categories">
      <div className="container">
        <div className="catbar-scroll no-scrollbar">
          <button type="button" className={`cat-pill ${selectedCategoryId === "all" ? "active" : ""}`} onClick={() => onSelectCategory("all")}>
            <Sparkles size={13} color={selectedCategoryId === "all" ? "var(--gold-primary)" : "var(--teal-500)"} />
            <span>All Designs</span>
            <span className="cat-count">{totalProductsCount}</span>
          </button>

          {categories.map((cat) => (
            <button key={cat.id} type="button" className={`cat-pill ${selectedCategoryId === cat.id ? "active" : ""}`} onClick={() => onSelectCategory(cat.id)}>
              <span>{cat.name}</span>
              <span className="cat-count">{productCounts[cat.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
