const PageWorksList = {
  render() {
    const items = typeof works !== 'undefined' ? works.filter(w => w.id !== 'more') : [];
    const extras = typeof worksExtra !== 'undefined' ? worksExtra : [];
    return `
      <div class="subpage works-list-page">

        <section class="subpage__section">
          <h1 class="subpage__title">Recent<br>Works</h1>
          <ul class="works__list">
            ${items.map((w, i) => `
              <li class="works__item">
                <a href="/works/${w.id}" class="works__item__link">
                  <span class="works__item__num">${String(i + 1).padStart(2, '0')}</span>
                  <span class="works__item__title">
                    <span class="works__item__title__en">${w.title}</span>
                    <span class="works__item__title__ko">${w.name}</span>
                  </span>
                  <span class="works__item__meta">
                    <span class="works__item__category">${w.category}</span>
                    <span class="works__item__sep">·</span>
                    <span class="works__item__year">${w.year}</span>
                  </span>
                  <svg class="works__sparkle" viewBox="-1.1 -1.1 2.2 2.2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0,-1 L0.092,-0.092 L1,0 L0.092,0.092 L0,1 L-0.092,0.092 L-1,0 L-0.092,-0.092 Z" fill="currentColor"/></svg>
                </a>
              </li>
            `).join('')}
          </ul>

          ${extras.length ? `
          <div class="wl-more">
            <button class="wl-more__btn" id="wlMoreBtn">
              More Projects
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/><polyline points="6 13 12 19 18 13"/>
              </svg>
            </button>
            <ul class="wl-extra" id="wlExtra">
              ${extras.map(e => `
                <li class="wl-extra__item">
                  <a href="${e.url}" target="_blank" rel="noopener" class="wl-extra__link">
                    ${e.name}
                    <span class="wl-extra__arrow">↗</span>
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
          ` : ''}
        </section>

      </div>
      <img class="works__thumb" id="works-thumb" alt="" aria-hidden="true">
    `;
  },

  init() {
    gsap.from('.subpage__title', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' });
    gsap.from('.works__item', {
      x: 150, opacity: 0, duration: 0.6, ease: 'power2.out',
      stagger: 0.08,
      delay: 0.2,
    });

    // More Projects 토글
    const btn = document.getElementById('wlMoreBtn');
    const extra = document.getElementById('wlExtra');
    if (btn && extra) {
      gsap.set(extra, { height: 0, overflow: 'hidden' });
      let open = false;
      btn.addEventListener('click', () => {
        open = !open;
        btn.classList.toggle('is-open', open);
        if (open) {
          gsap.set(extra, { height: 'auto' });
          const h = extra.offsetHeight;
          gsap.fromTo(extra, { height: 0 }, { height: h, duration: 0.5, ease: 'power3.out' });
          gsap.from('.wl-extra__item', { y: 20, opacity: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out', delay: 0.15 });
        } else {
          gsap.to(extra, { height: 0, duration: 0.4, ease: 'power3.in' });
        }
      });
    }

    // 썸네일 hover
    const thumb = document.querySelector('#subpage-view .works__thumb');
    if (thumb) {
      document.querySelectorAll('#subpage-view .works__item').forEach(li => {
        const id = (li.querySelector('a')?.getAttribute('href') || '').split('/').pop();
        const work = works.find(w => w.id === id);
        if (!work) return;
        li.addEventListener('mouseenter', () => { thumb.src = work.main; thumb.classList.add('is-visible'); });
        li.addEventListener('mouseleave', () => { thumb.classList.remove('is-visible'); });
      });
      document.addEventListener('mousemove', e => {
        gsap.to(thumb, { left: e.clientX, top: e.clientY, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      });
    }
  },
};
