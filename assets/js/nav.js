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
  const btns = document.querySelectorAll('.theme-switch');
  if (!btns.length) return;

  btns.forEach((btn) => btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'basic' ? 'summer' : 'basic';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    refreshScrollColorReveals();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = next === 'basic' ? '#1C1A17' : '#0056B3';
    debugTheme();
  }));
}

// 콘솔에서 window.debugWorksAnim() 호출 — /works 진입 직후에 바로 실행
// works__item의 x/opacity가 시간에 따라 실제로 움직이는지, 충돌하는 트윈이 있는지 확인
function debugWorksAnim() {
  const items = document.querySelectorAll('#subpage-view .works__item');
  if (!items.length) {
    console.warn('[debugWorksAnim] .works__item을 찾을 수 없습니다 — /works 페이지에서 호출하세요.');
    return;
  }
  const target = items[0];
  let tick = 0;
  const rows = [];
  const iv = setInterval(() => {
    const tweens = gsap.getTweensOf(target);
    rows.push({
      t_ms: tick * 100,
      x: gsap.getProperty(target, 'x'),
      opacity: gsap.getProperty(target, 'opacity'),
      transform: getComputedStyle(target).transform,
      activeTweens: tweens.length,
      tweenTargetsMatch: tweens.map(tw => tw.targets().includes(target)).join(','),
    });
    tick++;
    if (tick > 20) {
      clearInterval(iv);
      console.table(rows);
    }
  }, 100);
}
window.debugWorksAnim = debugWorksAnim;

// 콘솔에서 window.debugTheme() 로도 수동 호출 가능
// 테마 변수와 실제 엘리먼트에 찍힌 색을 비교해서 어긋난 부분을 찾는 용도
function debugTheme() {
  const theme = document.documentElement.getAttribute('data-theme');
  const rootStyle = getComputedStyle(document.documentElement);
  const vars = ['--color-bg', '--color-text', '--color-accent', '--color-line', '--color-sparkle'];

  const varRows = vars.map((name) => ({ variable: name, value: rootStyle.getPropertyValue(name).trim() }));

  const targets = [
    { label: '#works .works__item border', selector: '#works .works__item', prop: 'borderBottomColor' },
    { label: 'header__sparkle color', selector: '.header__sparkle', prop: 'color' },
    { label: 'header__sparkle-fixed color', selector: '.header__sparkle-fixed', prop: 'color' },
    { label: 'footer__sparkle color', selector: '.footer__sparkle', prop: 'color' },
    { label: 'works__item__title__en color', selector: '.works__item__title__en', prop: 'color' },
  ];

  const elementRows = targets.map(({ label, selector, prop }) => {
    const el = document.querySelector(selector);
    if (!el) return { label, selector, value: '(엘리먼트 없음)' };
    return { label, selector, value: getComputedStyle(el)[prop] };
  });

  console.group(`%c[theme: ${theme}]`, 'color:#0af;font-weight:bold;');
  console.table(varRows);
  console.table(elementRows);
  console.groupEnd();
}

window.debugTheme = debugTheme;

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
