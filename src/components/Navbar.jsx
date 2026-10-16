import React from "react";
import { MessageCircle, Search, Sparkles, Building2 } from "lucide-react";
import { formatWhatsAppNumber } from "../utils/whatsapp";

export default function Navbar({
  settings,
  searchQuery,
  setSearchQuery,
  showSearch,
  setShowSearch,
  onOpenPayment,
}) {
  const phone = formatWhatsAppNumber(settings?.whatsappNumber);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "#ffffff", borderBottom: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
      {/* Top Announcement Bar - Clickable to open Bank & Payment Details */}
      <div
        onClick={onOpenPayment}
        role="button"
        tabIndex={0}
        title="Click to view bank accounts & payment instructions"
        style={{
          backgroundColor: "var(--teal-800)",
          color: "#ffffff",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.03em",
          padding: "7px 12px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          cursor: "pointer",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--teal-900)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--teal-800)")}
      >
        <Sparkles size={13} color="var(--gold-primary)" />
        <span>
          {settings?.announcement || "🌸 At least 30% payment is required to place the order because these dresses are made custom for you on order"}
        </span>
        <span
          style={{
            textDecoration: "underline",
            fontSize: "0.72rem",
            color: "var(--gold-primary)",
            fontWeight: 700,
            marginLeft: "4px",
            whiteSpace: "nowrap",
          }}
        >
          [View Accounts 💳]
        </span>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
        {/* Brand Logo & Name */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img
            src="/ttbz-logo.png"
            alt="Tiny Threads By Zirwa"
            style={{
              height: "46px",
              width: "46px",
              objectFit: "contain",
              borderRadius: "50%",
              border: "1.5px solid var(--teal-200)",
              padding: "2px",
              backgroundColor: "#FAF7F2",
            }}
          />
          <div>
            <span
              className="font-serif"
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "var(--teal-900)",
                display: "block",
                lineHeight: 1.1,
              }}
            >
              TINY THREADS
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                letterSpacing: "0.22em",
                fontWeight: 700,
                color: "var(--gold-primary)",
                textTransform: "uppercase",
                display: "block",
              }}
            >
              BY ZIRWA
            </span>
          </div>
        </a>

        {/* Action icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Bank Accounts Button */}
          <button
            onClick={onOpenPayment}
            title="View Bank & Wallet Accounts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#FFF8E1",
              border: "1.5px solid #FFE082",
              color: "#8D6E14",
              padding: "8px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFECB3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFF8E1")}
          >
            <Building2 size={15} color="#8D6E14" />
            <span style={{ display: "inline-block" }}>Bank Details</span>
          </button>

          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Search items"
            style={{
              background: showSearch ? "var(--teal-100)" : "transparent",
              border: "1px solid",
              borderColor: showSearch ? "var(--teal-400)" : "var(--border-subtle)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--teal-800)",
              transition: "all 0.2s ease",
            }}
          >
            <Search size={18} />
          </button>

          {/* Direct WhatsApp Quick Chat */}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent("Hello Tiny Threads By Zirwa! I have an inquiry about your baby dresses.")}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with us on WhatsApp"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "var(--teal-50)",
              border: "1.5px solid var(--teal-400)",
              color: "var(--teal-800)",
              padding: "8px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            <MessageCircle size={16} color="var(--whatsapp-green)" />
            <span style={{ display: "inline-block" }}>
              WhatsApp Us
            </span>
          </a>
        </div>
      </div>

      {/* Expandable Live Search Bar */}
      {showSearch && (
        <div
          style={{
            backgroundColor: "var(--teal-50)",
            borderTop: "1px solid var(--teal-100)",
            padding: "10px 16px",
          }}
          className="animate-fade-in"
        >
          <div className="container" style={{ position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "28px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--teal-600)",
              }}
            />
            <input
              type="text"
              placeholder="Search handcrafted frocks, sizes (e.g. 0-3M), festive dresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="input-field"
              style={{
                paddingLeft: "42px",
                paddingRight: "40px",
                borderRadius: "var(--radius-full)",
                borderColor: "var(--teal-300)",
                backgroundColor: "#ffffff",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "28px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
