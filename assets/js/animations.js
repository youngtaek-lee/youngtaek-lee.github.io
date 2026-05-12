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
// Works 타이틀 + 리스트 스크롤 리빌
// =============================
function initWorksReveal() {
  // 타이틀 글자 분리
  const label = document.querySelector('.works__label');
  if (label) {
    label.innerHTML = label.textContent.split('').map(ch =>
      `<span class="reveal-char"><span class="reveal-char__inner">${ch}</span></span>`
    ).join('');

    const chars = label.querySelectorAll('.reveal-char__inner');
    const titleTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.works',
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1,
      }
    });
    chars.forEach((ch, i) => {
      titleTl.from(ch, { yPercent: 110, ease: 'none', duration: 1 }, i * 0.15);
    });
  }

  // 서브텍스트 클립마스크 우측 등장 (타이틀 완료 후)
  const sub = document.querySelector('.works__sub');
  if (sub) {
    gsap.from(sub, {
      x: -250,
      ease: 'none',
      scrollTrigger: {
        trigger: '.works',
        start: 'top 70%',
        end: 'top 40%',
        scrub: 1,
      }
    });
  }

  // 리스트 아이템 왼쪽 등장
  const items = document.querySelectorAll('.works__item');
  if (items.length) {
    const listTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.works__list',
        start: 'top 95%',
        end: 'center 60%',
        scrub: 1,
      }
    });
    items.forEach((item, i) => {
      listTl.from(item, { x: 150, ease: 'none', duration: 1 }, i * 0.12);
    });
  }
}

// =============================
// Hero → Dark 전환
// =============================
function initDarkTransition() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero-wrap',
      start: '55% top',
      end: 'bottom bottom',
      scrub: 1,
    }
  });

  tl.fromTo('main',
    { backgroundColor: '#161415' },
    { backgroundColor: '#DBCFB0', ease: 'none' },
    0
  ).fromTo('.hero__hidden-space',
    { backgroundColor: '#161415' },
    { backgroundColor: '#DBCFB0', ease: 'none' },
    0
  ).fromTo('.about-text',
    { backgroundColor: '#161415' },
    { backgroundColor: '#DBCFB0', ease: 'none' },
    0
  ).fromTo('body',
    { color: '#EDD9C0' },
    { color: '#161415', ease: 'none' },
    0
  ).fromTo('.header__logo',
    { color: '#EDD9C0' },
    { color: '#161415', ease: 'none' },
    0
  ).fromTo('.header__nav',
    { color: '#EDD9C0' },
    { color: '#161415', ease: 'none' },
    0
  ).fromTo('.menu-btn',
    { color: '#EDD9C0' },
    { color: '#161415', ease: 'none' },
    0
  );
}

// =============================
// About 텍스트 스크롤 spotlight
// =============================
function initAboutTextScroll() {
  // 타이틀 글자 분리 (works__label과 동일)
  const label = document.querySelector('.about-text__label');
  if (label) {
    label.innerHTML = label.textContent.split('').map(ch =>
      `<span class="reveal-char"><span class="reveal-char__inner">${ch}</span></span>`
    ).join('');

    const chars = label.querySelectorAll('.reveal-char__inner');
    const titleTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.about-text',
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1,
      }
    });
    chars.forEach((ch, i) => {
      titleTl.from(ch, { yPercent: 110, ease: 'none', duration: 1 }, i * 0.15);
    });
  }

  const words = document.querySelectorAll('.about__word');
  if (!words.length) return;

  const total = words.length;

  ScrollTrigger.create({
    trigger: '.about-text',
    start: 'top 75%',
    end: '+=120%',
    scrub: 0.3,
    onUpdate: (self) => {
      const activePos = self.progress * (total + 6) - 4;
      words.forEach((word, i) => {
        const dist = Math.abs(i - activePos);
        const opacity = Math.max(0.15, Math.exp(-dist * dist * 0.7));
        gsap.set(word, { opacity });
      });
    },
  });
}

