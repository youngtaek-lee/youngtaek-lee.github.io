const PageWorksDetail = {
  render(path) {
    const id   = path.replace('/works/', '');
    const work = typeof works !== 'undefined' ? works.find(w => w.id === id) : null;

    if (!work) return `<div class="subpage"><p style="padding:120px 40px">프로젝트를 찾을 수 없습니다.</p></div>`;

    return `
      <div class="subpage works-detail-page" data-id="${work.id}">

        <section class="subpage__hero">
          <p class="subpage__label"><a href="/works" class="back-link">← Works</a></p>
          <h1 class="subpage__title">${work.title}</h1>
          <p class="wd-meta">${work.category} — ${work.year}</p>
        </section>

        <section class="wd-main-img">
          <img src="${work.main}" alt="${work.title}">
        </section>

        <section class="subpage__section wd-info">
          <div class="wd-info__desc">
            <h2 class="subpage__section-title">Overview</h2>
            <p class="wd-info__text">프로젝트 설명이 들어갑니다.</p>
          </div>
          <div class="wd-info__side">
            <dl class="wd-meta-list">
              <dt>클라이언트</dt>
              <dd>${work.name}</dd>
              <dt>카테고리</dt>
              <dd>${work.category}</dd>
              <dt>연도</dt>
              <dd>${work.year}</dd>
            </dl>
            ${work.url ? `<a href="${work.url}" target="_blank" rel="noopener" class="wd-link">사이트 방문 →</a>` : ''}
          </div>
        </section>

      </div>
    `;
  },

  init() {
    gsap.from('.subpage__title', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' });
    gsap.from('.subpage__label', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' });
    gsap.from('.wd-meta',        { y: 20, opacity: 0, duration: 0.6, delay: 0.1, ease: 'power2.out' });
    gsap.from('.wd-main-img',    { y: 60, opacity: 0, duration: 1.0, delay: 0.2, ease: 'power3.out' });
    gsap.from('.wd-info',        {
      y: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.wd-info', start: 'top 80%' },
    });
  },
};
