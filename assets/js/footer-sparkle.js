// =============================
// Footer — 3D 글라스 스파클 (우측, 옆면만 보이게 눕혀서 회전)
// 스파클 형태식은 hero-glass.js의 shape()와 동일. 재질은 단순 유리(transmission) — 히어로처럼 글자 굴절은 없음
// =============================
async function initFooterSparkle() {
  const top = document.querySelector('.footer__top');
  const footer = document.querySelector('.footer');
  const statement = document.querySelector('.statement');
  if (!top || !footer || !statement || !window.WebGLRenderingContext) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let THREE, RoomEnvironment;
  try {
    THREE = await import('three');
    ({ RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js'));
  } catch (e) { return; }

  const cv = document.createElement('canvas');
  cv.className = 'footer__glass';
  cv.setAttribute('aria-hidden', 'true');
  top.appendChild(cv);

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); }
  catch (e) { cv.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(getComputedStyle(footer).backgroundColor);   // 푸터 배경과 동일 — 유리가 굴절시킬 배경
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const FOV = 10, DIST = 18;   // 원근감 완화: FOV↓ + DIST↑ (보이는 크기는 유지). 30/6이 기존 값
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, DIST);

  // 로우폴리 와이어프레임 (이전: 크롬 flatShading MeshPhysicalMaterial metalness 1, roughness 0.15, envMapIntensity 1.8)
  const mat = new THREE.MeshBasicMaterial({ color: 0x1C1A17, wireframe: true });

  // ── 스파클 지오메트리 (hero-glass.js와 동일한 식) ──
  const NU = 24, NV = 10, dirs = [];   // 로우폴리 분할 (매끈한 솔리드일 땐 256 × 128)
  dirs.push([0, 0, -1]);
  for (let j = 1; j < NV; j++) {
    const sv = (j / NV) * 2 - 1;
    const e = (Math.PI / 2) * (0.14 * sv + 0.86 * sv * sv * sv) * 0.999;
    for (let i = 0; i < NU; i++) {
      const psi = (i / NU) * Math.PI * 2, phi = psi - (0.86 / 4) * Math.sin(4 * psi);
      dirs.push([Math.cos(e) * Math.cos(phi), Math.cos(e) * Math.sin(phi), Math.sin(e)]);
    }
  }
  dirs.push([0, 0, 1]);
  const NP = dirs.length, pos = new Float32Array(NP * 3), idx = [];
  const ring = j => 1 + (j - 1) * NU;
  for (let i = 0; i < NU; i++) {
    const n = (i + 1) % NU;
    idx.push(0, ring(1) + n, ring(1) + i);
    for (let j = 1; j < NV - 1; j++) {
      const a = ring(j) + i, b = ring(j) + n, c = ring(j + 1) + i, d = ring(j + 1) + n;
      idx.push(a, b, c, b, d, c);
    }
    idx.push(NP - 1, ring(NV - 1) + i, ring(NV - 1) + n);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  (function shape(a, t, bl) {
    const e = 0.004 + 0.22 * bl * bl;
    const soft = u => Math.pow(u * u + e * e, a / 2) - Math.pow(e, a);
    const rad = (x, y, z) => Math.pow(soft(Math.abs(x)) + soft(Math.abs(y)) + soft(Math.abs(z) / t), -1 / a);
    const norm = 1 / rad(1, 0, 0);
    for (let k = 0; k < NP; k++) {
      const [x, y, z] = dirs[k], r = rad(x, y, z) * norm;
      pos[k * 3] = x * r; pos[k * 3 + 1] = y * r; pos[k * 3 + 2] = z * r;
    }
    geo.computeVertexNormals(); geo.computeBoundingSphere();
  })(0.7, 0.42, 0.9);   // 히어로는 (0.6, 0.34, 0.65) — 앞뒤(두께 방향) 뾰족함 완화: a↑ 덜 오목, t↑ 두껍게, bl↑ 끝 둥글게

  // 스파클 면(XY)을 눕혀서(X축 90°) 정면에서는 옆면(ㅡ 모양)만 보이게 하고, 면의 법선축(z)으로 회전
  const sparkle = new THREE.Mesh(geo, mat);
  const holder = new THREE.Group();
  holder.add(sparkle);
  holder.rotation.x = Math.PI / 2;         // 기울기 0 — 완전한 옆면 (이전: ±0.3 앞뒤, ±0.12 비스듬)
  scene.add(holder);

  let viewW = 1;
  function resize() {
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const viewH = 2 * DIST * Math.tan(FOV * Math.PI / 360);
    viewW = viewH * camera.aspect;
    holder.scale.setScalar(Math.min(viewW * 0.42, viewH * 0.9));   // 폭(지름 2)이 캔버스의 약 84%
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden || statement.getBoundingClientRect().top > innerHeight) return;   // 푸터가 보일 때만
    if (!reduce) sparkle.rotation.z = clock.getElapsedTime() * 0.45;
    renderer.render(scene, camera);
  }
  frame();
}
