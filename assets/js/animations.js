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
  const sparkleFxd = document.querySelector('.header__sparkle-fixed');
  if (sparkleFxd && header) {
    sparkleFxd.style.height = header.offsetHeight + 'px';
    syncSparklePosition();
    window.addEventListener('resize', () => {
      sparkleFxd.style.height = header.offsetHeight + 'px';
      syncSparklePosition();
    });
  }
}

// 헤더 nav가 비대칭 레이아웃(About/Works/토글)이라 sparkle의 실제 가로 위치가
// 뷰포트 중앙과 다름 — 인비저블 sparkle의 실측 위치를 fixed 트윈에 동기화
function syncSparklePosition() {
  const sparkle = document.querySelector('.header__sparkle');
  const sparkleFxd = document.querySelector('.header__sparkle-fixed');
  if (!sparkle || !sparkleFxd) return;
  const rect = sparkle.getBoundingClientRect();
  sparkleFxd.style.left = (rect.left + rect.width / 2) + 'px';
}

// =============================
// Header 입장 — 커튼 중간 지점(__onCurtainMid)에 맞춰 히어로 텍스트와 동일한 슬라이드+페이드
// =============================
let __headerRevealed = false;
function revealHeader() {
  if (__headerRevealed) return;
  __headerRevealed = true;

  const header = document.querySelector('.header');
  const sparkleFxd = document.querySelector('.header__sparkle-fixed');

  if (header) {
    gsap.fromTo(header,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
    );
  }
  if (sparkleFxd) {
    gsap.fromTo(sparkleFxd,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
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

  // 리스트 아이템 왼쪽 등장 (홈페이지 전용 — 서브페이지 .works__item과 분리)
  const items = document.querySelectorAll('#home-view .works__item');
  if (items.length) {
    const listTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#home-view .works__list',
        start: 'top 95%',
        end: 'center 60%',
        scrub: 1,
      }
    });
    items.forEach((item, i) => {
      listTl.from(item, { x: 150, ease: 'none', duration: 1, clearProps: 'transform' }, i * 0.12);
    });
  }
}

// =============================
// Hero → Dark 전환 (비활성화 — CSS 변수로 처리)
// =============================
let _darkTransitionTl = null;

function initDarkTransition() {
  return;
}

function refreshDarkTransition() {
  ScrollTrigger.getById('dark-transition')?.kill();
  if (_darkTransitionTl) {
    _darkTransitionTl.kill();
    _darkTransitionTl = null;
  }
  gsap.set(
    ['main', '.about-text', 'body', '.header__logo', '.header__nav',
     '.header__nav-btn', '.menu-btn', '.header__menu-btn', '.theme-toggle'],
    { clearProps: 'all' }
  );
  initDarkTransition();
}

// =============================
// Hero/About/Works 스크롤 색상 리빌 — 테마 색상 반영
// =============================
let _colorRevealTls = [];

function getThemeColors() {
  const cs = getComputedStyle(document.documentElement);
  const isSummer = document.documentElement.getAttribute('data-theme') === 'summer';
  return {
    bg: cs.getPropertyValue('--color-bg').trim(),
    text: cs.getPropertyValue('--color-text').trim(),
    taglineStart: isSummer
      ? cs.getPropertyValue('--color-accent').trim()
      : cs.getPropertyValue('--color-text').trim(),
  };
}

function initScrollColorReveals() {
  const { bg, text, taglineStart } = getThemeColors();

  _colorRevealTls.push(
    gsap.timeline({
      scrollTrigger: { id: 'color-reveal-hero', trigger: '.hero-wrap', start: 'bottom bottom', end: 'bottom top', scrub: 1 },
    }).fromTo('main', { backgroundColor: bg }, { backgroundColor: text, ease: 'none' })
      .fromTo('.hero__tagline', { color: taglineStart }, { color: bg, ease: 'none' }, 0)
  );

  _colorRevealTls.push(
    gsap.timeline({
      scrollTrigger: { id: 'color-reveal-about', trigger: '.about-text', start: 'top bottom', end: 'top center', scrub: 1 },
    }).fromTo('.about-text__label, .about__word', { color: text }, { color: bg, ease: 'none' })
  );
}

function refreshScrollColorReveals() {
  ['color-reveal-hero', 'color-reveal-about'].forEach(id => ScrollTrigger.getById(id)?.kill());
  _colorRevealTls.forEach(tl => tl.kill());
  _colorRevealTls = [];
  gsap.set(
    ['main', '.hero__tagline', '.about-text__label', '.about__word'],
    { clearProps: 'backgroundColor,color' }
  );
  initScrollColorReveals();
  ScrollTrigger.refresh();
}

