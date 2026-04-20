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

  // hero 패럴렉스
  const heroTrigger = {
    trigger: '.hero',
    start: '80% top',
    end: '80% top',
    scrub: 0.4,
  };

  // gsap.to('.hero__name', { y: -400, ease: 'power2.in', scrollTrigger: heroTrigger });
  // gsap.to('.hero__cta', { y: -500, ease: 'power2.in', scrollTrigger: heroTrigger });

  gsap.to('.hero__inner', {
    opacity: 0,
    filter: 'blur(16px)',
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: '30% top',
      end: 'bottom top',
      scrub: true,
    },
  });
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
          <img src="${work.thumb}" alt="${work.name}" loading="lazy" />
          <h3 class="work-item__title">${work.name}</h3>
          <div class="work-item__desc-wrap">
            <p class="work-item__desc">${work.desc}</p>
          </div>
        </div>
      </div>`
    )
    .join('');

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
// About 스크롤 텍스트
// =============================
function initAboutScroll() {
  const words = document.querySelectorAll('.about__word');
  const moreBtn = document.querySelector('.about__more-link');

  const aboutCard = document.querySelector('.about__card');

  if (aboutCard) {
    gsap.to(aboutCard, {
      opacity: 0,
      filter: 'blur(12px)',
      ease: 'none',
      scrollTrigger: {
        trigger: '.about',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  }

  if (moreBtn) {
    gsap.to(moreBtn, {
      opacity: 0,
      filter: 'blur(12px)',
      ease: 'none',
      scrollTrigger: {
        trigger: '.about',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  }

  if (!words.length) return;

  gsap.set(words, { opacity: 0.2 });

  const total = words.length;

  ScrollTrigger.create({
    trigger: '.about',
    start: 'top 80%',
    end: '+=100%',
    scrub: 0.3,
    onUpdate: (self) => {
      const activePos = self.progress * (total + 6) - 4;
      words.forEach((word, i) => {
        const dist = Math.abs(i - activePos);
        const opacity = Math.max(0.1, Math.exp(-dist * dist * 0.7));
        gsap.set(word, { opacity });
      });
    },
  });

}

// =============================
// Init
// =============================
document.addEventListener('DOMContentLoaded', () => {
  initBgMesh();
  renderClients();
  renderWorks();
  initMenu();
  initHeroEntrance();
  initAnimations();
  initAboutScroll();
  const lenis = initLenis();
  initHeader(lenis);
});
