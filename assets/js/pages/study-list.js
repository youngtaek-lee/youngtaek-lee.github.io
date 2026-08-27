const PageStudyList = {
  meta() {
    return {
      title: 'Study',
      description: '이영택의 학습 기록 — 새로 배운 기술과 개념을 정리합니다.',
    };
  },

  render() {
    const posts = typeof studyPosts !== 'undefined' ? studyPosts : [];
    return `
      <div class="subpage study-list-page">
        <section class="subpage__section">
          <h1 class="subpage__title">Study</h1>
          <ul class="study__list">
            ${posts.map(p => `
              <li class="study__item">
                <a href="/study/${p.id}" class="study__item__link">
                  <span class="study__item__date">${p.date}</span>
                  <span class="study__item__title">${p.title}</span>
                  <span class="study__item__excerpt">${p.excerpt}</span>
                </a>
              </li>
            `).join('')}
            ${!posts.length ? `<li class="study__item study__item--empty">아직 작성된 글이 없습니다.</li>` : ''}
          </ul>
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
    gsap.set('#subpage-view .study__item', { y: 20, opacity: 0 });

    const doHeroReveal = () => {
      if (chars) gsap.to(chars, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.1 });
      gsap.to('#subpage-view .study__item', { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08, delay: 0.2 });
    };

    if (document.getElementById('intro') || gsap.isTweening(document.querySelector('.page-transition'))) {
      window.__onCurtainMid = doHeroReveal;
    } else {
      doHeroReveal();
    }
  },
};
