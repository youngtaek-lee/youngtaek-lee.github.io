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
          <div class="wl-extra-wrap">
            <p class="subpage__section-title">More Works</p>
            <ul class="wl-extra">
              ${extras.map(e => `
                <li class="wl-extra__item">
                  ${e.url
                    ? `<a href="${e.url}" target="_blank" rel="noopener" class="wl-extra__link">
                        <span class="wl-extra__name">${e.name}</span>
                        <span class="wl-extra__arrow">↗</span>
                      </a>`
                    : `<span class="wl-extra__link wl-extra__link--text">
                        <span class="wl-extra__name">${e.name}</span>
                      </span>`
                  }
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
