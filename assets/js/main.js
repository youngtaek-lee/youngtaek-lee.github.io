// =============================
// Background Blob (Three.js)
// =============================
function initBgMesh() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  // 가장자리가 자연스럽게 투명해지는 소프트 셰이더
  const vShader = `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uAmp;
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec3 pos = position;
      float d =
        sin(pos.x * 1.8 + uTime * uSpeed)        * uAmp +
        sin(pos.y * 2.2 + uTime * uSpeed * 1.4)  * uAmp +
        sin(pos.z * 1.6 + uTime * uSpeed * 0.9)  * uAmp * 0.7;
      pos += normal * d;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;
  const fShader = `
    uniform vec3  uColor;
    uniform float uOpacity;
    varying vec3  vNormal;
    void main() {
      float rim   = clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
      float alpha = pow(rim, 1.4) * uOpacity;
      gl_FragColor = vec4(uColor, alpha);
    }
  `;

  function makeBlob(radius, color, x, y, z, speed, amp, opacity) {
    const geo = new THREE.SphereGeometry(radius, 64, 64);
    const mat = new THREE.ShaderMaterial({
      vertexShader: vShader,
      fragmentShader: fShader,
      uniforms: {
        uTime:    { value: 0 },
        uSpeed:   { value: speed },
        uAmp:     { value: amp },
        uColor:   { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  const blobs = [
    makeBlob(3.2, '#3d5a47', -1.8,  0.6,  0,    0.7,  0.42, 0.9),
    makeBlob(2.6, '#5bc8d8',  2.2, -0.4, -0.5,  0.6,  0.36, 0.55),
    makeBlob(2.0, '#1e3d30',  0.4, -1.8,  0.3,  0.85, 0.32, 0.65),
  ];

  let t = 0;
  function tick() {
    requestAnimationFrame(tick);
    t += 0.01;
    blobs.forEach((b, i) => {
      b.material.uniforms.uTime.value = t + i * 1.5;
      b.rotation.y += 0.003 * (i % 2 === 0 ? 1 : -1);
      b.rotation.x += 0.0015;
    });
    renderer.render(scene, camera);
  }
  tick();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}

// =============================
// 텍스트 글자 분해 (split-text)
// =============================
function splitText(el) {
  const text = el.textContent.trim();
  el.textContent = '';
  el.setAttribute('aria-label', text);

  [...text].forEach((char) => {
    const span = document.createElement('span');
    span.className = char === ' ' ? 'char char--space' : 'char';
    span.textContent = char;
    span.setAttribute('aria-hidden', 'true');
    el.appendChild(span);
  });

  return el.querySelectorAll('.char:not(.char--space)');
}

// =============================
// 애니메이션 (GSAP + ScrollTrigger)
// =============================
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  const EASE = 'power2.out';
  const TRIGGER_START = 'top 88%';

  // 섹션 라디우스 → sticky 닿으면 0

  // 글자 분해 + 스태거 애니메이션
  document.querySelectorAll(
    '.section__label, .section__title, .about__summary'
  ).forEach((el) => {
    const chars = splitText(el);
    gsap.from(chars, {
      opacity: 0,
      y: '0.6em',
      duration: 0.6,
      ease: EASE,
      stagger: 0.025,
      scrollTrigger: { trigger: el, start: TRIGGER_START },
    });
  });

  // About 카드 슬라이드업
  gsap.to('.about__card', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.about__card',
      start: 'top 85%',
    },
  });

  // 블록 단위 fade-up
  document.querySelectorAll('.anim-fade-up').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: EASE,
      scrollTrigger: { trigger: el, start: TRIGGER_START },
    });
  });

  // 블록 단위 slide
  document.querySelectorAll('.anim-slide-left').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      x: -24,
      duration: 0.6,
      ease: EASE,
      scrollTrigger: { trigger: el, start: TRIGGER_START },
    });
  });

  document.querySelectorAll('.anim-slide-right').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      x: 24,
      duration: 0.6,
      ease: EASE,
      scrollTrigger: { trigger: el, start: TRIGGER_START },
    });
  });

  // hero 패럴렉스
  const heroTrigger = {
    trigger: '.hero',
    start: 'top top',
    end: '60% top',
    scrub: 0.4,
  };

  gsap.to('.hero__name', { y: -400, ease: 'power2.in', scrollTrigger: heroTrigger });
  gsap.to('.hero__cta', { y: -500, ease: 'power2.in', scrollTrigger: heroTrigger });
}


// =============================
// 클라이언트 데이터
// =============================
const clients = [
  { name: '사세',                    file: 'sase.png' },
  { name: '오산대학교',              file: 'osan.png' },
  { name: '플레이윈터',              file: 'playwinter.png' },
  { name: '레이머티리얼즈',          file: 'raymats.png' },
  { name: '벡셀',                    file: 'bexel.png' },
  { name: '세경대학교',              file: 'saekyung.png' },
  { name: '성공회대 첨단융합디자인센터', file: 'skhu-acdc.png' },
  { name: '인터메타',                file: 'intermeta.png' },
  { name: '총신대학교 교수학습지원센터', file: 'chongshin.png' },
  { name: '비영리조직평가원 KINE',   file: 'kine.png' },
  { name: '마르시스',                file: 'marusys.svg' },
  { name: '충남공공디자인센터',      file: 'cpdc.png' },
  { name: '삼성이앤씨',              file: 'samsung-enc.png' },
  { name: '멘토스쿨',                file: 'mentorschool.png' },
  { name: '사단법인 하희',           file: 'hahee.png' },
  { name: '굿씨상담센터',            file: 'goodseed.png' },
  { name: '교농',                    file: 'kyonong.png' },
  { name: '영음예술기획',            file: 'youngeum.png' },
  { name: '남원시조합공동사업',      file: 'namwon.png' },
  { name: '축산박람회',              file: 'livestock.png' },
  { name: '하남시민에너지협동조합',  file: 'hnam-energy.png' },
  { name: '기획인애드',              file: 'ghi.png' },
];

// =============================
// Clients 마퀴 렌더링
// =============================
function renderClients() {
  const track = document.getElementById('clientsTrack');
  if (!track) return;

  // 두 벌 복사 → 끊김 없는 루프
  const items = [...clients, ...clients]
    .map(({ name, file }) => `
      <span class="clients__item">
        <img src="assets/images/clients/${file}" alt="${name}" class="clients__logo" />
      </span>`)
    .join('');

  track.innerHTML = items;
}

// =============================
// 프로젝트 데이터
// =============================
const works = [
  {
    id: 'sase',
    name: '사세',
    thumb: 'assets/images/works/sase.jpg',
    url: 'https://www.sase.co.kr/html/index/',
    tags: ['퍼블리싱', '유지보수'],
    desc: '가장 오랜 기간 유지보수를 담당한 프로젝트입니다. 메인 개편, 기능 추가·제거, 자잘한 수정까지 지속적으로 대응했습니다.',
  },
  {
    id: 'raymats',
    name: '레이머티리얼즈',
    thumb: 'assets/images/works/raymats.jpg',
    url: 'https://raymats.com/html/index/',
    tags: ['퍼블리싱', '유지보수'],
    desc: '퍼블리싱 완료 후 메인 영상 섹션 추가 작업을 진행했습니다. 추가 요청이 적었고 깔끔하게 마무리된 프로젝트입니다.',
  },
  {
    id: 'marusys',
    name: '마르시스',
    thumb: 'assets/images/works/marusys.jpg',
    url: 'https://www.marusys.com/html/index/index.php',
    tags: ['퍼블리싱', '유지보수'],
    desc: 'fullpage.js를 활용해 섹션 전환 방식으로 구현했습니다. 라이브러리 기반 레이아웃 구성 및 유지보수를 담당했습니다.',
  },
  {
    id: 'bexel',
    name: '벡셀',
    thumb: 'assets/images/works/bexel.jpg',
    url: 'https://www.bexel.co.kr/html/index/index.php',
    tags: ['퍼블리싱', '유지보수'],
    desc: '제품 수가 많아 리스트 구조와 배치를 어떻게 효율적으로 잡을지 고민이 많았던 프로젝트입니다.',
  },
  {
    id: 'cpdc',
    name: '충남공공디자인센터',
    thumb: 'assets/images/works/cpdc.jpg',
    url: 'https://www.cpdc.re.kr/html/index/',
    tags: ['퍼블리싱', '유지보수'],
    desc: '메인 페이지에 SVG 아이콘 애니메이션 구현 요청이 있었습니다. 공공기관 특성에 맞게 접근성을 고려해 작업했습니다.',
  },
  {
    id: 'optimedi',
    name: '옵티메디',
    thumb: 'assets/images/works/optimedi.jpg',
    url: 'https://www.optimedi.kr/',
    tags: ['퍼블리싱'],
    desc: '스크롤 진행도를 나타내는 게이지바를 구현했습니다. 최대한 심플하게 표현해달라는 요청에 맞춰 작업했습니다.',
  },
  {
    id: 'ghi',
    name: '기획인애드',
    thumb: 'assets/images/works/ghi.jpg',
    url: 'http://ghi.co.kr/html/index/',
    tags: ['퍼블리싱', '유지보수'],
    desc: '메인에 영상을 전면 배치하고 fullpage.js로 섹션을 구성했습니다. 영상 재생과 fullpage 전환이 자연스럽게 연결되도록 작업했습니다.',
  },
];

// =============================
// Works 카드 렌더링
// =============================
function renderWorks() {
  const grid = document.querySelector('.works__grid');
  if (!grid) return;

  grid.innerHTML = works
    .map(
      (work) => `
    <article class="work-card" data-id="${work.id}">
      <div class="work-card__thumb">
        <img src="${work.thumb}" alt="${work.name} 스크린샷" loading="lazy" />
      </div>
      <div class="work-card__info">
        <h3 class="work-card__name">${work.name}</h3>
        <div class="work-card__tags">
          ${work.tags
            .map(
              (tag) =>
                `<span class="work-card__tag ${tag === '유지보수' ? 'work-card__tag--accent' : ''}">${tag}</span>`
            )
            .join('')}
        </div>
      </div>
    </article>
  `
    )
    .join('');
}

// =============================
// Modal
// =============================
function openModal(id) {
  const work = works.find((w) => w.id === id);
  if (!work) return;

  const overlay = document.querySelector('.modal-overlay');
  const modal = overlay.querySelector('.modal');

  modal.querySelector('.modal__title').textContent = work.name;
  modal.querySelector('.modal__img').src = work.thumb;
  modal.querySelector('.modal__img').alt = work.name;
  modal.querySelector('.modal__desc').textContent = work.desc;

  const metaEl = modal.querySelector('.modal__meta');
  metaEl.innerHTML = work.tags
    .map(
      (tag) =>
        `<span class="work-card__tag ${tag === '유지보수' ? 'work-card__tag--accent' : ''}">${tag}</span>`
    )
    .join('');

  modal.querySelector('.modal__link').href = work.url;

  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function initModal() {
  const overlay = document.querySelector('.modal-overlay');

  document.querySelector('.works__grid').addEventListener('click', (e) => {
    const card = e.target.closest('.work-card');
    if (card) openModal(card.dataset.id);
  });

  overlay.querySelector('.modal__close').addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}


// =============================
// Menu Overlay
// =============================
function initMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');
  const menuBackdrop = document.getElementById('menuBackdrop');

  const links = menuOverlay.querySelectorAll('.menu-overlay__link');

  function openMenu() {
    menuOverlay.classList.add('is-open');
    menuOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    gsap.fromTo(links,
      { opacity: 0, x: 24 },
      { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out', stagger: 0.12, delay: 0.3 }
    );
  }

  function closeMenu() {
    gsap.to(links, { opacity: 0, x: 24, duration: 0.2, ease: 'power2.in', stagger: 0.06 });
    menuOverlay.classList.remove('is-open');
    menuOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  menuBackdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  menuOverlay.querySelectorAll('.menu-overlay__link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

// =============================
// Header + Bottom Nav
// =============================
function initHeader(lenis) {
  const header = document.querySelector('.header');
  const bottomNav = document.getElementById('bottomNav');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const HEADER_THRESHOLD = 60;
  const NAV_THRESHOLD = 60;
  const BOTTOM_THRESHOLD = 120;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      header.classList.add('is-visible');
    });
  });

  let fadeTimer = null;

  function fadeInHeader() {
    clearTimeout(fadeTimer);
    header.style.transition = 'none';
    header.style.transform = 'translateY(0)';
    header.style.opacity = '0';
    header.offsetHeight; // reflow
    header.classList.remove('is-hidden');
    header.style.transition = 'opacity 0.5s ease';
    header.style.opacity = '1';
    fadeTimer = setTimeout(() => {
      header.style.transition = '';
      header.style.transform = '';
      header.style.opacity = '';
    }, 550);
  }

  let prevHeaderShouldHide = false;

  lenis.on('scroll', ({ scroll, limit }) => {
    const headerShouldHide = scroll > HEADER_THRESHOLD;
    const navShouldShow = scroll > NAV_THRESHOLD && scroll < limit - BOTTOM_THRESHOLD;

    if (headerShouldHide && !prevHeaderShouldHide) {
      clearTimeout(fadeTimer);
      header.style.transition = '';
      header.style.transform = '';
      header.classList.add('is-hidden');
    } else if (!headerShouldHide && prevHeaderShouldHide) {
      fadeInHeader();
    }
    prevHeaderShouldHide = headerShouldHide;

    navShouldShow
      ? bottomNav.classList.add('is-visible')
      : bottomNav.classList.remove('is-visible');
  });

  scrollTopBtn.addEventListener('click', () => {
    lenis.scrollTo(0);
  });
}


// =============================
// Lenis 스무스 스크롤
// =============================
function initLenis() {
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    touchInertiaExponent: 1.7,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    overscroll: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// =============================
// Hero 입장 애니메이션
// =============================
function initHeroEntrance() {
  const nameLines = document.querySelectorAll('.hero__name-line');

  gsap.to(nameLines, {
    backgroundSize: '100% 100%',
    duration: 1,
    ease: 'power2.out',
    stagger: 0.1,
    delay: 0.2,
  });

  gsap.fromTo('.hero__cta',
    { opacity: 0 },
    { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 1.5 }
  );
}

// =============================
// Init
// =============================
document.addEventListener('DOMContentLoaded', () => {
  initBgMesh();
  renderClients();
  renderWorks();
  initModal();
  initMenu();
  initHeroEntrance();
  initAnimations();
  const lenis = initLenis();
  initHeader(lenis);
});
