// =============================
// Hero Grid Animation (Canvas 2D)
// =============================
function initGridAnimation() {
  const frame = document.querySelector('.hero__frame');
  if (!frame) return;

  // ── Canvas 생성 ───────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.className = 'hero__grid-canvas';
  frame.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const TARGET_H = 20; // 목표 수평 간격 (px)
  const TARGET_V = 30; // 목표 수직 간격 (px) — 위아래 여유

  let W, H, cols, rows, spacingX, spacingY;
  let mouseX = -999, mouseY = -999;
  let elapsed = 0, lastTime = 0, timeScale = 1;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = frame.offsetWidth;
    H = frame.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 양쪽 꽉 맞도록 cols 수 결정 후 역산
    cols    = Math.round(W / TARGET_H);
    rows    = Math.round(H / TARGET_V);
    spacingX = W / cols;
    spacingY = H / rows;
  }

  resize();
  window.addEventListener('resize', resize);

  // ── 마우스 추적 ───────────────────────────────
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    heroTitle.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    heroTitle.addEventListener('mouseleave', () => {
      mouseX = -999;
      mouseY = -999;
    });
  }

  // ── ScrollTrigger 속도 연동 ────────────────────
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '.hero-wrap',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => { timeScale = 1 - self.progress * 0.7; }
    });
  }

  // ── 렌더 루프 ─────────────────────────────────
  function draw(timestamp) {
    const delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
    lastTime = timestamp;
    elapsed += delta * timeScale;

    ctx.clearRect(0, 0, W, H);

    for (let col = 0; col < cols; col++) {
      const x     = (col + 0.5) * spacingX;
      const phase = (col / cols) * Math.PI * 4;
      const wave  = Math.sin(elapsed * 0.5 + phase) * 0.5 + 0.5;

      for (let row = 0; row < rows; row++) {
        const y         = (row + 0.5) * spacingY;
        const dist      = Math.hypot(x - mouseX, y - mouseY);
        const proximity = Math.max(0, 1 - dist / 90);

        const r       = 4 + wave * 2 + proximity * 4;
        const opacity = 0.3 + wave * 0.4 + proximity * 0.4;
        const isX     = (col + row) % 2 === 0;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(241,90,41,${opacity.toFixed(2)})`;
        ctx.lineWidth   = 1.2 + proximity * 1.0;

        if (isX) {
          const d = r * 0.707; // r / √2 — 팔 길이 + 와 동일하게 보정
          ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d);
          ctx.moveTo(x + d, y - d); ctx.lineTo(x - d, y + d);
        } else {
          ctx.moveTo(x,     y - r); ctx.lineTo(x,     y + r);
          ctx.moveTo(x - r, y    ); ctx.lineTo(x + r, y    );
        }

        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}
