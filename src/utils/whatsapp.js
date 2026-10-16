import confetti from "canvas-confetti";

/**
 * Normalizes phone number into international WhatsApp format without + or spaces
 * Default fallback to Tiny Threads WhatsApp number: 923256393722
 */
export function formatWhatsAppNumber(phone) {
  if (!phone) return "923256393722";
  let clean = phone.replace(/[^\d]/g, "");
  if (clean.startsWith("0")) {
    clean = "92" + clean.substring(1);
  }
  return clean || "923256393722";
}

/**
 * Builds the WhatsApp order URL with product details, selected size, price, and link
 */
export function generateWhatsAppOrderUrl({
  phone = "923256393722",
  product,
  selectedSize,
  customNotes = "",
  currency = "PKR",
}) {
  const targetPhone = formatWhatsAppNumber(phone);

  const productUrl = `${window.location.origin}${window.location.pathname}#product-${product.id}`;
  const sizeName = selectedSize?.size || "Standard";
  const sizePrice = selectedSize?.price
    ? `${currency} ${Number(selectedSize.price).toLocaleString()}`
    : "Price on inquiry";

  const message = [
    `🌸 *TINY THREADS BY ZIRWA - ORDER INQUIRY* 🌸`,
    ``,
    `Hello! I would like to place an order for this handcrafted piece:`,
    ``,
    `👗 *Product:* ${product.title}`,
    `📏 *Selected Size:* ${sizeName}`,
    `💰 *Price:* ${sizePrice}`,
    `🔗 *Product Link:* ${productUrl}`,
    customNotes ? `📝 *Notes/Customization:* ${customNotes}` : "",
    `💳 *Payment Note:* Ready to pay 30% advance for custom made order.`,
    ``,
    `Could you please confirm availability and delivery timeframe? Thank you! 💕`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Trigger confetti micro-celebration
 */
export function fireOrderConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.75 },
      colors: ["#2C5E57", "#4EA8A1", "#F8E1E7", "#C59B27"],
    });
  } catch (e) {
    // ignore
  }
}
