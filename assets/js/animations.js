// =============================
// Hero Frame 높이 동적 계산
// =============================
function initHeroFrame() {
  const frame     = document.querySelector('.hero__frame');
  const tagline   = document.querySelector('.hero__tagline');
  const heroTitle = document.querySelector('.hero__title');
  if (!frame || !tagline || !heroTitle) return;

  function update() {
    const heroRect    = heroTitle.getBoundingClientRect();
    const taglineRect = tagline.getBoundingClientRect();
    const fontSize    = parseFloat(getComputedStyle(tagline).fontSize);
    // line-height 0.85로 인한 글리프 visual overflow 보정 (em 기준 약 15%)
    const visualOverflow = fontSize * 0.15;
    const fromBottom  = heroRect.bottom - taglineRect.top + visualOverflow + 50;
    frame.style.bottom = `${fromBottom}px`;
  }

  update();
  // resize 후속 처리는 initHeroTaglineScroll.build() 내 updateFrame()이 담당
}

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
  if (header) gsap.set(header, { opacity: 1, visibility: 'visible' });
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
  ).fromTo('.header__nav-btn',
    { color: '#EDD9C0', borderColor: 'rgba(237,217,192,0.25)' },
    { color: '#161415', borderColor: 'rgba(22,20,21,0.2)', ease: 'none' },
    0
  ).fromTo('.menu-btn',
    { color: '#EDD9C0' },
    { color: '#161415', ease: 'none' },
    0
  ).fromTo('.header__menu-btn',
    { color: '#EDD9C0' },
    { color: '#161415', ease: 'none' },
    0
  );
}

// =============================
// Footer Big 텍스트 — 높이 기준 fit
// =============================
function initFooterBig() {
  const top = document.querySelector('.footer__top');
  const big = document.querySelector('.footer__big');
  if (!top || !big) return;

  function fit() {
    // 텍스트 제거 후 footer__top 순수 높이 측정
    big.style.display = 'none';
    const availH = top.clientHeight;
    big.style.display = '';

    // CSS vw 기반 너비 제약값 측정
    big.style.fontSize = '';
    const cssSize = parseFloat(getComputedStyle(big).fontSize);

    // 높이와 너비 중 작은 쪽으로 확정
    big.style.fontSize = Math.min(availH, cssSize) + 'px';
  }

  fit();

  let raf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fit);
  });
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
  const frame       = document.querySelector('.hero__frame');
  if (!title || !tagline || !hiddenSpace) return;

  let tl = null;
  let tickerFn = null;
  let st = null;

  function updateFrame() {
    if (!frame) return;
    const heroRect    = title.getBoundingClientRect();
    const taglineRect = tagline.getBoundingClientRect();
    const fontSize    = parseFloat(getComputedStyle(tagline).fontSize);
    const visualOverflow = fontSize * 0.15;
    frame.style.bottom = `${heroRect.bottom - taglineRect.top + visualOverflow + 50}px`;
  }

  function build() {
    if (tl)       { tl.kill(); tl = null; }
    if (tickerFn) { gsap.ticker.remove(tickerFn); tickerFn = null; }
    if (st)       { st.kill(); st = null; }

    // 리셋: 이전 상태 초기화 (fromTo가 명시적 from 사용하므로 DOM도 초기 위치로)
    const overLetters = Array.from(tagline.querySelectorAll('[data-hi]'));
    gsap.set(overLetters, { x: 0 });
    gsap.set(tagline, { bottom: 20 });

    // font-size 역산 — computed padding 기준 (미디어쿼리 변경 대응)
    const cs    = getComputedStyle(tagline);
    const padH  = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const range = document.createRange();
    range.selectNodeContents(tagline);
    const textW  = range.getBoundingClientRect().width;
    const availW = title.clientWidth - padH;
    const curPx  = parseFloat(cs.fontSize);
    tagline.style.fontSize = ((curPx * availW / textW) / window.innerWidth * 100).toFixed(3) + 'vw';

    const titleH   = title.offsetHeight;
    const taglineH = tagline.offsetHeight;
    const initH    = Math.max(0, titleH - taglineH - 40);
    gsap.set(hiddenSpace, { height: initH });

    // ghost로 HELLO 각 글자 목표 위치 측정 (중앙 정렬)
    const ghost = document.createElement('p');
    ghost.className = 'hero__tagline';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.cssText = 'visibility:hidden;pointer-events:none;text-align:center;letter-spacing:0.08em;';
    ghost.innerHTML = 'HELLO'.split('').map(l => `<span style="display:inline-block">${l}</span>`).join('');
    title.appendChild(ghost);
    const ghostRects = Array.from(ghost.querySelectorAll('span')).map(el => el.getBoundingClientRect());
    title.removeChild(ghost);

    const overRects    = overLetters.map(el => el.getBoundingClientRect());
    const translations = overLetters.map((el, i) => {
      const hi = parseInt(el.dataset.hi);
      return ghostRects[hi].left - overRects[i].left;
    });

    const centeredBottom = Math.round((window.innerHeight - taglineH) / 2);

    tl = gsap.timeline({ paused: true });

    // fromTo로 명시: 리사이즈 후 현재 DOM 상태와 무관하게 항상 올바른 범위로 보간
    tl.fromTo(tagline,     { bottom: 20 },    { bottom: centeredBottom, ease: 'none',       duration: 0.5 }, 0)
      .fromTo(hiddenSpace, { height: initH }, { height: titleH,         ease: 'none',       duration: 0.5 }, 0);

    overLetters.forEach((el, i) => {
      tl.fromTo(el, { x: 0 }, { x: translations[i], ease: 'power2.out', duration: 0.5 }, 0);
    });

    // Phase 2 (0.5 → 1.0): HELLO 유지
    tl.to({}, { duration: 0.5 }, 0.5);

    // X mark: HELLO 완성 시점(0.5)에 회전하며 등장
    const xMark = tagline.querySelector('.hero__x-mark');
    if (xMark) {
      tl.fromTo(xMark,
        { opacity: 0, scale: 0, rotation: -180 },
        { opacity: 1, scale: 1, rotation: 45, duration: 0.18, ease: 'back.out(2)' },
        0.5
      );
    }

    st = ScrollTrigger.create({
      trigger: '.hero-wrap',
      start: 'top top',
      end: 'bottom bottom',
    });

    // 리사이즈 후 현재 스크롤 위치에 즉시 맞춤 (깜빡임 방지)
    if (st.end > st.start) {
      const p = gsap.utils.clamp(0, 1, (lenis.scroll - st.start) / (st.end - st.start));
      tl.progress(p);
    }

    // lenis.scroll(lerp된 값)로 직접 구동 → Lenis easing이 그대로 전달됨, pin 충격 없음
    tickerFn = () => {
      if (!st || st.end <= st.start) return;
      const p = gsap.utils.clamp(0, 1, (lenis.scroll - st.start) / (st.end - st.start));
      tl.progress(p);
    };
    gsap.ticker.add(tickerFn);

    // font-size 변경 후 frame 위치 재계산
    updateFrame();
  }

  document.fonts.ready.then(() => {
    build();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    });
  });
}

