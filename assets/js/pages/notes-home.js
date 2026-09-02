const PageNotesHome = {
  meta() {
    return {
      title: 'Notes',
      description: '이영택의 학습 기록 — 새로 배운 기술과 개념을 정리합니다.',
    };
  },

  render() {
    const groups = typeof notesCategoryGroups !== 'undefined' ? notesCategoryGroups : [];

    return `
      <div class="subpage notes-home-page">
        <section class="subpage__section">
          <h1 class="subpage__title">Notes</h1>
          <div class="notes-home__groups">
            ${groups.map(g => `
              <div class="notes-home__group">
                <p class="notes-home__group-label">${g.group}</p>
                ${(g.categories && g.categories.length) ? `
                  <div class="notes-home__tabs">
                    ${g.categories.map(c => `
                      <a href="/notes/${c.slug}" class="notes-home__tab">${c.label}${c.file ? ' <span class="notes-home__count">✓</span>' : ''}</a>
                    `).join('')}
                  </div>
                ` : ''}
                ${(g.subgroups || []).map(sg => `
                  <div class="notes-home__subgroup">
                    <p class="notes-home__subgroup-label">${sg.subgroup}</p>
                    <div class="notes-home__tabs">
                      ${sg.categories.map(c => `
                        <a href="/notes/${c.slug}" class="notes-home__tab">${c.label}${c.file ? ' <span class="notes-home__count">✓</span>' : ''}</a>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  },

  init() {
    const titleEl = document.querySelector('#subpage-view .subpage__title');
    let chars;
    if (titleEl) {
      titleEl.innerHTML = titleEl.textContent.split('').map(ch =>
        `<span class="reveal-char"><span class="reveal-char__inner">${ch}</span></span>`
      ).join('');
      chars = titleEl.querySelectorAll('.reveal-char__inner');
      gsap.set(chars, { yPercent: 110 });
    }
    gsap.set('#subpage-view .notes-home__group', { y: 20, opacity: 0 });

    const doHeroReveal = () => {
      if (chars) gsap.to(chars, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.1 });
      gsap.to('#subpage-view .notes-home__group', { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08, delay: 0.2 });
    };

    if (document.getElementById('intro') || gsap.isTweening(document.querySelector('.page-transition'))) {
      window.__onCurtainMid = doHeroReveal;
    } else {
      doHeroReveal();
    }
  },
};
