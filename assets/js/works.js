// =============================
// 프로젝트 데이터
// =============================
const works = [
  { id: 'sase',     title: 'Sase',     name: '사세',          category: 'IT Solutions', year: 2023, main: 'assets/images/works/사세 메인캡쳐.png',       url: 'https://www.sase.co.kr/html/index/' },
  { id: 'bexel',    title: 'Bexel',    name: '벡셀',          category: 'Electronics',  year: 2024, main: 'assets/images/works/벡셀 메인.png',           url: 'https://www.bexel.co.kr/html/index/index.php' },
  { id: 'marusys',  title: 'Marusys',  name: '마르시스',      category: 'EdTech',       year: 2023, main: 'assets/images/works/마르시스 메인.png',        url: 'https://www.marusys.com/html/index/index.php' },
  { id: 'raymats',  title: 'Raymats',  name: '레이머티리얼즈', category: 'Materials',    year: 2024, main: 'assets/images/works/레이머터리얼즈 메인.png',   url: 'https://raymats.com/html/index/' },
  { id: 'optimedi', title: 'Optimedi', name: '옵티메디',      category: 'Healthcare',   year: 2024, main: 'assets/images/works/옵티메디 메인.png',        url: 'https://www.optimedi.kr/' },
  { id: 'ghi',      title: 'GHI',      name: '기획인애드',    category: 'Advertising',  year: 2023, main: 'assets/images/works/기획인애드 메인.png',      url: 'http://ghi.co.kr/html/index/' },
];

// =============================
// Works 렌더링 + 수평 스크롤
// =============================
function renderWorks() {
  const track = document.querySelector('.works__track');
  if (!track) return;

  const ul = document.createElement('ul');
  ul.className = 'works-list';
  works.forEach((work, i) => {
    const li = document.createElement('li');
    li.className = 'works-list__item';
    li.dataset.index = i;
    li.innerHTML = `
      <span class="works-list__num">${String(i + 1).padStart(2, '0')}</span>
      <span class="works-list__title">
        <span class="works-list__title-en">${work.title}</span>
        <span class="works-list__title-ko">${work.name}</span>
      </span>
      <span class="works-list__meta">${work.category} · ${work.year}</span>
    `;
    ul.appendChild(li);
  });
  track.appendChild(ul);

  const thumb = document.createElement('div');
  thumb.id = 'worksThumb';
  thumb.innerHTML = '<img src="" alt="" />';
  document.body.appendChild(thumb);
  const thumbImg = thumb.querySelector('img');
  gsap.set(thumb, { opacity: 0, x: -999, y: -999 });

  ul.querySelectorAll('.works-list__item').forEach((item) => {
    const i = parseInt(item.dataset.index);
    const work = works[i];

    item.addEventListener('mouseenter', (e) => {
      thumbImg.src = work.main;
      gsap.set(thumb, { x: e.clientX + 28, y: e.clientY - 110 });
      gsap.to(thumb, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    });

    item.addEventListener('mousemove', (e) => {
      gsap.to(thumb, {
        x: e.clientX + 28,
        y: e.clientY - 110,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(thumb, { opacity: 0, duration: 0.25, ease: 'power2.in' });
    });
  });
}
