const PageStudyDetail = {
  meta(path) {
    const id   = path.replace('/study/', '');
    const list = typeof studyPosts !== 'undefined' ? studyPosts : [];
    const post = list.find(p => p.id === id);
    if (!post) return null;
    return { title: post.title, description: post.excerpt };
  },

  render(path) {
    const id   = path.replace('/study/', '');
    const list = typeof studyPosts !== 'undefined' ? studyPosts : [];
    const post = list.find(p => p.id === id);

    if (!post) return `<div class="subpage"><p style="padding:120px 40px">글을 찾을 수 없습니다.</p></div>`;

    return `
      <div class="subpage study-detail-page" data-id="${post.id}">
        <section class="subpage__hero">
          <p class="wd-meta">${post.date}</p>
          <h1 class="subpage__title">${post.title}</h1>
        </section>
        <section class="subpage__section study__body" id="study-body">
          <p style="opacity:0.4">불러오는 중...</p>
        </section>
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

    const doHeroReveal = () => {
      if (titleEl) gsap.to(titleEl.querySelectorAll('.reveal-word__inner'), {
        yPercent: 0, duration: 0.85, ease: 'power3.out', stagger: 0.08, delay: 0.1,
      });
      gsap.to('#subpage-view .wd-meta', { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.35 });
    };

    if (document.getElementById('intro') || gsap.isTweening(document.querySelector('.page-transition'))) {
      window.__onCurtainMid = doHeroReveal;
    } else {
      doHeroReveal();
    }

    const id   = path.replace('/study/', '');
    const list = typeof studyPosts !== 'undefined' ? studyPosts : [];
    const post = list.find(p => p.id === id);
    if (!post) return;

    fetch(post.file)
      .then(res => res.text())
      .then(md => {
        const body = document.getElementById('study-body');
        if (!body) return;
        body.innerHTML = typeof marked !== 'undefined' ? marked.parse(md) : md;
        gsap.from(body.children, { y: 16, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' });
        requestAnimationFrame(() => {
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          window.__lenis?.resize();
        });
      })
      .catch(() => {
        const body = document.getElementById('study-body');
        if (body) body.innerHTML = '<p>글을 불러오지 못했습니다.</p>';
      });
  },
};
