// =============================
// 프로젝트 데이터
// =============================
const works = [
  {
    id: 'sase',
    name: '사세',
    bg: 'assets/images/works/사세 배경.jpg',
    main: 'assets/images/works/사세 메인캡쳐.png',
    url: 'https://www.sase.co.kr/html/index/',
    tags: ['퍼블리싱', '유지보수'],
    desc: '가장 오랜 기간 유지보수를 담당한 프로젝트입니다. 메인 개편, 기능 추가·제거, 자잘한 수정까지 지속적으로 대응했습니다.',
  },
  {
    id: 'bexel',
    name: '벡셀',
    bg: 'assets/images/works/벡셀 배경.png',
    main: 'assets/images/works/벡셀 메인.png',
    url: 'https://www.bexel.co.kr/html/index/index.php',
    tags: ['퍼블리싱', '유지보수'],
    desc: '제품 수가 많아 리스트 구조와 배치를 어떻게 효율적으로 잡을지 고민이 많았던 프로젝트입니다.',
  },
  {
    id: 'marusys',
    name: '마르시스',
    bg: 'assets/images/works/마르시스 배경.png',
    main: 'assets/images/works/마르시스 메인.png',
    url: 'https://www.marusys.com/html/index/index.php',
    tags: ['퍼블리싱', '유지보수'],
    desc: 'fullpage.js를 활용해 섹션 전환 방식으로 구현했습니다. 라이브러리 기반 레이아웃 구성 및 유지보수를 담당했습니다.',
  },
  {
    id: 'raymats',
    name: '레이머티리얼즈',
    bg: 'assets/images/works/레이머터리얼즈 배경.jpg',
    main: 'assets/images/works/레이머터리얼즈 메인.png',
    url: 'https://raymats.com/html/index/',
    tags: ['퍼블리싱', '유지보수'],
    desc: '퍼블리싱 완료 후 메인 영상 섹션 추가 작업을 진행했습니다. 추가 요청이 적었고 깔끔하게 마무리된 프로젝트입니다.',
  },
  {
    id: 'optimedi',
    name: '옵티메디',
    bg: 'assets/images/works/옵티메디 배경.jpg',
    main: 'assets/images/works/옵티메디 메인.png',
    url: 'https://www.optimedi.kr/',
    tags: ['퍼블리싱'],
    desc: '스크롤 진행도를 나타내는 게이지바를 구현했습니다. 최대한 심플하게 표현해달라는 요청에 맞춰 작업했습니다.',
  },
  {
    id: 'ghi',
    name: '기획인애드',
    bg: 'assets/images/works/기획인애드 배경.png',
    main: 'assets/images/works/기획인애드 메인.png',
    url: 'http://ghi.co.kr/html/index/',
    tags: ['퍼블리싱', '유지보수'],
    desc: '메인에 영상을 전면 배치하고 fullpage.js로 섹션을 구성했습니다. 영상 재생과 fullpage 전환이 자연스럽게 연결되도록 작업했습니다.',
  },
];

// =============================
// Works 렌더링 + 수평 스크롤
// =============================
function renderWorks() {
  const track = document.querySelector('.works__track');
  if (!track) return;

  track.innerHTML = works
    .map(
      (work) => `
      <div class="work-item">
        <span class="work-item__label">${work.id.toUpperCase()}</span>
        <div class="work-item__img-wrap">
          <img class="work-item__bg-img" src="${work.bg}" alt="" />
          <img class="work-item__main-img" src="${work.main}" alt="${work.name}" loading="lazy" />
        </div>
      </div>`
    )
    .join('') + `
    <div class="work-item work-item--more">
      <a href="works.html" class="work-item--more__text">See More <span class="work-item--more__arrow">→</span></a>
    </div>`;

  let scrollTimer;
  gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: '.works__track-wrap',
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${track.scrollWidth - window.innerWidth}`,
      onUpdate: () => {
        track.style.pointerEvents = 'none';
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          track.style.pointerEvents = '';
        }, 150);
      },
    },
  });
}
