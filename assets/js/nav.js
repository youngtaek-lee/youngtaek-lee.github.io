// =============================
// Custom Cursor
// =============================
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  const hoverEls = 'a, button, [role="button"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverEls)) cursor.classList.add('is-hovering');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverEls)) cursor.classList.remove('is-hovering');
  });
}

// =============================
// Header + Bottom Nav
// =============================
function initHeader(lenis) {
  const header       = document.querySelector('.header');
  const bottomNav    = document.getElementById('bottomNav');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (!header || !bottomNav || !scrollTopBtn) return;

  const NAV_THRESHOLD    = 60;
  const BOTTOM_THRESHOLD = 120;

  lenis.on('scroll', ({ scroll, limit }) => {
    const navShouldShow = scroll > NAV_THRESHOLD && scroll < limit - BOTTOM_THRESHOLD;
    navShouldShow
      ? bottomNav.classList.add('is-visible')
      : bottomNav.classList.remove('is-visible');
  });

  scrollTopBtn.addEventListener('click', () => {
    lenis.scrollTo(0);
  });
}

// =============================
// Lenis 스무스 스크롤
// =============================
function initLenis() {
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    touchInertiaExponent: 1.7,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    overscroll: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
