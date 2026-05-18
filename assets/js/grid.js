// =============================
// Hero Grid Animation (Canvas 2D)
// =============================
function initGridAnimation(container) {
  const frame = container || document.querySelector('.hero');
  if (!frame) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__grid-canvas';
  frame.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const TARGET_H = 22;
  const TARGET_V = 30;
  const PAD_Y    = 14;

  // 클릭 파동
  const RIPPLE_MAX_R  = 300; // 최대 확장 반지름
  const RIPPLE_W      = 28;  // 고리 두께
  const RIPPLE_SPEED  = 0.6; // age/초
  const RIPPLE_LIMIT  = 4;

  let W, H, cols, rows, spacingX, spacingY;
  let canvasRect = { left: 0, top: 0 };
  let active = true;
  const JITTER = 0; // 위치 흔들림 (0=완벽한격자)
  let cells = [];
  const ripples = []; // { x, y, age }
  let lastTime = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = frame.offsetWidth;
    H = frame.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols     = Math.round(W / TARGET_H);
    rows     = Math.round((H - PAD_Y * 2) / TARGET_V);
    spacingX = W / cols;
    spacingY = (H - PAD_Y * 2) / rows;
    canvasRect = canvas.getBoundingClientRect();

    cells = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        cells.push({
          ox:   (Math.random() - 0.5) * spacingX * JITTER,
          oy:   (Math.random() - 0.5) * spacingY * JITTER,
          gain: 0.7 + Math.random() * 0.6,
        });
      }
    }
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', () => { canvasRect = canvas.getBoundingClientRect(); });

  // 클릭 시 파동 스폰
  frame.addEventListener('click', (e) => {
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    ripples.push({ x, y, age: 0 });
    if (ripples.length > RIPPLE_LIMIT) ripples.shift();
  });

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '.hero-wrap',
      start: 'top top',
      end: 'bottom top',
      onUpdate: () => { canvasRect = canvas.getBoundingClientRect(); }
    });
  }

  function drawSparkle(cx, cy, r) {
    const inner = r * 0.13;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a   = (i * Math.PI / 4) - Math.PI / 2;
      const rad = i % 2 === 0 ? r : inner;
      const px  = cx + Math.cos(a) * rad;
      const py  = cy + Math.sin(a) * rad;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function draw(timestamp) {
    if (!active) return;
    const delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
    lastTime = timestamp;

    // 잔파 age 진행 + 만료 제거
    for (const rp of ripples) rp.age += delta * RIPPLE_SPEED;
    while (ripples.length && ripples[0].age >= 1) ripples.shift();

    ctx.clearRect(0, 0, W, H);

    for (let col = 0; col < cols; col++) {
      const x = (col + 0.5) * spacingX;
      for (let row = 0; row < rows; row++) {
        const cell = cells[col * rows + row];
        const cx   = x + cell.ox;
        const y    = PAD_Y + (row + 0.5) * spacingY + cell.oy;

        // 클릭 파동 — 도넛 고리
        let proximity = 0;
        for (const rp of ripples) {
          const rd    = Math.hypot(cx - rp.x, y - rp.y);
          const rR    = rp.age * RIPPLE_MAX_R;
          const rDiff = rd - rR;
          const fade  = 1 - rp.age;
          const rProx = Math.exp(-(rDiff * rDiff) / (2 * RIPPLE_W * RIPPLE_W)) * fade;
          proximity = Math.max(proximity, rProx);
        }

        const r       = 4 + proximity * 20;
        const opacity = 0.18 + proximity * 0.65;

        ctx.shadowBlur  = proximity > 0.1 ? proximity * 16 : 0;
        ctx.shadowColor = `rgba(237,217,192,${opacity})`;
        ctx.fillStyle   = `rgba(237,217,192,${opacity.toFixed(2)})`;

        drawSparkle(cx, y, r);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  return function destroy() {
    active = false;
  };
}
