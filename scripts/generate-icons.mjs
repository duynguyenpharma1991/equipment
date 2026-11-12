// Renders the placeholder app icon (capsule on a green→navy tile) to the PNG sizes
// needed by the favicon, Apple touch icon and PWA manifest.
// Replace the SVG below with your real logo and re-run:  node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** `padding` shrinks the glyph so maskable icons keep it inside the safe zone. */
function svg(size, { padding = 0, rounded = true } = {}) {
  const radius = rounded ? size * 0.22 : 0;
  const g = size * (1 - padding * 2);
  const o = size * padding;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#007338"/>
      <stop offset="1" stop-color="#04326e"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <g transform="translate(${o} ${o}) scale(${g / 24})" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-35 12 12)"/>
    <path d="M9.2 7.6l5.6 8.8"/>
  </g>
</svg>`;
}

async function write(file, size, opts) {
  const out = path.join(root, file);
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg(size, opts))).png().toFile(out);
  console.log("wrote", file);
}

await write("src/app/icon.png", 512, { padding: 0.18 });
await write("src/app/apple-icon.png", 180, { padding: 0.18, rounded: false });
await write("public/icons/icon-192.png", 192, { padding: 0.18 });
await write("public/icons/icon-512.png", 512, { padding: 0.18 });
await write("public/icons/icon-maskable-512.png", 512, { padding: 0.28, rounded: false });
