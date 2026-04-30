// =============================
// Intro Screen
// =============================
function initIntro() {
  const screen = document.getElementById('introScreen');
  const logo   = document.getElementById('introLogo');
  const loader = document.getElementById('introLoader');
  const oChar  = document.getElementById('introO');
  const lines  = logo ? logo.querySelectorAll('.intro-logo__line > span') : [];

  if (!screen || !logo) return;

  let loadDone     = false;
  let minDelayDone = false;

  function tryTransition() {
    if (!loadDone || !minDelayDone) return;

    gsap.to(loader, { opacity: 0, duration: 0.3, ease: 'power1.out' });

    gsap.delayedCall(0.4, () => {
      const oRect = oChar ? oChar.getBoundingClientRect() : null;
      const maxR  = Math.hypot(window.innerWidth, window.innerHeight);
      const W = window.innerWidth, H = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      // 피그마에서 추출한 o 카운터 패스의 viewBox 및 중심 좌표
      const vbW = 14, vbH = 16;
      const cCX = 6.864, cCY = 7.612;
      const cHH = 4.994;

      // measureText로 실제 글자 잉크 높이 측정 (element box ≠ glyph height)
      const mc = document.createElement('canvas').getContext('2d');
      mc.font = getComputedStyle(oChar || document.body).font;
      const m = mc.measureText('o');
      const glyphH    = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const glyphTopY = oRect ? oRect.top + (oRect.height - glyphH) / 2 : H / 2;

      const HOLE_EXPAND = 1.40; // 구멍 상하 여유 — 숫자 높이면 더 뚫림
      const baseScaleX = oRect ? oRect.width / vbW : 1;
      const baseScaleY = glyphH / vbH * HOLE_EXPAND;
      const screenOx   = oRect ? oRect.left + oRect.width * (cCX / vbW) : W / 2;
      const screenOy   = glyphTopY + glyphH * (cCY / vbH);
      const sFinal     = Math.ceil(maxR / (baseScaleY * cHH)) + 5;

      // canvas로 다크 오버레이 + 카운터 모양 구멍 렌더링
      const cvs = document.createElement('canvas');
      cvs.width  = W * dpr;
      cvs.height = H * dpr;
      cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      screen.insertBefore(cvs, screen.firstChild);

      const ctx    = cvs.getContext('2d');
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#0f0f0f';
      const counterPath = new Path2D('M6.908 12.606C7.68533 12.606 8.338 12.4153 8.866 12.034C9.394 11.6527 9.79733 11.1027 10.076 10.384C10.3547 9.66533 10.494 8.78533 10.494 7.744C10.494 6.65867 10.3473 5.73467 10.054 4.972C9.77533 4.20933 9.36467 3.63 8.822 3.234C8.27933 2.82333 7.61933 2.618 6.842 2.618C6.07933 2.618 5.42667 2.816 4.884 3.212C4.356 3.59333 3.94533 4.15067 3.652 4.884C3.37333 5.61733 3.234 6.52667 3.234 7.612C3.234 8.404 3.31467 9.11533 3.476 9.746C3.652 10.362 3.894 10.8827 4.202 11.308C4.51 11.7333 4.89133 12.056 5.346 12.276C5.80067 12.496 6.32133 12.606 6.908 12.606Z');

      function drawFrame(s) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.save();
        ctx.translate(screenOx, screenOy);
        ctx.scale(s * baseScaleX, s * baseScaleY);
        ctx.translate(-cCX, -cCY);
        ctx.fill(counterPath);
        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
      }
      drawFrame(1);

      // 인트로 screen 배경 투명화 (canvas가 bg 담당)
      screen.style.background = 'transparent';

      // 로고 scale transform-origin을 O 중심으로 설정
      const logoRect = logo.getBoundingClientRect();
      const originX  = ((screenOx - logoRect.left) / logoRect.width)  * 100;
      const originY  = ((screenOy - logoRect.top)  / logoRect.height) * 100;
      gsap.set(logo, { transformOrigin: `${originX}% ${originY}%` });

      gsap.to(logo, {
        scale: sFinal,
        duration: 1.4,
        ease: 'power3.in',
        onUpdate() { drawFrame(gsap.getProperty(logo, 'scale')); },
        onComplete: () => screen.remove(),
      });
    });
  }

  setTimeout(() => { minDelayDone = true; tryTransition(); }, 1500);

  if (document.readyState === 'complete') {
    loadDone = true;
  } else {
    window.addEventListener('load', () => { loadDone = true; tryTransition(); }, { once: true });
  }

  gsap.to(lines, { y: 0, duration: 0.85, ease: 'expo.out', stagger: 0.15, delay: 0.15 });
  gsap.to(loader, { opacity: 1, duration: 0.4, delay: 0.85, ease: 'power1.in' });
}

