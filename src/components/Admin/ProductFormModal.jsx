import React, { useState, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Wand2,
  DollarSign,
  Images,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import GalleryPicker from "./GalleryPicker";
import { addGalleryImages } from "../../services/gallery";
import useBodyScrollLock from "../../utils/useBodyScrollLock";

// Quick Sizing Presets for rapid product creation
const QUICK_SIZE_PRESETS = [
  { name: "Baby Standard", sizes: ["0-3 Months", "3-6 Months", "6-12 Months", "1-2 Years", "2-3 Years"] },
  { name: "Newborn Essentials", sizes: ["Newborn", "0-3 Months", "3-6 Months"] },
  { name: "Kids (2-6 Yrs)", sizes: ["2-3 Years", "3-4 Years", "4-5 Years", "5-6 Years"] },
  { name: "Standard S/M/L", sizes: ["Small", "Medium", "Large"] },
];

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "var(--teal-900)",
  marginBottom: 6,
};

export default function ProductFormModal({
  product,
  categories = [],
  onSave,
  onClose,
  currency = "PKR",
}) {
  useBodyScrollLock(true);

  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [fabricTag, setFabricTag] = useState(product?.fabricTag || product?.fabric_tag || "");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [isActive, setIsActive] = useState(product?.isActive !== false);
  const [saving, setSaving] = useState(false);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    product?.categoryIds || (categories.length > 0 ? [categories[0].id] : [])
  );

  // Images state
  const [images, setImages] = useState(product?.images?.length ? product.images : []);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [directUploadProgress, setDirectUploadProgress] = useState(null);
  const directFileInputRef = useRef(null);

  // Sizes & Pricing state
  const [sizes, setSizes] = useState(
    product?.sizes?.length
      ? product.sizes
      : [
          { size: "0-3 Months", price: 2400, inStock: true },
          { size: "3-6 Months", price: 2600, inStock: true },
          { size: "6-12 Months", price: 2800, inStock: true },
        ]
  );
  const [batchBasePrice, setBatchBasePrice] = useState(2500);
  const [batchStep, setBatchStep] = useState(200);

  const toggleCategory = (catId) => {
    if (selectedCategoryIds.includes(catId)) {
      if (selectedCategoryIds.length === 1) return; // Keep at least one category
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  const handleAddSizeRow = () => {
    setSizes([...sizes, { size: "New Size", price: batchBasePrice || 2500, inStock: true }]);
  };

  const handleUpdateSizeRow = (i, field, value) => {
    const updated = [...sizes];
    updated[i] = { ...updated[i], [field]: value };
    setSizes(updated);
  };

  const handleRemoveSizeRow = (i) => {
    if (sizes.length > 1) {
      setSizes(sizes.filter((_, idx) => idx !== i));
    }
  };

  const handleApplyPreset = (presetSizes) => {
    const base = Number(batchBasePrice) || 2400;
    const step = Number(batchStep) || 200;
    setSizes(presetSizes.map((s, idx) => ({ size: s, price: base + idx * step, inStock: true })));
  };

  const handleBatchSetPrices = () => {
    const base = Number(batchBasePrice) || 2400;
    const step = Number(batchStep) || 0;
    setSizes(sizes.map((s, idx) => ({ ...s, price: base + idx * step })));
  };

  // Direct multi-image upload
  const handleDirectMultiUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setDirectUploadProgress({ done: 0, total: files.length });
    try {
      const added = await addGalleryImages(files, (done) =>
        setDirectUploadProgress({ done, total: files.length })
      );
      const newUrls = added.map((item) => item.url);
      // Append new URLs in upload sequence
      setImages((prev) => [...prev, ...newUrls]);
    } catch (err) {
      alert("Image upload failed: " + (err.message || "Unknown error"));
    } finally {
      setDirectUploadProgress(null);
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImages([...images, url]);
    setImageUrlInput("");
  };

  const handleGalleryConfirm = (urls) => {
    setImages((prev) => [...prev, ...urls.filter((u) => !prev.includes(u))]);
    setShowGallery(false);
  };

  const moveImage = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    setImages(next);
  };

  const removeImage = (i) => {
    setImages(images.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter product title");
    if (sizes.length === 0) return alert("Please add at least one size");

    setSaving(true);
    try {
      await onSave({
        ...(product || {}),
        title: title.trim(),
        description: description.trim(),
        fabricTag: fabricTag.trim() || null,
        categoryIds: selectedCategoryIds,
        images: images.length > 0 ? images : ["/ttbz-logo.png"],
        sizes: sizes.map((s) => ({
          size: s.size.trim(),
          price: Number(s.price) || 0,
          inStock: s.inStock !== false,
        })),
        isFeatured,
        isActive,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal-content modal-md"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-label={product ? "Edit product" : "Create product"}
      >
        <div className="modal-handle" />
        <div className="modal-head">
          <div style={{ minWidth: 0 }}>
            <h3 className="font-serif modal-title">
              {product ? "Edit Product" : "Create New Product"}
            </h3>
            <span className="modal-sub">Sizes, pricing, photos & categories</span>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle} htmlFor="pf-title">
              Product Title *
            </label>
            <input
              id="pf-title"
              type="text"
              placeholder="e.g. Mint Blossom Hand-Embroidered Frock"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Categories (multi-select) */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              Categories *{" "}
              <span style={{ fontWeight: 500, color: "var(--text-muted)", fontSize: "0.74rem" }}>
                (can select more than 1)
              </span>
            </label>
            <div className="row-wrap" style={{ gap: 8 }}>
              {categories.map((cat) => {
                const on = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`cat-pill ${on ? "active" : ""}`}
                  >
                    {cat.name} {on && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle} htmlFor="pf-desc">
              Description & Craftsmanship Details
            </label>
            <textarea
              id="pf-desc"
              rows={3}
              placeholder="Handmade smocked frock, delicate floral stitches, organza flounces…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Fabric / Material Tag (OPTIONAL - Per User Request) */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle} htmlFor="pf-fabric">
              Fabric / Material Tag{" "}
              <span style={{ fontWeight: 500, color: "var(--text-muted)", fontSize: "0.74rem" }}>
                (Optional — leave blank to remove the cotton badge)
              </span>
            </label>
            <input
              id="pf-fabric"
              type="text"
              placeholder="e.g. 100% Baby-Safe Pure Cotton, Organza & Zari, or leave blank"
              value={fabricTag}
              onChange={(e) => setFabricTag(e.target.value)}
              className="input-field"
            />
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
              If you leave this empty, no hardcoded cotton badge will be shown to customers.
            </div>
          </div>

          {/* Product Images & Multi-Upload in Sequence */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              Product Images{" "}
              <span style={{ fontWeight: 500, color: "var(--text-muted)", fontSize: "0.74rem" }}>
                (First photo is the main storefront picture)
              </span>
            </label>

            {/* Hidden multi-file input */}
            <input
              ref={directFileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleDirectMultiUpload}
              style={{ display: "none" }}
            />

            {/* Thumbnail Strip with Reorder Controls */}
            {images.length > 0 ? (
              <div className="img-strip" style={{ marginBottom: 14 }}>
                {images.map((img, idx) => (
                  <div className="img-tile" key={`${img.slice(-24)}-${idx}`}>
                    <img src={img} alt={`Product photo ${idx + 1}`} />
                    <span className="img-seq-num">#{idx + 1}</span>
                    {idx === 0 && <span className="main-tag">MAIN</span>}
                    <div className="tile-actions">
                      <button
                        type="button"
                        aria-label="Move left"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, -1)}
                        title="Move Left"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onClick={() => removeImage(idx)}
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label="Move right"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 1)}
                        title="Move Right"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 12 }}>
                No photos selected yet. Upload multiple photos or choose from the upload gallery below.
              </div>
            )}

            {/* Progress indicator during direct multi-upload */}
            {directUploadProgress && (
              <div style={{ marginBottom: 12, padding: "8px 12px", background: "var(--teal-50)", borderRadius: 8 }}>
                <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--teal-900)" }}>
                  Uploading photo {directUploadProgress.done} of {directUploadProgress.total} in sequence…
                </div>
                <div className="progress" style={{ marginTop: 6 }}>
                  <div style={{ width: `${(directUploadProgress.done / directUploadProgress.total) * 100}%` }} />
                </div>
              </div>
            )}

            {/* Upload & Gallery Action Buttons */}
            <div className="row-wrap" style={{ gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => directFileInputRef.current?.click()}
                disabled={!!directUploadProgress}
              >
                <UploadCloud size={16} />
                <span>Upload Multiple Photos</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowGallery(true)}
              >
                <Images size={16} />
                <span>Select from Upload Gallery</span>
              </button>
            </div>

            {/* URL input fallback */}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                type="url"
                inputMode="url"
                placeholder="…or paste image URL directly"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="input-field"
                style={{ fontSize: "0.85rem" }}
              />
              <button type="button" className="btn btn-ghost" onClick={handleAddImageUrl}>
                Add
              </button>
            </div>
          </div>

          {/* Sizes & Pricing */}
          <div
            style={{
              padding: 14,
              backgroundColor: "#faf8f5",
              borderRadius: 14,
              border: "1px solid var(--border-subtle)",
              marginBottom: 20,
            }}
          >
            <div className="row-wrap" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: 800,
                    color: "var(--teal-900)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <DollarSign size={16} color="var(--gold-primary)" /> Sizes & Pricing
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                  Each size has its own price.
                </div>
              </div>
              <button type="button" className="btn btn-outline" onClick={handleAddSizeRow}>
                <Plus size={14} /> Add Size
              </button>
            </div>

            {/* Quick 1-click presets */}
            <div
              style={{
                marginBottom: 12,
                padding: 10,
                backgroundColor: "#fff",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  color: "var(--teal-800)",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Sparkles size={12} color="var(--gold-primary)" /> QUICK SIZE PRESETS (1-Click)
              </div>
              <div className="row-wrap" style={{ gap: 6 }}>
                {QUICK_SIZE_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p.sizes)}
                    className="chip chip-teal"
                    style={{
                      cursor: "pointer",
                      border: "1px solid var(--teal-300)",
                      padding: "6px 10px",
                      fontSize: "0.75rem",
                    }}
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch pricing generator */}
            <div
              className="row-wrap"
              style={{
                marginBottom: 14,
                padding: "8px 12px",
                backgroundColor: "var(--teal-50)",
                borderRadius: 8,
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  color: "var(--teal-800)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Wand2 size={13} /> Batch:
              </span>
              <label
                style={{
                  fontSize: "0.74rem",
                  color: "var(--text-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Base {currency}
                <input
                  type="number"
                  inputMode="numeric"
                  value={batchBasePrice}
                  onChange={(e) => setBatchBasePrice(Number(e.target.value))}
                  style={{
                    width: 78,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid var(--border-subtle)",
                  }}
                />
              </label>
              <label
                style={{
                  fontSize: "0.74rem",
                  color: "var(--text-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                + Step
                <input
                  type="number"
                  inputMode="numeric"
                  value={batchStep}
                  onChange={(e) => setBatchStep(Number(e.target.value))}
                  style={{
                    width: 66,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid var(--border-subtle)",
                  }}
                />
              </label>
              <button
                type="button"
                className="btn btn-primary"
                style={{ minHeight: 34, padding: "5px 12px", fontSize: "0.76rem" }}
                onClick={handleBatchSetPrices}
              >
                Apply to all
              </button>
            </div>

            {/* Size rows list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sizes.map((s, idx) => (
                <div className="size-row" key={idx}>
                  <input
                    className="f-name"
                    type="text"
                    value={s.size}
                    placeholder="Size (e.g. 0-3 Months)"
                    aria-label="Size name"
                    onChange={(e) => handleUpdateSizeRow(idx, "size", e.target.value)}
                    style={{ fontWeight: 600 }}
                  />
                  <div className="f-price" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      {currency}
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={s.price}
                      placeholder="Price"
                      aria-label="Price"
                      onChange={(e) => handleUpdateSizeRow(idx, "price", Number(e.target.value))}
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                  <label
                    className="f-stock"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      color: s.inStock !== false ? "#1e7e34" : "#999",
                      minHeight: 36,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={s.inStock !== false}
                      onChange={(e) => handleUpdateSizeRow(idx, "inStock", e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    <span>{s.inStock !== false ? "In stock" : "Sold out"}</span>
                  </label>
                  <button
                    className="f-del"
                    type="button"
                    onClick={() => handleRemoveSizeRow(idx)}
                    disabled={sizes.length <= 1}
                    aria-label="Remove size"
                    style={{
                      background: "transparent",
                      border: 0,
                      width: 36,
                      height: 36,
                      color: sizes.length <= 1 ? "#ccc" : "#d9534f",
                      cursor: sizes.length <= 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility & Featured Flags */}
          <div
            className="row-wrap"
            style={{
              gap: 18,
              padding: 12,
              backgroundColor: "#FAF7F2",
              borderRadius: 8,
              border: "1px solid var(--border-subtle)",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 36,
              }}
            >
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span>⭐ Featured on Homepage</span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 36,
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span>Visible in Store</span>
            </label>
          </div>
        </div>

        <div className="modal-foot" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: "1 1 auto", maxWidth: 260 }}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Product"}
          </button>
        </div>
      </form>

      {/* Gallery Selector Modal */}
      {showGallery && (
        <div onClick={(e) => e.stopPropagation()}>
          <GalleryPicker
            mode="select"
            usedUrls={images}
            onClose={() => setShowGallery(false)}
            onConfirm={handleGalleryConfirm}
          />
        </div>
      )}
    </div>
  );
}
