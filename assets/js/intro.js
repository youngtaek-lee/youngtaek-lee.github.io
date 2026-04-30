// =============================
// Intro Screen
// =============================
function initIntro() {
  const screen = document.getElementById('introScreen');
  const logo   = document.getElementById('introLogo');
  const loader = document.getElementById('introLoader');
  const oChar  = document.getElementById('introO');
  const lines  = logo ? logo.querySelectorAll('.intro-logo__line > span') : [];

  if (!screen || !logo) return;

  let loadDone     = false;
  let minDelayDone = false;

  function tryTransition() {
    if (!loadDone || !minDelayDone) return;

    gsap.to(loader, { opacity: 0, duration: 0.3, ease: 'power1.out' });

    gsap.delayedCall(0.4, () => {
      const oRect = oChar ? oChar.getBoundingClientRect() : null;
      const maxR  = Math.hypot(window.innerWidth, window.innerHeight);
      const W = window.innerWidth, H = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      const vbW = 14, vbH = 16;
      const cCX = 6.864, cCY = 7.612;
      const cHH = 4.994;

      const mc = document.createElement('canvas').getContext('2d');
      mc.font = getComputedStyle(oChar || document.body).font;
      const m = mc.measureText('o');
      const glyphH    = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const glyphTopY = oRect ? oRect.top + (oRect.height - glyphH) / 2 : H / 2;

      const HOLE_EXPAND = 1.40;
      const baseScaleX = oRect ? oRect.width / vbW : 1;
      const baseScaleY = glyphH / vbH * HOLE_EXPAND;
      const screenOx   = oRect ? oRect.left + oRect.width * (cCX / vbW) : W / 2;
      const screenOy   = glyphTopY + glyphH * (cCY / vbH);
      const sFinal     = Math.ceil(maxR / (baseScaleY * cHH)) + 5;

      const cvs = document.createElement('canvas');
      cvs.width  = W * dpr;
      cvs.height = H * dpr;
      cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      screen.insertBefore(cvs, screen.firstChild);

      const ctx    = cvs.getContext('2d');
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#0f0f0f';
      const counterPath = new Path2D('M6.908 12.606C7.68533 12.606 8.338 12.4153 8.866 12.034C9.394 11.6527 9.79733 11.1027 10.076 10.384C10.3547 9.66533 10.494 8.78533 10.494 7.744C10.494 6.65867 10.3473 5.73467 10.054 4.972C9.77533 4.20933 9.36467 3.63 8.822 3.234C8.27933 2.82333 7.61933 2.618 6.842 2.618C6.07933 2.618 5.42667 2.816 4.884 3.212C4.356 3.59333 3.94533 4.15067 3.652 4.884C3.37333 5.61733 3.234 6.52667 3.234 7.612C3.234 8.404 3.31467 9.11533 3.476 9.746C3.652 10.362 3.894 10.8827 4.202 11.308C4.51 11.7333 4.89133 12.056 5.346 12.276C5.80067 12.496 6.32133 12.606 6.908 12.606Z');

      function drawFrame(s) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.save();
        ctx.translate(screenOx, screenOy);
        ctx.scale(s * baseScaleX, s * baseScaleY);
        ctx.translate(-cCX, -cCY);
        ctx.fill(counterPath);
        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
      }
      drawFrame(1);

      screen.style.background = 'transparent';

      const logoRect = logo.getBoundingClientRect();
      const originX  = ((screenOx - logoRect.left) / logoRect.width)  * 100;
      const originY  = ((screenOy - logoRect.top)  / logoRect.height) * 100;
      gsap.set(logo, { transformOrigin: `${originX}% ${originY}%` });

      gsap.to(logo, {
        scale: sFinal,
        duration: 1.4,
        ease: 'power3.in',
        onUpdate() { drawFrame(gsap.getProperty(logo, 'scale')); },
        onComplete: () => screen.remove(),
      });
    });
  }

  setTimeout(() => { minDelayDone = true; tryTransition(); }, 1500);

  if (document.readyState === 'complete') {
    loadDone = true;
  } else {
    window.addEventListener('load', () => { loadDone = true; tryTransition(); }, { once: true });
  }

  gsap.to(lines, { y: 0, duration: 0.85, ease: 'expo.out', stagger: 0.15, delay: 0.15 });
  gsap.to(loader, { opacity: 1, duration: 0.4, delay: 0.85, ease: 'power1.in' });
}
