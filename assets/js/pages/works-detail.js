const PageWorksDetail = {
  render(path) {
    const id    = path.replace('/works/', '');
    const list  = typeof works !== 'undefined' ? works : [];
    const idx   = list.findIndex(w => w.id === id);
    const work  = idx !== -1 ? list[idx] : null;

    if (!work) return `<div class="subpage"><p style="padding:120px 40px">프로젝트를 찾을 수 없습니다.</p></div>`;

    const prev = list[idx - 1] ?? null;
    const next = list[idx + 1] ?? null;

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

        ${work.gallery?.length ? `
        <section class="wd-gallery">
          ${work.gallery.map(img => `<img src="${img}" alt="${work.title} 갤러리">`).join('')}
        </section>` : ''}

        <nav class="wd-nav">
          ${prev ? `<a href="/works/${prev.id}" class="wd-nav__item wd-nav__item--prev">
            <span class="wd-nav__label">Prev</span>
            <span class="wd-nav__title">${prev.title}</span>
          </a>` : '<div></div>'}
          ${next ? `<a href="/works/${next.id}" class="wd-nav__item wd-nav__item--next">
            <span class="wd-nav__label">Next</span>
            <span class="wd-nav__title">${next.title}</span>
          </a>` : '<div></div>'}
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
      links.innerHTML = `<a href="${work.url}" target="_blank" rel="noopener" class="bottom-nav__link bottom-nav__link--cta" style="background:var(--c-orange);color:var(--c-beige)">VIEW SITE</a>`;
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

    // 이미지 로드 후 높이 재계산
    const imgs = document.querySelectorAll('.works-detail-page img');
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === imgs.length) {
        ScrollTrigger.refresh();
        window.__lenis?.resize();
      }
    };
    imgs.forEach(img => {
      if (img.complete) onLoad();
      else img.addEventListener('load', onLoad);
    });
  },
};
