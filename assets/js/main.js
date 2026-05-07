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

  renderWorks();
  initCursor();
  initMenu();
  initAboutScroll();
  initWorksEntrance();

  const lenis = initLenis();
  initHeader(lenis);

  initHeroEntrance();
  initHeroTaglineScroll();
});
