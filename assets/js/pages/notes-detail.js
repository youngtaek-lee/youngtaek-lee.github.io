const PageNotesDetail = {
  _category(path) {
    const slug = path.replace('/notes/', '');
    const list = typeof notesAllCategories !== 'undefined' ? notesAllCategories : [];
    return list.find(c => c.slug === slug) || null;
  },

  meta(path) {
    const cat = this._category(path);
    if (!cat) return null;
    return { title: cat.label, description: '이영택의 학습 기록 — 새로 배운 기술과 개념을 정리합니다.' };
  },

  render(path) {
    const cat = this._category(path);
    if (!cat) return `<div class="subpage"><p style="padding:120px 40px">글을 찾을 수 없습니다.</p></div>`;

    const list = typeof notesAllCategories !== 'undefined' ? notesAllCategories : [];
    const idx  = list.findIndex(c => c.slug === cat.slug);
    const prev = list.length > 1 ? list[(idx - 1 + list.length) % list.length] : null;
    const next = list.length > 1 ? list[(idx + 1) % list.length] : null;

    return `
      <div class="subpage notes-detail-page" data-id="${cat.slug}">
        <section class="subpage__hero">
          <a href="/notes" class="notes-list__back">&larr; Notes</a>
          ${cat.date ? `<p class="wd-meta">${cat.date}</p>` : ''}
          <h1 class="subpage__title">${cat.label}</h1>
        </section>
        <section class="subpage__section notes__body" id="notes-body">
          ${cat.file ? `<p style="opacity:0.4">불러오는 중...</p>` : `<p style="opacity:0.4">아직 작성된 글이 없습니다.</p>`}
        </section>

        <nav class="wd-nav">
          ${prev ? `<a href="/notes/${prev.slug}" class="wd-nav__item wd-nav__item--prev">
            <span class="wd-nav__label">Prev</span>
            <div class="wd-nav__bottom">
              <div class="wd-nav__arrow">
                <svg class="wd-nav__arrow-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
              </div>
              <span class="wd-nav__title">${prev.label}</span>
            </div>
          </a>` : ''}
          ${next ? `<a href="/notes/${next.slug}" class="wd-nav__item wd-nav__item--next">
            <span class="wd-nav__label">Next</span>
            <div class="wd-nav__bottom">
              <span class="wd-nav__title">${next.label}</span>
              <div class="wd-nav__arrow">
                <svg class="wd-nav__arrow-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </a>` : ''}
        </nav>
      </div>
    `;
  },

  init(path) {
    const titleEl = document.querySelector('#subpage-view .subpage__title');
    if (titleEl) {
      titleEl.innerHTML = titleEl.textContent.trim().split(/\s+/).map(w =>
        `<span class="reveal-word"><span class="reveal-word__inner">${w}</span></span>`
      ).join(' ');
      gsap.set(titleEl.querySelectorAll('.reveal-word__inner'), { yPercent: 120 });
    }
    gsap.set('#subpage-view .wd-meta', { y: 12, opacity: 0 });

    const bodyEl = document.getElementById('notes-body');
    if (bodyEl) gsap.set(bodyEl, { opacity: 0, y: 20 });

    const doHeroReveal = () => {
      if (titleEl) gsap.to(titleEl.querySelectorAll('.reveal-word__inner'), {
        yPercent: 0, duration: 0.85, ease: 'power3.out', stagger: 0.08, delay: 0.1,
      });
      gsap.to('#subpage-view .wd-meta', { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.35 });
      if (bodyEl) gsap.to(bodyEl, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.75 });
    };

    if (document.getElementById('intro') || gsap.isTweening(document.querySelector('.page-transition'))) {
      window.__onCurtainMid = doHeroReveal;
    } else {
      doHeroReveal();
    }

    gsap.from('#subpage-view .wd-nav', {
      y: 30, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '#subpage-view .wd-nav', start: 'top 90%' },
    });

    const cat = this._category(path);
    if (!cat || !cat.file) return;

    fetch(cat.file)
      .then(res => res.text())
      .then(md => {
        const body = document.getElementById('notes-body');
        if (!body) return;
        body.innerHTML = typeof marked !== 'undefined' ? marked.parse(md) : md;
        if (typeof hljs !== 'undefined') {
          body.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
        }
        Array.from(body.children).forEach(el => {
          gsap.from(el, {
            y: 16, opacity: 0, duration: 0.5, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          });
        });
        requestAnimationFrame(() => {
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          window.__lenis?.resize();
        });
      })
      .catch(() => {
        const body = document.getElementById('notes-body');
        if (body) body.innerHTML = '<p>글을 불러오지 못했습니다.</p>';
      });
  },
};
