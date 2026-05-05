// =============================
// Hero Blob (Three.js — blobmixer style)
// =============================
function initHeroBlob() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('heroBlobCanvas');
  if (!canvas) return;

  let W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(1);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  camera.position.z = 5;

  function createGradientTexture() {
    const S = 512;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d');
    const h = ctx.createLinearGradient(0, 0, S, 0);
    h.addColorStop(0,    '#5C4A3A');
    h.addColorStop(0.05, '#C4A882');
    h.addColorStop(0.20, '#7A9B6E');
    h.addColorStop(1,    '#3D5C40');
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

  const geometry = new THREE.SphereBufferGeometry(1, 128, 128);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(1.6);
  scene.add(mesh);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(1, 2, 3);
  scene.add(dirLight);

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

  let targetRotX = 0, targetRotY = 0;
  let scrollRotX = 0, scrollRotY = 0;
  document.addEventListener('mousemove', e => {
    targetRotX = (e.clientY / H - 0.5) * 0.5;
    targetRotY = (e.clientX / W - 0.5) * 0.7;
  });

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  });

  canvas.style.opacity = 1;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const easeIn = gsap.parseEase('power2.in');
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate(self) {
        const p = self.progress;
        const sp = easeIn(p);
        mesh.position.set(0, 0, 0);
        mesh.scale.setScalar(gsap.utils.interpolate(1.6, 0.6, sp));
        scrollRotX = gsap.utils.interpolate(0,  0.6, p);
        scrollRotY = gsap.utils.interpolate(0, -0.8, p);
        canvas.style.opacity = 1 - p;
      },
      onLeaveBack() {
        mesh.position.set(0, 0, 0);
        mesh.scale.setScalar(1.6);
        scrollRotX = 0; scrollRotY = 0;
        canvas.style.opacity = 1;
      },
    });

    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
      onUpdate(self) {
        const p = self.progress;
        mesh.position.set(-2, 0, 0);
        mesh.scale.setScalar(gsap.utils.interpolate(0.15, 0.9, p));
        scrollRotX = gsap.utils.interpolate(-1.2,  0,    p);
        scrollRotY = gsap.utils.interpolate( 1.2, -0.15, p);
        canvas.style.opacity = Math.min(p * 2, 1);
      },
      onLeaveBack() {
        canvas.style.opacity = 0;
        mesh.position.set(-2, 0, 0);
        mesh.scale.setScalar(0.15);
        scrollRotX = 0; scrollRotY = 0;
      },
    });
  }

  let visible = true;
  const visObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0 });
  visObserver.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clock.stop();
    else clock.start();
  });

  let blobTensed = false;
  let tensionTime = 0;
  const blobState = { timeScale: 1 };

  const ctaBtn = document.querySelector('.hero__cta-link--accent');
  if (ctaBtn && typeof gsap !== 'undefined') {
    const heroName = document.querySelector('.hero__name');

    ctaBtn.addEventListener('mouseenter', () => {
      blobTensed = true;
      tensionTime = 0;
      gsap.to(mesh.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.2, ease: 'power2.out', overwrite: true });
      gsap.to(uniforms.distort, { value: 0.54, duration: 0.4, ease: 'power2.out' });
      gsap.to(uniforms.surfaceDistort, { value: 1.1, duration: 0.4, ease: 'power2.out' });
      gsap.to(blobState, { timeScale: 2.8, duration: 0.4, ease: 'power2.out' });
      if (heroName) gsap.to(heroName, { scale: 0.94, duration: 0.2, ease: 'power2.out', overwrite: true });
    });
    ctaBtn.addEventListener('mouseleave', () => {
      blobTensed = false;
      mesh.position.x = 0;
      gsap.to(mesh.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.8, ease: 'elastic.out(1.3, 0.4)', overwrite: true });
      gsap.to(uniforms.distort, { value: 0.5, duration: 0.6, ease: 'power2.out' });
      gsap.to(uniforms.surfaceDistort, { value: 1.0, duration: 0.6, ease: 'power2.out' });
      gsap.to(blobState, { timeScale: 1, duration: 0.6, ease: 'power2.out' });
      if (heroName) gsap.to(heroName, { scale: 1, duration: 0.8, ease: 'elastic.out(1.3, 0.4)', overwrite: true });
    });
  }

  const clock = new THREE.Clock();
  let lastTime = 0;
  (function animate(now) {
    requestAnimationFrame(animate);
    if (now - lastTime < 16) return;
    lastTime = now;
    if (!visible || parseFloat(canvas.style.opacity) === 0) return;
    const delta = clock.getDelta();
    uniforms.time.value        = (uniforms.time.value        + delta / 3 * blobState.timeScale) % 21.0;
    uniforms.surfaceTime.value = (uniforms.surfaceTime.value + delta / 3 * blobState.timeScale) % 21.0;
    mesh.rotation.x += (targetRotX + scrollRotX - mesh.rotation.x) * 0.05;
    mesh.rotation.y += (targetRotY + scrollRotY - mesh.rotation.y) * 0.05;
    if (blobTensed) {
      tensionTime += delta;
      mesh.position.x = Math.sin(tensionTime * 40) * 0.012;
    }
    renderer.render(scene, camera);
  })(0);
}
