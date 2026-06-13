// =============================
// Init
// =============================

function setRealVH() {
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--real-vh', `${vh}px`);
}
setRealVH();
window.addEventListener('resize', setRealVH);
window.addEventListener('orientationchange', () => setTimeout(setRealVH, 200));

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });

  // GitHub Pages SPA redirect 처리
  const redirect = sessionStorage.getItem('spa-redirect');
  if (redirect) {
    sessionStorage.removeItem('spa-redirect');
    history.replaceState({}, '', redirect);
  }

  initTheme();
  initPageTransition();
  Router.init();

  // renderWorks(); // 정적 HTML로 대체 중
  initWorksThumb();
  initWorksSparkle();
  initCursor();
  initAboutScroll();
  // initWorksEntrance(); // 정적 HTML로 대체 중
  initDarkTransition();

  gsap.timeline({
    scrollTrigger: {
      trigger: '.hero-wrap',
      start: 'bottom bottom',
      end: 'bottom top',
      scrub: 1,
    }
  }).fromTo('main',
    { backgroundColor: '#1C1A17' },
    { backgroundColor: '#EDD9C0', ease: 'none' }
  ).fromTo('.hero__tagline',
    { color: '#EDD9C0' },
    { color: '#1C1A17', ease: 'none' },
    0
  );

  gsap.timeline({
    scrollTrigger: {
      trigger: '.about-text',
      start: 'top bottom',
      end: 'top center',
      scrub: 1,
    }
  }).fromTo('.about-text__label, .about__word',
    { color: '#EDD9C0' },
    { color: '#1C1A17', ease: 'none' }
  );

  gsap.timeline({
    scrollTrigger: {
      trigger: '.works',
      start: 'top bottom',
      end: 'top center',
      scrub: 1,
    }
  }).fromTo('.works__label, .works__sub, .works__item__num, .works__item__title__en, .works__item__title__ko, .works__item__meta',
    { color: '#EDD9C0' },
    { color: '#1C1A17', ease: 'none' }
  );

  initWorksReveal();
  initAboutTextScroll();

  const lenis = initLenis();
  window.__lenis = lenis;
  initHeader(lenis);
  initMobileMenu();

  initHobbyPopcorn();
  initIntro();
  initHeroTaglineScroll();
  initFooterBig();
  initFooterScale();

});
