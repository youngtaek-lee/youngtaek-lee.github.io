// =============================
// 프로젝트 데이터
// =============================
const works = [
  { id: 'sase',     title: 'Sase',     name: '사세',          category: 'Food & Beverage',  year: 2023, main: 'assets/images/works/사세 메인캡쳐.png',       url: 'https://www.sase.co.kr/html/index/' },
  { id: 'bexel',    title: 'Bexel',    name: '벡셀',          category: 'Electronics',      year: 2024, main: 'assets/images/works/벡셀 메인.png',           url: 'https://www.bexel.co.kr/html/index/index.php' },
  { id: 'marusys',  title: 'Marusys',  name: '마르시스',      category: 'IT · Embedded',    year: 2023, main: 'assets/images/works/마르시스 메인.png',        url: 'https://www.marusys.com/html/index/index.php' },
  { id: 'raymats',  title: 'Raymats',  name: '레이머티리얼즈', category: 'Materials',         year: 2024, main: 'assets/images/works/레이머터리얼즈 메인.png',   url: 'https://raymats.com/html/index/' },
  { id: 'optimedi', title: 'Optimedi', name: '옵티메디',      category: 'Medical Device',   year: 2024, main: 'assets/images/works/옵티메디 메인.png',        url: 'https://www.optimedi.kr/' },
  { id: 'ghi',      title: 'GHI',      name: '기획인애드',    category: 'Advertising',      year: 2023, main: 'assets/images/works/기획인애드 메인.png',      url: 'http://ghi.co.kr/html/index/' },
];

// =============================
// Works 렌더링
// =============================
function renderWorks() {
  const track = document.querySelector('.works__track');
  if (!track) return;

  track.innerHTML = `
    <ul class="works-list"></ul>
    <div class="works-panel">
      <div class="works-panel__img-wrap"></div>
    </div>
  `;

  const ul       = track.querySelector('.works-list');
  const imgWrap  = track.querySelector('.works-panel__img-wrap');
  imgWrap.innerHTML = `
    <div class="works-panel__placeholder">
      <div class="works-panel__logo"><span>Lee</span><span>Young</span><span>Taek.</span></div>
    </div>
  `;
  const MAX      = 3;
  const stack    = [];
  let activeIndex = -1;

  works.forEach((work, i) => {
    const li = document.createElement('li');
    li.className = 'works-list__item';
    li.dataset.index = i;
    li.innerHTML = `
      <span class="works-list__title">
        <span class="works-list__title-en">${work.title}</span>
        <span class="works-list__title-ko">${work.name}</span>
      </span>
      <span class="works-list__meta">${work.category} · ${work.year}</span>
    `;
    ul.appendChild(li);
  });

  function updatePanel(i) {
    if (i === activeIndex) return;
    activeIndex = i;
    const work = works[i];

    ul.querySelectorAll('.works-list__item').forEach((item, idx) => {
      item.classList.toggle('is-active', idx === i);
    });

    // 스택 꽉 차면 가장 오래된 것 페이드아웃 후 제거
    if (stack.length >= MAX) {
      const oldest = stack.shift();
      gsap.to(oldest, { opacity: 0, duration: 0.25, onComplete: () => oldest.remove() });
    }

    const img = document.createElement('img');
    img.className = 'works-panel__img';
    img.alt = work.title;
    img.style.zIndex = stack.length + 1;
    gsap.set(img, { y: '100%' });
    imgWrap.appendChild(img);
    stack.push(img);

    img.onload = () => {
      imgWrap.classList.add('has-image');
      gsap.to(img, { y: '0%', duration: 0.5, ease: 'power2.out' });
    };
    img.src = work.main;
  }

  const moreItem = document.createElement('li');
  moreItem.className = 'works-list__item works-list__item--more';
  moreItem.innerHTML = `
    <span class="works-list__title">
      <span class="works-list__title-en">More Works</span>
      <span class="works-list__title-ko">더 많은 작업물보기</span>
    </span>
    <span class="works-list__more-plus">+</span>
  `;
  ul.appendChild(moreItem);

  ul.querySelectorAll('.works-list__item').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const idx = parseInt(item.dataset.index);
      if (!isNaN(idx)) updatePanel(idx);
    });
  });

}

// =============================
// Works 패널 smooth follow
// =============================
function initWorksPanelFollow(lenis) {
  const panel = document.querySelector('.works-panel');
  const wrap  = document.querySelector('.works__track-wrap');
  if (!panel || !wrap) return;

  const TOP = 120;
  const panelInitialTop = panel.getBoundingClientRect().top - wrap.getBoundingClientRect().top;
  const snapY = gsap.quickTo(panel, 'y', { duration: 0.6, ease: 'power3.out' });

  lenis.on('scroll', () => {
    const wrapRect = wrap.getBoundingClientRect();
    const raw = -wrapRect.top + TOP;
    const max = wrap.offsetHeight - panelInitialTop - panel.offsetHeight - TOP;
    snapY(Math.max(0, Math.min(raw, max)));
  });
}
