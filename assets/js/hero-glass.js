// =============================
// Hero — 글라스 스파클 + 마우스 거리별 굵기 모션 텍스트
// Three.js는 import()로 지연 로드. 실패하면 기존 DOM 텍스트(.hero__tagline)를 그대로 보여줌
// =============================
async function initHeroGlass() {
  const hero    = document.querySelector('.hero');
  const title   = document.querySelector('.hero__title');
  const tagline = document.querySelector('.hero__tagline');
  if (!hero || !title || !tagline || !window.WebGLRenderingContext) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WMIN = 120, WMAX = 700;                       // 가변 폰트(Antonio, Anton 계열) 굵기 범위
  const FONT = (w, px) => `${Math.round(w)} ${px.toFixed(1)}px Antonio, Anton, "Arial Narrow", sans-serif`;
  let CAP = 0.73;                                     // 대문자 높이 비율 (폰트 로드 후 실측)
  const WEIGHT_MOTION = !matchMedia('(hover: none)').matches;   // 마우스 굵기 모션 (터치 기기에서는 끔)
  const LOW_SCALE = 0.8, DRAW_GAP = 33;               // 글자 텍스처 해상도·최대 30fps. 선명도↑ 부하↑ (0.6 가벼움 / 1.0 무거움)

  let THREE, RoomEnvironment;
  try {
    THREE = await import('three');
    ({ RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js'));
    await Promise.race([document.fonts.load(FONT(WMAX, 100)), new Promise(r => setTimeout(r, 3000))]);
    const mg = document.createElement('canvas').getContext('2d');
    mg.font = FONT(WMAX, 100);
    const asc = mg.measureText('H').actualBoundingBoxAscent;
    if (asc > 30 && asc < 120) CAP = asc / 100;       // 실제 글자 높이로 줄 간격 계산
  } catch (e) { return; }

  const cv = document.createElement('canvas');
  cv.className = 'hero__glass';
  cv.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  } catch (e) { return; }
  title.prepend(cv);
  hero.classList.add('hero--glass');

  const isSmall = () => innerWidth < 768;
  // 품질 단계(0 기본 → 3 최저): 프레임이 느리면 frame()이 자동으로 한 단계씩 낮춤
  let tier = 0;
  const pixelRatio = () => Math.min(devicePixelRatio, tier >= 1 || isSmall() ? 1 : 1.25);
  renderer.setPixelRatio(pixelRatio());
  renderer.toneMapping = THREE.NoToneMapping;         // 굴절된 배경과 직접 보이는 배경 색이 어긋나지 않게

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const FOV = 32, DIST = 6;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, DIST);

  // ── 글자 평면: 2D 캔버스에 직접 그려 텍스처로 쓰고 유리가 굴절시킴 ──
  const textMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), textMat);
  plane.position.z = -1;
  scene.add(plane);

  const NAME = [tagline.textContent.trim().replace(/\s+/g, ' ')];   // 이름 전체를 한 줄로
  const letters = [];
  NAME.forEach((line, li) => [...line].forEach(ch => letters.push({ ch, li, cur: WMAX, tgt: WMAX, x: 0, w: 0, cy: 0 })));

  let lowT, TW = 0, TH = 0, fs = 100, bases = [], pad = 30;
  let colors = { bg: '', fg: '' }, dirty = true, lastDraw = 0;
  const bgEls = [document.querySelector('main'), document.body, document.documentElement];

  // 스크롤 색상 리빌(GSAP)이 main 배경과 tagline 글자색을 바꾸므로 매 프레임 읽어서 따라감
  function readColors() {
    let bg = '#000';
    for (const el of bgEls) {
      const c = el && getComputedStyle(el).backgroundColor;
      if (c && c !== 'transparent' && !/,\s*0\)$/.test(c)) { bg = c; break; }
    }
    return { bg, fg: getComputedStyle(tagline).color };
  }

  function makeTarget(scale) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(TW * scale)); c.height = Math.max(1, Math.round(TH * scale));
    const g = c.getContext('2d');
    g.scale(scale, scale);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
    return { g, tex };
  }

  function setupText() {
    TW = title.clientWidth; TH = title.clientHeight;
    if (!TW || !TH) return false;
    lowT && lowT.tex.dispose();
    lowT = makeTarget(LOW_SCALE);
    textMat.map = lowT.tex; textMat.needsUpdate = true;
    bgUniform.value = lowT.tex;

    pad = isSmall() ? 20 : 30;
    const g = lowT.g;
    g.font = FONT(WMAX, 100);
    const longest = Math.max(...NAME.map(l => [...l].reduce((a, c) => a + g.measureText(c).width, 0)));
    fs = (TW - pad * 2) / longest * 100;
    const n = NAME.length, gap = () => fs * 0.07;
    const total = () => n * CAP * fs + (n - 1) * gap();
    if (total() > TH * 0.84) fs *= (TH * 0.84) / total();
    const top = (TH - total()) / 2;                      // 세로 중앙
    bases = NAME.map((_, i) => top + CAP * fs + i * (CAP * fs + gap()));
    dirty = true;
    return true;
  }

  const mouse = { x: -9999, y: -9999 }, m = { x: 0, y: 0 };
  const sigmaK = 0.17;

  function updateLetters(dt) {
    if (!WEIGHT_MOTION) return;
    const sigma = sigmaK * TW;
    let moving = false;
    letters.forEach(L => {
      const d2 = (mouse.x - (L.x + L.w / 2)) ** 2 + (mouse.y - L.cy) ** 2;
      L.tgt = WMAX - (WMAX - WMIN) * Math.exp(-d2 / (2 * sigma * sigma));   // 마우스에 가까울수록 가늘게
      const dv = L.tgt - L.cur;
      if (Math.abs(dv) > 0.4) moving = true;
      L.cur += dv * Math.min(1, dt * 9);
    });
    if (moving) dirty = true;
  }

  function drawText(T) {
    const g = T.g;
    g.fillStyle = colors.bg; g.fillRect(0, 0, TW, TH);
    g.fillStyle = colors.fg; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    NAME.forEach((_, li) => {
      const row = letters.filter(L => L.li === li);
      row.forEach(L => {                                 // 현재 굵기로 글자 폭 측정
        g.font = FONT(L.cur, fs);
        L.w = g.measureText(L.ch).width - fs * 0.03;
      });
      const total = row.reduce((a, L) => a + L.w, 0);
      let x = NAME.length === 1 ? (TW - total) / 2       // 한 줄이면 가로 중앙 (굵기가 변해도 중심 유지)
            : li % 2 === 0 ? pad : TW - pad - total;     // 여러 줄이면 왼쪽/오른쪽 엇갈림
      row.forEach(L => {
        L.x = x; L.cy = bases[li] - CAP * fs / 2;
        g.font = FONT(L.cur, fs);
        g.fillText(L.ch, x, bases[li]);
        x += L.w;
      });
    });
    T.tex.needsUpdate = true;
    textMat.map = T.tex;
  }

  // ── 4각 스파클 (글라스) ──
  // transmission(장면을 한 번 더 그리는 진짜 투과)은 너무 무거워서, 글자 텍스처를 표면 법선으로 비틀어 샘플링하는 가짜 굴절로 대체.
  // 표면 자체는 색을 검게 두고 반사(env·clearcoat)만 PBR로 계산, 굴절된 글자 색을 프레넬 비율로 더함.
  const bgUniform = { value: null };                 // 글자 텍스처
  const resUniform = { value: new THREE.Vector2(1, 1) };
  const optUniform = { value: new THREE.Vector3(0.1, 0.06, 1.45) };   // x: 굴절 세기, y: 색수차, z: ior
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x000000, metalness: 0, roughness: 0.04, ior: 1.45,
    clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 1.8,
  });
  mat.onBeforeCompile = sh => {
    sh.uniforms.uBg = bgUniform; sh.uniforms.uRes = resUniform; sh.uniforms.uOpt = optUniform;
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uBg;\nuniform vec2 uRes;\nuniform vec3 uOpt;')
      .replace('#include <opaque_fragment>', `
        {
          vec3 vdir = normalize(vViewPosition);
          vec2 suv = gl_FragCoord.xy / uRes;
          vec3 rr = refract(-vdir, normal, 1.0 / uOpt.z);
          vec2 off = rr.xy * uOpt.x * vec2(uRes.y / uRes.x, 1.0);
          vec3 tcol = vec3(
            texture2D(uBg, suv + off * (1.0 + uOpt.y)).r,
            texture2D(uBg, suv + off).g,
            texture2D(uBg, suv + off * (1.0 - uOpt.y)).b);
          float fr = pow(1.0 - clamp(dot(normal, vdir), 0.0, 1.0), 3.0);
          outgoingLight += tcol * (1.0 - clamp(0.1 + fr * 0.85, 0.0, 1.0));
        }
        #include <opaque_fragment>`);
  };
  const NU = 256, NV = 128, dirs = [];
  dirs.push([0, 0, -1]);
  for (let j = 1; j < NV; j++) {                       // 축 근처에 정점을 몰아서 끝이 매끈하게
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
  // 반경 r = (Σ soft(|d_i|)^a)^(-1/a): a<1 이면 옆면이 안쪽으로 휘고, soft-abs 로 끝이 둥글어짐
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
  })(0.6, 0.34, 0.65);
  const sparkle = new THREE.Mesh(geo, mat);
  const holder = new THREE.Group(); holder.add(sparkle); scene.add(holder);   // 중앙 고정

  function resize() {
    if (!setupText()) return;
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(TW, TH, false);
    renderer.getDrawingBufferSize(resUniform.value);
    camera.aspect = TW / TH; camera.updateProjectionMatrix();
    const viewH = 2 * (DIST + 1) * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    plane.scale.set(viewH * camera.aspect, viewH, 1);
  }
  let rzTimer;
  new ResizeObserver(() => { clearTimeout(rzTimer); rzTimer = setTimeout(resize, 100); }).observe(title);

  // ── 입력: 마우스 위치(글자 굵기)와 기울기 ──
  const clearPointer = () => { mouse.x = mouse.y = -9999; m.x = m.y = 0; dirty = true; };
  window.addEventListener('pointermove', e => {
    const r = title.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) return clearPointer();
    mouse.x = x; mouse.y = y;
    m.x = (x / r.width) * 2 - 1; m.y = -((y / r.height) * 2 - 1);
  }, { passive: true });
  document.addEventListener('pointerleave', clearPointer);
  window.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') clearPointer(); });

  const perf = { avg: 0.016, checkAt: performance.now() + 4000 };   // 시작 직후 로딩 구간은 측정에서 제외
  function setTier(n) {
    tier = n;
    if (n >= 1) { renderer.setPixelRatio(pixelRatio()); renderer.setSize(TW, TH, false); renderer.getDrawingBufferSize(resUniform.value); }   // 해상도 1배
    if (n >= 2) optUniform.value.y = 0;                                                        // 색수차 끔
    // 3단계는 frame()의 30fps 제한
  }

  const s = { px: 0, py: 0, vx: 0, vy: 0 };
  let visible = false, last = performance.now(), t = 0;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(title);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden || !lowT) { last = now; return; }
    const raw = (now - last) / 1000;
    if (tier >= 3 && raw < 0.028) return;               // 최저 단계: 30fps로 제한
    last = now;
    const dt = Math.min(0.033, raw);
    if (!reduce) t += dt;

    // 적응형 품질: 평균 프레임이 20ms(50fps)보다 느리면 한 단계씩 낮춤 (모니터 주사율이 높으면 영향 없음)
    if (raw < 0.25) perf.avg += (raw - perf.avg) * 0.05;
    if (tier < 3 && now > perf.checkAt) {
      perf.checkAt = now + 1500;
      if (perf.avg > 0.02) { setTier(tier + 1); perf.avg = 0.016; perf.checkAt = now + 2500; }
    }

    const c = readColors();
    if (c.bg !== colors.bg || c.fg !== colors.fg) { colors = c; dirty = true; }
    updateLetters(dt);

    if (dirty && now - lastDraw >= DRAW_GAP) {            // 저해상도 텍스처, 최대 30fps
      drawText(lowT);
      lastDraw = now; dirty = false;
    }

    // 스파클: 위치는 고정, 마우스 방향으로 기울어지는 각도만 스프링(놓으면 출렁)
    const K = 60, C = 6.5;
    const gx = -m.y * 0.2 + (reduce ? 0 : Math.sin(t * 0.7) * 0.05);
    const gy = m.x * 0.25 + (reduce ? 0 : Math.sin(t * 0.5 + 1) * 0.07);
    s.vx += ((gx - s.px) * K - s.vx * C) * dt; s.vy += ((gy - s.py) * K - s.vy * C) * dt;
    s.px += s.vx * dt; s.py += s.vy * dt;
    holder.rotation.set(s.px, s.py, 0);
    sparkle.rotation.z = t * 0.07;
    holder.scale.setScalar(1.15 * Math.min(1, camera.aspect * 0.9 + 0.35));

    renderer.render(scene, camera);
  }

  resize();
  requestAnimationFrame(frame);
}
