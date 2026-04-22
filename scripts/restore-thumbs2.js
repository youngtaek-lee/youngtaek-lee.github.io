const sharp = require('sharp');
const path = require('path');

const dir = 'C:/Users/korii/projects/portfolio/assets/images/works';

const restores = [
  { src: 'optimedi_orig.jpg', out: 'optimedi.jpg' },
  // ghi: 워터마크 없는 원본 없음 — ghi_logo.png만 있음
];

async function main() {
  for (const { src, out } of restores) {
    const meta = await sharp(path.join(dir, src)).metadata();
    console.log(`${src}: ${meta.width}×${meta.height}`);

    await sharp(path.join(dir, src))
      .resize(1600, 1000, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(dir, out));
    console.log(`${out} — restored`);
  }
}

main().catch(console.error);
