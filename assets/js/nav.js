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
// Mobile Menu
// =============================
function initMobileMenu() {
  const btn      = document.getElementById('menuBtn');
  const overlay  = document.getElementById('menuOverlay');
  const backdrop = document.getElementById('menuBackdrop');
  const closeBtn = document.getElementById('menuClose');
  if (!btn || !overlay) return;

  const links = Array.from(overlay.querySelectorAll('.menu-overlay__link'));

  function openMenu() {
    overlay.classList.add('is-open');
    window.__lenis?.stop();
    gsap.fromTo(links,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.08, delay: 0.25 }
    );
  }

  function closeMenu() {
    overlay.classList.remove('is-open');
    window.__lenis?.start();
    gsap.set(links, { opacity: 0, y: 0 });
  }

  btn.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  backdrop?.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
  });
}

// =============================
// Theme Toggle
// =============================
function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'basic' ? 'summer' : 'basic';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    refreshDarkTransition();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = next === 'basic' ? '#1C1A17' : '#0056B3';
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
    autoResize: false,
  });

  window.addEventListener('orientationchange', () => setTimeout(() => lenis.resize(), 200));

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
