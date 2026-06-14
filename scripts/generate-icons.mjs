// Run once after cloning: node scripts/generate-icons.mjs
// Requires: npm install -g sharp-cli  OR  use the browser method below
//
// Browser method (easiest):
//   1. Open public/icons/oarfish.svg in Chrome
//   2. Right-click → Save image as... → save as pwa-192x192.png (resize in Paint/Preview)
//   3. Repeat for pwa-512x512.png
//
// Or use: https://realfavicongenerator.net  (upload the SVG)

import { createCanvas, loadImage } from 'canvas'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const svgPath = resolve(__dir, '../public/icons/oarfish.svg')

for (const size of [192, 512]) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const img = await loadImage(svgPath)
  ctx.drawImage(img, 0, 0, size, size)
  const buffer = canvas.toBuffer('image/png')
  const outPath = resolve(__dir, `../public/icons/pwa-${size}x${size}.png`)
  writeFileSync(outPath, buffer)
  console.log(`✓ Generated ${outPath}`)
}
