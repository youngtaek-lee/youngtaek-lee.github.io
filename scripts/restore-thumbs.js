const sharp = require('sharp');
const path = require('path');

const dir = 'C:/Users/korii/projects/portfolio/assets/images/works';

const restores = [
  { src: 'sase_upscayl_4x_upscayl-standard-4x.png',           out: 'sase.jpg' },
  { src: 'HISTORY_1636512220_upscayl_4x_upscayl-standard-4x.png', out: 'bexel.jpg' },
  { src: 'marusys_upscayl_4x_upscayl-standard-4x.png',         out: 'marusys.jpg' },
  { src: 'raymats_upscayl_4x_upscayl-standard-4x.png',         out: 'raymats.jpg' },
];

async function main() {
  for (const { src, out } of restores) {
    await sharp(path.join(dir, src))
      .resize(1600, 1000, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(dir, out));
    console.log(`${out} — restored`);
  }
}

main().catch(console.error);
