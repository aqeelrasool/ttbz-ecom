import React, { useEffect, useRef, useState } from "react";
import { X, UploadCloud, Trash2, Check, Images, Sparkles, Plus } from "lucide-react";
import { getGallery, addGalleryImages, deleteGalleryImage } from "../../services/gallery";
import useBodyScrollLock from "../../utils/useBodyScrollLock";

/**
 * GalleryPicker
 * mode="manage": Admin Gallery tab where admin can upload & view all photos in upload sequence.
 * mode="select": Modal picker opened while creating/editing product to select photos in sequence.
 */
export default function GalleryPicker({
  mode = "manage",
  onClose,
  onConfirm,
  usedUrls = [],
}) {
  const isSelect = mode === "select";
  useBodyScrollLock(isSelect);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // Array of IDs in selected order
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const list = await getGallery();
      setItems(list);
    } catch (e) {
      setError(e.message || "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setError("");
    setProgress({ done: 0, total: files.length });

    try {
      const added = await addGalleryImages(files, (done) =>
        setProgress({ done, total: files.length })
      );
      // Append in upload order
      setItems((prev) => [...prev, ...added]);

      // If in select mode, automatically select the newly uploaded images in order
      if (isSelect) {
        setSelectedIds((prev) => [...prev, ...added.map((a) => a.id)]);
      }
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(items.map((i) => i.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleDelete = async (item, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Delete "${item.name || "this photo"}" from gallery?`)) return;
    try {
      await deleteGalleryImage(item);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const handleConfirm = () => {
    const urls = selectedIds
      .map((id) => items.find((i) => i.id === id)?.url)
      .filter(Boolean);
    onConfirm(urls);
  };

  const bodyContent = (
    <div className="gallery-picker-content">
      {/* Hidden Multi-file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{ display: "none" }}
      />

      {/* Upload Banner / Dropzone */}
      <div
        className="gallery-upload-box"
        onClick={() => !progress && fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload multiple photos"
      >
        <UploadCloud size={30} color="var(--teal-700)" style={{ margin: "0 auto 6px", display: "block" }} />
        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--teal-900)" }}>
          {progress ? `Uploading photos (${progress.done} / ${progress.total})…` : "Tap to Upload Multiple Photos"}
        </div>
        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 2 }}>
          Select 1, 5, or 10 photos at once • Stored in exact upload sequence
        </div>

        {progress && (
          <div style={{ marginTop: 10, maxWidth: 320, margin: "10px auto 0" }}>
            <div className="progress">
              <div style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--teal-800)", fontWeight: 700, marginTop: 4 }}>
              Processing photo {progress.done} of {progress.total}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: "#fde8e8", color: "#c81e1e", padding: "10px 14px", borderRadius: 8, fontSize: "0.82rem", marginTop: 12 }}>
          {error}
        </div>
      )}

      {/* Gallery Header & Controls */}
      <div className="gallery-meta-bar">
        <div>
          <strong style={{ fontSize: "0.92rem", color: "var(--teal-900)" }}>
            Gallery Photos ({items.length})
          </strong>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
            Numbered in order of upload (#1, #2, #3…)
          </span>
        </div>

        {isSelect && items.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn-mini" onClick={selectAll}>Select all</button>
            {selectedIds.length > 0 && (
              <button type="button" className="btn-mini" onClick={clearSelection}>Clear</button>
            )}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 36, color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Loading photos…
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 36, color: "var(--text-muted)", fontSize: "0.88rem" }}>
          <Images size={36} color="var(--teal-400)" style={{ margin: "0 auto 8px", display: "block" }} />
          No photos in gallery yet. Upload your first product photos above.
        </div>
      ) : (
        <div className="gallery-grid">
          {items.map((item, idx) => {
            const pickIndex = selectedIds.indexOf(item.id);
            const isPicked = pickIndex >= 0;
            const isAlreadyUsed = isSelect && usedUrls.includes(item.url);

            return (
              <div
                key={item.id}
                role={isSelect ? "button" : undefined}
                tabIndex={isSelect ? 0 : undefined}
                className={`gal-item ${isPicked ? "selected" : ""} ${isAlreadyUsed && !isPicked ? "used" : ""}`}
                onClick={isSelect ? () => toggleSelect(item.id) : undefined}
                title={item.name || `Photo #${idx + 1}`}
              >
                <img src={item.url} alt={item.name || `Photo ${idx + 1}`} loading="lazy" />

                {/* Upload sequence badge */}
                <span className="gal-seq">#{idx + 1}</span>

                {/* Selection order badge (shows 1, 2, 3 in the order tapped) */}
                {isPicked && (
                  <span className="gal-pick">
                    {pickIndex + 1}
                  </span>
                )}

                {/* Already used badge */}
                {isAlreadyUsed && !isPicked && (
                  <span className="gal-pick" style={{ background: "var(--gold-primary)" }} title="Already added to product">
                    <Check size={12} />
                  </span>
                )}

                {/* Delete button (when managing gallery) */}
                {!isSelect && (
                  <button
                    type="button"
                    className="gal-del"
                    aria-label={`Delete ${item.name || "image"}`}
                    onClick={(e) => handleDelete(item, e)}
                    title="Delete image"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // If used in Admin tab view (inline)
  if (!isSelect) {
    return <div>{bodyContent}</div>;
  }

  // If used as modal picker from product form
  return (
    <div className="modal-overlay" style={{ zIndex: 10050 }} onClick={onClose}>
      <div
        className="modal-content modal-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Select photos from gallery"
      >
        <div className="modal-handle" />
        <div className="modal-head">
          <div style={{ minWidth: 0 }}>
            <h3 className="font-serif modal-title">Upload Gallery</h3>
            <span className="modal-sub">
              Tap images to select. Numbers show the sequence they will appear in your product.
            </span>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">{bodyContent}</div>

        <div className="modal-foot" style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleConfirm}
            disabled={selectedIds.length === 0 || !!progress}
          >
            {selectedIds.length > 0
              ? `Add ${selectedIds.length} Selected Photo${selectedIds.length > 1 ? "s" : ""} in Sequence`
              : "Select photos to add"}
          </button>
        </div>
      </div>
    </div>
  );
}
