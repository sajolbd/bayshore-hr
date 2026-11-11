/**
 * Compresses and center-crops an uploaded image File into a 256x256 JPEG data URL
 * suitable for lightweight profile avatar storage in MongoDB.
 */
export async function compressAvatarFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a PNG, JPG, or WebP image file.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Selected image is too large (max 10 MB before compression).");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image file."));
      el.src = objectUrl;
    });

    const targetSize = 256;
    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas image processing unavailable in this browser.");
    }

    const minSide = Math.min(img.width, img.height);
    const sx = Math.max(0, Math.floor((img.width - minSide) / 2));
    const sy = Math.max(0, Math.floor((img.height - minSide) / 2));

    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);
    return canvas.toDataURL("image/jpeg", 0.84);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

