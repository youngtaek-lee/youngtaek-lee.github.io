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

  // 글자 분해 + 스태거 애니메이션
  document.querySelectorAll(
    '.hero__label, .hero__title, .section__label, .section__title, .about__summary'
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

  // hero desc / actions (로드 후 딜레이 등장)
  gsap.from('.hero__desc', { opacity: 0, y: 20, duration: 0.6, ease: EASE, delay: 0.4 });
  gsap.from('.hero__actions', { opacity: 0, y: 20, duration: 0.6, ease: EASE, delay: 0.6 });
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
// 다크모드 토글
// =============================
const ICON_SUN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const ICON_MOON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

function initTheme() {
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme') || 'light';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (btn) btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
    localStorage.setItem('theme', theme);
  }

  apply(saved);

  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      apply(current === 'dark' ? 'light' : 'dark');
    });
  }
}

// =============================
// Header
// =============================
function initHeader() {
  const header = document.querySelector('.header');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      header.classList.add('is-visible');
    });
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

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}

// =============================
// Init
// =============================
document.addEventListener('DOMContentLoaded', () => {
  renderWorks();
  initModal();
  initHeader();
  initTheme();
  initAnimations();
  initLenis();
});