// =============================
// Footer Big 텍스트 — 높이 기준 fit
// =============================
function initFooterBig() {
  const top = document.querySelector('.footer__top');
  const big = document.querySelector('.footer__big');
  const footer = document.querySelector('.footer');
  if (!top || !big || !footer) return;

  function fit() {
    // JS 오버라이드 초기화 → CSS 기본값(50vh)으로 리플로우
    document.documentElement.style.removeProperty('--footer-height');

    // 텍스트 제거 후 footer__top 순수 높이 측정
    big.style.display = 'none';
    const availH = top.clientHeight;
    big.style.display = '';

    // CSS vw 기반 너비 제약값 측정
    big.style.fontSize = '';
    const cssSize = parseFloat(getComputedStyle(big).fontSize);

    // 높이와 너비 중 작은 쪽으로 확정
    big.style.fontSize = Math.min(availH, cssSize) + 'px';

    // offsetHeight 읽기 자체가 동기 reflow 강제 → rAF 불필요
    document.documentElement.style.setProperty('--footer-height', footer.offsetHeight + 'px');
    ScrollTrigger.refresh();
    if (window.__lenis) window.__lenis.resize();
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
function initHeroTaglineScroll() {
  const title   = document.querySelector('.hero__title');
  const tagline = document.querySelector('.hero__tagline');
  if (!title || !tagline) return;

  function fitFontSize() {
    const cs    = getComputedStyle(tagline);
    const padH  = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const range = document.createRange();
    range.selectNodeContents(tagline);
    const textW  = range.getBoundingClientRect().width;
    const availW = title.clientWidth - padH;
    const curPx  = parseFloat(cs.fontSize);
    tagline.style.fontSize = ((curPx * availW / textW) / window.innerWidth * 100).toFixed(3) + 'vw';

    const titleH    = title.offsetHeight;
    const taglineH  = tagline.offsetHeight;
    const maxTaglineH = titleH - 40;
    if (taglineH > maxTaglineH && maxTaglineH > 0) {
      const newFontPx = parseFloat(getComputedStyle(tagline).fontSize) * (maxTaglineH / taglineH);
      tagline.style.fontSize = (newFontPx / window.innerWidth * 100).toFixed(3) + 'vw';
    }

  }

  document.fonts.ready.then(() => {
    fitFontSize();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitFontSize, 150);
    });
  });

  window.__heroTaglineRebuild = fitFontSize;
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
      <feFlood flood-color="#ffffff" flood-opacity="0.8" result="color"/>
      <feComposite in="color" in2="expanded" operator="in" result="outline"/>
      <feMerge><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter></defs>`;
    document.body.appendChild(svg);
  }

  const { Engine, Runner, Bodies, Body, World, Events } = Matter;

  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 1;
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
  let floor = null;
  let floorOpen = false;
  const FLOOR_BURST_LIMIT = 40;

  function initStatics() {
    if (statics) return;
    const W = container.offsetWidth;
    const H = container.offsetHeight;
    const T = 80;
    floor = Bodies.rectangle(W / 2, H - 30 + T / 2, W + 200, T, { isStatic: true, friction: 0.7, restitution: 0.2 });
    statics = [
      floor,
      Bodies.rectangle(-T / 2, H / 2, T, H * 10, { isStatic: true }),
      Bodies.rectangle(W + T / 2, H / 2, T, H * 10, { isStatic: true }),
    ];
    World.add(engine.world, statics);
  }

  Events.on(engine, 'afterUpdate', () => {
    const limit = container.offsetHeight + 300;

    const now = performance.now();
    const POP_MS = 220;

    if (!floorOpen && active.length >= FLOOR_BURST_LIMIT) {
      floorOpen = true;
      World.remove(engine.world, floor);
      for (const { body } of active) {
        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 8,
          y: -(2 + Math.random() * 3),
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
      }
    } else if (floorOpen && active.length === 0) {
      floorOpen = false;
      World.add(engine.world, floor);
    }

    for (let i = active.length - 1; i >= 0; i--) {
      const { body, el, born } = active[i];
      if (body.position.y > limit) {
        World.remove(engine.world, body);
        el.remove();
        active.splice(i, 1);
        continue;
      }
      const age = now - born;
      const t = Math.min(age / POP_MS, 1);
      const scale = t >= 1 ? 1 : 0.3 + 0.7 * (1 - Math.pow(1 - t, 3));
      el.style.left = body.position.x + 'px';
      el.style.top = body.position.y + 'px';
      el.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${body.angle}rad)`;
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
          x: (Math.random() - 0.5) * 10,
          y: -(5 + Math.random() * 5),
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
        World.add(engine.world, body);

        const el = document.createElement('div');
        el.innerHTML = ICONS[Math.floor(Math.random() * ICONS.length)];
        el.style.cssText = `position:absolute;pointer-events:none;user-select:none;will-change:transform,opacity;left:${bx}px;top:${by}px;transform:translate(-50%,-50%) scale(0.3);opacity:0;filter:url(#icon-outline);transition:opacity 0.25s ease-out;`;
        container.appendChild(el);
        requestAnimationFrame(() => { el.style.opacity = '1'; });
        active.push({ body, el, born: performance.now() });
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
  window.__centerHobbyBtn = centerBtn;

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