// =============================
// Footer Scale Reveal
// =============================
function initFooterScale() {
  const footer = document.querySelector('.footer');
  const statement = document.querySelector('.statement');
  if (!footer || !statement) return;

  const sparkle = document.querySelector('.footer__sparkle');
  let sparkleShown = false;
  if (sparkle) gsap.set(sparkle, { opacity: 0, scale: 0, rotation: -180 });

  gsap.fromTo(footer,
    { scale: 0.92, transformOrigin: 'center bottom' },
    {
      scale: 1,
      transformOrigin: 'center bottom',
      ease: 'none',
      scrollTrigger: {
        trigger: '.statement',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          if (!sparkle) return;
          if (self.progress >= 0.85 && !sparkleShown) {
            sparkleShown = true;
            gsap.to(sparkle, { opacity: 1, scale: 1, rotation: 45, duration: 0.5, ease: 'back.out(2)' });
          } else if (self.progress < 0.85 && sparkleShown) {
            sparkleShown = false;
            gsap.to(sparkle, { opacity: 0, scale: 0, rotation: -180, duration: 0.3, ease: 'power2.in' });
          }
        },
      }
    }
  );
}

// =============================
// Footer — Hobby Popcorn
// =============================
function initHobbyPopcorn() {
  const btn = document.getElementById('hobbyBtn');
  const container = document.getElementById('hobbyPopcorn');
  if (!btn || !container || typeof Matter === 'undefined') return;

  // 아이콘 shape 따라 베이지 아웃라인 SVG 필터
  if (!document.getElementById('icon-outline-filter')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'icon-outline-filter');
    svg.style.cssText = 'position:absolute;width:0;height:0;';
    svg.innerHTML = `<defs><filter id="icon-outline" color-interpolation-filters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology operator="dilate" radius="3" in="SourceAlpha" result="expanded"/>
      <feFlood flood-color="#ffffff" flood-opacity="0.4" result="color"/>
      <feComposite in="color" in2="expanded" operator="in" result="outline"/>
      <feMerge><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter></defs>`;
    document.body.appendChild(svg);
  }

  const { Engine, Runner, Bodies, Body, World, Events } = Matter;

  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 2;
  const runner = Runner.create();
  Runner.run(runner, engine);

  const isMobile = window.innerWidth <= 768;
  const S = isMobile ? 0.6 : 1;
  const ICONS = [
    `<img src="assets/images/netflix-icon.png" height="${Math.round(54*S)}" style="display:block;width:auto;">`,
    `<img src="assets/images/pepsi-icon.png" width="${Math.round(54*S)}" height="${Math.round(54*S)}" style="display:block;">`,
    `<img src="assets/images/hanwha-icon.svg" height="${Math.round(54*S)}" style="display:block;width:auto;">`,
    `<img src="assets/images/claude-icon.svg" width="${Math.round(54*S)}" height="${Math.round(54*S)}" style="display:block;">`,
    `<img src="assets/images/github-icon.png" width="${Math.round(54*S)}" height="${Math.round(54*S)}" style="display:block;">`,
    `<img src="assets/images/vscode-icon.svg" width="${Math.round(54*S)}" height="${Math.round(54*S)}" style="display:block;">`,
    `<img src="assets/images/chimchakman-icon.svg" width="${Math.round(44*S)}" height="${Math.round(44*S)}" style="display:block;">`,
    `<img src="assets/images/slack-icon.svg" width="${Math.round(44*S)}" height="${Math.round(44*S)}" style="display:block;">`,
    `<img src="assets/images/riot-icon.svg" width="${Math.round(42*S)}" height="${Math.round(42*S)}" style="display:block;">`,
    `<img src="assets/images/notion-icon.svg" width="${Math.round(46*S)}" height="${Math.round(46*S)}" style="display:block;">`,
    `<img src="assets/images/youtube-icon.svg" height="${Math.round(32*S)}" style="display:block;width:auto;">`,
    `<img src="assets/images/obsidian-icon.svg" width="${Math.round(44*S)}" height="${Math.round(44*S)}" style="display:block;">`,
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

  function spawnIcons() {
    initStatics();
    const count = Math.floor(Math.random() * 2) + 2;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const bx = bRect.left - cRect.left + bRect.width / 2;
    const by = bRect.top - cRect.top + bRect.height / 2;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const body = Bodies.circle(bx, by, Math.round(27 * S), {
          restitution: 0.4,
          friction: 0.5,
          frictionAir: 0.008,
          density: 0.004,
        });
        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 20,
          y: -(4 + Math.random() * 4),
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.5);
        World.add(engine.world, body);

        const el = document.createElement('div');
        el.innerHTML = ICONS[Math.floor(Math.random() * ICONS.length)];
        el.style.cssText = `position:absolute;pointer-events:none;user-select:none;will-change:transform;left:${bx}px;top:${by}px;transform:translate(-50%,-50%);filter:url(#icon-outline);`;
        container.appendChild(el);
        active.push({ body, el });
      }, i * 65);
    }
  }

  // 버튼 초기 중앙 위치 설정
  function centerBtn() {
    const cW = container.offsetWidth;
    const cH = container.offsetHeight;
    btn.style.left = (cW / 2 - btn.offsetWidth / 2) + 'px';
    btn.style.top  = (cH / 2 - btn.offsetHeight / 2) + 'px';
  }
  centerBtn();
  window.addEventListener('resize', centerBtn);

  // 드래그 + 쉐이크 감지
  let isDragging = false;
  let offsetX = 0, offsetY = 0;
  let lastX = 0;
  let lastDir = 0;
  let dirChanges = 0;
  let lastDirChangeTime = 0;

  function getClient(e) {
    return e.touches
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
  }

  btn.addEventListener('click', spawnIcons);
  btn.addEventListener('mousedown', startDrag);

  function startDrag(e) {
    isDragging = true;
    const { x, y } = getClient(e);
    const bRect = btn.getBoundingClientRect();
    offsetX = x - bRect.left;
    offsetY = y - bRect.top;
    lastX = x;
    lastDir = 0;
    dirChanges = 0;
    btn.style.transition = 'none';
    btn.style.cursor = 'grabbing';
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
  }

  function onDrag(e) {
    if (!isDragging) return;
    const { x, y } = getClient(e);
    const cRect = container.getBoundingClientRect();
    const dx = x - lastX;
    lastX = x;

    // 컨테이너 내 위치 이동 (경계 클램프)
    const newLeft = Math.min(Math.max(x - cRect.left - offsetX, 0), cRect.width  - btn.offsetWidth);
    const newTop  = Math.min(Math.max(y - cRect.top  - offsetY, 0), cRect.height - btn.offsetHeight);
    btn.style.left = newLeft + 'px';
    btn.style.top  = newTop  + 'px';

    // 쉐이크 감지
    if (Math.abs(dx) > 4) {
      const dir = dx > 0 ? 1 : -1;
      const now = Date.now();
      if (lastDir !== 0 && dir !== lastDir && now - lastDirChangeTime < 300) {
        dirChanges++;
        if (dirChanges >= 2) {
          spawnIcons();
          dirChanges = 0;
        }
      }
      lastDir = dir;
      lastDirChangeTime = now;
    }
  }

  function endDrag() {
    isDragging = false;
    btn.style.cursor = 'pointer';
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
  }
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
