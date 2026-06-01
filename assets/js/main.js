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

  initPageTransition();
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

  // 직접 서브페이지로 진입 시 initDarkTransition의 FROM state가 덮어쓰므로 재적용
  if (document.body.classList.contains('is-subpage')) {
    gsap.set(['.header__logo', '.header__nav', '.header__menu-btn', '.menu-btn'], { color: '#161415' });
    gsap.set('.header__nav-btn', { color: '#161415', borderColor: 'rgba(22,20,21,0.2)' });
  }
});
