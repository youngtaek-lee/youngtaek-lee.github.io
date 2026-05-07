// =============================
// Hero 입장 애니메이션 (인트로 완료 후 호출)
// =============================
function initHeroEntrance() {
  gsap.from('.hero__box', {
    opacity: 0,
    scale: 0.96,
    duration: 1,
    ease: 'power3.out',
  });

  const header = document.querySelector('.header');
  if (header) {
    gsap.fromTo(header,
      { opacity: 0, visibility: 'visible' },
      { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 }
    );
  }
}

// =============================
// About 가로 스크롤 마퀴
// =============================
function initAboutScroll() {
  const track = document.querySelector('.about__marquee-track');
  if (!track) return;

  gsap.to(track, {
    xPercent: -50,
    ease: 'none',
    scrollTrigger: {
      trigger: '.about',
      start: 'top top',
      end: '+=150%',
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });
}

// =============================
// Works 리스트 등장
// =============================
function initWorksEntrance() {
  gsap.from('.works__item', {
    opacity: 0,
    y: 16,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.06,
    scrollTrigger: {
      trigger: '.works__list',
      start: 'top 78%',
    },
  });
}

// =============================
// Hero 타이틀 스크롤 마스킹
// =============================
function initHeroTaglineScroll(lenis) {
  const title       = document.querySelector('.hero__title');
  const tagline     = document.querySelector('.hero__tagline');
  const hiddenSpace = document.querySelector('.hero__hidden-space');
  if (!title || !tagline || !hiddenSpace) return;

  document.fonts.ready.then(() => {
    const titleH  = title.offsetHeight;
    const taglineH = tagline.offsetHeight;

    const initH = Math.max(0, titleH - taglineH - 40);
    gsap.set(hiddenSpace, { height: initH });

    // SCROLLWHEEL → HELLO 위치 계산
    const overLetters = Array.from(tagline.querySelectorAll('[data-hi]'));
    const overRects   = overLetters.map(el => el.getBoundingClientRect());

    // ghost로 HELLO 각 글자 목표 위치 측정 (중앙 정렬)
    const ghost = document.createElement('p');
    ghost.className = 'hero__tagline';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.cssText = 'visibility:hidden;pointer-events:none;text-align:center;';
    ghost.innerHTML = 'HELLO'.split('').map(l => `<span style="display:inline-block">${l}</span>`).join('');
    title.appendChild(ghost);
    const ghostRects = Array.from(ghost.querySelectorAll('span')).map(el => el.getBoundingClientRect());
    title.removeChild(ghost);

    // 각 over 글자 → HELLO 목표 위치까지의 x 이동량
    const translations = overLetters.map((el, i) => {
      const hi = parseInt(el.dataset.hi);
      return ghostRects[hi].left - overRects[i].left;
    });

    const tl = gsap.timeline({ paused: true });

    // Phase 1 (0 → 0.5): 상승 + 마스킹 + HELLO 재배열
    tl.to(tagline,     { bottom: Math.round(titleH * 0.3), ease: 'none',       duration: 0.5 }, 0)
      .to(hiddenSpace, { height: titleH,                   ease: 'none',       duration: 0.5 }, 0);

    overLetters.forEach((el, i) => {
      tl.to(el, { x: translations[i], ease: 'power2.out', duration: 0.5 }, 0);
    });

    // Phase 2 (0.5 → 1.0): HELLO 유지
    tl.to({}, { duration: 0.5 }, 0.5);

    const st = ScrollTrigger.create({
      trigger: '.hero-wrap',
      start: 'top top',
      end: 'bottom bottom',
    });

    // lenis.scroll(lerp된 값)로 직접 구동 → Lenis easing이 그대로 전달됨, pin 충격 없음
    gsap.ticker.add(() => {
      if (!st.end) return;
      const p = gsap.utils.clamp(0, 1, (lenis.scroll - st.start) / (st.end - st.start));
      tl.progress(p);
    });

  }); // document.fonts.ready
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
