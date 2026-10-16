import React, { useState, useEffect } from "react";
import { X, Copy, Check, MessageCircle, AlertCircle, Building2, Smartphone, ShieldCheck } from "lucide-react";
import { PAYMENT_ACCOUNTS, ADVANCE_PAYMENT_NOTE } from "../data/paymentAccounts";
import { formatWhatsAppNumber } from "../utils/whatsapp";
import useBodyScrollLock from "../utils/useBodyScrollLock";

function CopyButton({ text, id, copiedKey, onCopy, children }) {
  const done = copiedKey === id;
  return (
    <button type="button" className={`copy-btn ${done ? "done" : ""}`} onClick={() => onCopy(text, id)}>
      {done ? <><Check size={13} /> Copied</> : <><Copy size={13} /> {children}</>}
    </button>
  );
}

export default function PaymentModal({ isOpen, onClose, settings }) {
  useBodyScrollLock(isOpen);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const phone = formatWhatsAppNumber(settings?.whatsappNumber || "923256393722");
  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Hello Tiny Threads By Zirwa! 🌸\n\nI have transferred the advance payment for my order.\nAttached is my payment receipt screenshot.\n\nPlease confirm my order. Thank you! 💕"
  )}`;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Payment accounts">
        <div className="modal-handle" />
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--teal-200)", flexShrink: 0 }}>
              <Building2 size={20} color="var(--teal-700)" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 className="font-serif modal-title">Payment & Bank Accounts</h3>
              <span className="modal-sub">Official accounts of Tiny Threads By Zirwa</span>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div style={{ backgroundColor: "#FFF8E1", border: "1.5px solid #FFE082", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <AlertCircle size={20} color="#B78103" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ fontSize: "0.88rem", fontWeight: 800, color: "#8D6E14", marginBottom: 4 }}>30% Advance Payment Required</h4>
              <p style={{ fontSize: "0.82rem", color: "#6D5200", lineHeight: 1.5 }}>{ADVANCE_PAYMENT_NOTE}</p>
              <p style={{ fontSize: "0.82rem", color: "#6D5200", fontWeight: 700, marginTop: 6 }}>
                👉 Please transfer to any account below and share your payment screenshot on our WhatsApp number to confirm stitching.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {PAYMENT_ACCOUNTS.map((acc) => (
              <div key={acc.id} style={{ background: "#fff", border: "1.5px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 14, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    {acc.type === "Bank Account" ? <Building2 size={18} color="var(--teal-700)" /> : <Smartphone size={18} color="var(--teal-700)" />}
                    <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--teal-900)" }}>{acc.bankName}</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999, backgroundColor: acc.badgeBg, color: acc.badgeColor, whiteSpace: "nowrap" }}>{acc.type}</span>
                </div>

                <div className="pay-row">
                  <div>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>Account title</span>
                    <span className="pay-val">{acc.accountTitle}</span>
                  </div>
                </div>
                <div className="pay-row">
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>Account no.</span>
                    <span className="pay-val">{acc.accountNumber}</span>
                  </div>
                  <CopyButton text={acc.accountNumber} id={`${acc.id}-acc`} copiedKey={copiedKey} onCopy={handleCopy}>Copy</CopyButton>
                </div>
                {acc.iban && (
                  <div className="pay-row">
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>IBAN</span>
                      <span className="pay-val" style={{ fontSize: "0.84rem" }}>{acc.iban}</span>
                    </div>
                    <CopyButton text={acc.iban} id={`${acc.id}-iban`} copiedKey={copiedKey} onCopy={handleCopy}>IBAN</CopyButton>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", backgroundColor: "var(--teal-50)", borderRadius: 8, border: "1px dashed var(--teal-300)" }}>
            <ShieldCheck size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "0.76rem", color: "var(--teal-900)", fontWeight: 600 }}>
              Official accounts for Tiny Threads By Zirwa. Every payment is acknowledged on WhatsApp.
            </span>
          </div>
        </div>

        <div className="modal-foot">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp btn-wa-lg" style={{ fontSize: "0.92rem" }}>
            <MessageCircle size={20} color="#ffffff" />
            <span>Share Payment Screenshot on WhatsApp</span>
          </a>
          <div className="hide-sm" style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--text-light)", marginTop: 6 }}>
            Opens WhatsApp +{settings?.whatsappNumber || "92 325 6393722"}
          </div>
        </div>
      </div>
    </div>
  );
}
