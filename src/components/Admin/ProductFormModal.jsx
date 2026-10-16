import React, { useState } from "react";
import { X, Plus, Trash2, Upload, Sparkles, Wand2, DollarSign, Image as ImageIcon } from "lucide-react";
import { uploadProductImage } from "../../services/db";

// Quick Sizing Presets for rapid product creation
const QUICK_SIZE_PRESETS = [
  {
    name: "Baby Standard",
    sizes: ["0-3 Months", "3-6 Months", "6-12 Months", "1-2 Years", "2-3 Years"],
  },
  {
    name: "Newborn Essentials",
    sizes: ["Newborn", "0-3 Months", "3-6 Months"],
  },
  {
    name: "Kids (2-6 Yrs)",
    sizes: ["2-3 Years", "3-4 Years", "4-5 Years", "5-6 Years"],
  },
  {
    name: "Standard S/M/L",
    sizes: ["Small", "Medium", "Large"],
  },
];

export default function ProductFormModal({
  product,
  categories = [],
  onSave,
  onClose,
  currency = "PKR",
}) {
  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [isActive, setIsActive] = useState(product?.isActive !== false);

  // Multi-category support
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    product?.categoryIds || (categories.length > 0 ? [categories[0].id] : [])
  );

  // Images list
  const [images, setImages] = useState(
    product?.images && product.images.length > 0
      ? product.images
      : ["/products/mint-embroidered-dress.jpg"]
  );
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  // Sizes with individual pricing
  const [sizes, setSizes] = useState(
    product?.sizes && product.sizes.length > 0
      ? product.sizes
      : [
          { size: "0-3 Months", price: 2400, inStock: true },
          { size: "3-6 Months", price: 2600, inStock: true },
          { size: "6-12 Months", price: 2800, inStock: true },
        ]
  );

  // Quick Batch Pricing state
  const [batchBasePrice, setBatchBasePrice] = useState(2500);
  const [batchStep, setBatchStep] = useState(200);

  // Toggle Category selection (multi-category)
  const toggleCategory = (catId) => {
    if (selectedCategoryIds.includes(catId)) {
      if (selectedCategoryIds.length === 1) return; // keep at least 1
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  // Add individual size row
  const handleAddSizeRow = () => {
    setSizes([...sizes, { size: "New Size", price: batchBasePrice || 2500, inStock: true }]);
  };

  // Update specific size row
  const handleUpdateSizeRow = (index, field, value) => {
    const updated = [...sizes];
    updated[index] = { ...updated[index], [field]: value };
    setSizes(updated);
  };

  // Remove size row
  const handleRemoveSizeRow = (index) => {
    if (sizes.length <= 1) return;
    setSizes(sizes.filter((_, i) => i !== index));
  };

  // Quick Preset Add
  const handleApplyPreset = (presetSizes) => {
    const base = Number(batchBasePrice) || 2400;
    const step = Number(batchStep) || 200;
    const newSizes = presetSizes.map((sizeName, idx) => ({
      size: sizeName,
      price: base + idx * step,
      inStock: true,
    }));
    setSizes(newSizes);
  };

  // Batch Set Prices on all current sizes
  const handleBatchSetPrices = () => {
    const base = Number(batchBasePrice) || 2400;
    const step = Number(batchStep) || 0;
    const updated = sizes.map((s, idx) => ({
      ...s,
      price: base + idx * step,
    }));
    setSizes(updated);
  };

  // Add Image URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages([...images, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  // Upload image file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      setImages([...images, uploadedUrl]);
    } catch (err) {
      alert("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Remove Image
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter product title");
      return;
    }
    if (sizes.length === 0) {
      alert("Please add at least one size");
      return;
    }

    const payload = {
      ...(product || {}),
      title: title.trim(),
      description: description.trim(),
      categoryIds: selectedCategoryIds,
      images: images.length > 0 ? images : ["/ttbz-logo.png"],
      sizes: sizes.map((s) => ({
        size: s.size.trim(),
        price: Number(s.price) || 0,
        inStock: s.inStock !== false,
      })),
      isFeatured,
      isActive,
    };

    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "760px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 22px",
            borderBottom: "1px solid var(--border-subtle)",
            backgroundColor: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <h3 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--teal-900)" }}>
              {product ? "Edit Handcrafted Product" : "Create New Product"}
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Quick sizing, multi-category assignment & individual price tags
            </span>
          </div>

          <button
            onClick={onClose}
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
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px", overflowY: "auto", flexGrow: 1 }}>
          {/* Title & Status */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "6px" }}>
              Product Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Mint Blossom Hand-Embroidered Frock"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* MULTI-CATEGORY ASSIGNMENT */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--teal-900)" }}>
                Categories (Product can belong to multiple categories) *
              </label>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                Select all that apply
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.82rem",
                      fontWeight: isSelected ? 700 : 500,
                      border: isSelected ? "1.5px solid var(--teal-600)" : "1px solid var(--border-subtle)",
                      backgroundColor: isSelected ? "var(--teal-50)" : "#ffffff",
                      color: isSelected ? "var(--teal-900)" : "var(--text-main)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{cat.name}</span>
                    {isSelected && <span style={{ color: "var(--teal-600)", fontWeight: 800 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "6px" }}>
              Description & Fabric Details
            </label>
            <textarea
              rows={3}
              placeholder="Handmade smocked frock, soft pure cotton fabric, embroidered rosebuds, pearl buttons..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </div>

          {/* SIZES & PRICING MATRIX WITH QUICK ADD */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#faf8f5",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--teal-900)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <DollarSign size={16} color="var(--gold-primary)" />
                  Sizes & Size-Specific Pricing
                </label>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Each size can have a different price. Use Quick Add to create in seconds!
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSizeRow}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#ffffff",
                  border: "1px solid var(--teal-500)",
                  color: "var(--teal-800)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Plus size={14} /> Add Custom Size
              </button>
            </div>

            {/* QUICK PRESETS BUTTONS */}
            <div style={{ marginBottom: "12px", padding: "10px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--teal-800)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Sparkles size={12} color="var(--gold-primary)" />
                ⚡ QUICK SIZE PRESETS (1-Click Fill):
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {QUICK_SIZE_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleApplyPreset(preset.sizes)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      backgroundColor: "var(--teal-50)",
                      border: "1px solid var(--teal-300)",
                      color: "var(--teal-900)",
                      cursor: "pointer",
                    }}
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* BATCH PRICING TOOL */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "14px",
                padding: "8px 12px",
                backgroundColor: "var(--teal-50)",
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--teal-800)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Wand2 size={13} /> Batch Pricing:
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Base {currency}:</span>
                <input
                  type="number"
                  value={batchBasePrice}
                  onChange={(e) => setBatchBasePrice(Number(e.target.value))}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-subtle)", fontSize: "0.8rem" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>+ Step:</span>
                <input
                  type="number"
                  value={batchStep}
                  onChange={(e) => setBatchStep(Number(e.target.value))}
                  style={{ width: "65px", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-subtle)", fontSize: "0.8rem" }}
                />
              </div>
              <button
                type="button"
                onClick={handleBatchSetPrices}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  backgroundColor: "var(--teal-700)",
                  color: "#ffffff",
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Apply to All Sizes
              </button>
            </div>

            {/* SIZES TABLE */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sizes.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 100px 36px",
                    gap: "8px",
                    alignItems: "center",
                    backgroundColor: "#ffffff",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <input
                    type="text"
                    value={s.size}
                    placeholder="Size name (e.g. 0-3 Months)"
                    onChange={(e) => handleUpdateSizeRow(idx, "size", e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  />

                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>{currency}</span>
                    <input
                      type="number"
                      value={s.price}
                      placeholder="Price"
                      onChange={(e) => handleUpdateSizeRow(idx, "price", Number(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", cursor: "pointer", color: s.inStock !== false ? "#1e7e34" : "#999" }}>
                    <input
                      type="checkbox"
                      checked={s.inStock !== false}
                      onChange={(e) => handleUpdateSizeRow(idx, "inStock", e.target.checked)}
                    />
                    <span>{s.inStock !== false ? "In Stock" : "Sold Out"}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveSizeRow(idx)}
                    disabled={sizes.length <= 1}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: sizes.length <= 1 ? "#ccc" : "#d9534f",
                      cursor: sizes.length <= 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT IMAGES */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "6px" }}>
              Product Images
            </label>

            {/* Current Images Preview */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    width: "70px",
                    height: "70px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    overflow: "hidden",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      fontSize: "11px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add Image via URL or Upload */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px", display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  placeholder="Paste image URL (https://...)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="input-field"
                  style={{ fontSize: "0.82rem" }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  style={{
                    padding: "0 12px",
                    borderRadius: "6px",
                    backgroundColor: "var(--teal-50)",
                    border: "1px solid var(--teal-300)",
                    color: "var(--teal-900)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Add URL
                </button>
              </div>

              {/* Upload File */}
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  backgroundColor: "var(--teal-700)",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Upload size={14} />
                <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Visibility and Featured flags */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px", padding: "12px", backgroundColor: "#FAF7F2", borderRadius: "8px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.84rem", fontWeight: 600, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <span>⭐ Feature on Homepage</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.84rem", fontWeight: 600, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Active (Visible in store)</span>
            </label>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              paddingTop: "14px",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "#ffffff",
                color: "var(--text-main)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: "10px 22px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                backgroundColor: "var(--teal-700)",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Save Handcrafted Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
