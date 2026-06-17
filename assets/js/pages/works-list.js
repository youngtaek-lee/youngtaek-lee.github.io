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
        </section>

        ${extras.length ? `
        <section class="subpage__section">
          <p class="subpage__section-title">More Works</p>
          <ul class="more-works">
            ${extras.map(e => `
              <li class="more-works__item">
                ${e.url
                  ? `<a href="${e.url}" target="_blank" rel="noopener" class="more-works__link">${e.name} ↗</a>`
                  : `<span class="more-works__link more-works__link--filled">${e.name}</span>`
                }
              </li>
            `).join('')}
          </ul>
        </section>
        ` : ''}

      </div>
      <img class="works__thumb" id="works-thumb" alt="" aria-hidden="true">
    `;
  },

  init() {
    const titleEl = document.querySelector('#subpage-view .subpage__title');
    let chars;
    if (titleEl) {
      titleEl.innerHTML = titleEl.innerHTML.split(/<br\s*\/?>/i).map(line =>
        line.trim().split('').map(ch =>
          `<span class="reveal-char"><span class="reveal-char__inner">${ch}</span></span>`
        ).join('')
      ).join('<br>');
      chars = titleEl.querySelectorAll('.reveal-char__inner');
      gsap.set(chars, { yPercent: 110 });
    }
    gsap.set('.works__item', { x: 150, opacity: 0 });

    const doHeroReveal = () => {
      if (chars) gsap.to(chars, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.1 });
      gsap.to('.works__item', { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08, delay: 0.2 });
    };

    if (document.getElementById('intro')) {
      window.__onIntroComplete = doHeroReveal;
    } else {
      doHeroReveal();
    }

    gsap.from('.more-works__item', {
      y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
      stagger: 0.04,
      scrollTrigger: { trigger: '.more-works', start: 'top 85%' },
    });

    document.querySelectorAll('#subpage-view .subpage__section-title').forEach(el => {
      el.innerHTML = el.textContent.split('').map(ch =>
        ch === ' '
          ? '<span class="reveal-char" style="width:0.3em;display:inline-block"></span>'
          : `<span class="reveal-char"><span class="reveal-char__inner">${ch}</span></span>`
      ).join('');
      const chars = el.querySelectorAll('.reveal-char__inner');
      gsap.from(chars, {
        yPercent: 110, duration: 0.6, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
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
