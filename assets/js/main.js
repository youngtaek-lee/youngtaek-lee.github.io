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
  initCursor();
  initMenu();
  initAboutScroll();
  // initWorksEntrance(); // 정적 HTML로 대체 중
  initDarkTransition();
  initWorksReveal();
  initAboutTextScroll();

  const lenis = initLenis();
  initHeader(lenis);

  initHobbyPopcorn();
  initHeroEntrance();
  initHeroTaglineScroll(lenis);
});
