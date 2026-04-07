/** JPEG / PNG / WebP in project `assets/` (same folder as book cover). Cover file is excluded. */

const COVER_FILENAME = "4065863.jpg";

const modules = import.meta.glob("../../assets/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", {
  eager: true,
  import: "default"
});

export function getAlbumPhotoUrls() {
  return Object.entries(modules)
    .filter(([path]) => !path.replace(/\\/g, "/").endsWith(COVER_FILENAME))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map(([, url]) => url);
}
