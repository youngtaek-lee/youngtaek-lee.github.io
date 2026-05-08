// =============================
// 프로젝트 데이터
// =============================
const works = [
  { id: 'sase',     title: 'Sase',     name: '사세',           category: 'Food & Beverage', year: 2023, main: 'assets/images/works/사세 메인캡쳐.png',       url: 'https://www.sase.co.kr/html/index/' },
  { id: 'bexel',    title: 'Bexel',    name: '벡셀',           category: 'Electronics',     year: 2024, main: 'assets/images/works/벡셀 메인.png',           url: 'https://www.bexel.co.kr/html/index/index.php' },
  { id: 'marusys',  title: 'Marusys',  name: '마르시스',       category: 'IT · Embedded',   year: 2023, main: 'assets/images/works/마르시스 메인.png',        url: 'https://www.marusys.com/html/index/index.php' },
  { id: 'raymats',  title: 'Raymats',  name: '레이머티리얼즈', category: 'Materials',        year: 2024, main: 'assets/images/works/레이머터리얼즈 메인.png',   url: 'https://raymats.com/html/index/' },
  { id: 'optimedi', title: 'Optimedi', name: '옵티메디',       category: 'Medical Device',  year: 2024, main: 'assets/images/works/옵티메디 메인.png',        url: 'https://www.optimedi.kr/' },
  { id: 'ghi',      title: 'GHI',      name: '기획인애드',     category: 'Advertising',     year: 2023, main: 'assets/images/works/기획인애드 메인.png',      url: 'http://ghi.co.kr/html/index/' },
];

// =============================
// Works 썸네일 hover (정적 HTML용)
// =============================
function initWorksThumb() {
  const thumb = document.getElementById('works-thumb');
  if (!thumb) return;

  document.querySelectorAll('.works__item').forEach(li => {
    const href = li.querySelector('a')?.getAttribute('href') || '';
    const id = href.split('/').pop();
    const work = works.find(w => w.id === id);
    if (!work) return;

    li.addEventListener('mouseenter', () => {
      thumb.src = work.main;
      thumb.classList.add('is-visible');
    });
    li.addEventListener('mouseleave', () => {
      thumb.classList.remove('is-visible');
    });
  });

  document.addEventListener('mousemove', (e) => {
    gsap.to(thumb, {
      left: e.clientX,
      top: e.clientY,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });
}

// =============================
// Works 렌더링 — 라인 리스트
// =============================
function renderWorks() {
  const list  = document.getElementById('works-list');
  const thumb = document.getElementById('works-thumb');
  if (!list) return;

  works.forEach((work, i) => {
    const li = document.createElement('li');
    li.className = 'works__item';
    li.innerHTML = `
      <a href="/works/${work.id}" class="works__item__link">
        <span class="works__item__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="works__item__title">${work.title}</span>
        <span class="works__item__category">${work.category}</span>
        <span class="works__item__year">${work.year}</span>
      </a>
    `;

    if (thumb) {
      li.addEventListener('mouseenter', () => {
        thumb.src = work.main;
        thumb.classList.add('is-visible');
      });
      li.addEventListener('mouseleave', () => {
        thumb.classList.remove('is-visible');
      });
    }

    list.appendChild(li);
  });

  // 썸네일 커서 따라다니기
  if (thumb) {
    document.addEventListener('mousemove', (e) => {
      gsap.to(thumb, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  }
}
