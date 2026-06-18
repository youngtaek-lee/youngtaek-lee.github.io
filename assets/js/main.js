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
  initScrollColorReveals();

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
