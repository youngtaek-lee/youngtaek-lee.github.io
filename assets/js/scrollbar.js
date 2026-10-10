// =============================
// Custom Scrollbar (theme-switch 스타일)
// =============================
(() => {
  const bar = document.createElement('div');
  bar.className = 'scrollbar';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span class="scrollbar__thumb"></span>';
  document.body.appendChild(bar);
  const thumb = bar.firstElementChild;

  const doc = document.documentElement;
  const PAD = 2;
  const MIN_THUMB = 28;
  const MAIN_GAP = 24;

  function metrics() {
    const max = doc.scrollHeight - window.innerHeight;
    const trackH = bar.clientHeight - PAD * 2;
    const thumbH = Math.max(MIN_THUMB, trackH * (window.innerHeight / doc.scrollHeight));
    return { max, trackH, thumbH, travel: trackH - thumbH };
  }

  // 푸터가 드러나면 트랙 하단이 <main> 하단 위에서 멈추도록 (CSS: bottom: max(기본값, --sb-main-gap))
  function syncToMain() {
    const main = document.querySelector('main');
    const gap = main ? window.innerHeight - main.getBoundingClientRect().bottom + MAIN_GAP : 0;
    bar.style.setProperty('--sb-main-gap', `${Math.max(0, gap)}px`);
  }

  function update() {
    syncToMain();
    const { max, thumbH, travel } = metrics();
    bar.classList.toggle('is-hidden', max <= 1);
    if (max <= 1) return;
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    thumb.style.height = `${thumbH}px`;
    thumb.style.transform = `translateY(${p * travel}px)`;
  }

  function scrollToY(y) {
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }

  let dragging = false;
  let startY = 0;
  let startScroll = 0;

  thumb.addEventListener('pointerdown', (e) => {
    dragging = true;
    startY = e.clientY;
    startScroll = window.scrollY;
    thumb.setPointerCapture(e.pointerId);
    bar.classList.add('is-dragging');
    e.preventDefault();
  });
  thumb.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const { max, travel } = metrics();
    if (travel > 0) scrollToY(startScroll + ((e.clientY - startY) / travel) * max);
  });
  const end = () => { dragging = false; bar.classList.remove('is-dragging'); };
  thumb.addEventListener('pointerup', end);
  thumb.addEventListener('pointercancel', end);

  // 트랙 클릭 → 해당 위치로 이동
  bar.addEventListener('pointerdown', (e) => {
    if (e.target === thumb) return;
    const r = bar.getBoundingClientRect();
    const { max, travel, thumbH } = metrics();
    const p = (e.clientY - r.top - PAD - thumbH / 2) / travel;
    scrollToY(Math.min(1, Math.max(0, p)) * max);
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  new ResizeObserver(update).observe(document.body);
  update();

  // 헤더와 동일한 등장 모션 (intro 이후 revealHeader에서 호출)
  window.revealScrollbar = () => {
    gsap.fromTo(bar,
      { x: 24, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: 'power2.out', clearProps: 'opacity,transform',
        onStart: () => bar.classList.add('is-ready') }
    );
  };
  if (typeof __headerRevealed !== 'undefined' && __headerRevealed) window.revealScrollbar();
})();
