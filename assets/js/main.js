// =============================
// Loading Screen
// =============================
// 흐름: CSS #loadingBg(베이지) → JS 즉시 제거 → canvas 4단계 애니메이션
// grow(2→100px, 1.5s) → hold(100px, 100% 대기) → swell(100→300px, 0.8s) → burst(300→full, 0.55s, destination-out)
function initLoadingScreen() {
  document.getElementById('loadingBg')?.remove();

  // 로딩 화면 중에 Three.js 미리 다운로드 — 끝날 때 바로 쓸 수 있게
  let threeLoaded = false;
  const threeScript = document.createElement('script');
  threeScript.src = 'assets/js/three-custom.min.js';
  threeScript.onload = () => { threeLoaded = true; };
  document.head.appendChild(threeScript);

  const canvas = document.getElementById('loadingCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width  = window.innerWidth;
  const H = canvas.height = window.innerHeight;
  const CX = W / 2, CY = H / 2;
  const maxR = Math.sqrt(CX * CX + CY * CY) * 1.12;
  const N = 8;
  const BG = '#000000';
  const R0 = 2, R1 = 100;

  let r = R0, t = 0, phaseP = 0;
  let phase = 'grow'; // grow → hold → swell → burst
  let loadDone = false;
  let lastTime = null;

  // 실제 리소스 로딩 진행률 추적
  const domRes = document.querySelectorAll('link[rel="stylesheet"][href], script[src], img[src]');
  const total  = Math.max(domRes.length + 4, 10);
  let loadedCount = Math.min(performance.getEntriesByType('resource').length, total - 1);
  let targetPct   = Math.round((loadedCount / total) * 80);
  let displayPct  = targetPct;
  let po = null;

  if (window.PerformanceObserver) {
    try {
      po = new PerformanceObserver((list) => {
        loadedCount = Math.min(loadedCount + list.getEntries().length, total - 1);
        if (!loadDone) targetPct = Math.min(Math.round((loadedCount / total) * 95), 95);
      });
      po.observe({ entryTypes: ['resource'] });
    } catch (e) {}
  }

  window.addEventListener('load', () => {
    loadDone = true;
    targetPct = 100;
    if (po) try { po.disconnect(); } catch (e) {}
  });

  function blobPath(radius) {
    const amp = Math.max(3, radius * 0.045);
    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const rr = radius
        + Math.sin(a * 2 + t * 0.6) * amp
        + Math.cos(a * 3.5 + t * 0.4) * amp * 0.6;
      pts.push([CX + Math.cos(a) * rr, CY + Math.sin(a) * rr]);
    }
    ctx.beginPath();
    ctx.moveTo((pts[N-1][0]+pts[0][0])/2, (pts[N-1][1]+pts[0][1])/2);
    for (let i = 0; i < N; i++) {
      const mx = (pts[i][0]+pts[(i+1)%N][0])/2;
      const my = (pts[i][1]+pts[(i+1)%N][1])/2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    ctx.closePath();
  }

  function drawPct(alpha) {
    if (r < 36 || alpha <= 0) return;
    const a = Math.min(1, (r - 36) / 18) * alpha;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.font = `700 13px "Bricolage Grotesque", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.min(Math.floor(displayPct), 100) + '%', CX, CY);
    ctx.restore();
  }

  function draw(now) {
    const dt = lastTime !== null ? Math.min((now - lastTime) / 1000, 0.05) : 0;
    lastTime = now;
    t += 0.025;

    // Observer가 없거나 느릴 때 최소 진행 보장
    if (!loadDone && targetPct < 85) targetPct = Math.min(targetPct + dt * 6, 85);
    displayPct += (targetPct - displayPct) * Math.min(dt * 5, 0.2);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    if (phase === 'grow') {
      // 2 → 100px, ease-out, 1.5s
      phaseP = Math.min(phaseP + dt / 1.5, 1);
      const e = 1 - Math.pow(1 - phaseP, 2);
      r = R0 + (R1 - R0) * e;
      blobPath(r); ctx.fillStyle = '#00d4ff'; ctx.fill();
      drawPct(1);
      if (phaseP >= 1) { phase = 'hold'; phaseP = 0; }

    } else if (phase === 'hold') {
      // 100px 유지, 100% 도달 + loadDone 대기
      r = R1;
      blobPath(r); ctx.fillStyle = '#00d4ff'; ctx.fill();
      drawPct(1);
      if (loadDone && displayPct >= 99) { phase = 'windup'; phaseP = 0; }

    } else if (phase === 'windup') {
      // 100 → 68px 으로 살짝 움츠러들었다가 burst 진입 (역동성)
      phaseP = Math.min(phaseP + dt / 0.22, 1);
      const e = phaseP * phaseP;
      r = R1 - (R1 - 55) * e;
      blobPath(r); ctx.fillStyle = '#00d4ff'; ctx.fill();
      drawPct(Math.max(0, 1 - phaseP * 3));
      if (phaseP >= 1) { phase = 'burst'; phaseP = 0; }

    } else if (phase === 'burst') {
      // 68 → full, cubic ease-in(서서히→빠르게), 0.9s
      phaseP = Math.min(phaseP + dt / 0.9, 1);
      const e = phaseP * phaseP * phaseP;
      r = 55 + (maxR - 55) * e;

      // 파란 blob: 65% 이후 서서히 페이드아웃
      const blueAlpha = phaseP < 0.65 ? 1 : Math.max(0, 1 - (phaseP - 0.65) / 0.25);
      ctx.globalAlpha = blueAlpha;
      blobPath(r);
      ctx.fillStyle = '#00d4ff';
      ctx.fill();
      ctx.globalAlpha = 1;

      // 뚫기는 70% 이후부터 서서히 시작
      const cutRatio = Math.max(0, (phaseP - 0.7) / 0.3);
      const cutAlpha = cutRatio * cutRatio; // ease-in
      if (cutAlpha > 0) {
        ctx.globalAlpha = cutAlpha;
        ctx.globalCompositeOperation = 'destination-out';
        blobPath(r);
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      if (phaseP >= 1) {
        canvas.style.transition = 'opacity 0.3s ease';
        canvas.style.opacity = '0';
        setTimeout(() => {
          canvas.remove();
          const startBg = () => {
            initBgMesh();
            const bg = document.getElementById('bgCanvas');
            if (bg) { bg.style.transition = 'opacity 1s ease'; bg.style.opacity = '1'; }
          };
          threeLoaded ? startBg() : (threeScript.onload = startBg);
        }, 300);
        return;
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

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
// Custom Cursor
// =============================
function initCustomCursor() {
  const canvas = document.getElementById('cursorCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const SIZE = 220;
  canvas.width = SIZE;
  canvas.height = SIZE;

  const CX = SIZE / 2;
  const CY = SIZE / 2;

  let tx = -999, ty = -999;
  let cx = -999, cy = -999;
  let t = 0;
  let initialized = false;
  let hoverProgress = 0;
  let hoverTarget = 0;

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!initialized) {
      cx = tx; cy = ty;
      initialized = true;
      canvas.style.opacity = '1';
    }
  });
  document.addEventListener('mouseleave', () => { canvas.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { if (initialized) canvas.style.opacity = '1'; });

  function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    const N = 8;
    const baseR = 14 + (100 - 14) * hoverProgress;
    const amp   = 4 * (1 - hoverProgress);

    ctx.beginPath();
    if (amp < 0.3) {
      ctx.arc(CX, CY, baseR, 0, Math.PI * 2);
    } else {
      const pts = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const r = baseR
          + Math.sin(a * 2 + t * 1.1) * amp
          + Math.cos(a * 3.5 + t * 0.7) * amp * 0.5;
        pts.push([CX + Math.cos(a) * r, CY + Math.sin(a) * r]);
      }
      ctx.moveTo(
        (pts[N - 1][0] + pts[0][0]) / 2,
        (pts[N - 1][1] + pts[0][1]) / 2
      );
      for (let i = 0; i < N; i++) {
        const mx = (pts[i][0] + pts[(i + 1) % N][0]) / 2;
        const my = (pts[i][1] + pts[(i + 1) % N][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
      }
      ctx.closePath();
    }
    ctx.fillStyle = '#00d4ff';
    ctx.fill();

    // 텍스트: 확장 60% 이후부터 페이드인
    if (hoverProgress > 0.6) {
      const alpha = (hoverProgress - 0.6) / 0.4;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 13px "Bricolage Grotesque", sans-serif';
      ctx.fillText('VIEW', CX, CY - 9);
      ctx.fillText('WORKS', CX, CY + 9);
      ctx.globalAlpha = 1;
    }
  }

  function tick() {
    requestAnimationFrame(tick);
    t += 0.04;

    if (initialized) {
      const el = document.elementFromPoint(tx, ty);
      hoverTarget = (el && el.closest('.work-item__img-wrap')) ? 1 : 0;
    }

    hoverProgress += (hoverTarget - hoverProgress) * 0.14;

    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;

    // 블롭 중심 고정: 커서 우하단 +34px — 크기가 커져도 중심 그대로
    canvas.style.transform = `translate(${cx - 76}px, ${cy - 76}px)`;
    draw();
  }
  tick();
}

// =============================
// Contact Blob (Three.js)
// =============================
function initContactBlob() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('contactBlobCanvas');
  if (!canvas) return;

  const SIZE = 200;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(SIZE, SIZE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 5.5;

  const vShader = `
    uniform float uTime;
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec3 pos = position;
      float d =
        sin(pos.x * 1.8 + uTime * 0.4) * 0.10 +
        sin(pos.y * 2.2 + uTime * 0.5) * 0.09 +
        sin(pos.z * 1.6 + uTime * 0.3) * 0.06;
      pos += normal * d;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fShader = `
    uniform vec3 uColor;
    varying vec3 vNormal;
    void main() {
      float rim = clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
      float alpha = pow(rim, 1.1) * 0.92;
      gl_FragColor = vec4(uColor, alpha);
    }
  `;

  const geo = new THREE.SphereGeometry(1.5, 64, 64);
  const mat = new THREE.ShaderMaterial({
    vertexShader: vShader,
    fragmentShader: fShader,
    uniforms: {
      uTime:  { value: 0 },
      uColor: { value: new THREE.Color('#00d4ff') },
    },
    transparent: true,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  let t = 0;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  (function tick() {
    requestAnimationFrame(tick);
    t += 0.008;
    mat.uniforms.uTime.value = t;
    mesh.rotation.y += 0.002;
    mesh.rotation.x += 0.001;

    mouseX += (targetX - mouseX) * 0.04;
    mouseY += (targetY - mouseY) * 0.04;
    mesh.position.x = mouseX * 0.35;
    mesh.position.y = mouseY * 0.35;

    renderer.render(scene, camera);
  })();
}

function loadThree(cb) {
  if (typeof THREE !== 'undefined') { cb(); return; }
  const s = document.createElement('script');
  s.src = 'assets/js/three-custom.min.js';
  s.onload = cb;
  document.head.appendChild(s);
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
// Skills 렌더링
// =============================
const ICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';

const skills = [
  { name: 'HTML5',       icon: `${ICON}html5/html5-original.svg` },
  { name: 'CSS3',        icon: `${ICON}css3/css3-original.svg` },
  { name: 'JavaScript',  icon: `${ICON}javascript/javascript-plain.svg` },
  { name: 'jQuery',      icon: `${ICON}jquery/jquery-original.svg` },
  { name: 'Sass',        icon: `${ICON}sass/sass-original.svg` },
  { name: 'Git',         icon: `${ICON}git/git-original.svg` },
  { name: 'Figma',       icon: `${ICON}figma/figma-original.svg` },
  { name: 'Photoshop',   icon: `${ICON}photoshop/photoshop-plain.svg` },
  { name: 'Illustrator', icon: `${ICON}illustrator/illustrator-plain.svg` },
  { name: 'React',       icon: `${ICON}react/react-original.svg` },
  { name: 'VSCode',      icon: `${ICON}vscode/vscode-original.svg` },
  { name: 'GitHub',      icon: `${ICON}github/github-original.svg` },
];

function renderSkills() {
  const grid = document.querySelector('.skills__grid');
  if (!grid) return;

  grid.innerHTML = skills.map(s => `
    <div class="skill-item">
      <span class="skill-item__name">${s.name}</span>
      <img class="skill-item__icon" src="${s.icon}" alt="${s.name}" loading="lazy">
    </div>
  `).join('');

  grid.querySelectorAll('.skill-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const r = item.getBoundingClientRect();
      item.style.setProperty('--x', `${e.clientX - r.left}px`);
      item.style.setProperty('--y', `${e.clientY - r.top}px`);
    });
  });
}

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
// Works 헤딩 fill 애니메이션
// =============================
function initWorksHeading() {
  const heading = document.querySelector('.works__heading');
  if (!heading) return;

  gsap.to(heading, {
    backgroundSize: '100% 100%',
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.works__track-wrap',
      start: 'top 80%',
    },
  });

  const skillsHeading = document.querySelector('.skills__heading');
  if (skillsHeading) {
    gsap.to(skillsHeading, {
      backgroundSize: '100% 100%',
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.skills', start: 'top 80%' },
    });
  }

  const contactHeading = document.querySelector('.contact__heading');
  if (!contactHeading) return;

  gsap.to(contactHeading, {
    backgroundSize: '100% 100%',
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.contact',
      start: 'top 80%',
    },
  });
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
// Stars Canvas
// =============================
function initStars() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const layers = [
    { count: 180, minR: 0.3, maxR: 0.7, speed: 0.08, alpha: 0.35 },
    { count: 80,  minR: 0.7, maxR: 1.2, speed: 0.18, alpha: 0.55 },
    { count: 30,  minR: 1.2, maxR: 2.0, speed: 0.32, alpha: 0.8  },
  ];

  const stars = layers.flatMap(({ count, speed, alpha }) =>
    Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 4,
      r: 0.3,
      speed,
      alpha,
    }))
  );

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  const aboutTrack = document.querySelector('.about-track');
  const works = document.querySelector('.works');

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.beginPath();
    if (aboutTrack) {
      const r = aboutTrack.getBoundingClientRect();
      ctx.rect(r.left, r.top, r.width, r.height);
    }
    if (works) {
      const r = works.getBoundingClientRect();
      ctx.rect(r.left, r.top, r.width, r.height);
    }
    ctx.clip();

    const spread = Math.min(scrollY * 0.00025, 0.35);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    stars.forEach(({ x, y, r, speed, alpha }) => {
      const drawY = (y - scrollY * speed) % (canvas.height * 4);
      if (drawY < -10 || drawY > canvas.height + 10) return;
      const drawX = x + (x - cx) * spread;
      const spreadY = drawY + (drawY - cy) * spread * 0.4;
      const fadedAlpha = alpha * (1 - spread * 0.6);
      ctx.beginPath();
      ctx.arc(drawX, spreadY, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${fadedAlpha})`;
      ctx.fill();
    });

    ctx.restore();
    requestAnimationFrame(draw);
  }
  draw();
}

// =============================
// Init
// =============================
document.addEventListener('DOMContentLoaded', () => {
  // initLoadingScreen(); // 개발 중 비활성화
  document.getElementById('loadingBg')?.remove();
  document.getElementById('loadingCanvas')?.remove();
  loadThree(initContactBlob);
  initStars();
  initCustomCursor();
  renderClients();
  renderWorks();
  renderSkills();
  initMenu();
  initHeroEntrance();
  initWorksHeading();
  initAnimations();
  initAboutScroll();
  const lenis = initLenis();
  initHeader(lenis);
});
