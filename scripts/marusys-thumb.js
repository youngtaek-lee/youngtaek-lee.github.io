const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const worksDir = 'C:/Users/korii/projects/portfolio/assets/images/works';
const clientsDir = 'C:/Users/korii/projects/portfolio/assets/images/clients';

async function main() {
  // SVG 로고 → PNG 변환 (로고 너비 600px 기준)
  const svgRaw = fs.readFileSync(path.join(clientsDir, 'marusys-white.svg'));
  const logoPng = await sharp(svgRaw)
    .resize({ width: 600 })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logoPng).metadata();
  const logoW = logoMeta.width;
  const logoH = logoMeta.height;

  // 배경 이미지 (1600×1000)
  const bgMeta = await sharp(path.join(worksDir, 'marusys.jpg')).metadata();
  const bgW = bgMeta.width;
  const bgH = bgMeta.height;

  const left = Math.round((bgW - logoW) / 2);
  const top = Math.round((bgH - logoH) / 2);

  await sharp(path.join(worksDir, 'marusys.jpg'))
    .modulate({ brightness: 0.6 })
    .composite([{ input: logoPng, left, top }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(worksDir, 'marusys.jpg.tmp'));

  fs.renameSync(
    path.join(worksDir, 'marusys.jpg.tmp'),
    path.join(worksDir, 'marusys.jpg')
  );

  console.log(`Done — logo ${logoW}×${logoH} centered on ${bgW}×${bgH}`);
}

main().catch(console.error);
