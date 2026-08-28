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
    this._defaultTitle       = document.title;
    this._defaultDescription = document.querySelector('meta[name="description"]')?.content || '';

    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        e.preventDefault();
        this.navigate(href);
      }
    });

    window.addEventListener('popstate', () => this.render(location.pathname, true));

    this.render(location.pathname, true);  // 초기 로드: 전환 없으므로 즉시
  },

  navigate(path) {
    const toStudy = path.startsWith('/study');
    document.body.style.setProperty('--intro-bg', toStudy ? 'var(--dark-bg)' : '');
    document.body.style.setProperty('--intro-trail-bg', toStudy ? 'var(--dark-accent)' : '');
    history.pushState({}, '', path);
    if (typeof playPageTransition === 'function') {
      playPageTransition(
        () => this.render(path),
        () => this._pendingReveal?.()
      );
    } else {
      this.render(path, true);
    }
  },

  render(path, immediate = false) {
    const isHome = path === '/' || path === '/index.html';
    const page   = this._getPage(path);

    if (this._gsapCtx) {
      this._gsapCtx.revert();
      this._gsapCtx = null;
    }

    if (isHome) {
      this._pendingReveal = null;
      this._showHome();
      this._setMeta(this._defaultTitle, this._defaultDescription);
    } else if (page) {
      this._showSubpage(page, path, immediate);
      const meta = typeof page.meta === 'function' ? page.meta(path) : null;
      this._setMeta(
        meta?.title ? `${meta.title} — ${this._defaultTitle}` : this._defaultTitle,
        meta?.description || this._defaultDescription
      );
    } else {
      this._pendingReveal = null;
      this._showHome();
      this._setMeta(this._defaultTitle, this._defaultDescription);
    }

    document.body.classList.toggle('is-subpage', !isHome);
    const isStudy = path.startsWith('/study');
    document.body.classList.toggle('is-study', isStudy);
    const studyBtn = document.getElementById('studyBtn');
    if (studyBtn) {
      studyBtn.textContent = isStudy ? 'Home' : 'Study';
      studyBtn.setAttribute('href', isStudy ? '/' : '/study');
    }
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
      const isStudyDetail = path.startsWith('/study/');
      scrollTopBtn.setAttribute('aria-label', isStudyDetail ? '목록으로' : '맨 위로');
      scrollTopBtn.innerHTML = isStudyDetail
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="6 11 12 5 18 11"></polyline></svg>`;
    }
    document.querySelectorAll('.header__nav-btn').forEach(btn => {
      btn.classList.toggle('is-active', path.startsWith(btn.getAttribute('href')));
    });
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  },

  _setMeta(title, description) {
    document.title = title;
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', description);
  },

  _restoreBottomLinks() {
    if (this._originalBottomLinks) {
      const links = document.querySelector('.bottom-nav__links');
      if (links) links.innerHTML = this._originalBottomLinks;
      this._originalBottomLinks = null;
    }
    document.querySelector('.bottom-nav')?.classList.remove('is-detail');
  },

  _showHome() {
    this._restoreBottomLinks();
    this.homeView.style.display    = '';
    this.subpageView.style.display = 'none';
    this.subpageView.innerHTML     = '';
    this.subpageView.setAttribute('aria-hidden', 'true');
    requestAnimationFrame(() => {
      // gsap.set 우선순위 초기화 → onRefresh에서 tl이 올바른 색상으로 덮어쓸 수 있도록
      gsap.set(['.header__logo', '.header__nav', '.header__nav-btn', '.header__menu-btn', '.menu-btn'],
        { clearProps: 'color,borderColor' });
      if (typeof window.__heroTaglineRebuild === 'function') window.__heroTaglineRebuild();
      if (typeof window.__centerHobbyBtn === 'function') window.__centerHobbyBtn();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      window.__lenis?.resize();
    });
  },

  _showSubpage(page, path, immediate = false) {
    this._restoreBottomLinks();
    this.homeView.style.display    = 'none';
    this.subpageView.style.display = '';
    this.subpageView.removeAttribute('aria-hidden');
    this.subpageView.innerHTML = page.render(path);

    const runInit = () => {
      this._gsapCtx = gsap.context(() => page.init(path), this.subpageView);
    };

    if (immediate) {
      runInit();
    } else {
      // 패널 슬라이드아웃 시작(onMid +0.1s)에 맞춰 실행 — 패널이 빠지면서 애니메이션이 드러남
      this._pendingReveal = null;
      setTimeout(runInit, 100);
    }

    // footer 등 공유 요소의 ScrollTrigger 위치를 서브페이지 레이아웃 기준으로 재계산
    requestAnimationFrame(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      window.__lenis?.resize();
    });
  },

  _getPage(path) {
    if (path === '/about' || path.startsWith('/about'))  return PageAbout;
    if (path === '/works' || path === '/works/')         return PageWorksList;
    if (path.startsWith('/works/'))                      return PageWorksDetail;
    if (path === '/study' || path === '/study/')         return PageStudyList;
    if (path.startsWith('/study/'))                      return PageStudyDetail;
    return null;
  },
};
