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
  const PARALLAX_SPARKLE = 0.3, PARALLAX_TEXT = 0.12;   // 스크롤 한 화면당 이동량(화면 높이 대비). 클수록 속도 차이가 커짐
  const LOW_SCALE = 0.8, DRAW_GAP = 33;              // 글자 텍스처 해상도·최대 30fps. 선명도↑ 부하↑ (0.6 가벼움 / 1.0 무거움)

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
  hero.prepend(cv);                                   // 헤더 뒤까지 빛이 깔리도록 히어로 전체를 덮음
  hero.classList.add('hero--glass');

  const isSmall = () => innerWidth < 768;
  // 품질 단계(0 기본 → 3 최저): 프레임이 느리면 frame()이 자동으로 한 단계씩 낮춤
  let tier = 0;
  const pixelRatio = () => Math.min(devicePixelRatio, tier >= 1 || isSmall() ? 1 : 1.25);
  renderer.setPixelRatio(pixelRatio());
  renderer.toneMapping = THREE.NoToneMapping;         // 굴절된 배경과 직접 보이는 배경 색이 어긋나지 않게

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);       // 패럴랙스로 글자 평면이 움직여도 가장자리가 비지 않게 (배경색은 frame()에서 갱신)
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const FOV = 32, DIST = 6;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, DIST);

  // ── 글자 평면: 2D 캔버스에 직접 그려 텍스처로 쓰고 유리가 굴절시킴 ──
  // 배경의 빛 덩어리는 셰이더에서 계산하고, 글자는 캔버스의 알파(coverage)만 텍스처로 써서 색을 입힘.
  // 스파클의 굴절 샘플링도 같은 함수(BG_GLSL)를 써서, 빛과 글자가 함께 굴절되어 보임.
  const bgUniform    = { value: null };                      // 글자 coverage 텍스처(알파)
  const resUniform   = { value: new THREE.Vector2(1, 1) };
  const optUniform   = { value: new THREE.Vector3(0.1, 0.06, 1.45) };   // x: 굴절 세기, y: 색수차, z: ior
  const shiftUniform = { value: new THREE.Vector2() };                // 글자 평면이 패럴랙스로 움직인 만큼 샘플링 위치 보정
  const timeUniform  = { value: 0 };
  const mouseUniform = { value: new THREE.Vector2(0.5, 0.5) };        // 0~1, y는 위쪽이 1
  const colBg = { value: new THREE.Color() }, colFg = { value: new THREE.Color() }, colGlow = { value: new THREE.Color() };
  const GLOW_SIZE = 2.0, GLOW_MIX = 0.0, GLOW_CORE = 0.0;   // 라이트 끔 (다시 켜려면 0.26 / 0.1 정도로)                // 빛 크기(최대) / 포인트 컬러가 배경에 섞이는 최대 비율
  // 빛 덩어리는 1/4 해상도 렌더 타깃에 따로 그려 두고(부드러운 그라데이션이라 해상도 차이가 안 보임),
  // 글자 평면과 스파클 굴절은 그 텍스처를 샘플링만 함 → 풀스크린 연산량이 약 1/16
  const aspectUniform = { value: 1 };
  const glowUniform = { value: null };
  const BG_GLSL = `
    uniform sampler2D uBg;
    uniform sampler2D uGlow;
    uniform vec2 uRes;
    uniform vec3 uColFg;
    vec3 hgBase(vec2 uv) { return texture2D(uGlow, uv).rgb; }`;
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uTime: timeUniform, uMouse: mouseUniform, uColBg: colBg, uColGlow: colGlow, uAspect: aspectUniform },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uColBg;
      uniform vec3 uColGlow;
      uniform float uAspect;
      void main() {
        vec2 p = vUv;
        float t = uTime * 0.25;
        vec2 c1 = vec2(0.72 + 0.10 * sin(t * 1.1),       0.62 + 0.12 * cos(t * 0.9));
        vec2 c2 = vec2(0.28 + 0.12 * cos(t * 0.8 + 1.3), 0.48 + 0.10 * sin(t * 1.2 + 0.4));
        vec2 c3 = vec2(0.52 + 0.16 * sin(t * 0.6 + 2.1), 0.30 + 0.08 * cos(t * 1.0 + 1.0));
        float s = 0.045 * ${GLOW_SIZE.toFixed(2)};
        vec2 a = (p - c1) * vec2(uAspect, 1.0);
        float g = exp(-dot(a, a) / s) * 0.85;
        a = (p - c2) * vec2(uAspect, 1.0); g += exp(-dot(a, a) / (s * 0.9)) * 0.55;
        a = (p - c3) * vec2(uAspect, 1.0); g += exp(-dot(a, a) / (s * 1.3)) * 0.45;
        a = (p - uMouse) * vec2(uAspect, 1.0); g += exp(-dot(a, a) / (0.03 * ${GLOW_SIZE.toFixed(2)})) * 1.1;
        vec3 c = mix(uColBg, uColGlow, clamp(g, 0.0, 1.0) * ${GLOW_MIX.toFixed(2)});
        c += uColGlow * pow(clamp(g - 0.6, 0.0, 1.0), 2.0) * ${GLOW_CORE.toFixed(2)};
        gl_FragColor = vec4(c, 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const glowRT = new THREE.WebGLRenderTarget(64, 36, {
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false,
    type: (renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'))
      ? THREE.HalfFloatType : THREE.UnsignedByteType,   // 어두운 그라데이션 띠 방지
  });
  glowUniform.value = glowRT.texture;
  const glowScene = new THREE.Scene();
  const glowQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glowMat);
  glowQuad.frustumCulled = false;
  glowScene.add(glowQuad);
  const glowCam = new THREE.Camera();
  const textMat = new THREE.ShaderMaterial({
    uniforms: { uBg: bgUniform, uGlow: glowUniform, uRes: resUniform, uColFg: colFg },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec2 vUv;\n${BG_GLSL}
      void main() {
        float a = texture2D(uBg, vUv).a;
        gl_FragColor = vec4(mix(hgBase(vUv), uColFg, a), 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), textMat);
  plane.position.z = -1;
  scene.add(plane);
  let viewH = 1;                                      // 글자 평면 깊이에서의 화면 높이(월드 단위)

  const NAME = [tagline.textContent.trim().replace(/\s+/g, ' ')];   // 이름 전체를 한 줄로
  const letters = [];
  NAME.forEach((line, li) => [...line].forEach(ch => letters.push({ ch, li, cur: WMAX, tgt: WMAX, x: 0, w: 0, cy: 0 })));

  let lowT, TW = 0, TH = 0, fs = 100, bases = [], pad = 30;
  let colors = { bg: '', fg: '', accent: '' }, dirty = true, lastDraw = 0;
  const bgEls = [document.querySelector('main'), document.body, document.documentElement];

  // 스크롤 색상 리빌(GSAP)이 main 배경과 tagline 글자색을 바꾸므로 매 프레임 읽어서 따라감
  function readColors() {
    let bg = '#000';
    for (const el of bgEls) {
      const c = el && getComputedStyle(el).backgroundColor;
      if (c && c !== 'transparent' && !/,\s*0\)$/.test(c)) { bg = c; break; }
    }
    return {
      bg,
      fg: getComputedStyle(tagline).color,
      accent: getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || bg,
    };
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
    TW = hero.clientWidth; TH = hero.clientHeight;
    if (!TW || !TH) return false;
    lowT && lowT.tex.dispose();
    lowT = makeTarget(LOW_SCALE);
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
    g.clearRect(0, 0, TW, TH);
    g.fillStyle = '#fff'; g.textBaseline = 'alphabetic'; g.textAlign = 'left';   // 알파만 쓰고 색은 셰이더(uColFg)에서
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
    bgUniform.value = T.tex;
  }

  // ── 4각 스파클 (글라스) ──
  // transmission(장면을 한 번 더 그리는 진짜 투과)은 너무 무거워서, 글자 텍스처를 표면 법선으로 비틀어 샘플링하는 가짜 굴절로 대체.
  // 표면 자체는 색을 검게 두고 반사(env·clearcoat)만 PBR로 계산, 굴절된 글자 색을 프레넬 비율로 더함.
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x000000, metalness: 0, roughness: 0.04, ior: 1.45,
    clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 1.8,
  });
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, {
      uBg: bgUniform, uGlow: glowUniform, uRes: resUniform, uOpt: optUniform, uShift: shiftUniform, uColFg: colFg,
    });
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + BG_GLSL + '\nuniform vec3 uOpt;\nuniform vec2 uShift;')
      .replace('#include <opaque_fragment>', `
        {
          vec3 vdir = normalize(vViewPosition);
          vec2 suv = gl_FragCoord.xy / uRes - uShift;
          vec3 rr = refract(-vdir, normal, 1.0 / uOpt.z);
          vec2 off = rr.xy * uOpt.x * vec2(uRes.y / uRes.x, 1.0);
          vec3 base = hgBase(suv + off);                       // 굴절된 위치의 빛 덩어리 색
          vec3 tcol = vec3(
            mix(base.r, uColFg.r, texture2D(uBg, suv + off * (1.0 + uOpt.y)).a),
            mix(base.g, uColFg.g, texture2D(uBg, suv + off).a),
            mix(base.b, uColFg.b, texture2D(uBg, suv + off * (1.0 - uOpt.y)).a));
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
    glowRT.setSize(Math.max(32, Math.ceil(TW / 4)), Math.max(18, Math.ceil(TH / 4)));
    aspectUniform.value = TW / TH;
    camera.aspect = TW / TH; camera.updateProjectionMatrix();
    viewH = 2 * (DIST + 1) * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    plane.scale.set(viewH * camera.aspect, viewH, 1);
  }
  let rzTimer;
  new ResizeObserver(() => { clearTimeout(rzTimer); rzTimer = setTimeout(resize, 100); }).observe(hero);

  // ── 입력: 마우스 위치(글자 굵기)와 기울기 ──
  const clearPointer = () => { mouse.x = mouse.y = -9999; m.x = m.y = 0; dirty = true; };
  window.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
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
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);

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
    if (c.bg !== colors.bg || c.fg !== colors.fg || c.accent !== colors.accent) {
      colors = c;
      scene.background.set(c.bg);
      colBg.value.set(c.bg); colFg.value.set(c.fg); colGlow.value.set(c.accent);   // 색은 uniform으로만 바꿈(글자 재그리기 불필요)
    }
    timeUniform.value = t;
    mouseUniform.value.x += ((m.x + 1) / 2 - mouseUniform.value.x) * Math.min(1, dt * 4);   // 빛이 마우스를 부드럽게 따라옴
    mouseUniform.value.y += ((m.y + 1) / 2 - mouseUniform.value.y) * Math.min(1, dt * 4);
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
    // 패럴랙스: 스크롤하면 스파클은 페이지보다 빨리 위로 올라가며 살짝 작아지고, 글자는 페이지보다 느리게 따라옴
    const p = reduce ? 0 : Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
    plane.position.y = -p * viewH * PARALLAX_TEXT;
    shiftUniform.value.set(0, plane.position.y / viewH);
    holder.position.y = p * viewH * PARALLAX_SPARKLE;
    holder.scale.setScalar(1.15 * Math.min(1, camera.aspect * 0.9 + 0.35) * (1 - 0.18 * p));

    renderer.setRenderTarget(glowRT);                   // 1/4 해상도로 빛만 먼저 그림
    renderer.render(glowScene, glowCam);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }

  resize();
  requestAnimationFrame(frame);
}
