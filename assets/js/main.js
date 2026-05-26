// =============================
// Init
// =============================

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // GitHub Pages SPA redirect 처리
  const redirect = sessionStorage.getItem('spa-redirect');
  if (redirect) {
    sessionStorage.removeItem('spa-redirect');
    history.replaceState({}, '', redirect);
  }

  Router.init();

  // renderWorks(); // 정적 HTML로 대체 중
  initWorksThumb();
  initWorksSparkle();
  initCursor();
  initAboutScroll();
  // initWorksEntrance(); // 정적 HTML로 대체 중
  initDarkTransition();
  initWorksReveal();
  initAboutTextScroll();

  const lenis = initLenis();
  window.__lenis = lenis;
  initHeader(lenis);
  initMobileMenu();

  initHobbyPopcorn();
  initIntro();
  initHeroTaglineScroll(lenis);
  initFooterBig();
  initFooterScale();
  initHeroFrame();
  // initGridAnimation(); // 인트로로 이동
});
