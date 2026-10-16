import React, { useState, useEffect } from "react";
import { X, Copy, Check, MessageCircle, AlertCircle, Building2, Smartphone, ShieldCheck } from "lucide-react";
import { PAYMENT_ACCOUNTS, ADVANCE_PAYMENT_NOTE } from "../data/paymentAccounts";
import { formatWhatsAppNumber } from "../utils/whatsapp";

export default function PaymentModal({ isOpen, onClose, settings }) {
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const phone = formatWhatsAppNumber(settings?.whatsappNumber || "923256393722");

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    "Hello Tiny Threads By Zirwa! 🌸\n\nI have transferred the advance payment for my order.\nAttached is my payment receipt screenshot.\n\nPlease confirm my order. Thank you! 💕"
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${whatsappMessage}`;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "580px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1px solid var(--border-subtle)",
            backgroundColor: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "var(--teal-50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--teal-200)",
              }}
            >
              <Building2 size={20} color="var(--teal-700)" />
            </div>
            <div>
              <h3 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--teal-900)" }}>
                Payment & Bank Accounts
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Official Accounts for Tiny Threads By Zirwa
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
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
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: "20px 22px", overflowY: "auto", flexGrow: 1 }}>
          {/* Important Notice Box */}
          <div
            style={{
              backgroundColor: "#FFF8E1",
              border: "1.5px solid #FFE082",
              borderRadius: "var(--radius-md)",
              padding: "14px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <AlertCircle size={22} color="#B78103" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "0.88rem", fontWeight: 800, color: "#8D6E14", marginBottom: "4px" }}>
                30% Advance Payment Required
              </h4>
              <p style={{ fontSize: "0.82rem", color: "#6D5200", lineHeight: 1.5, margin: 0 }}>
                {ADVANCE_PAYMENT_NOTE}
              </p>
              <p style={{ fontSize: "0.82rem", color: "#6D5200", fontWeight: 700, marginTop: "6px", margin: 0 }}>
                👉 Please transfer to any of the accounts below and share your payment screenshot on our WhatsApp to confirm stitching.
              </p>
            </div>
          </div>

          {/* Accounts List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "22px" }}>
            {PAYMENT_ACCOUNTS.map((acc) => (
              <div
                key={acc.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Bank / Wallet Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {acc.type === "Bank Account" ? (
                      <Building2 size={18} color="var(--teal-700)" />
                    ) : (
                      <Smartphone size={18} color="var(--teal-700)" />
                    )}
                    <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--teal-900)" }}>
                      {acc.bankName}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: acc.badgeBg,
                      color: acc.badgeColor,
                    }}
                  >
                    {acc.type}
                  </span>
                </div>

                {/* Account Title */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px dashed var(--border-subtle)" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    Account Title:
                  </span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--teal-900)" }}>
                    {acc.accountTitle}
                  </span>
                </div>

                {/* Account Number */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>
                      Account No:
                    </span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "0.03em" }}>
                      {acc.accountNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(acc.accountNumber, `${acc.id}-acc`)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--teal-300)",
                      backgroundColor: copiedKey === `${acc.id}-acc` ? "var(--teal-700)" : "var(--teal-50)",
                      color: copiedKey === `${acc.id}-acc` ? "#ffffff" : "var(--teal-900)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {copiedKey === `${acc.id}-acc` ? (
                      <>
                        <Check size={13} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy
                      </>
                    )}
                  </button>
                </div>

                {/* IBAN (for Meezan) */}
                {acc.iban && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderTop: "1px dashed var(--border-subtle)",
                      marginTop: "4px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>
                        IBAN:
                      </span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)", wordBreak: "break-all" }}>
                        {acc.iban}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(acc.iban, `${acc.id}-iban`)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--teal-300)",
                        backgroundColor: copiedKey === `${acc.id}-iban` ? "var(--teal-700)" : "var(--teal-50)",
                        color: copiedKey === `${acc.id}-iban` ? "#ffffff" : "var(--teal-900)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        flexShrink: 0,
                        marginLeft: "8px",
                      }}
                    >
                      {copiedKey === `${acc.id}-iban` ? (
                        <>
                          <Check size={13} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy IBAN
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              backgroundColor: "var(--teal-50)",
              borderRadius: "8px",
              border: "1px dashed var(--teal-300)",
            }}
          >
            <ShieldCheck size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "0.76rem", color: "var(--teal-900)", fontWeight: 600 }}>
              Official accounts verified for Tiny Threads By Zirwa. All payments are strictly receipted and acknowledged on WhatsApp.
            </span>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div
          style={{
            padding: "16px 22px",
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "#ffffff",
            position: "sticky",
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
            style={{
              padding: "13px 20px",
              fontSize: "0.92rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <MessageCircle size={20} color="#ffffff" />
            <span>Share Payment Screenshot on WhatsApp</span>
          </a>
          <div style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--text-light)" }}>
            Sends directly to WhatsApp: +{settings?.whatsappNumber || "92 325 6393722"}
          </div>
        </div>
      </div>
    </div>
  );
}
