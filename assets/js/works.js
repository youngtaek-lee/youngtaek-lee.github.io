// =============================
// 프로젝트 데이터
// =============================
const works = [
  {
    id: 'sase', title: 'Sase', name: '사세', category: 'Food & Beverage', year: 2023,
    main: 'assets/images/works/사세 메인캡쳐.png',
    url: 'https://www.sase.co.kr/html/index/',
    overview: '글로벌 냉동식품 기업 사세의 웹사이트 퍼블리싱 및 유지보수 작업을 진행했습니다. 제품의 품질감과 브랜드 신뢰를 시각적으로 전달하기 위해 비주얼 중심의 레이아웃을 구현하였습니다.',
    gallery: [
      'assets/images/works/sase-fullpage.png',
      'assets/images/works/sase-about.png',
      'assets/images/works/sase-distribution.png',
      'assets/images/works/sase-production.png',
    ],
  },
  {
    id: 'bexel', title: 'Bexel', name: '벡셀', category: 'Electronics', year: 2024,
    main: 'assets/images/works/벡셀 메인.png',
    url: 'https://www.bexel.co.kr/html/index/index.php',
    overview: '국내 배터리·전자제품 브랜드 벡셀의 웹사이트 퍼블리싱 및 유지보수 작업을 진행했습니다. 다크 톤 비주얼과 오렌지 포인트 컬러를 활용해 브랜드 신뢰감과 제품 라인업을 효과적으로 전달하는 레이아웃을 구현하였습니다.',
    gallery: [
      'assets/images/works/bexel-fullpage.png',
      'assets/images/works/bexel-product.png',
      'assets/images/works/bexel-acc.png',
    ],
  },
  {
    id: 'marusys', title: 'Marusys', name: '마르시스', category: 'IT · Embedded', year: 2023,
    main: 'assets/images/works/마르시스 메인.png',
    url: 'https://www.marusys.com/html/index/index.php',
    overview: 'IT·임베디드 솔루션 기업 마르시스의 웹사이트 퍼블리싱 및 유지보수 작업을 진행했습니다. 다크 톤의 모던한 레이아웃과 브랜드 아이덴티티를 살린 비주얼 구성으로 기업 신뢰감과 기술력을 효과적으로 전달하였습니다.',
    gallery: [
      'assets/images/works/marusys-fullpage.png',
      'assets/images/works/marusys-iptv.png',
      'assets/images/works/marusys-about.png',
    ],
  },
  {
    id: 'raymats', title: 'Raymats', name: '레이머티리얼즈', category: 'Materials', year: 2024,
    main: 'assets/images/works/레이머터리얼즈 메인.png',
    url: 'https://raymats.com/html/index/',
    overview: '첨단 소재 전문 기업 레이머티리얼즈의 웹사이트 퍼블리싱 및 유지보수 작업을 진행했습니다. 소재의 혁신성과 기술 신뢰를 전달하기 위해 깔끔한 레이아웃과 비주얼 중심의 콘텐츠 구성을 구현하였습니다.',
    gallery: [
      'assets/images/works/raymats-fullpage.png',
      'assets/images/works/raymats-about.png',
      'assets/images/works/raymats-tech.png',
      'assets/images/works/raymats-eyewear.png',
    ],
  },
  {
    id: 'optimedi', title: 'Optimedi', name: '옵티메디', category: 'Medical Device', year: 2024,
    main: 'assets/images/works/옵티메디 메인.png',
    url: 'https://www.optimedi.kr/',
    overview: '의료기기 전문 기업 옵티메디의 웹사이트 퍼블리싱 및 유지보수 작업을 진행했습니다. 의료 분야 특유의 신뢰감과 전문성을 전달하기 위해 간결하고 안정적인 레이아웃과 명확한 정보 구조를 구현하였습니다.',
    gallery: [
      'assets/images/works/optimedi-fullpage.png',
      'assets/images/works/optimedi-greeting.png',
      'assets/images/works/optimedi-quality.png',
    ],
  },
  { id: 'ghi',      title: 'GHI',      name: '기획인애드',     category: 'Advertising',     year: 2023, main: 'assets/images/works/기획인애드 메인.png',      url: 'http://ghi.co.kr/html/index/' },
];

