// =============================
// Init
// =============================
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

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
