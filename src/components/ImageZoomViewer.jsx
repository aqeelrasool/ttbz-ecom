import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

/**
 * ImageZoomViewer
 * - Inline touch-and-drag loupe (magnifier glass) for mobile and desktop hover
 * - Fullscreen interactive lightbox with pinch-to-zoom, pan, double-tap zoom,
 *   and keyboard navigation for the ultimate artisan fabric inspection experience.
 */
export default function ImageZoomViewer({
  images = [],
  activeIndex = 0,
  onIndexChange,
  alt = "Product image",
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Inline loupe state (for touch-and-drag or mouse hover)
  const [loupeActive, setLoupeActive] = useState(false);
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0, relX: 50, relY: 50 });
  const inlineContainerRef = useRef(null);

  // Fullscreen touch tracking for pinch & pan
  const fsContainerRef = useRef(null);
  const pinchRef = useRef({
    isPinching: false,
    startDist: 0,
    startScale: 1,
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    lastTap: 0,
  });

  const currentImg = images[activeIndex] || "/ttbz-logo.png";

  // Reset zoom whenever image changes or fullscreen closes
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetZoom();
  }, [activeIndex, resetZoom]);

  // Lock body scroll when fullscreen zoom is open
  useEffect(() => {
    if (!isFullscreen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isFullscreen]);

  // ---------------------------------------------------------------------------
  // Inline Touch & Hover Loupe
  // ---------------------------------------------------------------------------
  const updateLoupeCoords = (clientX, clientY) => {
    const el = inlineContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Constrain within bounds
    const clampedX = Math.max(0, Math.min(rect.width, x));
    const clampedY = Math.max(0, Math.min(rect.height, y));
    const relX = (clampedX / rect.width) * 100;
    const relY = (clampedY / rect.height) * 100;

    setLoupePos({
      x: clampedX,
      y: clampedY,
      relX,
      relY,
    });
  };

  const handleTouchStartInline = (e) => {
    if (e.touches.length === 1) {
      setLoupeActive(true);
      updateLoupeCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMoveInline = (e) => {
    if (loupeActive && e.touches.length === 1) {
      // Prevent screen scrolling while user is inspecting the image with loupe
      if (e.cancelable) e.preventDefault();
      updateLoupeCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEndInline = () => {
    setLoupeActive(false);
  };

  const handleMouseMoveInline = (e) => {
    setLoupeActive(true);
    updateLoupeCoords(e.clientX, e.clientY);
  };

  const handleMouseLeaveInline = () => {
    setLoupeActive(false);
  };

  // ---------------------------------------------------------------------------
  // Fullscreen Navigation
  // ---------------------------------------------------------------------------
  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (images.length > 1) {
      const prev = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
      onIndexChange?.(prev);
    }
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (images.length > 1) {
      const next = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
      onIndexChange?.(next);
    }
  };

  const zoomIn = (e) => {
    if (e) e.stopPropagation();
    setScale((s) => Math.min(4, Number((s + 0.6).toFixed(2))));
  };

  const zoomOut = (e) => {
    if (e) e.stopPropagation();
    setScale((s) => {
      const next = Math.max(1, Number((s - 0.6).toFixed(2)));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // Fullscreen Touch Gestures (Pinch-to-zoom, Pan, Double-tap)
  // ---------------------------------------------------------------------------
  const getTouchDist = (t1, t2) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  };

  const handleFsTouchStart = (e) => {
    const p = pinchRef.current;
    if (e.touches.length === 2) {
      p.isPinching = true;
      p.startDist = getTouchDist(e.touches[0], e.touches[1]);
      p.startScale = scale;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      // Double-tap to zoom
      if (now - p.lastTap < 320) {
        if (scale > 1.2) {
          resetZoom();
        } else {
          setScale(2.5);
          // Center zoom on tap position
          const rect = fsContainerRef.current?.getBoundingClientRect();
          if (rect) {
            const tapX = e.touches[0].clientX - rect.left - rect.width / 2;
            const tapY = e.touches[0].clientY - rect.top - rect.height / 2;
            setPosition({ x: -tapX * 0.8, y: -tapY * 0.8 });
          }
        }
        p.lastTap = 0;
        return;
      }
      p.lastTap = now;

      p.isDragging = true;
      p.startX = e.touches[0].clientX;
      p.startY = e.touches[0].clientY;
      p.startPosX = position.x;
      p.startPosY = position.y;
    }
  };

  const handleFsTouchMove = (e) => {
    const p = pinchRef.current;
    if (p.isPinching && e.touches.length === 2) {
      if (e.cancelable) e.preventDefault();
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const factor = dist / (p.startDist || 1);
      const newScale = Math.max(1, Math.min(4.5, Number((p.startScale * factor).toFixed(2))));
      setScale(newScale);
      if (newScale <= 1) setPosition({ x: 0, y: 0 });
    } else if (p.isDragging && e.touches.length === 1 && scale > 1) {
      if (e.cancelable) e.preventDefault();
      const dx = e.touches[0].clientX - p.startX;
      const dy = e.touches[0].clientY - p.startY;
      // Allow panning when zoomed in
      const maxPanX = (window.innerWidth * (scale - 1)) / 1.8;
      const maxPanY = (window.innerHeight * (scale - 1)) / 1.8;
      setPosition({
        x: Math.max(-maxPanX, Math.min(maxPanX, p.startPosX + dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, p.startPosY + dy)),
      });
    }
  };

  const handleFsTouchEnd = (e) => {
    const p = pinchRef.current;
    if (e.touches.length < 2) p.isPinching = false;
    if (e.touches.length === 0) p.isDragging = false;
  };

  return (
    <>
      {/* ----------------- INLINE MAIN IMAGE CONTAINER ----------------- */}
      <div
        ref={inlineContainerRef}
        className="zoom-inline-wrap"
        onTouchStart={handleTouchStartInline}
        onTouchMove={handleTouchMoveInline}
        onTouchEnd={handleTouchEndInline}
        onMouseMove={handleMouseMoveInline}
        onMouseLeave={handleMouseLeaveInline}
        onClick={() => setIsFullscreen(true)}
        role="button"
        tabIndex={0}
        aria-label="Touch and drag to zoom fabric details, or tap to open fullscreen"
      >
        <img
          src={currentImg}
          alt={alt}
          className="zoom-inline-img"
          loading="eager"
          onError={(e) => {
            e.currentTarget.src = "/ttbz-logo.png";
          }}
        />

        {/* Floating invitation badge */}
        <div className="zoom-hint-badge">
          <Maximize2 size={13} />
          <span>Touch & hold to zoom • Tap fullscreen</span>
        </div>

        {/* FLOATING MAGNIFIER LOUPE */}
        {loupeActive && (
          <div
            className="zoom-loupe"
            style={{
              left: `${loupePos.x}px`,
              top: `${Math.max(60, loupePos.y - 70)}px`,
            }}
          >
            <div
              className="zoom-loupe-inner"
              style={{
                backgroundImage: `url(${currentImg})`,
                backgroundPosition: `${loupePos.relX}% ${loupePos.relY}%`,
                backgroundSize: "320% 320%",
              }}
            />
            <div className="zoom-loupe-crosshair" />
            <span className="zoom-loupe-tag">3x Detail</span>
          </div>
        )}
      </div>

      {/* ----------------- FULLSCREEN ZOOM LIGHTBOX ----------------- */}
      {isFullscreen && (
        <div
          className="zoom-fs-overlay"
          onClick={() => setIsFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Product Image Fullscreen Zoom"
        >
          {/* Header Controls */}
          <div className="zoom-fs-header" onClick={(e) => e.stopPropagation()}>
            <div className="zoom-fs-counter">
              <span>{activeIndex + 1} / {images.length}</span>
              <span className="zoom-fs-scale-badge">{Math.round(scale * 100)}%</span>
            </div>

            <div className="zoom-fs-controls">
              <button
                type="button"
                className="zoom-fs-btn"
                onClick={zoomOut}
                disabled={scale <= 1}
                aria-label="Zoom out"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                type="button"
                className="zoom-fs-btn"
                onClick={resetZoom}
                disabled={scale === 1 && position.x === 0 && position.y === 0}
                aria-label="Reset zoom"
                title="Reset Zoom"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                className="zoom-fs-btn"
                onClick={zoomIn}
                disabled={scale >= 4}
                aria-label="Zoom in"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                type="button"
                className="zoom-fs-btn zoom-fs-close"
                onClick={() => setIsFullscreen(false)}
                aria-label="Close fullscreen view"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Center viewport with gestures */}
          <div
            ref={fsContainerRef}
            className="zoom-fs-stage"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleFsTouchStart}
            onTouchMove={handleFsTouchMove}
            onTouchEnd={handleFsTouchEnd}
          >
            <div
              className="zoom-fs-canvas"
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                transition: pinchRef.current.isPinching || pinchRef.current.isDragging ? "none" : "transform 0.22s ease-out",
                cursor: scale > 1 ? "grab" : "zoom-in",
              }}
            >
              <img
                src={currentImg}
                alt={alt}
                className="zoom-fs-img"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.src = "/ttbz-logo.png";
                }}
              />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="zoom-fs-arrow prev"
                  onClick={handlePrev}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  className="zoom-fs-arrow next"
                  onClick={handleNext}
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Footer Guide & Thumbnails */}
          <div className="zoom-fs-footer" onClick={(e) => e.stopPropagation()}>
            <div className="zoom-fs-guide">
              Pinch or double-tap to zoom • Drag to inspect delicate embroidery & stitching
            </div>

            {images.length > 1 && (
              <div className="zoom-fs-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`zoom-fs-thumb ${activeIndex === idx ? "active" : ""}`}
                    onClick={() => onIndexChange?.(idx)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={img} alt="" />
                    <span>#{idx + 1}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