// 자투리 프로젝트 — 이름 + 외부링크만
const worksExtra = [
  { name: '플레이윈터',              url: 'https://playwinter.com/kr/html/index/' },
  { name: '영음예술기획',            url: 'http://www.iyoungeum.com/html/index/' },
  { name: '하남시환경교육센터',       url: 'http://www.heec.co.kr/html/index/' },
  { name: '인터메타',                url: 'https://www.intermeta.co.kr/html/index/' },
  { name: '오산대학교',              url: 'https://www.osan.ac.kr/?menuno=127' },
  { name: '전문대학평생직업교육발전협의', url: 'https://www.colive.kr/html/index/' },
  { name: '세경대학교',              url: 'https://www.saekyung.ac.kr/intro/intro.php' },
  { name: '성공회대 첨단융합디자인센터', url: 'https://skhuacdc2.gabia.io/html/index/index.php' },
  { name: '세종직업능력개발원',       url: 'https://www.sjacademy.co.kr/_html/index.php' },
  { name: '부산국제주류&와인박람회',  url: 'https://busan.siwse.com/' },
  { name: '중앙직업전문학교 리뉴얼',  url: 'https://www.pbi.or.kr/html/index/' },
  { name: '총신대학교 교수학습지원센터', url: 'https://cctl.csu.ac.kr/html/index/' },
  { name: '비영리조직평가원 KINE',    url: 'https://www.kine1004.org/html/index/index.php' },
  { name: '충남공공디자인센터',       url: 'https://www.cpdc.re.kr/html/index/' },
  { name: '한국학점은행평생교육협의회', url: 'http://cacb.kr/html/index/' },
  { name: '트리니티 디아이비',        url: 'http://triniti.kr/html/index/' },
  { name: '삼성이앤씨',              url: 'http://www.samseongenc.com/html/index/' },
  { name: '슈가엔 쇼핑몰',           url: 'http://www.sugaren.co.kr/html/index.php' },
  { name: '멘토스쿨',                url: 'http://mentor-school.co.kr/html/' },
  { name: '사단법인 하희',           url: 'http://www.hahee.or.kr/html/index/index.php' },
  { name: '굿씨상담센터',            url: 'http://www.goodseed.or.kr/html/index/' },
  { name: '교농',                    url: 'http://www.kyonong.com/html/index/index.php' },
  { name: '팍스농',                  url: 'http://paxnong.com/' },
  { name: '남원시조합공동사업',       url: 'http://namwonunion.co.kr/html/index/' },
  { name: '재단법인 지역활성화네트워크', url: 'http://www.kistock.co.kr/html/index/' },
  { name: '쌍용직업전문학교',         url: 'http://syhrd.kr/new/html/index/' },
  { name: '하남시민에너지협동조합',   url: 'http://ghi.co.kr/html/index/' },
  { name: '에스앤씨건설' },
  { name: '2021 장애학생 페스티벌' },
  { name: '제이와이이노센트' },
  { name: '축산박람회' },
  { name: '트리니티 딥러닝 플랫폼' },
  { name: '올댓스포츠 브레이킹 선수권' },
  { name: '원퍼시스컨설팅 비모션' },
];

// =============================
// Works 리스트 스파클 마크
// =============================
function initWorksSparkle() {
  const SPARKLE_SVG = `<svg class="works__sparkle" viewBox="-1.1 -1.1 2.2 2.2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0,-1 L0.092,-0.092 L1,0 L0.092,0.092 L0,1 L-0.092,0.092 L-1,0 L-0.092,-0.092 Z" fill="currentColor"/></svg>`;
  document.querySelectorAll('.works__item__link').forEach(link => {
    link.insertAdjacentHTML('beforeend', SPARKLE_SVG);
  });
}

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
