// =============================
// 애니메이션 (GSAP + ScrollTrigger)
// =============================
function initAnimations() {
  gsap.to('.hero__inner', {
    opacity: 0,
    filter: 'blur(16px)',
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: '30% top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

// =============================
// Hero 입장 애니메이션
// =============================
function initHeroEntrance() {
  const lines = document.querySelectorAll('.hero__name-line');

  lines.forEach(line => {
    const words = line.textContent.trim().split(' ');
    line.innerHTML = words.map(w =>
      `<span class="word-clip"><span class="word">${w}</span></span>`
    ).join(' ');
  });

  gsap.set('.word', { yPercent: 110 });
  gsap.set('.hero__cta', { opacity: 0 });

  gsap.to('.word', {
    yPercent: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.08,
  });
  gsap.to('.hero__cta', {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
    delay: 0.5,
  });
}

// =============================
// 섹션 헤딩 단어 분리 유틸
// =============================
function wrapWordsForReveal(el) {
  const nodes = Array.from(el.childNodes);
  el.innerHTML = '';
  const inners = [];
  let needSpace = false;

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.trim().split(/\s+/).filter(Boolean);
      words.forEach((word, i) => {
        if (needSpace || i > 0) el.appendChild(document.createTextNode(' '));
        const outer = document.createElement('span');
        outer.className = 'reveal-word';
        const inner = document.createElement('span');
        inner.className = 'reveal-word__inner';
        inner.textContent = word;
        outer.appendChild(inner);
        el.appendChild(outer);
        inners.push(inner);
        needSpace = true;
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const outer = document.createElement('span');
      outer.className = 'reveal-word';
      const inner = document.createElement('span');
      inner.className = 'reveal-word__inner';
      inner.appendChild(node);
      outer.appendChild(inner);
      el.appendChild(outer);
      inners.push(inner);
      needSpace = false;
    }
  });

  return inners;
}

// =============================
// 섹션 헤딩 등장 애니메이션
// =============================
function initWorksHeading() {
  const sections = [
    { heading: '.works__heading',  sub: '.works__sub',   extras: [], items: '.works-list__item', itemsStagger: 0.07, hStagger: 0.1,  eStagger: 0.08, trigger: '.works__track-wrap', start: 'top 60%', toggleActions: 'play none none reverse' },
    { heading: '.skills__heading', sub: '.skills__sub',  extras: [], items: '.skill-item', hStagger: 0.1,  eStagger: 0.08, trigger: '.skills',            start: 'top 65%', toggleActions: 'play none none reverse' },
    { heading: '.clients__heading',sub: '.clients__sub', extras: [], items: '.clients__overflow', itemsStagger: 0.15, hStagger: 0.1,  eStagger: 0.08, trigger: '.clients',           start: 'top 65%', toggleActions: 'play none none reverse' },
    { heading: '.contact__title',  sub: null,            extras: ['.contact__email', '.contact__sns'], hStagger: 0,    eStagger: 0,    trigger: '.contact',           start: 'top 60%', toggleActions: 'play none none reverse' },
  ];

  sections.forEach(({ heading, sub, extras, items, itemsStagger, hStagger, eStagger, trigger, start, toggleActions }) => {
    const headingEl = document.querySelector(heading);
    const subEl     = sub ? document.querySelector(sub) : null;
    if (!headingEl) return;

    const headingWords = wrapWordsForReveal(headingEl);
    const subWords     = subEl ? wrapWordsForReveal(subEl) : [];

    const tl = gsap.timeline({
      scrollTrigger: { trigger, start, toggleActions },
    });
    tl.from(headingWords, { y: '105%', duration: 0.85, ease: 'expo.out', stagger: hStagger });
    if (subWords.length) {
      tl.from(subWords, { y: '105%', duration: 0.7, ease: 'expo.out', stagger: 0.06 }, '-=0.45');
    }
    extras.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      const words = wrapWordsForReveal(el);
      if (words.length) {
        tl.from(words, { y: '105%', duration: 0.7, ease: 'expo.out', stagger: eStagger }, '-=0.35');
      }
    });

    if (items) {
      const itemEls = document.querySelectorAll(items);
      if (itemEls.length) {
        tl.from(itemEls, { opacity: 0, y: 24, duration: 0.5, ease: 'power2.out', stagger: itemsStagger ?? 0.05 });
      }
    }

  });

  const worksPanel = document.querySelector('.works-panel');
  if (worksPanel) {
    gsap.set(worksPanel, { opacity: 0, x: 40 });
    ScrollTrigger.create({
      trigger: '.works__track-wrap',
      start: 'top 60%',
      onEnter:     () => gsap.to(worksPanel, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 1.7 }),
      onLeaveBack: () => gsap.set(worksPanel, { opacity: 0, x: 40 }),
    });
  }
}

// =============================
// About 스크롤 텍스트
// =============================
function initAboutScroll() {
  const words = document.querySelectorAll('.about__word');
  const aboutCard = document.querySelector('.about__card');
  const moreBtn = document.querySelector('.about__more-link');

  if (aboutCard) {
    gsap.to(aboutCard, {
      opacity: 0,
      filter: 'blur(12px)',
      ease: 'none',
      scrollTrigger: {
        trigger: '.about',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  }

  if (moreBtn) {
    gsap.to(moreBtn, {
      opacity: 0,
      filter: 'blur(12px)',
      ease: 'none',
      scrollTrigger: {
        trigger: '.about',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  }

  if (!words.length) return;

  gsap.set(words, { opacity: 0.2 });

  const total = words.length;

  ScrollTrigger.create({
    trigger: '.about',
    start: 'top 80%',
    end: '+=100%',
    scrub: 0.3,
    onUpdate: (self) => {
      const activePos = self.progress * (total + 6) - 4;
      words.forEach((word, i) => {
        const dist = Math.abs(i - activePos);
        const opacity = Math.max(0.1, Math.exp(-dist * dist * 0.7));
        gsap.set(word, { opacity });
      });
    },
  });
}
