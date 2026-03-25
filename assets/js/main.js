// =============================
// 스크롤 애니메이션 (IntersectionObserver)
// =============================
function initAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  const targets = document.querySelectorAll(
    '.anim-fade-up, .anim-fade-in, .anim-slide-left, .anim-slide-right'
  );
  targets.forEach((el) => observer.observe(el));
}

// =============================
// Works 수직스크롤 → 카드 수평이동
// =============================
function initWorksScroll() {
  const section = document.querySelector('#works');
  const grid = document.querySelector('.works__grid');
  if (!section || !grid) return;

  // 섹션 높이 = 카드 전체 가로 너비 + 여유 (스크롤 거리)
  function setSectionHeight() {
    const gridWidth = grid.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollDistance = gridWidth - viewportWidth + 120;
    section.style.height = `${window.innerHeight + scrollDistance}px`;
  }

  setSectionHeight();
  window.addEventListener('resize', setSectionHeight);

  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top - window.scrollY + section.getBoundingClientRect().top;

    // 섹션 시작 기준 스크롤 진행도 계산
    const scrolled = -section.getBoundingClientRect().top;
    const maxScroll = section.offsetHeight - window.innerHeight;

    if (scrolled < 0 || scrolled > maxScroll) return;

    const progress = scrolled / maxScroll;
    const gridWidth = grid.scrollWidth;
    const viewportWidth = window.innerWidth;
    const maxTranslate = -(gridWidth - viewportWidth + 120);

    grid.style.transform = `translateX(${maxTranslate * progress}px)`;
  });
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
    desc: '사세 공식 웹사이트 퍼블리싱 및 지속적인 유지보수 작업을 진행했습니다.',
  },
  {
    id: 'raymats',
    name: '레이머티리얼즈',
    thumb: 'assets/images/works/raymats.jpg',
    url: 'https://raymats.com/html/index/',
    tags: ['퍼블리싱', '유지보수'],
    desc: '레이머티리얼즈 공식 웹사이트 퍼블리싱 및 지속적인 유지보수 작업을 진행했습니다.',
  },
  {
    id: 'marusys',
    name: '마르시스',
    thumb: 'assets/images/works/marusys.jpg',
    url: 'https://www.marusys.com/html/index/index.php',
    tags: ['퍼블리싱', '유지보수'],
    desc: '마르시스 공식 웹사이트 퍼블리싱 및 지속적인 유지보수 작업을 진행했습니다.',
  },
  {
    id: 'bexel',
    name: '벡셀',
    thumb: 'assets/images/works/bexel.jpg',
    url: 'https://www.bexel.co.kr/html/index/index.php',
    tags: ['퍼블리싱', '유지보수'],
    desc: '벡셀 공식 웹사이트 퍼블리싱 및 지속적인 유지보수 작업을 진행했습니다.',
  },
  {
    id: 'cpdc',
    name: '충남공공디자인센터',
    thumb: 'assets/images/works/cpdc.jpg',
    url: 'https://www.cpdc.re.kr/html/index/',
    tags: ['퍼블리싱', '유지보수'],
    desc: '충남공공디자인센터 공식 웹사이트 퍼블리싱 및 지속적인 유지보수 작업을 진행했습니다.',
  },
  {
    id: 'optimedi',
    name: '옵티메디',
    thumb: 'assets/images/works/optimedi.jpg',
    url: 'https://www.optimedi.kr/',
    tags: ['퍼블리싱'],
    desc: '옵티메디 공식 웹사이트 퍼블리싱 작업을 진행했습니다.',
  },
  {
    id: 'ghi',
    name: '기획인애드',
    thumb: 'assets/images/works/ghi.jpg',
    url: 'http://ghi.co.kr/html/index/',
    tags: ['퍼블리싱', '유지보수'],
    desc: '기획인애드 공식 웹사이트 퍼블리싱 및 지속적인 유지보수 작업을 진행했습니다.',
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
    btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
    localStorage.setItem('theme', theme);
  }

  apply(saved);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    apply(current === 'dark' ? 'light' : 'dark');
  });
}

// =============================
// Header 스크롤 효과
// =============================
function initHeader() {
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });
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
  initWorksScroll();
});
