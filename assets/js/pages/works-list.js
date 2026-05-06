const PageWorksList = {
  render() {
    const items = typeof works !== 'undefined' ? works.filter(w => w.id !== 'more') : [];
    return `
      <div class="subpage works-list-page">

        <section class="subpage__hero">
          <p class="subpage__label">Works</p>
          <h1 class="subpage__title">Recent<br>Works</h1>
        </section>

        <section class="subpage__section">
          <ul class="wl-list">
            ${items.map((w, i) => `
              <li class="wl-item">
                <a href="/works/${w.id}" class="wl-item__link">
                  <span class="wl-item__num">${String(i + 1).padStart(2, '0')}</span>
                  <div class="wl-item__info">
                    <h2 class="wl-item__title">${w.title}</h2>
                    <p class="wl-item__meta">${w.category} — ${w.year}</p>
                  </div>
                  <div class="wl-item__thumb">
                    <img src="${w.main}" alt="${w.title}" loading="lazy">
                  </div>
                  <span class="wl-item__arrow">→</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </section>

      </div>
    `;
  },

  init() {
    gsap.from('.subpage__title', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' });
    gsap.from('.subpage__label', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' });

    gsap.from('.wl-item', {
      y: 30, opacity: 0, duration: 0.6, ease: 'power2.out',
      stagger: 0.08,
      delay: 0.2,
    });
  },
};
