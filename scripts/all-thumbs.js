const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const worksDir = 'C:/Users/korii/projects/portfolio/assets/images/works';
const clientsDir = 'C:/Users/korii/projects/portfolio/assets/images/clients';

const works = [
  { name: 'sase',     logo: 'sase.png',         white: false, logoRatio: 0.32, vignette: true  },
  { name: 'bexel',    logo: 'bexel.png',         white: true,  logoRatio: 0.38, vignette: true  },
  { name: 'marusys',  logo: 'marusys-white.svg', white: false, logoRatio: 0.38, vignette: true  },
  { name: 'raymats',  logo: 'raymats.png',        white: false, logoRatio: 0.28, vignette: true  },
  { name: 'optimedi', logo: null,                              logoRatio: 0,    vignette: false },
  { name: 'ghi',      logo: 'ghi.png',            white: true,  logoRatio: 0.38, vignette: true  },
];

async function getLogo(logoPath, targetWidth, makeWhite) {
  const ext = path.extname(logoPath).toLowerCase();

  if (ext === '.svg') {
    const svgBuf = fs.readFileSync(logoPath);
    return sharp(svgBuf).resize({ width: targetWidth }).png().toBuffer();
  }

  if (!makeWhite) {
    return sharp(logoPath).resize({ width: targetWidth }).ensureAlpha().png().toBuffer();
  }

  const { data, info } = await sharp(logoPath)
    .resize({ width: targetWidth })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i + 1] = data[i + 2] = 255;
  }

  return sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();
}

function makeVignetteSVG(w, h) {
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gl" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="black" stop-opacity="0.65"/>
      <stop offset="40%"  stop-color="black" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gr" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%"   stop-color="black" stop-opacity="0.65"/>
      <stop offset="40%"  stop-color="black" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0"           width="${Math.round(w * 0.45)}" height="${h}" fill="url(#gl)"/>
  <rect x="${Math.round(w * 0.55)}" width="${Math.round(w * 0.45)}" height="${h}" fill="url(#gr)"/>
</svg>`);
}

async function main() {
  for (const { name, logo, white, logoRatio, vignette } of works) {
    const thumbPath = path.join(worksDir, `${name}.jpg`);
    const bgMeta = await sharp(thumbPath).metadata();
    const { width: W, height: H } = bgMeta;

    const composites = [];

    if (logo) {
      const logoPath = path.join(clientsDir, logo);
      const targetW = Math.round(W * logoRatio);
      const logoBuf = await getLogo(logoPath, targetW, white);
      const logoMeta = await sharp(logoBuf).metadata();
      composites.push({
        input: logoBuf,
        left: Math.round((W - logoMeta.width)  / 2),
        top:  Math.round((H - logoMeta.height) / 2),
      });
    }

    if (vignette) {
      composites.push({ input: makeVignetteSVG(W, H), left: 0, top: 0 });
    }

    await sharp(thumbPath)
      .modulate({ brightness: 0.6 })
      .composite(composites)
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(thumbPath + '.tmp');

    fs.renameSync(thumbPath + '.tmp', thumbPath);
    console.log(`${name} — done`);
  }
}

main().catch(console.error);
