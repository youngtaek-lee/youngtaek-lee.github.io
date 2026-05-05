// =============================// Init
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

  initIntro();
  renderWorks();
  renderSkills();
  initMenu();
  initHeroEntrance();
  initWorksHeading();
  initAnimations();
  initAboutScroll();
  initHeroBlob();
  const lenis = initLenis();
  initWorksPanelFollow(lenis);
  initHeader(lenis);
});