// =============================
// Hero Blob (Three.js — blobmixer style)
// =============================
function initHeroBlob() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('heroBlobCanvas');
  if (!canvas) return;

  let W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  camera.position.z = 5;

  // ── Gradient texture ─────────────────────────────────────────
  function createGradientTexture() {
    const S = 512;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d');
    const h = ctx.createLinearGradient(0, 0, S, 0);
    h.addColorStop(0,    '#3D5C40');
    h.addColorStop(0.4,  '#7A9B6E');
    h.addColorStop(0.7,  '#C4A882');
    h.addColorStop(1,    '#5C4A3A');
    ctx.fillStyle = h;
    ctx.fillRect(0, 0, S, S);
    const d = ctx.createLinearGradient(0, S, S, 0);
    d.addColorStop(0,    'rgba(196,168,130,0)');
    d.addColorStop(0.45, 'rgba(196,168,130,0.28)');
    d.addColorStop(0.55, 'rgba(196,168,130,0.28)');
    d.addColorStop(1,    'rgba(196,168,130,0)');
    ctx.fillStyle = d;
    ctx.fillRect(0, 0, S, S);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  // ── Stefan Gustavson periodic Perlin noise (GLSL) ─────────────
  const NOISE_GLSL = `
vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289v4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x)  { return mod289v4(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float pnoise(vec3 P, vec3 rep) {
  vec3 Pi0 = mod(floor(P), rep);
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
  Pi0 = mod289v3(Pi0); Pi1 = mod289v3(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix  = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy  = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy  = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x); vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z); vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x); vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z); vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3  fade_xyz = fade(Pf0);
  vec4  n_z  = mix(vec4(n000,n100,n010,n110), vec4(n001,n101,n011,n111), fade_xyz.z);
  vec2  n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  return 2.2 * mix(n_yz.x, n_yz.y, fade_xyz.x);
}
  `;

  // ── Blob displacement functions (GLSL) ────────────────────────
  const FUNCTIONS_GLSL = `
uniform float time;
uniform float radius;
uniform float distort;
uniform float frequency;
uniform float surfaceDistort;
uniform float surfaceFrequency;
uniform float surfaceTime;
uniform float numberOfWaves;
uniform float fixNormals;
uniform float surfacePoleAmount;
uniform float gooPoleAmount;
uniform float noisePeriod;

float f(vec3 point) {
  float yPos          = smoothstep(-1.0, 1.0, point.y);
  float amount        = sin(yPos * 3.1415926538);
  float wavePoleAmount = mix(amount, 1.0, surfacePoleAmount);
  float gooPoleAmt    = mix(amount, 1.0, gooPoleAmount);
  float goo = pnoise(
    vec3(point / frequency + mod(time, noisePeriod)),
    vec3(noisePeriod)
  ) * pow(distort, 2.0);
  float surfaceNoise = pnoise(
    vec3(point / surfaceFrequency + mod(surfaceTime, noisePeriod)),
    vec3(noisePeriod)
  );
  float waves = (
    point.x * sin((point.y + surfaceNoise) * 3.1415926538 * numberOfWaves) +
    point.z * cos((point.y + surfaceNoise) * 3.1415926538 * numberOfWaves)
  ) * 0.01 * pow(surfaceDistort, 2.0);
  return waves * wavePoleAmount + goo * gooPoleAmt;
}

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}
  `;

  // ── Uniforms ──────────────────────────────────────────────────
  const uniforms = {
    time:              { value: 0 },
    surfaceTime:       { value: 0 },
    distort:           { value: 0.5 },
    frequency:         { value: 1.5 },
    surfaceDistort:    { value: 1.0 },
    surfaceFrequency:  { value: 1.0 },
    numberOfWaves:     { value: 4.0 },
    surfacePoleAmount: { value: 1.0 },
    gooPoleAmount:     { value: 1.0 },
    noisePeriod:       { value: 21.0 },
    fixNormals:        { value: 1.0 },
    radius:            { value: 1.0 },
  };

  // ── Material ──────────────────────────────────────────────────
  const material = new THREE.MeshPhysicalMaterial({
    roughness:          0.14,
    metalness:          0,
    clearcoat:          1.0,
    clearcoatRoughness: 0.7,
    color:              new THREE.Color('#ffffff'),
    map:                createGradientTexture(),
  });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${NOISE_GLSL}\n${FUNCTIONS_GLSL}`)
      .replace('void main() {', `void main() {
  vec3 displacedPosition = position + normalize(normal) * f(position);
  vec3 displacedNormal   = normalize(normal);
  if (fixNormals > 0.5) {
    float offset     = 0.5 / 512.0;
    vec3 tangent     = orthogonal(normal);
    vec3 bitangent   = normalize(cross(normal, tangent));
    vec3 nb1         = position + tangent   * offset;
    vec3 nb2         = position + bitangent * offset;
    vec3 dn1         = nb1 + normal * f(nb1);
    vec3 dn2         = nb2 + normal * f(nb2);
    vec3 dTangent    = dn1 - displacedPosition;
    vec3 dBitangent  = dn2 - displacedPosition;
    displacedNormal  = normalize(cross(dTangent, dBitangent));
  }`)
      .replace('#include <displacementmap_vertex>', 'transformed = displacedPosition;')
      .replace('#include <defaultnormal_vertex>', THREE.ShaderChunk.defaultnormal_vertex.replace(
        'vec3 transformedNormal = objectNormal;',
        'vec3 transformedNormal = displacedNormal;'
      ));
  };
  material.customProgramCacheKey = () => 'blobmixer-hero-v1';

  // ── Mesh ──────────────────────────────────────────────────────
  const geometry = new THREE.SphereBufferGeometry(1, 256, 341);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(1.6);
  scene.add(mesh);

  // ── Lighting ─────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(1, 2, 3);
  scene.add(dirLight);

  // ── Environment (clearcoat 반사용) ────────────────────────────
  (function setupEnv() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const ec = document.createElement('canvas');
    ec.width = 256; ec.height = 128;
    const ectx = ec.getContext('2d');
    const eg = ectx.createLinearGradient(0, 0, 0, 128);
    eg.addColorStop(0,   '#F0EBE3');
    eg.addColorStop(0.5, '#ffffff');
    eg.addColorStop(1,   '#E8DDD0');
    ectx.fillStyle = eg;
    ectx.fillRect(0, 0, 256, 128);
    const etex = new THREE.CanvasTexture(ec);
    etex.mapping = THREE.EquirectangularReflectionMapping;
    const envRT = pmrem.fromEquirectangular(etex);
    scene.environment = envRT.texture;
    pmrem.dispose();
    etex.dispose();
  })();

  // ── Mouse parallax ───────────────────────────────────────────
  let targetRotX = 0, targetRotY = 0;
  let scrollRotX = 0, scrollRotY = 0;
  document.addEventListener('mousemove', e => {
    targetRotX = (e.clientY / H - 0.5) * 0.5;
    targetRotY = (e.clientX / W - 0.5) * 0.7;
  });

  // ── Resize ───────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  });

  canvas.style.opacity = '1';

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Phase 1: Hero 이탈 — 좌하단으로 이동하며 fade out, scale 1.6→1.0
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate(self) {
        const p = self.progress;
        const sp = gsap.parseEase('power2.in')(p);
        mesh.position.x = gsap.utils.interpolate(0, -4.5, p);
        mesh.position.y = gsap.utils.interpolate(0, -1.5, p);
        mesh.scale.setScalar(gsap.utils.interpolate(1.6, 1.0, sp));
        scrollRotX = gsap.utils.interpolate(0,  0.35, p);
        scrollRotY = gsap.utils.interpolate(0, -0.4,  p);
        canvas.style.opacity = 1 - p;
      },
      onLeaveBack() {
        mesh.position.set(0, 0, 0);
        mesh.scale.setScalar(1.6);
        scrollRotX = 0; scrollRotY = 0;
        canvas.style.opacity = '1';
      },
    });

    // Phase 2: Contact — 좌상단(scale 1.3)에서 좌중앙(scale 0.9)으로 서서히 안착
    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
      onUpdate(self) {
        const p = self.progress;
        const ep = gsap.parseEase('expoScale(0.5, 2)')(p);
        mesh.position.x = gsap.utils.interpolate(-5, -2, p);
        mesh.position.y = gsap.utils.interpolate(2, 0, p);
        mesh.scale.setScalar(gsap.utils.interpolate(1.3, 0.9, ep));
        scrollRotX = gsap.utils.interpolate(-0.55,  0,    p);
        scrollRotY = gsap.utils.interpolate( 0.6,  -0.15, p);
        canvas.style.opacity = Math.min(p * 2, 1);
      },
      onLeaveBack() {
        canvas.style.opacity = '0';
        mesh.scale.setScalar(1.3);
        scrollRotX = 0; scrollRotY = 0;
      },
    });
  }

  // ── Loop ─────────────────────────────────────────────────────
  let visible = true;
  const visObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0 });
  visObserver.observe(canvas);

  // ── Contact 버튼 hover → blob scale ──────────────────────────
  const ctaBtn = document.querySelector('.hero__cta-link--accent');
  if (ctaBtn && typeof gsap !== 'undefined') {
    ctaBtn.addEventListener('mouseenter', () => {
      gsap.to(mesh.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 0.8, ease: 'expo.out' });
    });
    ctaBtn.addEventListener('mouseleave', () => {
      gsap.to(mesh.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 1.0, ease: 'expo.out' });
    });
  }

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    if (!visible || parseFloat(canvas.style.opacity) === 0) return;
    const delta = clock.getDelta();
    uniforms.time.value        = (uniforms.time.value        + delta / 3) % 21.0;
    uniforms.surfaceTime.value = (uniforms.surfaceTime.value + delta / 3) % 21.0;
    mesh.rotation.x += (targetRotX + scrollRotX - mesh.rotation.x) * 0.05;
    mesh.rotation.y += (targetRotY + scrollRotY - mesh.rotation.y) * 0.05;
    renderer.render(scene, camera);
  })();
}

// =============================
// 애니메이션 (GSAP + ScrollTrigger)
// =============================
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

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
  { name: 'GSAP',        icon: `${ICON}gsap/gsap-original.svg` },
  { name: 'Git',         icon: `${ICON}git/git-original.svg` },
  { name: 'Figma',       icon: `${ICON}figma/figma-original.svg` },
  { name: 'Photoshop',   icon: `${ICON}photoshop/photoshop-plain.svg` },
  { name: 'Illustrator', icon: `${ICON}illustrator/illustrator-plain.svg` },
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
// 섹션 헤딩 등장 애니메이션
// =============================
function initWorksHeading() {
  const worksHeading  = document.querySelector('.works__heading');
  const skillsHeading = document.querySelector('.skills__heading');
  const clientsHeading = document.querySelector('.clients__heading');

  // Works: 등장만 (핀 섹션이라 exit 제어 안 함)
  if (worksHeading) {
    gsap.timeline({
      scrollTrigger: {
        trigger: '.works__track-wrap',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    }).fromTo(worksHeading,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
    );
  }

  // Skills / Clients: 진입 등장 + 이탈 퇴장 + 재진입 재등장
  [
    { el: skillsHeading,  section: '.skills'  },
    { el: clientsHeading, section: '.clients' },
  ].forEach(({ el, section }) => {
    if (!el) return;
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 15%',
        toggleActions: 'play reverse play reverse',
      },
    }).fromTo(el,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
    );
  });
}

// =============================
// Hero 입장 애니메이션
// =============================
function initHeroEntrance() {
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
  initIntro();
  renderClients();
  renderWorks();
  renderSkills();
  initMenu();
  initHeroEntrance();
  initWorksHeading();
  initAnimations();
  initAboutScroll();
  initHeroBlob();
  const lenis = initLenis();
  initHeader(lenis);
});
