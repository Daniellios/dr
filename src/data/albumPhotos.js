/** JPEG / PNG / WebP in project `assets/` (same folder as book cover). Cover file is excluded. */

const COVER_FILENAME = "book-cover.jpg";

const modules = import.meta.glob("../../assets/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", {
  eager: true,
  import: "default"
});

export function getAlbumPhotoUrls() {
  return Object.entries(modules)
    .filter(([path]) => {
      const normalized = path.replace(/\\/g, "/");
      if (normalized.endsWith(COVER_FILENAME)) return false;
      const filename = normalized.split("/").pop() || "";
      // Only use assets explicitly named like `photo-1.jpg`, `photo-02.png`, etc.
      return /^photo-\d+\.(jpg|jpeg|png|webp)$/i.test(filename);
    })
    .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map(([, url]) => url);
}
