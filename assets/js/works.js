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
      <div class="works-panel__img-wrap">
        <img class="works-panel__img works-panel__img--a" src="" alt="" />
        <img class="works-panel__img works-panel__img--b" src="" alt="" />
      </div>
    </div>
  `;

  const ul = track.querySelector('.works-list');
  const imgA = track.querySelector('.works-panel__img--a');
  const imgB = track.querySelector('.works-panel__img--b');

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

  let activeIndex = -1;

  // 매번 현재 y값 기준으로 "더 보이는 쪽"을 current로 판단 → 빠른 전환 시 방향 오류 방지
  function getVisiblePair() {
    const yA = Math.abs(parseFloat(gsap.getProperty(imgA, 'y')) || 0);
    const yB = Math.abs(parseFloat(gsap.getProperty(imgB, 'y')) || 0);
    return yA <= yB ? [imgA, imgB] : [imgB, imgA];
  }

  function updatePanel(i, animate = true) {
    if (i === activeIndex) return;
    const work = works[i];
    activeIndex = i;

    ul.querySelectorAll('.works-list__item').forEach((item, idx) => {
      item.classList.toggle('is-active', idx === i);
    });

    gsap.killTweensOf([imgA, imgB]);

    if (!animate) {
      imgA.src = work.main;
      imgA.alt = work.title;
      gsap.set(imgA, { y: '0%', zIndex: 1 });
      gsap.set(imgB, { y: '100%', zIndex: 0 });
      return;
    }

    const [currentImg, nextImg] = getVisiblePair();

    nextImg.src = work.main;
    nextImg.alt = work.title;
    gsap.set(nextImg,    { y: '100%', zIndex: 1 });
    gsap.set(currentImg, { zIndex: 0 });

    gsap.to(nextImg,    { y: '0%',    duration: 0.5, ease: 'power2.out' });
    gsap.to(currentImg, { y: '-100%', duration: 0.5, ease: 'power2.out' });
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

  updatePanel(0, false);

  ul.querySelectorAll('.works-list__item').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      updatePanel(parseInt(item.dataset.index));
    });
  });
}
