import React from "react";
import { MessageCircle, Search, Sparkles, Building2 } from "lucide-react";
import { formatWhatsAppNumber } from "../utils/whatsapp";

export default function Navbar({ settings, searchQuery, setSearchQuery, showSearch, setShowSearch, onOpenPayment }) {
  const phone = formatWhatsAppNumber(settings?.whatsappNumber);

  return (
    <>
      {/* Announcement (scrolls away; tap opens payment accounts) */}
      <button type="button" className="announce" onClick={onOpenPayment} title="View bank accounts & payment instructions">
        <Sparkles size={13} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
        <span>{settings?.announcement || "🌸 At least 30% payment is required to place the order because these dresses are made custom for you on order"}</span>
        <span className="announce-cta">[View Accounts 💳]</span>
      </button>

      <header className="nav">
        <div className="container nav-inner">
          <a href="/" className="brand" aria-label="Tiny Threads By Zirwa - home">
            <img src="/ttbz-logo.png" alt="" className="brand-logo" />
            <div style={{ minWidth: 0 }}>
              <span className="font-serif brand-name">TINY THREADS</span>
              <span className="brand-sub">BY ZIRWA</span>
            </div>
          </a>

          <div className="nav-actions">
            <button type="button" className="pill-btn pill-gold" onClick={onOpenPayment} aria-label="Bank details">
              <Building2 size={16} />
              <span className="label">Bank Details</span>
            </button>

            <button type="button" className={`icon-btn ${showSearch ? "active" : ""}`} onClick={() => setShowSearch(!showSearch)} aria-label="Search items" aria-expanded={showSearch}>
              <Search size={18} />
            </button>

            <a
              className="pill-btn pill-teal"
              href={`https://wa.me/${phone}?text=${encodeURIComponent("Hello Tiny Threads By Zirwa! I have an inquiry about your baby dresses.")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle size={17} color="var(--whatsapp-green)" />
              <span className="label">WhatsApp Us</span>
            </a>
          </div>
        </div>

        {showSearch && (
          <div className="search-panel animate-fade-in">
            <div className="container search-wrap">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search frocks, sizes (e.g. 0-3 Months)…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="input-field"
                aria-label="Search products"
              />
              {searchQuery && (
                <button type="button" className="search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search">✕</button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
