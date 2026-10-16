import { getSupabaseClient } from "./db";

/**
 * Image gallery service.
 * - Upload multiple images at one time: processed sequentially with monotonic
 *   increasing `seq` so the stored sequence always matches the exact upload order.
 * - In the gallery, images are displayed in the exact sequence they were uploaded (#1, #2, #3...).
 * - Supabase: files go to the `product-images` storage bucket + `gallery_images` table.
 * - Local / Offline: images are stored in browser IndexedDB.
 */

const IDB_NAME = "ttbz_gallery";
const IDB_STORE = "images";
const BUCKET = "product-images";

const DEFAULT_INITIAL_GALLERY = [
  { id: "img-seed-1", url: "/products/mint-embroidered-dress.jpg", path: null, name: "Mint Blossom Handcrafted Frock", seq: 1 },
  { id: "img-seed-2", url: "/products/blush-smocked-dress.jpg", path: null, name: "Vintage Rose Smocked Frock", seq: 2 },
  { id: "img-seed-3", url: "/products/ivory-festive-dress.jpg", path: null, name: "Ivory & Gold Zari Festive Frock", seq: 3 },
  { id: "img-seed-4", url: "/products/peach-floral-dress.jpg", path: null, name: "Peach Blossom Summer Frock", seq: 4 },
];

// ----------------------------- IndexedDB helpers ----------------------------
function openIdb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbAll() {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE).objectStore(IDB_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(item) {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(item);
    tx.oncomplete = () => resolve(item);
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(id) {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ------------------------------ Image processing ----------------------------
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`"${file.name}" is not a valid image`)); };
    img.src = url;
  });
}

/** Resize (max 1400px) + convert to JPEG for crisp high quality while staying lightweight. */
export async function compressImage(file, maxDim = 1400, quality = 0.85) {
  const img = await loadImage(file);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image"))), "image/jpeg", quality)
  );
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// --------------------------------- Public API -------------------------------

/**
 * Returns all gallery images ordered by `seq` ascending
 * (the exact sequence in which they were uploaded).
 */
export async function getGallery() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("seq", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((r) => ({
          id: r.id,
          url: r.url,
          path: r.path,
          name: r.name,
          seq: Number(r.seq),
        }));
      }
    } catch (e) {
      console.warn("Gallery fetch failed, using local gallery", e);
    }
  }

  const all = await idbAll();
  if (all.length === 0) {
    // Seed default photos so the gallery is immediately populated
    for (const item of DEFAULT_INITIAL_GALLERY) {
      await idbPut(item).catch(() => {});
    }
    return [...DEFAULT_INITIAL_GALLERY];
  }

  // Sort strictly by sequence number ascending (1, 2, 3...)
  return all.sort((a, b) => (Number(a.seq) || 0) - (Number(b.seq) || 0));
}

/**
 * Upload multiple files at once.
 * Files are processed sequentially to guarantee each file gets a sequential
 * monotonic `seq` number in the exact order selected by the user.
 */
export async function addGalleryImages(files, onProgress) {
  const supabase = getSupabaseClient();
  const existing = await getGallery();
  let maxSeq = existing.reduce((m, i) => Math.max(m, Number(i.seq) || 0), 0);
  const added = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    maxSeq += 1;
    const seq = maxSeq;
    const blob = await compressImage(file);
    const id = `img-${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 6)}`;
    let item = null;

    if (supabase) {
      try {
        const cleanName = (file.name || "photo").replace(/[^a-zA-Z0-9.-]/g, "_");
        const path = `gallery/${String(seq).padStart(6, "0")}_${cleanName}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });
        if (upErr) throw upErr;
        const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        const row = { id, url, path, name: file.name, seq };
        const { error: dbErr } = await supabase.from("gallery_images").insert(row);
        if (dbErr) throw dbErr;
        item = row;
      } catch (e) {
        console.warn("Cloud upload failed, saving locally instead:", e);
      }
    }

    if (!item) {
      item = {
        id,
        url: await blobToDataUrl(blob),
        path: null,
        name: file.name,
        seq,
      };
      await idbPut(item);
    }

    added.push(item);
    if (onProgress) onProgress(i + 1);
  }

  return added;
}

export async function deleteGalleryImage(item) {
  const supabase = getSupabaseClient();
  if (supabase && item.path) {
    try {
      await supabase.storage.from(BUCKET).remove([item.path]);
      await supabase.from("gallery_images").delete().eq("id", item.id);
    } catch (e) {
      console.warn("Cloud delete failed", e);
    }
  }
  await idbDelete(item.id).catch(() => {});
}
