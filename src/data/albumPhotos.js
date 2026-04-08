/** JPEG / PNG / WebP in project `assets/` (same folder as book cover). Cover file is excluded. */

const COVER_FILENAME = "book-cover.jpg";

const modules = import.meta.glob("../../assets/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", {
  eager: true,
  import: "default"
});

function getAlbumPhotoEntries() {
  return Object.entries(modules)
    .filter(([path]) => {
      const normalized = path.replace(/\\/g, "/");
      if (normalized.endsWith(COVER_FILENAME)) return false;
      const filename = normalized.split("/").pop() || "";
      // Only use assets explicitly named like `photo-1.jpg`, `photo-02.png`, etc.
      return /^photo-\d+\.(jpg|jpeg|png|webp)$/i.test(filename);
    })
    .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function getAlbumPhotoUrls() {
  return getAlbumPhotoEntries().map(([, url]) => url);
}

export function getAlbumPhotoUrlByStem(stem) {
  const exactName = new RegExp(`^${stem}\\.(jpg|jpeg|png|webp)$`, "i");
  const match = getAlbumPhotoEntries().find(([path]) => {
    const normalized = path.replace(/\\/g, "/");
    const filename = normalized.split("/").pop() || "";
    return exactName.test(filename);
  });
  return match ? match[1] : null;
}