// =============================
// Works 리스트 등장 (구버전 — 미사용)
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
    // 실제 렌더된 텍스트 너비로 font-size 역산 → 컨테이너에 딱 맞게
    const range = document.createRange();
    range.selectNodeContents(tagline);
    const textW  = range.getBoundingClientRect().width;
    const availW = title.clientWidth - 60; // padding 10px * 2
    const curPx  = parseFloat(getComputedStyle(tagline).fontSize);
    tagline.style.fontSize = ((curPx * availW / textW) / window.innerWidth * 100).toFixed(3) + 'vw';

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
    ghost.style.cssText = 'visibility:hidden;pointer-events:none;text-align:center;letter-spacing:0.08em;';
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
    const centeredBottom = Math.round((window.innerHeight - taglineH) / 2);
    tl.to(tagline,     { bottom: centeredBottom,            ease: 'none',       duration: 0.5 }, 0)
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
// Footer — Hobby Popcorn
// =============================
function initHobbyPopcorn() {
  const btn = document.getElementById('hobbyBtn');
  const container = document.getElementById('hobbyPopcorn');
  if (!btn || !container || typeof Matter === 'undefined') return;

  const { Engine, Runner, Bodies, Body, World, Events } = Matter;

  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 2;
  const runner = Runner.create();
  Runner.run(runner, engine);

  const ICONS = [
`<img src="assets/images/netflix-icon.png" height="54" style="display:block;width:auto;">`,
`<img src="assets/images/pepsi-icon.png" width="54" height="54" style="display:block;">`,
    `<img src="assets/images/hanwha-icon.svg" height="54" style="display:block;width:auto;">`,
    `<img src="assets/images/claude-icon.svg" width="54" height="54" style="display:block;">`,
    `<img src="assets/images/github-icon.png" width="54" height="54" style="display:block;">`,
    `<img src="assets/images/vscode-icon.svg" width="54" height="54" style="display:block;">`,
    `<img src="assets/images/chimchakman-icon.svg" width="44" height="44" style="display:block;">`,
    `<img src="assets/images/burgerking-icon.svg" width="44" height="44" style="display:block;">`,
    `<img src="assets/images/slack-icon.svg" width="44" height="44" style="display:block;">`,
    `<img src="assets/images/riot-icon.svg" width="42" height="42" style="display:block;">`,
    `<img src="assets/images/notion-icon.svg" width="54" height="54" style="display:block;">`,
    `<img src="assets/images/youtube-icon.svg" height="32" style="display:block;width:auto;">`,
    `<img src="assets/images/samsung-icon.svg" height="32" style="display:block;width:auto;">`,
  ];
  const active = [];
  let statics = null;

  function initStatics() {
    if (statics) return;
    const W = container.offsetWidth;
    const H = container.offsetHeight;
    const T = 80;
    statics = [
      Bodies.rectangle(W / 2, H - 30 + T / 2, W + 200, T, { isStatic: true, friction: 0.7, restitution: 0.2 }),
      Bodies.rectangle(-T / 2, H / 2, T, H * 10, { isStatic: true }),
      Bodies.rectangle(W + T / 2, H / 2, T, H * 10, { isStatic: true }),
    ];
    World.add(engine.world, statics);
  }

  Events.on(engine, 'afterUpdate', () => {
    const limit = container.offsetHeight + 300;
    for (let i = active.length - 1; i >= 0; i--) {
      const { body, el } = active[i];
      if (body.position.y > limit) {
        World.remove(engine.world, body);
        el.remove();
        active.splice(i, 1);
        continue;
      }
      el.style.left = body.position.x + 'px';
      el.style.top = body.position.y + 'px';
      el.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
    }
  });

  btn.addEventListener('click', () => {
    initStatics();

    const count = Math.floor(Math.random() * 2) + 2; // 2~3개
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const bx = bRect.left - cRect.left + bRect.width / 2;
    const by = bRect.top - cRect.top + bRect.height / 2;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const body = Bodies.circle(bx, by, 27, {
          restitution: 0.4,
          friction: 0.5,
          frictionAir: 0.008,
          density: 0.004,
        });
        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 10,
          y: -(16 + Math.random() * 8),
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.5);
        World.add(engine.world, body);

        const el = document.createElement('div');
        el.innerHTML = ICONS[Math.floor(Math.random() * ICONS.length)];
        el.style.cssText = `position:absolute;color:rgba(255,255,255,0.88);pointer-events:none;user-select:none;will-change:transform;left:${bx}px;top:${by}px;transform:translate(-50%,-50%);`;
        container.appendChild(el);
        active.push({ body, el });
      }, i * 65);
    }
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
      if (node.tagName === 'BR') {
        el.appendChild(node);
        needSpace = false;
        return;
      }
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
