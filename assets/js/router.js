// =============================
// SPA Router
// =============================
const Router = {
  homeView: null,
  subpageView: null,
  _gsapCtx: null,
  _isFirst: true,

  init() {
    this.homeView    = document.getElementById('home-view');
    this.subpageView = document.getElementById('subpage-view');

    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        e.preventDefault();
        this.navigate(href);
      }
    });

    window.addEventListener('popstate', () => this.render(location.pathname));

    this.render(location.pathname, true);
  },

  navigate(path) {
    history.pushState({}, '', path);
    this.render(path);
  },

  render(path, isInit = false) {
    const isHome = path === '/' || path === '/index.html';
    const page   = this._getPage(path);

    if (this._gsapCtx) {
      this._gsapCtx.revert();
      this._gsapCtx = null;
    }

    if (isHome) {
      this._showHome();
    } else if (page) {
      this._showSubpage(page, path);
    } else {
      this._showHome();
    }

    document.getElementById('menuOverlay')?.classList.remove('is-open');
    document.body.classList.toggle('is-subpage', !isHome);
    window.scrollTo(0, 0);
  },

  _showHome() {
    this.homeView.style.display    = '';
    this.subpageView.style.display = 'none';
    this.subpageView.innerHTML     = '';
    this.subpageView.setAttribute('aria-hidden', 'true');
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  },

  _showSubpage(page, path) {
    this.homeView.style.display    = 'none';
    this.subpageView.style.display = '';
    this.subpageView.removeAttribute('aria-hidden');
    this.subpageView.innerHTML = page.render(path);
    this._gsapCtx = gsap.context(() => page.init(path), this.subpageView);
  },

  _getPage(path) {
    if (path === '/about' || path.startsWith('/about'))  return PageAbout;
    if (path === '/works' || path === '/works/')         return PageWorksList;
    if (path.startsWith('/works/'))                      return PageWorksDetail;
    if (path === '/contact')                             return PageContact;
    return null;
  },
};
