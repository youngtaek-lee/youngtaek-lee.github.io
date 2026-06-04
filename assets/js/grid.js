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

  const TARGET_H = 28;
  const TARGET_V = 28;
  const PAD_Y    = 10;

  const RIPPLE_MAX_R = 300;
  const RIPPLE_W     = 28;
  const RIPPLE_SPEED = 0.6;
  const RIPPLE_LIMIT = 4;

  const SHAPES = ['star4'];

  let W, H, cols, rows, spacingX, spacingY;
  let canvasRect = { left: 0, top: 0 };
  let active = true;
  let cells  = [];
  const ripples = [];
  let lastTime = 0;
  let time = 0;
  let mouseX = -9999, mouseY = -9999;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    W = frame.offsetWidth;
    H = frame.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (cols > 0) spacingX = W / cols;
    if (rows > 0) spacingY = (H - PAD_Y * 2) / rows;
    canvasRect = canvas.getBoundingClientRect();
  }

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
        const type = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        cells.push({
          type,
          rot:    0,
          scale:  1.0,
          inner:  0.22 + Math.random() * 0.08,  // 0.22 ~ 0.30
          baseOp: 0.10 + Math.random() * 0.14,
          jitter: (Math.random() - 0.5) * 0.5,
        });
      }
    }
  }

  function noise3D(x, y, z) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const fx = x-ix, fy = y-iy, fz = z-iz;
    const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy), uz = fz*fz*(3-2*fz);
    function h(a,b,c) {
      const n = Math.sin(a*127.1 + b*311.7 + c*74.7) * 43758.5453;
      return (n - Math.floor(n)) * 2 - 1;
    }
    return (
      h(ix,  iy,  iz)*(1-ux)*(1-uy)*(1-uz) + h(ix+1,iy,  iz)*ux*(1-uy)*(1-uz) +
      h(ix,  iy+1,iz)*(1-ux)*uy*(1-uz)     + h(ix+1,iy+1,iz)*ux*uy*(1-uz) +
      h(ix,  iy,  iz+1)*(1-ux)*(1-uy)*uz   + h(ix+1,iy,  iz+1)*ux*(1-uy)*uz +
      h(ix,  iy+1,iz+1)*(1-ux)*uy*uz       + h(ix+1,iy+1,iz+1)*ux*uy*uz
    );
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', () => { canvasRect = canvas.getBoundingClientRect(); });


  frame.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  frame.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  frame.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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

  function drawCell(cx, cy, r, cell) {
    if (cell.type === 'none') return;
    const inn = r * cell.inner;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a   = (i * Math.PI / 4) - Math.PI / 2 + cell.rot;
      const rad = i % 2 === 0 ? r : inn;
      const px  = cx + Math.cos(a) * rad;
      const py  = cy + Math.sin(a) * rad;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function draw(timestamp) {
    if (!active) return;
    const delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
    lastTime = timestamp;

    time += delta;
    for (const rp of ripples) rp.age += delta * RIPPLE_SPEED;
    while (ripples.length && ripples[0].age >= 1) ripples.shift();

    ctx.clearRect(0, 0, W, H);

    for (let col = 0; col < cols; col++) {
      const x = (col + 0.5) * spacingX;
      for (let row = 0; row < rows; row++) {
        const cell = cells[col * rows + row];
        const cy   = PAD_Y + (row + 0.5) * spacingY;
        const cx   = x;

        let proximity = 0;
        for (const rp of ripples) {
          const rd    = Math.hypot(cx - rp.x, cy - rp.y);
          const rR    = rp.age * RIPPLE_MAX_R;
          const rDiff = rd - rR;
          const fade  = 1 - rp.age;
          const rProx = Math.exp(-(rDiff * rDiff) / (2 * RIPPLE_W * RIPPLE_W)) * fade;
          proximity = Math.max(proximity, rProx);
        }

        const mouseDist      = mouseX > -9000 ? Math.hypot(cx - mouseX, cy - mouseY) : 9999;
        const mouseInfluence = Math.max(0, 1 - mouseDist / 120);
        const wave    = Math.pow(noise3D(col * 0.18, row * 0.18, time * 0.28) * 0.5 + 0.5, 2);
        const baseR   = 4 + wave * wave * 9;
        const r       = baseR * (1 - mouseInfluence * 0.85) + proximity * 7;
        const opacity = 0.08 + wave * 0.58 * (1 - mouseInfluence * 0.5) + proximity * 0.65;

        ctx.fillStyle = `rgba(241,90,41,${opacity.toFixed(2)})`;

        drawCell(cx, cy, r, cell);
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  return function destroy() {
    active = false;
  };
}
