// Initial Seed Data for Tiny Threads By Zirwa
// Handcrafted baby & kids couture with size-specific pricing and multi-category support

export const INITIAL_CATEGORIES = [
  {
    id: "cat-frocks",
    name: "Handcrafted Frocks",
    slug: "handcrafted-frocks",
    description: "Delicate heirloom frocks with hand-embroidery and lace trim",
    displayOrder: 1,
  },
  {
    id: "cat-festive",
    name: "Festive & Party Wear",
    slug: "festive-party-wear",
    description: "Artisanal occasion wear with zari, organza, and pearl detailing",
    displayOrder: 2,
  },
  {
    id: "cat-baby",
    name: "Newborn & Baby (0-12M)",
    slug: "newborn-baby",
    description: "Ultra-soft hypoallergenic fabrics tailored for delicate newborn skin",
    displayOrder: 3,
  },
  {
    id: "cat-toddler",
    name: "Toddler & Kids (1-5Y)",
    slug: "toddler-kids",
    description: "Comfortable bespoke dresses for toddlers with twirl-worthy flair",
    displayOrder: 4,
  },
  {
    id: "cat-bestsellers",
    name: "Signature Best Sellers",
    slug: "best-sellers",
    description: "Our most loved and customer-favorite creations",
    displayOrder: 5,
  },
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-mint-delight",
    title: "Mint Blossom Hand-Embroidered Frock",
    description: "Crafted from breathable premium cotton in our signature vintage mint hue. Features delicate floral hand-embroidery across the chest and scalloped hemline, pearl buttons, and a dainty satin bow. Designed with soft inner lining to ensure ultimate comfort for baby skin.",
    images: [
      "/products/mint-embroidered-dress.jpg",
      "/ttbz-logo.png",
    ],
    // Multi-category support: belongs to frocks, newborn, toddler, and bestsellers!
    categoryIds: ["cat-frocks", "cat-baby", "cat-toddler", "cat-bestsellers"],
    sizes: [
      { size: "0-3 Months", price: 2400, inStock: true },
      { size: "3-6 Months", price: 2600, inStock: true },
      { size: "6-12 Months", price: 2800, inStock: true },
      { size: "1-2 Years", price: 3100, inStock: true },
      { size: "2-3 Years", price: 3400, inStock: true },
    ],
    isFeatured: true,
    isActive: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-blush-vintage",
    title: "Vintage Rose Smocked Cotton Frock",
    description: "An heirloom-quality blush pink dress featuring intricate hand-smocking across the bodice with tiny embroidered rosebuds. Finished with ruffled Peter Pan collar and flutter sleeve cuffs. Perfect for family portraits and milestone celebrations.",
    images: [
      "/products/blush-smocked-dress.jpg",
      "/products/mint-embroidered-dress.jpg",
    ],
    categoryIds: ["cat-frocks", "cat-baby", "cat-bestsellers"],
    sizes: [
      { size: "0-3 Months", price: 2600, inStock: true },
      { size: "3-6 Months", price: 2800, inStock: true },
      { size: "6-12 Months", price: 3000, inStock: true },
      { size: "1-2 Years", price: 3300, inStock: true },
    ],
    isFeatured: true,
    isActive: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-ivory-festive",
    title: "Ivory & Golden Thread Festive Organza Dress",
    description: "An opulent festive piece featuring layered pure organza tiered skirt, fine zari needlework along scalloped flounces, and a comfortable breathable cotton lining. Comes with delicate gold stitch embroidery honoring timeless Pakistani craftsmanship.",
    images: [
      "/products/ivory-festive-dress.jpg",
    ],
    categoryIds: ["cat-festive", "cat-toddler", "cat-bestsellers"],
    sizes: [
      { size: "6-12 Months", price: 3500, inStock: true },
      { size: "1-2 Years", price: 3800, inStock: true },
      { size: "2-3 Years", price: 4200, inStock: true },
      { size: "3-4 Years", price: 4500, inStock: true },
      { size: "Custom Sizing", price: 4800, inStock: true },
    ],
    isFeatured: true,
    isActive: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-peach-floral",
    title: "Sunny Peach Garden Flutter Frock",
    description: "Bright, airy, and full of joy. Made from 100% fine lawn cotton with charming watercolor florals, flutter sleeves, and mother-of-pearl buttons. Lightweight and gentle for hot summer days.",
    images: [
      "/products/blush-smocked-dress.jpg",
      "/products/mint-embroidered-dress.jpg",
    ],
    categoryIds: ["cat-frocks", "cat-baby", "cat-toddler"],
    sizes: [
      { size: "0-3 Months", price: 2100, inStock: true },
      { size: "3-6 Months", price: 2300, inStock: true },
      { size: "6-12 Months", price: 2500, inStock: true },
      { size: "1-2 Years", price: 2700, inStock: true },
    ],
    isFeatured: false,
    isActive: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_SETTINGS = {
  whatsappNumber: "923256393722",
  storeName: "Tiny Threads By Zirwa",
  tagline: "Artisanal Baby & Kids Couture",
  currency: "PKR",
  announcement: "🌸 At least 30% payment is required to place the order because these dresses are made custom for you on order",
  adminUsername: "admin",
  adminPassword: "admin123", // default password
  supabaseUrl: "",
  supabaseAnonKey: "",
};
