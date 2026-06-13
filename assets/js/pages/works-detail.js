const PageWorksDetail = {
  render(path) {
    const id    = path.replace('/works/', '');
    const list  = typeof works !== 'undefined' ? works : [];
    const idx   = list.findIndex(w => w.id === id);
    const work  = idx !== -1 ? list[idx] : null;

    if (!work) return `<div class="subpage"><p style="padding:120px 40px">프로젝트를 찾을 수 없습니다.</p></div>`;

    const prev = list[(idx - 1 + list.length) % list.length];
    const next = list[(idx + 1) % list.length];

    return `
      <div class="subpage works-detail-page" data-id="${work.id}">

        <section class="subpage__hero wd-hero">
          <h1 class="subpage__title">${work.title}</h1>
          <p class="wd-meta">${work.category} — ${work.year}</p>
          <p class="wd-overview">${work.overview || ''}</p>
        </section>

        <section class="wd-main-img">
          <img src="${work.main}" alt="${work.title}">
        </section>

        ${work.gallery?.length ? (() => {
          const col1 = work.gallery.filter((_, i) => i % 2 === 0);
          const col2 = work.gallery.filter((_, i) => i % 2 === 1);
          return `
        <section class="wd-gallery">
          <div class="wd-gallery__col">
            ${col1.map(img => `<img src="${img}" alt="${work.title} 갤러리">`).join('')}
          </div>
          <div class="wd-gallery__col">
            ${col2.map(img => `<img src="${img}" alt="${work.title} 갤러리">`).join('')}
            ${work.url ? `
            <a href="${work.url}" target="_blank" rel="noopener" class="wd-gallery__next">
              <span class="wd-gallery__next-title">VIEW SITE</span>
              <svg class="wd-gallery__next-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </a>` : ''}
          </div>
        </section>`;
        })() : ''}

        <nav class="wd-nav">
          ${prev ? `<a href="/works/${prev.id}" class="wd-nav__item wd-nav__item--prev">
            <span class="wd-nav__label">Prev</span>
            <div class="wd-nav__bottom">
              <div class="wd-nav__arrow">
                <svg class="wd-nav__arrow-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
              </div>
              <span class="wd-nav__title">${prev.title}</span>
            </div>
          </a>` : ''}
          ${next ? `<a href="/works/${next.id}" class="wd-nav__item wd-nav__item--next">
            <span class="wd-nav__label">Next</span>
            <div class="wd-nav__bottom">
              <span class="wd-nav__title">${next.title}</span>
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
    const id   = path.replace('/works/', '');
    const work = typeof works !== 'undefined' ? works.find(w => w.id === id) : null;

    // bottom-nav 교체
    const links = document.querySelector('.bottom-nav__links');
    if (links && work?.url) {
      Router._originalBottomLinks = links.innerHTML;
      links.innerHTML = `<a href="mailto:koriiscat@gmail.com" class="bottom-nav__link bottom-nav__link--cta" style="background:var(--basic-dark);color:var(--basic-beige);font-family:'Anton',sans-serif;font-weight:400">CONTACT</a><a href="${work.url}" target="_blank" rel="noopener" class="bottom-nav__link bottom-nav__link--cta" style="background:var(--basic-orange);color:var(--basic-dark);font-family:'Anton',sans-serif;font-weight:400">VIEW SITE</a>`;
    }
    document.querySelector('.bottom-nav')?.classList.add('is-detail');

    gsap.from('.subpage__title', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' });
    gsap.from('.wd-meta',        { y: 20, opacity: 0, duration: 0.6, delay: 0.1, ease: 'power2.out' });
    gsap.from('.wd-overview',    { y: 20, opacity: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' });
    gsap.from('.wd-main-img',    { y: 60, opacity: 0, duration: 1.0, delay: 0.3, ease: 'power3.out' });
    gsap.from('.wd-nav',         {
      y: 30, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.wd-nav', start: 'top 90%' },
    });

    // 이미지 로드 후 next 카드 짧은 칼럼으로 이동 + 높이 재계산
    const imgs = document.querySelectorAll('.works-detail-page img');
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === imgs.length) {
        const cols = document.querySelectorAll('.wd-gallery__col');
        const nextCard = document.querySelector('.wd-gallery__next');
        if (cols.length === 2 && nextCard) {
          const shorterIdx = cols[0].offsetHeight <= cols[1].offsetHeight ? 0 : 1;
          cols[shorterIdx].appendChild(nextCard);
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const diff = cols[1 - shorterIdx].getBoundingClientRect().height
                       - cols[shorterIdx].getBoundingClientRect().height;
            if (diff > 0) nextCard.style.height = `${nextCard.getBoundingClientRect().height + diff}px`;
            ScrollTrigger.refresh();
            window.__lenis?.resize();
          }));
        }
      }
    };
    imgs.forEach(img => {
      if (img.complete) onLoad();
      else img.addEventListener('load', onLoad);
    });
  },
};
