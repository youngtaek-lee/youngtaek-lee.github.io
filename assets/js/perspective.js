function initPerspectiveGrid() {
  const canvas = document.getElementById('perspective-grid');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;

  let mouseX = -999, mouseY = -999;
  let time = 0;

  function resize() {
    canvas.width  = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  container.addEventListener('mousemove', (e) => {
    const r = container.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });

  container.addEventListener('mouseleave', () => {
    mouseX = -999;
    mouseY = -999;
  });

  // 라인별 고정 개성값 (랜덤처럼 보이되 안정적으로)
  const LINE_COUNT = 36;
  const lines = Array.from({ length: LINE_COUNT }, (_, l) => ({
    amp:   14 + Math.sin(l * 2.3) * 8,       // 진폭 10~22
    freq:  0.005 + Math.cos(l * 1.7) * 0.002, // 주파수 미세 차이
    speed: 0.9 + Math.sin(l * 0.9) * 0.4,     // 속도 0.5~1.3배
    phase: l * 0.5,
  }));

  function draw() {
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const mouseRadius   = 160;
    const mouseStrength = 45;

    lines.forEach((ln, l) => {
      const baseY = (H / (LINE_COUNT + 1)) * (l + 1);
      const alpha = 0.1 + (l / LINE_COUNT) * 0.18;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 1;

      for (let s = 0; s <= 150; s++) {
        const x = (s / 150) * W;
        let y = baseY + Math.sin(x * ln.freq + time * ln.speed + ln.phase) * ln.amp;

        const dx   = x - mouseX;
        const dy   = y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * mouseStrength;
          y -= (dy / dist) * force;
        }

        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.stroke();
    });

    time += 0.006;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

document.addEventListener('DOMContentLoaded', initPerspectiveGrid);
