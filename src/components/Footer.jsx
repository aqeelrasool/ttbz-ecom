import React from "react";
import { MessageCircle, Heart, Phone, Sparkles } from "lucide-react";
import { formatWhatsAppNumber } from "../utils/whatsapp";

export default function Footer({ settings, onOpenPayment }) {
  const phone = formatWhatsAppNumber(settings?.whatsappNumber);

  return (
    <footer
      style={{
        backgroundColor: "var(--teal-900)",
        color: "#ffffff",
        paddingTop: "40px",
        paddingBottom: "30px",
        marginTop: "60px",
        borderTop: "3px solid var(--gold-primary)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "32px",
            marginBottom: "36px",
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <img
                src="/ttbz-logo.png"
                alt="Tiny Threads By Zirwa"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  padding: "2px",
                }}
              />
              <div>
                <span
                  className="font-serif"
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    display: "block",
                    lineHeight: 1.1,
                  }}
                >
                  TINY THREADS
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                    color: "var(--gold-primary)",
                    textTransform: "uppercase",
                  }}
                >
                  BY ZIRWA
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: "300px" }}>
              Artisanal heirloom couture for newborns, infants, and little girls. Handcrafted with meticulous needlework, delicate smocking, and premium breathable fabrics.
            </p>
            <div style={{ fontSize: "0.75rem", color: "var(--gold-primary)", marginTop: "8px", fontWeight: 600 }}>
              est. 2024
            </div>
          </div>

          {/* Quick WhatsApp Contact & Payment Accounts */}
          <div>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Order & Inquiries
            </h4>
            <p style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.75)", marginBottom: "14px" }}>
              We take orders exclusively via WhatsApp. At least 30% advance payment is required for custom stitching.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--whatsapp-green)",
                  color: "#ffffff",
                  padding: "10px 18px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <MessageCircle size={18} />
                <span>+{settings?.whatsappNumber || "92 325 6393722"}</span>
              </a>

              {onOpenPayment && (
                <button
                  type="button"
                  onClick={onOpenPayment}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#ffffff",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
                >
                  <span>💳 View Bank & Wallet Accounts</span>
                </button>
              )}
            </div>
          </div>

          {/* Quality Promises */}
          <div>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Our Promise
            </h4>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "0.83rem", color: "rgba(255,255,255,0.75)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={14} color="var(--gold-primary)" /> Hypoallergenic, baby-soft materials
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={14} color="var(--gold-primary)" /> Bespoke age & measurement stitching
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={14} color="var(--gold-primary)" /> Safe Bank Transfer
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={14} color="var(--gold-primary)" /> Delivery across Pakistan & Worldwide
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "20px",
            textAlign: "center",
            fontSize: "0.76rem",
            color: "rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <span>© {new Date().getFullYear()} Tiny Threads By Zirwa. All rights reserved.</span>
          <span>•</span>
          <span>Handcrafted with <Heart size={12} color="#f4c2ce" style={{ verticalAlign: "middle" }} /> for your little angels</span>
        </div>
      </div>
    </footer>
  );
}
