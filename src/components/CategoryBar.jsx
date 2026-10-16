import React from "react";
import { Sparkles } from "lucide-react";

export default function CategoryBar({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  productCounts = {},
  totalProductsCount = 0,
}) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky",
        top: "68px",
        zIndex: 90,
      }}
    >
      <div className="container" style={{ padding: "10px 16px" }}>
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "2px",
          }}
        >
          {/* "All" Category Pill */}
          <button
            onClick={() => onSelectCategory("all")}
            style={{
              whiteSpace: "nowrap",
              padding: "7px 16px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.82rem",
              fontWeight: selectedCategoryId === "all" ? 700 : 500,
              border: selectedCategoryId === "all" ? "1.5px solid var(--teal-700)" : "1px solid var(--border-subtle)",
              backgroundColor: selectedCategoryId === "all" ? "var(--teal-700)" : "#ffffff",
              color: selectedCategoryId === "all" ? "#ffffff" : "var(--text-main)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <Sparkles size={13} color={selectedCategoryId === "all" ? "var(--gold-primary)" : "var(--teal-500)"} />
            <span>All Designs</span>
            <span
              style={{
                fontSize: "0.7rem",
                padding: "1px 6px",
                borderRadius: "10px",
                backgroundColor: selectedCategoryId === "all" ? "rgba(255,255,255,0.25)" : "var(--teal-50)",
                color: selectedCategoryId === "all" ? "#ffffff" : "var(--teal-800)",
                marginLeft: "2px",
              }}
            >
              {totalProductsCount}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = productCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  whiteSpace: "nowrap",
                  padding: "7px 16px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.82rem",
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? "1.5px solid var(--teal-700)" : "1px solid var(--border-subtle)",
                  backgroundColor: isSelected ? "var(--teal-700)" : "#ffffff",
                  color: isSelected ? "#ffffff" : "var(--text-main)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <span>{cat.name}</span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "var(--teal-50)",
                    color: isSelected ? "#ffffff" : "var(--teal-800)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
